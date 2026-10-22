<?php
declare(strict_types=1);

use LifeOS\Auth;
use LifeOS\DB;
use LifeOS\Http;
use LifeOS\HttpError;
use LifeOS\Engine\Commission;
use LifeOS\Engine\Placement;
use LifeOS\Engine\Rank;

/** Member-facing API. All amounts in BDT. */

// ---- Auth ----
$router->post('/api/member/register', function () {
    if (!\LifeOS\PanelPolicy::enabled(DB::val("SELECT v FROM lo_settings WHERE k = 'signup_status'"))) throw new HttpError('Registration is currently disabled', 403);
    $b = Http::body();
    if (empty($b['pin']) && !empty($b['password'])) $b['pin'] = $b['password'];
    foreach (['phone', 'pin', 'name'] as $f) {
        if (empty($b[$f])) throw new HttpError("$f required");
    }
    if (!preg_match('/^01[3-9]\d{8}$/', (string) $b['phone'])) throw new HttpError('Valid BD phone required');
    if (strlen((string) $b['pin']) < 4 || strlen((string) $b['pin']) > 72) throw new HttpError('Password must be 4–72 characters');
    if (mb_strlen(trim((string) $b['name'])) > 100) throw new HttpError('Name is too long');
    if (!empty($b['email']) && !filter_var($b['email'], FILTER_VALIDATE_EMAIL)) throw new HttpError('Valid email required');
    if (DB::one('SELECT id FROM users WHERE phone = ?', [$b['phone']])) throw new HttpError('Phone already registered', 409);
    // Only the very first account (empty system) may join without a sponsor link.
    if (empty($b['referral_code']) && DB::one('SELECT user_id FROM lo_tree LIMIT 1', [])) throw new HttpError('A sponsor referral link is required to register');

    $sponsorId = null;
    if (!empty($b['referral_code'])) {
        $sp = DB::one('SELECT id FROM users WHERE referral_code = ?', [$b['referral_code']]);
        if (!$sp) throw new HttpError('Invalid referral code');
        $sponsorId = (int) $sp['id'];
    }

    $team = $b['team'] ?? null;
    if ($team !== null && !in_array($team, ['L', 'R'], true)) throw new HttpError('Invalid team');
    if ($team !== null && !$sponsorId) throw new HttpError('Sponsor required for team placement');
    $extended = isset($b['username']) || $team !== null;
    $username = trim((string) ($b['username'] ?? ''));
    if ($extended) {
        foreach (['email', 'blood_group', 'district', 'post_code', 'address_current', 'username'] as $field) {
            if (trim((string) ($b[$field] ?? '')) === '') throw new HttpError("$field required");
        }
        if (empty($b['accepted_terms'])) throw new HttpError('Terms agreement required');
        if (($b['confirm_password'] ?? '') !== $b['pin']) throw new HttpError('Passwords do not match');
        if (!preg_match('/^[A-Za-z][A-Za-z0-9_]{3,39}$/', $username)) throw new HttpError('Username must be 4–40 characters, starting with a letter');
        if (DB::one('SELECT id FROM users WHERE username = ? OR life_id = ? OR referral_code = ? OR phone = ?', [$username, $username, $username, $username])) throw new HttpError('Username already registered', 409);
        if (!in_array($b['blood_group'], ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], true)) throw new HttpError('Invalid blood group');
    }
    foreach (['nid_number' => 30, 'district' => 60, 'post_code' => 12, 'address_current' => 2000] as $field => $limit) {
        if (mb_strlen((string) ($b[$field] ?? '')) > $limit) throw new HttpError("$field is too long");
    }
    $photo = $b['photo_base64'] ?? null;
    if ($photo !== null && $photo !== '') {
        if (!is_string($photo) || strlen($photo) > 2800000 || !preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $photo, $m)) throw new HttpError('Photo must be JPG, PNG or WebP, at most 2 MB');
        $binary = base64_decode($m[2], true);
        $info = $binary === false ? false : @getimagesizefromstring($binary);
        if (!$info || strlen($binary) > 2097152 || !in_array($info['mime'], ['image/jpeg', 'image/png', 'image/webp'], true)) throw new HttpError('Invalid photo');
    }
    $result = DB::tx(function () use ($b, $sponsorId, $team, $username, $photo) {
        DB::one('SELECT id FROM lo_placement_lock WHERE id = 1 FOR UPDATE');
        if (!$sponsorId && DB::one('SELECT user_id FROM lo_tree LIMIT 1')) throw new HttpError('A sponsor referral link is required to register');
        if ($sponsorId && !DB::one('SELECT id FROM users WHERE id = ? AND status <> "suspended"', [$sponsorId])) throw new HttpError('Sponsor unavailable');
        $lifeId = 'LO' . str_pad((string) random_int(1, 99999999), 8, '0', STR_PAD_LEFT);
        $refCode = strtoupper(bin2hex(random_bytes(4)));
        $id = DB::insert(
            'INSERT INTO users (life_id, membership_no, referral_code, referred_by, phone, email, pin_hash, status, accepted_terms)
             VALUES (?,?,?,?,?,?,?,"pending",?)',
            [$lifeId, $lifeId, $refCode, $b['referral_code'] ?? null, $b['phone'], $b['email'] ?? null,
             password_hash((string) $b['pin'], PASSWORD_DEFAULT), !empty($b['accepted_terms']) ? 1 : 0]
        );
        if ($username !== '') DB::run('UPDATE users SET username = ? WHERE id = ?', [$username, $id]);
        DB::insert('INSERT INTO user_wallets (user_id) VALUES (?)', [$id]);
        DB::insert('INSERT INTO user_profiles (user_id, name) VALUES (?, ?)', [$id, trim((string) $b['name'])]);
        DB::run('UPDATE user_profiles SET blood_group = ?, nid_number = ?, district = ?, post_code = ?, address_current = ?, photo_base64 = ? WHERE user_id = ?', [$b['blood_group'] ?? null, $b['nid_number'] ?? null, $b['district'] ?? null, $b['post_code'] ?? null, $b['address_current'] ?? null, $photo, $id]);
        Placement::ensureNode($id, $sponsorId);
        Placement::place($id, $sponsorId, $team);
        return $id;
    });

    $u = DB::one('SELECT * FROM users WHERE id = ?', [$result]);
    Http::ok(['user_id' => $result, 'life_id' => $u['life_id'], 'token' => Auth::issue('m', $result)]);
});

// Public sponsor lookup for the join page: name + Life ID only, never financial data.
$router->get('/api/member/sponsor', function () {
    $code = (string) ($_GET['code'] ?? '');
    if (!preg_match('/^[A-Za-z0-9]{4,20}$/', $code)) throw new HttpError('Invalid referral code');
    $sp = DB::one('SELECT u.id, u.life_id FROM users u WHERE u.referral_code = ? AND u.status <> "suspended"', [$code]);
    if (!$sp) throw new HttpError('Invalid referral code', 404);
    $name = DB::val('SELECT name FROM user_profiles WHERE user_id = ? ORDER BY id LIMIT 1', [(int) $sp['id']]);
    $team = $_GET['team'] ?? null;
    $slot = Placement::preview((int) $sp['id'], $team);
    $placement = $slot ? DB::val('SELECT life_id FROM users WHERE id = ?', [$slot['parent_id']]) : null;
    Http::ok(['name' => $name ?: $sp['life_id'], 'life_id' => $sp['life_id'], 'team' => $team, 'placement_life_id' => $placement, 'placement_side' => $slot['side'] ?? null]);
});

$router->post('/api/member/login', function () {
    if (!\LifeOS\PanelPolicy::enabled(DB::val("SELECT v FROM lo_settings WHERE k = 'login_status'"))) throw new HttpError('Member login is currently disabled', 403);
    $b = Http::body();
    $u = DB::one('SELECT * FROM users WHERE phone = ? OR life_id = ? OR referral_code = ? OR username = ?', [$b['username'] ?? '', $b['username'] ?? '', $b['username'] ?? '', $b['username'] ?? '']);
    if (!$u || !password_verify((string) ($b['password'] ?? ''), (string) $u['pin_hash'])) {
        throw new HttpError('Invalid credentials', 401);
    }
    if ($u['status'] === 'suspended') throw new HttpError('Account suspended', 403);
    Http::ok(['token' => Auth::issue('m', (int) $u['id']), 'user' => memberSummary($u)]);
});

// ---- Dashboard ----
$router->get('/api/member/profile', function () {
    $u = Auth::member();
    Http::ok(DB::one('SELECT name, father_name, mother_name, nominee_name, nominee_relation, dob, blood_group, phone_alt, address_current, nid_number, photo_base64, district, post_code, ward_no, union_name, upazila FROM user_profiles WHERE user_id = ? ORDER BY id LIMIT 1', [(int) $u['id']]) ?? []);
});

$router->post('/api/member/profile', function () {
    $u = Auth::member();
    $b = Http::body();
    if (!\LifeOS\PanelPolicy::enabled(DB::val("SELECT v FROM lo_settings WHERE k = 'profile_edit_status'"))) throw new HttpError('Profile editing is currently disabled', 403);
    $fields = ['name', 'father_name', 'mother_name', 'nominee_name', 'nominee_relation', 'dob', 'blood_group', 'phone_alt', 'address_current', 'nid_number', 'district', 'post_code', 'ward_no', 'union_name', 'upazila'];
    $limits = ['name' => 100, 'nominee_name' => 80, 'nominee_relation' => 40, 'blood_group' => 5, 'phone_alt' => 20, 'address_current' => 2000, 'nid_number' => 30, 'district' => 60, 'post_code' => 12, 'ward_no' => 30];
    $values = [];
    foreach ($fields as $field) {
        $value = trim((string) ($b[$field] ?? ''));
        if (mb_strlen($value) > ($limits[$field] ?? 100)) throw new HttpError("$field is too long");
        $values[] = $value === '' ? null : $value;
    }
    if (!$values[0]) throw new HttpError('Full name required');
    if ($values[6] !== null && !in_array($values[6], ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], true)) throw new HttpError('Invalid blood group');
    if (array_key_exists('photo_base64', $b)) {
        $photo = $b['photo_base64'];
        if (!is_string($photo) || strlen($photo) > 2800000 || !preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $photo, $m)) throw new HttpError('Photo must be JPG, PNG or WebP, at most 2 MB');
        $binary = base64_decode($m[2], true);
        $info = $binary === false ? false : @getimagesizefromstring($binary);
        if (!$info || strlen($binary) > 2097152 || !in_array($info['mime'], ['image/jpeg', 'image/png', 'image/webp'], true)) throw new HttpError('Invalid photo');
        $fields[] = 'photo_base64'; $values[] = $photo;
    }
    if ($values[5] !== null && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $values[5]) || date('Y-m-d', strtotime($values[5]) ?: 0) !== $values[5])) throw new HttpError('Valid birth date required');
    DB::tx(function () use ($u, $fields, $values) {
        DB::one('SELECT id FROM users WHERE id = ? FOR UPDATE', [(int) $u['id']]);
        $profile = DB::one('SELECT id FROM user_profiles WHERE user_id = ? ORDER BY id LIMIT 1', [(int) $u['id']]);
        if ($profile) {
            DB::run('UPDATE user_profiles SET ' . implode(', ', array_map(fn($f) => "$f = ?", $fields)) . ' WHERE id = ?', [...$values, (int) $profile['id']]);
        } else {
            DB::insert('INSERT INTO user_profiles (user_id, ' . implode(', ', $fields) . ') VALUES (' . implode(',', array_fill(0, count($fields) + 1, '?')) . ')', [(int) $u['id'], ...$values]);
        }
    });
    Http::ok(['saved' => true]);
});

$router->post('/api/member/password', function () {
    $u = Auth::member();
    $b = Http::body();
    if (!password_verify((string) ($b['current_password'] ?? ''), (string) $u['pin_hash'])) throw new HttpError('Current password is incorrect', 403);
    $password = (string) ($b['new_password'] ?? '');
    if (strlen($password) < 6 || strlen($password) > 72) throw new HttpError('New password must be 6–72 characters');
    DB::run('UPDATE users SET pin_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), (int) $u['id']]);
    Http::ok(['changed' => true]);
});

$router->get('/api/member/me', function () {
    Http::ok(memberSummary(Auth::member()));
});

$router->get('/api/member/wallet', function () {
    $u = Auth::member();
    $uid = (int) $u['id'];
    $wallet = DB::one('SELECT * FROM user_wallets WHERE user_id = ?', [$uid]);
    $ledger = [];
    foreach (['REFERRAL', 'MATCHING', 'GENERATION', 'RANK', 'ADJUSTMENT'] as $t) {
        $ledger[$t] = (float) DB::val("SELECT COALESCE(SUM(amount),0) FROM lo_ledger WHERE user_id = ? AND ledger_type = ? AND status = 'PAID'", [$uid, $t]);
    }
    $withdrawn = (float) DB::val("SELECT COALESCE(SUM(amount),0) FROM lo_withdrawals WHERE user_id = ? AND status = 'APPROVED'", [$uid]);
    $pendingWd = (float) DB::val("SELECT COALESCE(SUM(amount),0) FROM lo_withdrawals WHERE user_id = ? AND status = 'PENDING'", [$uid]);
    $cashback = (float) DB::val("SELECT COALESCE(SUM(amount),0) FROM lo_ledger WHERE user_id = ? AND ledger_type = 'CASHBACK' AND status = 'PAID'", [$uid]);
    Http::ok([
        'withdrawable' => \LifeOS\Engine\Wallet::available($uid),
        'pending_withdrawal' => $pendingWd,
        'withdrawn' => $withdrawn,
        'cashback_service_only' => $cashback,
        'by_type' => $ledger,
        'legacy_wallet' => $wallet,
    ]);
});

$router->get('/api/member/ledger', function () {
    $u = Auth::member();
    $type = $_GET['type'] ?? null;
    $sql = 'SELECT payout_code, ledger_type, amount, level, status, note, created_at FROM lo_ledger WHERE user_id = ?';
    $p = [(int) $u['id']];
    if ($type) { $sql .= ' AND ledger_type = ?'; $p[] = $type; }
    $sql .= ' ORDER BY id DESC LIMIT 200';
    Http::ok(DB::all($sql, $p));
});

// ---- Trees ----
$router->get('/api/member/tree/binary', function () {
    $u = Auth::member();
    $uid = (int) $u['id'];
    $node = DB::one('SELECT * FROM lo_tree WHERE user_id = ?', [$uid]);
    $build = function (int $id, int $depth) use (&$build): ?array {
        if ($depth > 6) return null;
        $n = DB::one('SELECT t.*, u.life_id, u.phone FROM lo_tree t JOIN users u ON u.id = t.user_id WHERE t.user_id = ?', [$id]);
        if (!$n) return null;
        return [
            'user_id' => $id,
            'life_id' => $n['life_id'],
            'active' => (bool) $n['is_active'],
            'left_carry' => (float) $n['left_carry'],
            'right_carry' => (float) $n['right_carry'],
            'left' => $n['left_child_id'] ? $build((int) $n['left_child_id'], $depth + 1) : null,
            'right' => $n['right_child_id'] ? $build((int) $n['right_child_id'], $depth + 1) : null,
        ];
    };
    Http::ok($build($uid, 0));
});

$router->get('/api/member/tree/enrollment', function () {
    $u = Auth::member();
    $uid = (int) $u['id'];
    $directs = DB::all(
        'SELECT u.id, u.life_id, u.phone, u.created_at, t.is_active FROM lo_tree t JOIN users u ON u.id = t.user_id WHERE t.sponsor_id = ? ORDER BY u.id',
        [$uid]
    );
    $legs = DB::all('SELECT leg_user_id, carry, consumed FROM lo_enroll_legs WHERE upline_id = ?', [$uid]);
    Http::ok(['directs' => $directs, 'legs' => $legs]);
});

// ---- Activation (payment-verified only; gateway callback calls /api/admin/activations/{id}/confirm) ----
$router->post('/api/member/activations', function () {
    $u = Auth::member();
    $uid = (int) $u['id'];
    if (DB::one("SELECT id FROM lo_activations WHERE user_id = ? AND payment_status = 'SUCCESS'", [$uid])) {
        throw new HttpError('Already activated', 409);
    }
    $id = DB::insert(
        'INSERT INTO lo_activations (activation_code, user_id, payment_ref) VALUES (?, ?, ?)',
        ['ACT-' . strtoupper(bin2hex(random_bytes(8))), $uid, 'PENDING-' . bin2hex(random_bytes(8))]
    );
    Http::ok(['activation_id' => $id, 'fee' => 1000, 'status' => 'PENDING']);
});

$router->get('/api/member/activations', function () {
    $u = Auth::member();
    Http::ok(DB::all('SELECT id, activation_code, payment_status, fee, processed, created_at FROM lo_activations WHERE user_id = ? ORDER BY id DESC', [(int) $u['id']]));
});

// ---- Matching & rank ----
$router->get('/api/member/matching', function () {
    $u = Auth::member();
    Http::ok(DB::all(
        'SELECT event_code, sale_id, event_number, selected_type, calculated_payout, actual_payout, payout_status, created_at
         FROM lo_matching_events WHERE beneficiary_id = ? ORDER BY id DESC LIMIT 200',
        [(int) $u['id']]
    ));
});

$router->get('/api/member/rank', function () {
    $u = Auth::member();
    $uid = (int) $u['id'];
    $matchings = (int) DB::val('SELECT lifetime_matchings FROM lo_tree WHERE user_id = ?', [$uid]);
    $current = Rank::current($uid);
    $next = DB::one('SELECT * FROM lo_ranks WHERE required_matchings > ? ORDER BY required_matchings LIMIT 1', [$matchings]);
    Http::ok(['lifetime_matchings' => $matchings, 'current' => $current, 'next' => $next]);
});

// ---- Withdrawals ----
$router->get('/api/member/settings', function () {
    Auth::member();
    $out = ['withdraw_min' => '500', 'withdraw_max' => '25000', 'withdraw_charge_pct' => '0', 'withdrawal_status' => '1', 'profile_edit_status' => '1'];
    foreach (DB::all('SELECT k, v FROM lo_settings') as $row) if (array_key_exists($row['k'], $out)) $out[$row['k']] = $row['v'];
    Http::ok($out);
});

$router->post('/api/member/withdrawals', function () {
    $u = Auth::member();
    $b = Http::body();
    $amount = round((float) ($b['amount'] ?? 0), 3);
    if (empty($b['method']) || empty($b['account_number'])) throw new HttpError('method and account_number required');
    if (!in_array(strtolower((string) $b['method']), ['bkash', 'nagad', 'rocket', 'bank'], true)) throw new HttpError('Invalid payment method');
    if (strlen((string) $b['account_number']) > 100 || strlen((string) ($b['member_note'] ?? '')) > 1000) throw new HttpError('Withdrawal details too long');
    $uid = (int) $u['id'];
    $id = DB::tx(function () use ($uid, $b, $amount) {
        // Lock the member so two simultaneous requests cannot both spend the same balance.
        DB::one('SELECT id FROM users WHERE id = ? FOR UPDATE', [$uid]);
        $available = \LifeOS\Engine\Wallet::available($uid);
        $settings = [];
        foreach (DB::all('SELECT k, v FROM lo_settings') as $row) $settings[$row['k']] = $row['v'];
        $charge = \LifeOS\PanelPolicy::withdrawal($settings, $amount, $available);
        return DB::insert(
            'INSERT INTO lo_withdrawals (user_id, method, account_number, amount, charge, member_note) VALUES (?,?,?,?,?,?)',
            [$uid, $b['method'], $b['account_number'], $amount, $charge, trim((string) ($b['member_note'] ?? '')) ?: null]
        );
    });
    Http::ok(['withdrawal_id' => $id, 'status' => 'PENDING']);
});

$router->get('/api/member/withdrawals', function () {
    $u = Auth::member();
    Http::ok(DB::all('SELECT id, method, account_number, amount, charge, status, admin_note, member_note, created_at FROM lo_withdrawals WHERE user_id = ? ORDER BY id DESC', [(int) $u['id']]));
});

function memberSummary(array $u): array
{
    $uid = (int) $u['id'];
    $tree = DB::one('SELECT * FROM lo_tree WHERE user_id = ?', [$uid]);
    $profile = DB::one('SELECT name FROM user_profiles WHERE user_id = ? ORDER BY id LIMIT 1', [$uid]);
    return [
        'id' => $uid,
        'name' => $profile['name'] ?? $u['life_id'],
        'created_at' => $u['created_at'],
        'referred_by' => $u['referred_by'],
        'total_referral' => (int) DB::val('SELECT COUNT(*) FROM lo_tree WHERE sponsor_id = ?', [$uid]),
        'life_id' => $u['life_id'],
        'referral_code' => $u['referral_code'],
        'phone' => $u['phone'],
        'email' => $u['email'],
        'status' => $u['status'],
        'active' => (bool) ($tree['is_active'] ?? false),
        'lifetime_matchings' => (int) ($tree['lifetime_matchings'] ?? 0),
        'rank' => Rank::current($uid),
    ];
}

// Visible admin notices / scroll news for the member panel.
$router->get('/api/member/notices', function () {
    \LifeOS\Auth::member();
    \LifeOS\Http::ok(\LifeOS\DB::all("SELECT id, kind, title, content, show_from, show_to, updated_at FROM lo_notices
        WHERE is_visible = 1 AND (show_from IS NULL OR show_from <= CURDATE()) AND (show_to IS NULL OR show_to >= CURDATE()) ORDER BY id DESC LIMIT 50"));
});
