<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
use LifeOS\PanelPolicy;
use LifeOS\HttpError;

function check(bool $condition, string $label): void {
    if (!$condition) throw new RuntimeException($label);
    echo "PASS: $label\n";
}
function rejected(callable $fn, int $status): bool {
    try { $fn(); return false; } catch (HttpError $e) { return $e->status === $status; }
}
$s = ['withdraw_min' => '500', 'withdraw_max' => '25000', 'withdraw_charge_pct' => '5'];
check(PanelPolicy::enabled(null) && !PanelPolicy::enabled('0'), 'Missing switch defaults enabled; explicit zero disables');
check(rejected(fn() => PanelPolicy::withdrawal($s + ['withdrawal_status' => '0'], 500, 1000), 403), 'Disabled withdrawals rejected');
check(rejected(fn() => PanelPolicy::withdrawal($s, 499, 1000), 400), 'Configured minimum 500 enforced');
check(rejected(fn() => PanelPolicy::withdrawal($s, 25001, 30000), 422), 'Configured maximum 25000 enforced');
check(rejected(fn() => PanelPolicy::withdrawal($s, 500, 524), 422), 'Amount plus 25 charge cannot overdraw 524 balance');
check(PanelPolicy::withdrawal($s, 500, 525) === 25.0, '500 withdrawal with 5 percent charge reserves exactly 525');
check(rejected(fn() => PanelPolicy::dates('2026-10-23', '2026-10-22'), 422), 'Reversed notice range rejected');
check(rejected(fn() => PanelPolicy::dates('2026-02-30', null), 422), 'Impossible notice date rejected');