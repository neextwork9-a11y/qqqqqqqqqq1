<?php
declare(strict_types=1);
namespace LifeOS;

/** Shared enforcement for settings shown in the admin panel. */
final class PanelPolicy
{
    public static function enabled(mixed $value): bool { return $value === false || $value === null || (string) $value !== '0'; }

    public static function withdrawal(array $settings, float $amount, float $available): float
    {
        if (!self::enabled($settings['withdrawal_status'] ?? null)) throw new HttpError('Withdrawal requests are currently disabled', 403);
        $min = (float) ($settings['withdraw_min'] ?? 500);
        $max = (float) ($settings['withdraw_max'] ?? 25000);
        if (!is_finite($amount) || $amount <= 0 || $amount < $min) throw new HttpError("Minimum withdrawal is $min");
        if ($max > 0 && $amount > $max) throw new HttpError("Maximum withdrawal is $max", 422);
        $charge = round($amount * (float) ($settings['withdraw_charge_pct'] ?? 0) / 100, 3);
        if ($amount + $charge > $available) throw new HttpError('Insufficient withdrawable balance including charge', 422);
        return $charge;
    }

    public static function dates(?string $from, ?string $to): void
    {
        foreach ([$from, $to] as $date) {
            if ($date !== null && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || date('Y-m-d', strtotime($date) ?: 0) !== $date)) throw new HttpError('Invalid notice date', 422);
        }
        if ($from !== null && $to !== null && $from > $to) throw new HttpError('Show From must not be after Show To', 422);
    }
}