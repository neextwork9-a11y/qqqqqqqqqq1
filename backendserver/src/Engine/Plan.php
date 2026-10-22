<?php
declare(strict_types=1);

namespace LifeOS\Engine;

/** Fixed marketing-plan constants. Changing these changes the business plan. */
final class Plan
{
    public const FEE = 1000.0;
    public const CASHBACK = 100.0;
    public const REFERRAL = 200.0;
    public const MATCHING_RESERVE = 300.0;
    public const GENERATION_POOL = 200.0;
    public const RANK_POOL = 200.0;
    public const MAX_MATCHING_EVENTS = 11;
    public const DAILY_MATCHING_CAP = 5000.0;
    public const MATCHING_TOTAL_LIMIT = 299.854;

    public const ALLOCATIONS = ['CASHBACK' => 100, 'REFERRAL' => 200, 'MATCHING' => 300, 'GENERATION' => 200, 'RANK' => 200];

    public static function payout(float $enrollment, float $binary, int $event, float $remainingReserve, float $dailyUsed, float $configuredCap = self::DAILY_MATCHING_CAP): float
    {
        $cap = max(0.0, min(self::DAILY_MATCHING_CAP, $configuredCap));
        // Floor to ledger precision: rounding must never exceed reserve or cap.
        $amount = max(0.0, min(max($enrollment, $binary), self::matchingAmount($event), $remainingReserve, $cap - $dailyUsed));
        return floor(($amount + 1e-10) * 1000000) / 1000000;
    }

    /** Generation 1..10 */
    public const GENERATION = [1 => 50, 2 => 30, 3 => 25, 4 => 20, 5 => 18, 6 => 15, 7 => 12, 8 => 10, 9 => 10, 10 => 10];

    /** Matching event n payout: 150 halved each step (150, 75, 37.5 ... 0.146484375). Total ≈ 299.854 */
    public static function matchingAmount(int $n): float
    {
        if ($n < 1 || $n > self::MAX_MATCHING_EVENTS) return 0.0;
        return 150.0 / (2 ** ($n - 1));
    }
}
