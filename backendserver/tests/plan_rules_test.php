<?php
declare(strict_types=1);
// Pure marketing-plan formula checks (no database). Run: php backendserver/tests/plan_rules_test.php
require __DIR__ . '/../src/Engine/Plan.php';
use LifeOS\Engine\Plan;

$fail = 0;
function t(string $n, bool $c): void { global $fail; echo ($c ? 'ok    ' : 'FAIL  ') . "$n\n"; if (!$c) $fail++; }

t('Allocation totals 1000', array_sum(Plan::ALLOCATIONS) === 1000);
t('Generation totals 200', array_sum(Plan::GENERATION) === 200);
t('Higher bill selected: 150 vs 75 pays 150', Plan::payout(150, 75, 1, 300, 0) === 150.0);
t('Bill capped by event amount (event 2 = 75)', Plan::payout(150, 150, 2, 300, 0) === 75.0);
t('Reserve 20 vs event 37.5 pays 20', Plan::payout(37.5, 0, 3, 20, 0) === 20.0);
t('Reserve never negative: empty reserve pays 0', Plan::payout(150, 0, 1, 0, 0) === 0.0);
t('Daily cap: 4950 used pays only 50', Plan::payout(150, 0, 1, 300, 4950) === 50.0);
t('Daily cap full pays 0', Plan::payout(150, 0, 1, 300, 5000) === 0.0);
t('Configured cap above 5000 is clamped', Plan::payout(150, 0, 1, 300, 5000, 9000) === 0.0);
t('Event 12 not eligible', Plan::payout(150, 150, 12, 300, 0) === 0.0);
$sum = 0.0; for ($i = 1; $i <= 11; $i++) $sum += Plan::payout(150, 0, $i, 300 - $sum, 0);
t('11 events never exceed 299.854', $sum <= 299.854 && $sum > 299.85);
exit($fail ? 1 : 0);
