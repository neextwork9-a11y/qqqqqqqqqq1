<?php
declare(strict_types=1);
namespace LifeOS\Engine;

use LifeOS\DB;

/** Shared wallet calculation: cashback and legacy balances never fund withdrawals. */
final class Wallet
{
    public static function lock(): void
    {
        DB::one('SELECT id FROM lo_financial_lock WHERE id = 1 FOR UPDATE');
    }

    public static function available(int $userId, ?int $excludingWithdrawal = null): float
    {
        $earned = (float) DB::val("SELECT COALESCE(SUM(amount),0) FROM lo_ledger WHERE user_id = ? AND ledger_type IN ('REFERRAL','MATCHING','GENERATION','RANK','ADJUSTMENT','WITHDRAW') AND status = 'PAID'", [$userId]);
        $sql = "SELECT COALESCE(SUM(amount),0) FROM lo_withdrawals WHERE user_id = ? AND status IN ('PENDING','APPROVED')";
        $params = [$userId];
        if ($excludingWithdrawal !== null) { $sql .= ' AND id <> ?'; $params[] = $excludingWithdrawal; }
        return round($earned - (float) DB::val($sql, $params), 6);
    }
}