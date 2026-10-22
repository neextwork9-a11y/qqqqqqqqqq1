<?php
declare(strict_types=1);

use LifeOS\Auth;
use LifeOS\DB;
use LifeOS\Http;
use LifeOS\HttpError;
use LifeOS\Engine\Commission;

/** Admin API. */

$router->post('/api/admin/login', function () {
    $b = Http::body();
    $a = DB::one('SELECT * FROM admin_users WHERE email = ?', [$b['email'] ?? '']);
    if (!$a || !password_verify((string) ($b['password'] ?? ''), (string) ($a['password'] ?? ''))) {
        throw new HttpError('Invalid credentials', 401);
    }
    Http::ok(['token' => Auth::issue('a', (int) $a['id']), 'admin' => ['id' => (int) $a['id'], 'name' => $a['name'], 'email' => $a['email']]]);
});

$router->get('/api/admin/overview', function () {
    Auth::admin();
    Http::ok([
        'members' => (int) DB::val('SELECT COUNT(*) FROM users'),
        'active_members' => (int) DB::val('SELECT COUNT(*) FROM lo_tree WHERE is_active = 1'),
        'activations_pending' => (int) DB::val("SELECT COUNT(*) FROM lo_activations WHERE payment_status = 'PENDING'"),
        'matching_paid_total' => (float) DB::val("SELECT COALESCE(SUM(amount),0) FROM lo_ledger WHERE ledger_type = 'MATCHING' AND status = 'PAID'"),
        'pools' => DB::all('SELECT * FROM lo_pools'),
        'withdrawals_pending' => (int) DB::val("SELECT COUNT(*) FROM lo_withdrawals WHERE status = 'PENDING'"),
    ]);
});

$router->get('/api/admin/members', function () {
    Auth::admin();
    $q = '%' . ($_GET['q'] ?? '') . '%';
    Http::ok(DB::all(
        'SELECT u.id, u.life_id, u.phone, u.email, u.status, u.created_at, t.is_active, t.lifetime_matchings
         FROM users u LEFT JOIN lo_tree t ON t.user_id = u.id
         WHERE u.life_id LIKE ? OR u.phone LIKE ? ORDER BY u.id DESC LIMIT 200',
        [$q, $q]
    ));
});

$router->post('/api/admin/members/{id}/status', function ($p) {
    Auth::admin();
    $b = Http::body();
    if (!in_array($b['status'] ?? '', ['active', 'suspended', 'pending'], true)) throw new HttpError('Invalid status');
    if (!DB::one('SELECT id FROM users WHERE id = ?', [(int) $p['id']])) throw new HttpError('Member not found', 404);
    DB::run('UPDATE users SET status = ? WHERE id = ?', [$b['status'], (int) $p['id']]);
    Http::ok();
});

// Payment gateway / manual confirmation: only SUCCESS triggers commissions.
$router->post('/api/admin/activations/{id}/confirm', function ($p) {
    Auth::admin();
    $b = Http::body();
    $status = $b['status'] ?? '';
    if (!in_array($status, ['SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'], true)) throw new HttpError('Invalid status');
    $ref = $b['payment_ref'] ?? null;
    DB::tx(function () use ($p, $status, $ref) {
        $act = DB::one('SELECT * FROM lo_activations WHERE id = ? FOR UPDATE', [(int) $p['id']]);
        if (!$act) throw new HttpError('Activation not found', 404);
        if (in_array($act['payment_status'], ['CANCELLED', 'REFUNDED'], true)) return; // final states
        if ($act['payment_status'] === 'SUCCESS') {
            // Refund/chargeback after success: audited reversal, never deletion.
            if (in_array($status, ['CANCELLED', 'REFUNDED'], true)) Commission::reverseActivation((int) $p['id'], $status);
            return; // duplicate SUCCESS notification ignored
        }
        if ($ref) {
            // Unique payment_ref: same gateway trx can never confirm twice.
            DB::run('UPDATE lo_activations SET payment_ref = ? WHERE id = ?', [$ref, (int) $p['id']]);
        }
        DB::run('UPDATE lo_activations SET payment_status = ? WHERE id = ?', [$status, (int) $p['id']]);
        if ($status === 'SUCCESS') Commission::processActivation((int) $p['id']);
    });
    Http::ok();
});

$router->get('/api/admin/withdrawals', function () {
    Auth::admin();
    Http::ok(DB::all(
        'SELECT w.*, u.life_id, u.phone FROM lo_withdrawals w JOIN users u ON u.id = w.user_id ORDER BY w.id DESC LIMIT 200'
    ));
});

$router->post('/api/admin/withdrawals/{id}/process', function ($p) {
    Auth::admin();
    $b = Http::body();
    if (!in_array($b['status'] ?? '', ['APPROVED', 'REJECTED'], true)) throw new HttpError('Invalid status');
    DB::tx(function () use ($p, $b) {
        $w = DB::one('SELECT status FROM lo_withdrawals WHERE id = ? FOR UPDATE', [(int) $p['id']]);
        if (!$w) throw new HttpError('Withdrawal not found', 404);
        if ($w['status'] !== 'PENDING') throw new HttpError('Withdrawal already processed', 409);
        DB::run('UPDATE lo_withdrawals SET status = ?, admin_note = ?, processed_at = NOW() WHERE id = ?',
            [$b['status'], $b['note'] ?? null, (int) $p['id']]);
    });
    Http::ok();
});

const ADMIN_SETTING_KEYS = ['matching_paused', 'daily_matching_cap', 'withdraw_min', 'withdraw_max', 'withdraw_charge_pct',
    'site_name', 'site_slogan', 'site_url', 'site_email', 'login_status', 'signup_status', 'withdrawal_status', 'profile_edit_status'];

$router->get('/api/admin/settings', function () {
    Auth::admin();
    $out = [];
    foreach (DB::all('SELECT k, v FROM lo_settings') as $r) if (in_array($r['k'], ADMIN_SETTING_KEYS, true)) $out[$r['k']] = $r['v'];
    Http::ok($out);
});

$router->post('/api/admin/settings', function ($p) {
    Auth::admin();
    $b = Http::body();
    $validated = [];
    foreach (ADMIN_SETTING_KEYS as $k) {
        if (!isset($b[$k])) continue;
        $raw = (string) $b[$k];
        // Plan rule: daily matching cap can be lowered but never raised above ৳5,000.
        if ($k === 'daily_matching_cap') {
            $v = (float) $b[$k];
            if (!is_finite($v) || $v < 0 || $v > \LifeOS\Engine\Plan::DAILY_MATCHING_CAP) throw new HttpError('daily_matching_cap must be between 0 and 5000', 422);
        }
        if (in_array($k, ['matching_paused', 'login_status', 'signup_status', 'withdrawal_status', 'profile_edit_status'], true) && !in_array($raw, ['0', '1'], true)) throw new HttpError("$k must be 0 or 1", 422);
        if (in_array($k, ['withdraw_min', 'withdraw_max'], true) && (!is_numeric($raw) || (float) $raw < 0)) throw new HttpError("$k must be a positive number", 422);
        if ($k === 'withdraw_charge_pct' && (!is_numeric($raw) || (float) $raw < 0 || (float) $raw > 100)) throw new HttpError('withdraw_charge_pct must be between 0 and 100', 422);
        if (strlen($raw) > 255) throw new HttpError("$k is too long", 422);
        $validated[$k] = $raw;
    }
    $current = [];
    foreach (DB::all('SELECT k, v FROM lo_settings') as $row) $current[$row['k']] = $row['v'];
    $limits = array_replace($current, $validated);
    if ((float) ($limits['withdraw_max'] ?? 25000) > 0 && (float) ($limits['withdraw_min'] ?? 500) > (float) ($limits['withdraw_max'] ?? 25000)) throw new HttpError('Minimum withdrawal must not exceed maximum', 422);
    DB::tx(function () use ($validated) {
        foreach ($validated as $k => $raw) DB::run('INSERT INTO lo_settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [$k, $raw]);
    });
    Http::ok();
});

// Rank & Reward fulfillment: a reached member's gift is paid from the RANK pool only,
// idempotent on the reference, and never borrows from another category.
$router->post('/api/admin/ranks/{id}/reward', function ($p) {
    Auth::admin();
    $b = Http::body();
    $userId = (int) $p['id'];
    $amount = (float) ($b['amount'] ?? 0);
    $reference = trim((string) ($b['reference'] ?? ''));
    if (!is_finite($amount) || $amount <= 0) throw new HttpError('amount must be positive', 422);
    if ($reference === '' || strlen($reference) > 60) throw new HttpError('reference required (max 60 chars)', 422);
    $rank = DB::one('SELECT r.name FROM lo_user_ranks ur JOIN lo_ranks r ON r.id = ur.rank_id WHERE ur.user_id = ? AND r.required_matchings > 0 ORDER BY r.required_matchings DESC LIMIT 1', [$userId]);
    if (!$rank) throw new HttpError('Member has no achieved rank', 422);
    Commission::poolSpend('RANK', $amount, 'RR-U' . $userId . '-' . $reference, 'Rank reward (' . $rank['name'] . ') for user ' . $userId);
    Http::ok(['user_id' => $userId, 'rank' => $rank['name'], 'amount' => $amount, 'reference' => $reference]);
});

$router->get('/api/admin/matching-events', function () {
    Auth::admin();
    Http::ok(DB::all('SELECT * FROM lo_matching_events ORDER BY id DESC LIMIT 300'));
});

$router->post('/api/admin/adjustments', function () {
    Auth::admin();
    $b = Http::body();
    if (empty($b['user_id']) || !isset($b['amount'])) throw new HttpError('user_id and amount required');
    DB::run(
        'INSERT INTO lo_ledger (payout_code, user_id, ledger_type, amount, note) VALUES (?,?,?,?,?)',
        ['ADJ-' . strtoupper(bin2hex(random_bytes(8))), (int) $b['user_id'], 'ADJUSTMENT', (float) $b['amount'], $b['note'] ?? 'Admin adjustment']
    );
    Http::ok();
});

// Daily statement closing: once per member per past day; a closed statement is never recalculated.
$router->post('/api/admin/statements/close', function () {
    Auth::admin();
    $b = Http::body();
    $date = (string) ($b['date'] ?? date('Y-m-d', strtotime('-1 day')));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || $date >= date('Y-m-d')) throw new HttpError('Only a finished past day can be closed', 422);
    $closed = DB::tx(function () use ($date) {
        $rows = DB::all("SELECT beneficiary_id AS uid, COALESCE(SUM(CASE WHEN payout_status = 'PAID' THEN actual_payout ELSE 0 END),0) AS paid, COUNT(*) AS n
                         FROM lo_matching_events WHERE DATE(created_at) = ? GROUP BY beneficiary_id", [$date]);
        $n = 0;
        foreach ($rows as $r) {
            $n += DB::run('INSERT IGNORE INTO lo_statements (statement_code, user_id, statement_date, matching_paid, event_count) VALUES (?,?,?,?,?)',
                ['ST-' . str_replace('-', '', $date) . '-' . $r['uid'], (int) $r['uid'], $date, $r['paid'], (int) $r['n']]);
        }
        return $n;
    });
    Http::ok(['date' => $date, 'statements_closed' => $closed]);
});

// ---------- Admin panel reports & content ----------

/** Shared date/user filters for report endpoints: from, to (Y-m-d) and q (Life ID / phone). */
function adminFilters(string $dateCol, ?string $userCol = 'u'): array
{
    $w = []; $p = [];
    foreach (['from' => '>=', 'to' => '<='] as $k => $op) {
        $d = (string) ($_GET[$k] ?? '');
        if ($d === '') continue;
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) throw new HttpError("Invalid $k date", 422);
        $w[] = "DATE($dateCol) $op ?"; $p[] = $d;
    }
    $q = trim((string) ($_GET['q'] ?? ''));
    if ($q !== '' && $userCol) { $w[] = "($userCol.life_id LIKE ? OR $userCol.phone LIKE ?)"; $p[] = "%$q%"; $p[] = "%$q%"; }
    return [$w ? ' WHERE ' . implode(' AND ', $w) : '', $p];
}

const ADMIN_NAME_SQL = '(SELECT name FROM user_profiles up WHERE up.user_id = u.id ORDER BY up.id LIMIT 1)';

$router->get('/api/admin/company-info', function () {
    Auth::admin();
    $sum = fn(string $t) => (float) DB::val("SELECT COALESCE(SUM(amount),0) FROM lo_ledger WHERE ledger_type = ? AND status = 'PAID'", [$t]);
    $w = fn(string $s) => (float) DB::val('SELECT COALESCE(SUM(amount),0) FROM lo_withdrawals WHERE status = ?', [$s]);
    Http::ok([
        'members' => (int) DB::val('SELECT COUNT(*) FROM users'),
        'active_members' => (int) DB::val('SELECT COUNT(*) FROM lo_tree WHERE is_active = 1'),
        'sales_count' => (int) DB::val("SELECT COUNT(*) FROM lo_sales WHERE status <> 'REVERSED'"),
        'sales_amount' => (float) DB::val("SELECT COALESCE(SUM(fee),0) FROM lo_activations WHERE payment_status = 'SUCCESS'"),
        'activations_pending' => (int) DB::val("SELECT COUNT(*) FROM lo_activations WHERE payment_status = 'PENDING'"),
        'bonus' => ['CASHBACK' => $sum('CASHBACK'), 'REFERRAL' => $sum('REFERRAL'), 'MATCHING' => $sum('MATCHING'), 'GENERATION' => $sum('GENERATION'), 'RANK' => $sum('RANK'), 'ADJUSTMENT' => $sum('ADJUSTMENT')],
        'withdraw' => ['APPROVED' => $w('APPROVED'), 'PENDING' => $w('PENDING'), 'REJECTED' => $w('REJECTED'),
            'charges' => (float) DB::val("SELECT COALESCE(SUM(charge),0) FROM lo_withdrawals WHERE status = 'APPROVED'")],
        'pools' => DB::all('SELECT * FROM lo_pools'),
    ]);
});

$router->get('/api/admin/plan', function () {
    Auth::admin();
    $P = \LifeOS\Engine\Plan::class;
    Http::ok([
        'fee' => $P::FEE, 'allocations' => $P::ALLOCATIONS, 'generation' => $P::GENERATION,
        'max_matching_events' => $P::MAX_MATCHING_EVENTS, 'daily_matching_cap' => $P::DAILY_MATCHING_CAP,
        'matching_total_limit' => $P::MATCHING_TOTAL_LIMIT,
    ]);
});

$router->get('/api/admin/ranks', function () {
    Auth::admin();
    Http::ok(DB::all('SELECT r.id, r.name, r.required_matchings, (SELECT COUNT(*) FROM lo_user_ranks ur WHERE ur.rank_id = r.id) AS achieved FROM lo_ranks r ORDER BY r.id'));
});

$router->get('/api/admin/rank-achievers', function () {
    Auth::admin();
    [$where, $p] = adminFilters('ur.achieved_at');
    Http::ok(DB::all('SELECT ur.user_id, ur.achieved_at, r.name AS rank_name, u.life_id, u.phone, ' . ADMIN_NAME_SQL . ' AS name
        FROM lo_user_ranks ur JOIN lo_ranks r ON r.id = ur.rank_id JOIN users u ON u.id = ur.user_id' . ($where ? $where . ' AND' : ' WHERE') . ' r.required_matchings > 0
        ORDER BY ur.achieved_at DESC LIMIT 500', $p));
});

$router->get('/api/admin/member-list', function () {
    Auth::admin();
    [$where, $p] = adminFilters('u.created_at');
    Http::ok(DB::all('SELECT u.id, u.life_id, u.phone, u.email, u.status, u.referred_by, u.created_at, ' . ADMIN_NAME_SQL . ' AS name,
        t.is_active, t.lifetime_matchings, t.placement_side, (SELECT life_id FROM users s WHERE s.id = t.sponsor_id) AS sponsor_life_id
        FROM users u LEFT JOIN lo_tree t ON t.user_id = u.id' . $where . ' ORDER BY u.id DESC LIMIT 500', $p));
});

$router->get('/api/admin/member-report', function () {
    Auth::admin();
    [$where, $p] = adminFilters('u.created_at');
    $rows = DB::all("SELECT u.id, u.life_id, u.created_at, " . ADMIN_NAME_SQL . " AS name,
        (SELECT life_id FROM users s JOIN lo_tree t ON s.id = t.sponsor_id WHERE t.user_id = u.id) AS sponsor_life_id,
        (SELECT COUNT(*) FROM lo_tree c WHERE c.sponsor_id = u.id) AS directs,
        (SELECT COALESCE(SUM(fee),0) FROM lo_activations a WHERE a.user_id = u.id AND a.payment_status = 'SUCCESS') AS purchased,
        (SELECT COALESCE(SUM(amount),0) FROM lo_ledger l WHERE l.user_id = u.id AND l.status = 'PAID' AND l.ledger_type <> 'CASHBACK') AS earned,
        (SELECT COALESCE(SUM(amount + charge),0) FROM lo_withdrawals w WHERE w.user_id = u.id AND w.status IN ('PENDING','APPROVED')) AS withdrawn
        FROM users u" . $where . " ORDER BY u.id DESC LIMIT 500", $p);
    foreach ($rows as &$r) $r['balance'] = round((float) $r['earned'] - (float) $r['withdrawn'], 2);
    Http::ok(array_values(array_filter($rows, fn($r) => $r['balance'] > 0 || !empty($_GET['all']))));
});

$router->get('/api/admin/activations', function () {
    Auth::admin();
    [$where, $p] = adminFilters('a.created_at');
    $st = (string) ($_GET['status'] ?? '');
    if ($st !== '') {
        if (!in_array($st, ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'], true)) throw new HttpError('Invalid status', 422);
        $where .= ($where ? ' AND' : ' WHERE') . ' a.payment_status = ?'; $p[] = $st;
    }
    Http::ok(DB::all('SELECT a.id, a.activation_code, a.payment_ref, a.payment_status, a.fee, a.bv, a.processed, a.created_at, a.processed_at, u.life_id, u.phone, ' . ADMIN_NAME_SQL . ' AS name
        FROM lo_activations a JOIN users u ON u.id = a.user_id' . $where . ' ORDER BY a.id DESC LIMIT 500', $p));
});

$router->get('/api/admin/joining-report', function () {
    Auth::admin();
    [$where, $p] = adminFilters('u.created_at');
    Http::ok(DB::all('SELECT u.id, u.life_id, u.phone, u.created_at, u.status, ' . ADMIN_NAME_SQL . ' AS name, u.referred_by
        FROM users u' . $where . ' ORDER BY u.id DESC LIMIT 500', $p));
});

$router->get('/api/admin/sales-report', function () {
    Auth::admin();
    [$where, $p] = adminFilters('s.created_at');
    Http::ok(DB::all('SELECT s.id, s.sale_code, s.created_at, s.matching_count, s.matching_paid, s.generation_paid, s.status, a.fee, a.bv, a.payment_ref, u.life_id, ' . ADMIN_NAME_SQL . ' AS name
        FROM lo_sales s JOIN lo_activations a ON a.id = s.activation_id JOIN users u ON u.id = s.user_id' . $where . ' ORDER BY s.id DESC LIMIT 500', $p));
});

$router->get('/api/admin/ledger', function () {
    Auth::admin();
    [$where, $p] = adminFilters('l.created_at');
    $t = (string) ($_GET['type'] ?? '');
    if ($t !== '') {
        if (!in_array($t, ['CASHBACK', 'REFERRAL', 'MATCHING', 'GENERATION', 'RANK', 'ADJUSTMENT', 'WITHDRAW'], true)) throw new HttpError('Invalid type', 422);
        $where .= ($where ? ' AND' : ' WHERE') . ' l.ledger_type = ?'; $p[] = $t;
    }
    Http::ok(DB::all('SELECT l.id, l.payout_code, l.ledger_type, l.amount, l.level, l.status, l.note, l.created_at, u.life_id, ' . ADMIN_NAME_SQL . ' AS name
        FROM lo_ledger l JOIN users u ON u.id = l.user_id' . $where . ' ORDER BY l.id DESC LIMIT 1000', $p));
});

// Balance Add: credits a member through an audited ADJUSTMENT ledger row (never edits balances directly).
$router->post('/api/admin/balance-add', function () {
    $admin = Auth::admin();
    $b = Http::body();
    $amount = (float) ($b['amount'] ?? 0);
    if (!is_finite($amount) || $amount == 0.0 || abs($amount) > 1000000) throw new HttpError('Enter a valid amount', 422);
    $u = DB::one('SELECT id, life_id FROM users WHERE life_id = ?', [trim((string) ($b['life_id'] ?? ''))]);
    if (!$u) throw new HttpError('Member not found', 404);
    $code = 'ADJ-' . strtoupper(bin2hex(random_bytes(8)));
    DB::run('INSERT INTO lo_ledger (payout_code, user_id, ledger_type, amount, note) VALUES (?,?,?,?,?)',
        [$code, (int) $u['id'], 'ADJUSTMENT', $amount, mb_substr('By ' . $admin['name'] . ': ' . trim((string) ($b['note'] ?? 'Balance add')), 0, 255)]);
    Http::ok(['payout_code' => $code, 'life_id' => $u['life_id'], 'amount' => $amount]);
});

$router->get('/api/admin/notices', function () {
    Auth::admin();
    $kind = ($_GET['kind'] ?? 'NOTICE') === 'SCROLL' ? 'SCROLL' : 'NOTICE';
    Http::ok(DB::all('SELECT * FROM lo_notices WHERE kind = ? ORDER BY id DESC', [$kind]));
});

$router->post('/api/admin/notices', function () {
    $admin = Auth::admin();
    $b = Http::body();
    $kind = ($b['kind'] ?? 'NOTICE') === 'SCROLL' ? 'SCROLL' : 'NOTICE';
    $content = trim((string) ($b['content'] ?? ''));
    if ($content === '' || strlen($content) > 20000) throw new HttpError('Content is required', 422);
    $dates = [];
    foreach (['show_from', 'show_to'] as $k) {
        $d = (string) ($b[$k] ?? '');
        if ($d !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) throw new HttpError("Invalid $k", 422);
        $dates[] = $d ?: null;
    }
    \LifeOS\PanelPolicy::dates($dates[0], $dates[1]);
    $title = mb_substr(trim((string) ($b['title'] ?? '')), 0, 190) ?: null;
    if (!empty($b['id'])) {
        if (!DB::one('SELECT id FROM lo_notices WHERE id = ? AND kind = ?', [(int) $b['id'], $kind])) throw new HttpError('Notice not found', 404);
        DB::run('UPDATE lo_notices SET title = ?, content = ?, show_from = ?, show_to = ?, updated_by = ? WHERE id = ? AND kind = ?',
            [$title, $content, $dates[0], $dates[1], $admin['name'], (int) $b['id'], $kind]);
        Http::ok(['id' => (int) $b['id']]);
    }
    Http::ok(['id' => DB::insert('INSERT INTO lo_notices (kind, title, content, show_from, show_to, updated_by) VALUES (?,?,?,?,?,?)',
        [$kind, $title, $content, $dates[0], $dates[1], $admin['name']])]);
});

$router->post('/api/admin/notices/{id}/toggle', function ($p) {
    Auth::admin();
    if (!DB::one('SELECT id FROM lo_notices WHERE id = ?', [(int) $p['id']])) throw new HttpError('Notice not found', 404);
    DB::run('UPDATE lo_notices SET is_visible = 1 - is_visible WHERE id = ?', [(int) $p['id']]);
    Http::ok();
});

$router->post('/api/admin/notices/{id}/delete', function ($p) {
    Auth::admin();
    if (!DB::run('DELETE FROM lo_notices WHERE id = ?', [(int) $p['id']])) throw new HttpError('Notice not found', 404);
    Http::ok();
});

$router->post('/api/admin/password', function () {
    $admin = Auth::admin();
    $b = Http::body();
    if (!password_verify((string) ($b['current'] ?? ''), (string) ($admin['password'] ?? ''))) throw new HttpError('Current password is wrong', 422);
    $new = (string) ($b['new'] ?? '');
    if (strlen($new) < 8 || strlen($new) > 72) throw new HttpError('New password must be 8–72 characters', 422);
    DB::run('UPDATE admin_users SET password = ? WHERE id = ?', [password_hash($new, PASSWORD_DEFAULT), (int) $admin['id']]);
    Http::ok();
});

$router->get('/api/admin/me', function () {
    $admin = Auth::admin();
    Http::ok(['id' => (int) $admin['id'], 'name' => $admin['name'], 'email' => $admin['email']]);
});
