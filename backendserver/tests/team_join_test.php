<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
use LifeOS\DB;
use LifeOS\Engine\Placement;

// Disposable local database only; run after run_tests.php.
$failures = 0; $count = 0;
function checkTeam(string $name, bool $ok): void {
    global $failures, $count; $count++; if (!$ok) $failures++;
    echo ($ok ? 'ok    ' : 'FAIL  ') . $name . "\n";
}
function joinRequest(array $body): array {
    $c = curl_init('http://127.0.0.1:8090/api/member/register');
    curl_setopt_array($c, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode($body)]);
    $raw = curl_exec($c); $status = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    return ['status' => $status, 'data' => json_decode((string) $raw, true)['data'] ?? []];
}
function previewRequest(string $code, string $team): array {
    $raw = file_get_contents('http://127.0.0.1:8090/api/member/sponsor?' . http_build_query(['code' => $code, 'team' => $team]));
    return json_decode((string) $raw, true)['data'] ?? [];
}
$existing = DB::one('SELECT referral_code FROM users ORDER BY id LIMIT 1');
$s = joinRequest(['name' => 'Team Sponsor', 'phone' => '01788000000', 'password' => 'testpass', 'referral_code' => $existing['referral_code']]);
checkTeam('create isolated sponsor', $s['status'] === 200);
$sid = (int) ($s['data']['user_id'] ?? 0);
$code = DB::val('SELECT referral_code FROM users WHERE id = ?', [$sid]);
$base = ['name' => 'Team Member', 'email' => 'team@example.test', 'blood_group' => 'O+', 'district' => 'Dhaka', 'post_code' => '1207', 'address_current' => 'Test address', 'nid_number' => 'TEST123', 'password' => 'testpass', 'confirm_password' => 'testpass', 'accepted_terms' => 1, 'referral_code' => $code];
$sponsorLifeId = DB::val('SELECT life_id FROM users WHERE id = ?', [$sid]);
foreach (['L', 'R'] as $side) {
    $preview = previewRequest((string) $code, $side);
    checkTeam("empty $side form placement is sponsor ID", ($preview['placement_life_id'] ?? null) === $sponsorLifeId && ($preview['placement_side'] ?? null) === $side);
}
function joinTeam(string $name, string $team, int $n): int {
    global $base;
    $r = joinRequest($base + ['username' => $name, 'team' => $team, 'phone' => '0178800000' . $n]);
    checkTeam("$name registers", $r['status'] === 200);
    return (int) ($r['data']['user_id'] ?? 0);
}
$left = joinTeam('leftone', 'L', 1);
$right = joinTeam('rightone', 'R', 2);
$ll = joinTeam('lefttwo', 'L', 3);
$lr = joinTeam('leftthree', 'L', 4);
$lll = joinTeam('leftfour', 'L', 5);
// Left link always extends the outer left leg: sponsor -> left -> ll -> lr -> lll, each on L.
foreach ([[$left,$sid,'L'],[$right,$sid,'R'],[$ll,$left,'L'],[$lr,$ll,'L'],[$lll,$lr,'L']] as [$id,$parent,$side]) {
    $row = DB::one('SELECT placement_parent_id, placement_side, sponsor_id FROM lo_tree WHERE user_id = ?', [$id]);
    checkTeam("placement $id follows outer leg", (int) $row['placement_parent_id'] === $parent && $row['placement_side'] === $side);
    checkTeam("sponsor $id remains original referrer", (int) $row['sponsor_id'] === $sid);
}
$slot = Placement::preview($sid, 'R');
checkTeam('right preview extends right leg', $slot['parent_id'] === $right && $slot['side'] === 'R');
$slot = Placement::preview($sid, 'L');
checkTeam('left preview is last left member', $slot['parent_id'] === $lll && $slot['side'] === 'L');
$slot = Placement::preview($ll, 'R');
checkTeam('downline own right link uses own tree', $slot['parent_id'] === $ll && $slot['side'] === 'R');
$rr = joinTeam('righttwo', 'R', 7);
$rrr = joinTeam('rightthree', 'R', 8);
foreach ([[$rr, $right], [$rrr, $rr]] as [$id, $parent]) {
    $row = DB::one('SELECT placement_parent_id, placement_side, sponsor_id FROM lo_tree WHERE user_id = ?', [$id]);
    checkTeam("right registration $id stays on right chain", (int) $row['placement_parent_id'] === $parent && $row['placement_side'] === 'R' && (int) $row['sponsor_id'] === $sid);
    checkTeam("right parent $parent points to its child", (int) DB::val('SELECT right_child_id FROM lo_tree WHERE user_id = ?', [$parent]) === $id);
    $legacy = DB::one('SELECT placement_id, position FROM users WHERE id = ?', [$id]);
    checkTeam("right legacy placement $id agrees", (int) $legacy['placement_id'] === $parent && $legacy['position'] === 'right');
}
foreach ([['L', $lll], ['R', $rrr]] as [$side, $parent]) {
    $preview = previewRequest((string) $code, $side);
    checkTeam("$side form shows last same-side member ID", ($preview['placement_life_id'] ?? null) === DB::val('SELECT life_id FROM users WHERE id = ?', [$parent]) && ($preview['life_id'] ?? null) === $sponsorLifeId && ($preview['placement_side'] ?? null) === $side);
}
$downlineCode = (string) DB::val('SELECT referral_code FROM users WHERE id = ?', [$ll]);
$downline = joinRequest(array_replace($base, ['referral_code' => $downlineCode, 'team' => 'R', 'username' => 'downlineright', 'phone' => '01788000009']));
$downlineId = (int) ($downline['data']['user_id'] ?? 0);
$row = DB::one('SELECT placement_parent_id, placement_side, sponsor_id FROM lo_tree WHERE user_id = ?', [$downlineId]);
checkTeam('downline own right registration anchors at downline', $downline['status'] === 200 && (int) ($row['placement_parent_id'] ?? 0) === $ll && ($row['placement_side'] ?? null) === 'R' && (int) ($row['sponsor_id'] ?? 0) === $ll);
$ownLeft = joinRequest(array_replace($base, ['referral_code' => $downlineCode, 'team' => 'L', 'username' => 'downlineleft', 'phone' => '01788000010']));
$ownLeftId = (int) ($ownLeft['data']['user_id'] ?? 0);
$row = DB::one('SELECT placement_parent_id, placement_side, sponsor_id FROM lo_tree WHERE user_id = ?', [$ownLeftId]);
checkTeam('downline own left registration shares existing left chain', $ownLeft['status'] === 200 && (int) ($row['placement_parent_id'] ?? 0) === $lll && ($row['placement_side'] ?? null) === 'L' && (int) ($row['sponsor_id'] ?? 0) === $ll);
$stale = joinRequest(array_replace($base, ['team' => 'L', 'username' => 'staleleft', 'phone' => '01788000011', 'placement_parent_id' => $sid, 'placement_id' => $sid, 'placement_side' => 'R']));
$staleId = (int) ($stale['data']['user_id'] ?? 0);
$row = DB::one('SELECT placement_parent_id, placement_side, sponsor_id FROM lo_tree WHERE user_id = ?', [$staleId]);
checkTeam('stale or forged placement cannot redirect left link', $stale['status'] === 200 && (int) ($row['placement_parent_id'] ?? 0) === $ownLeftId && ($row['placement_side'] ?? null) === 'L' && (int) ($row['sponsor_id'] ?? 0) === $sid);
checkTeam('left chain never fills off-leg right vacancy', DB::val('SELECT right_child_id FROM lo_tree WHERE user_id = ?', [$left]) === null);
checkTeam('right chain never fills off-leg left vacancy', DB::val('SELECT left_child_id FROM lo_tree WHERE user_id = ?', [$right]) === null);
$profile = DB::one('SELECT * FROM user_profiles WHERE user_id = ?', [$left]);
checkTeam('registration fields persist', $profile['district'] === 'Dhaka' && $profile['post_code'] === '1207' && $profile['blood_group'] === 'O+' && $profile['nid_number'] === 'TEST123');
$bad = $base + ['username' => 'invalidteam', 'team' => 'X', 'phone' => '01788000006'];
checkTeam('invalid side rejected', joinRequest($bad)['status'] === 400);
$bad['team'] = 'L'; $bad['accepted_terms'] = 0;
checkTeam('terms required', joinRequest($bad)['status'] === 400);
$bad['accepted_terms'] = 1; $bad['confirm_password'] = 'different';
checkTeam('password confirmation required', joinRequest($bad)['status'] === 400);
$bad['confirm_password'] = 'testpass'; $bad['username'] = 'leftone';
checkTeam('duplicate username rejected', joinRequest($bad)['status'] === 409);
$bad['username'] = 'invalidphoto'; $bad['photo_base64'] = 'data:image/png;base64,YWJj';
checkTeam('non-image photo rejected', joinRequest($bad)['status'] === 400);
echo "$count checks, $failures failures\n";
exit($failures ? 1 : 0);