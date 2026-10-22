<?php
declare(strict_types=1);

namespace LifeOS\Engine;

use LifeOS\DB;
use LifeOS\HttpError;

/**
 * Commission engine. Processes one payment-verified activation exactly once:
 * cashback, direct referral, generation bonus, matching (enrollment + binary bills,
 * ONE selected payout per beneficiary event), daily cap, rank pool. One transaction.
 */
final class Commission
{
    /**
     * Distributes commissions for a SUCCESS activation.
     * Idempotent: an already-processed activation is a no-op.
     */
    public static function processActivation(int $activationId): void
    {
        DB::tx(function () use ($activationId) {
            $act = DB::one('SELECT * FROM lo_activations WHERE id = ? FOR UPDATE', [$activationId]);
            if (!$act) throw new HttpError('Activation not found', 404);
            if ($act['payment_status'] !== 'SUCCESS') throw new HttpError('Payment not successful', 422);
            if ((int) $act['processed'] === 1) return; // duplicate gateway notification ignored

            $userId = (int) $act['user_id'];
            $tree = DB::one('SELECT * FROM lo_tree WHERE user_id = ? FOR UPDATE', [$userId]);
            if (!$tree) throw new HttpError('User tree node missing', 500);

            $saleId = DB::insert(
                'INSERT INTO lo_sales (sale_code, activation_id, user_id) VALUES (?, ?, ?)',
                [self::code('SALE'), $activationId, $userId]
            );
            DB::run('UPDATE lo_tree SET is_active = 1 WHERE user_id = ?', [$userId]);

            // Service Cashback ৳100 — own ledger, never withdrawable/transferable.
            self::ledger('CASHBACK', $userId, Plan::CASHBACK, $activationId, $saleId, null, null, 'Service cashback (service-use only)');

            // Direct Referral ৳200 — direct sponsor only, and only if that sponsor is active.
            $sponsorId = $tree['sponsor_id'] !== null ? (int) $tree['sponsor_id'] : null;
            if ($sponsorId !== null && self::isActive($sponsorId)) {
                self::ledger('REFERRAL', $sponsorId, Plan::REFERRAL, $activationId, $saleId, null, null, 'Direct referral');
            } else {
                self::pool('REFERRAL_UNPAID', Plan::REFERRAL, $activationId, "REF-A$activationId");
            }

            // Generation Bonus ৳200 — 10 sponsor generations. An inactive sponsor blocks
            // every contribution above it; unpaid amounts stay in the company pool.
            $upline = Placement::sponsorUpline($userId, 10);
            $blocked = false;
            foreach (Plan::GENERATION as $level => $amount) {
                $target = $upline[$level - 1] ?? null;
                if ($target !== null && !$blocked && !self::isActive($target)) $blocked = true;
                if ($target !== null && !$blocked) {
                    self::ledger('GENERATION', $target, (float) $amount, $activationId, $saleId, null, $level, "Generation $level bonus");
                    DB::run('UPDATE lo_sales SET generation_paid = generation_paid + ? WHERE id = ?', [$amount, $saleId]);
                } else {
                    self::pool('GENERATION_UNPAID', (float) $amount, $activationId, "GEN$level-A$activationId");
                }
            }

            // Rank & Reward ৳200 — separate pool, never funded from the matching reserve.
            self::pool('RANK', Plan::RANK_POOL, $activationId, "RANK-A$activationId");

            // Fixed ৳1,000 allocation per activation (100/200/300/200/200); never borrowed across categories.
            foreach (Plan::ALLOCATIONS as $cat => $amt) {
                DB::run('INSERT IGNORE INTO lo_allocations (activation_id, category, amount) VALUES (?,?,?)', [$activationId, $cat, $amt]);
            }

            // Matching: both trees produce bills; each beneficiary gets ONE event / ONE payout.
            $paused = DB::val("SELECT v FROM lo_settings WHERE k = 'matching_paused'") === '1';
            $candidates = [];
            self::collectBinary($userId, $paused, $candidates, $saleId);
            self::collectEnrollment($userId, $sponsorId, $paused, $candidates, $saleId);
            foreach ($candidates as $beneficiaryId => $types) {
                self::matchingEvent($beneficiaryId, $saleId, $activationId, $sponsorId, $types);
            }

            DB::run('UPDATE lo_activations SET processed = 1, processed_at = NOW() WHERE id = ?', [$activationId]);
        });
    }

    /**
     * Refund / cancellation / chargeback: history is never deleted. Every paid entry of
     * the activation receives an opposite reversal entry; matching events are marked REVERSED.
     */
    public static function reverseActivation(int $activationId, string $status): void
    {
        DB::tx(function () use ($activationId, $status) {
            $act = DB::one('SELECT * FROM lo_activations WHERE id = ? FOR UPDATE', [$activationId]);
            if (!$act) throw new HttpError('Activation not found', 404);
            DB::run('UPDATE lo_activations SET payment_status = ? WHERE id = ?', [$status, $activationId]);
            if ((int) $act['processed'] !== 1) return;

            $rows = DB::all("SELECT * FROM lo_ledger WHERE activation_id = ? AND status = 'PAID' AND amount > 0 AND ledger_type <> 'ADJUSTMENT' FOR UPDATE", [$activationId]);
            foreach ($rows as $row) {
                // Cashback reversal stays inside the cashback ledger; commissions go to the adjustment ledger.
                $type = $row['ledger_type'] === 'CASHBACK' ? 'CASHBACK' : 'ADJUSTMENT';
                DB::run(
                    'INSERT IGNORE INTO lo_ledger (payout_code, user_id, ledger_type, amount, activation_id, sale_id, ref_id, level, note) VALUES (?,?,?,?,?,?,?,?,?)',
                    ['REV-' . $row['id'], (int) $row['user_id'], $type, -(float) $row['amount'], $activationId, $row['sale_id'], (int) $row['id'], $row['level'], 'Reversal: ' . $row['ledger_type'] . " ($status)"]
                );
            }
            DB::run("UPDATE lo_matching_events SET payout_status = 'REVERSED' WHERE activation_id = ? AND payout_status = 'PAID'", [$activationId]);
            DB::run("UPDATE lo_sales SET status = 'REVERSED' WHERE activation_id = ?", [$activationId]);
            DB::run('UPDATE lo_tree SET is_active = 0 WHERE user_id = ?', [(int) $act['user_id']]);
        });
    }

    /** Binary tree: new volume walks up the placement chain; one pair per active upline. */
    private static function collectBinary(int $userId, bool $paused, array &$candidates, int $saleId): void
    {
        foreach (Placement::binaryUpline($userId) as $step) {
            $up = DB::one('SELECT * FROM lo_tree WHERE user_id = ? FOR UPDATE', [$step['user_id']]);
            if (!$up || !(int) $up['is_active']) continue; // inactive IDs hold/earn no eligible volume
            $col = $step['side'] === 'L' ? 'left_carry' : 'right_carry';
            DB::run("UPDATE lo_tree SET $col = $col + 1 WHERE user_id = ?", [$step['user_id']]);
            // Provenance: this unit of volume keeps its source sale identity until consumed.
            $sideVal = $step['side'] === 'L' ? 1 : 2;
            DB::run('INSERT IGNORE INTO lo_volumes (sale_id, beneficiary_id, tree_type, leg_id) VALUES (?, ?, "BINARY", ?)', [$saleId, (int) $step['user_id'], $sideVal]);
            if ($paused) continue; // volume carries; no new matching while paused

            $left = (float) $up['left_carry'] + ($step['side'] === 'L' ? 1 : 0);
            $right = (float) $up['right_carry'] + ($step['side'] === 'R' ? 1 : 0);
            if (min($left, $right) < 1) continue;
            // Consume exactly one pair for this event — consumed volume is never reused.
            DB::run('UPDATE lo_tree SET left_carry = left_carry - 1, right_carry = right_carry - 1, left_consumed = left_consumed + 1, right_consumed = right_consumed + 1 WHERE user_id = ?', [$step['user_id']]);
            self::consumeVolumePair((int) $step['user_id'], 'BINARY', $saleId, [1, 2]);
            $candidates[(int) $step['user_id']]['BINARY'] = true;
        }
    }

    /** Enrollment tree: pairs the two largest eligible legs; an inactive sponsor blocks propagation. */
    private static function collectEnrollment(int $userId, ?int $sponsorId, bool $paused, array &$candidates, int $saleId): void
    {
        $legUser = $userId;
        $cur = $sponsorId;
        $depth = 500;
        while ($cur !== null && $depth-- > 0) {
            $up = DB::one('SELECT is_active, sponsor_id FROM lo_tree WHERE user_id = ? FOR UPDATE', [$cur]);
            if (!$up || !(int) $up['is_active']) break; // inactive sponsor: nothing contributes upward
            DB::run(
                'INSERT INTO lo_enroll_legs (upline_id, leg_user_id, carry) VALUES (?, ?, 1)
                 ON DUPLICATE KEY UPDATE carry = carry + 1',
                [$cur, $legUser]
            );
            // Provenance: the leg keeps its source sale identity until its volume is consumed.
            DB::run('INSERT IGNORE INTO lo_volumes (sale_id, beneficiary_id, tree_type, leg_id) VALUES (?, ?, "ENROLLMENT", ?)', [$saleId, $cur, $legUser]);
            if (!$paused) {
                $legs = DB::all('SELECT leg_user_id, carry FROM lo_enroll_legs WHERE upline_id = ? AND carry > 0 ORDER BY carry DESC, leg_user_id ASC LIMIT 2 FOR UPDATE', [$cur]);
                if (count($legs) === 2) {
                    foreach ($legs as $leg) {
                        DB::run('UPDATE lo_enroll_legs SET carry = carry - 1, consumed = consumed + 1 WHERE upline_id = ? AND leg_user_id = ?', [$cur, $leg['leg_user_id']]);
                    }
                    self::consumeVolumePair($cur, 'ENROLLMENT', $saleId, array_map(fn ($l) => (int) $l['leg_user_id'], $legs));
                    $candidates[$cur]['ENROLLMENT'] = true;
                }
            }
            $legUser = $cur;
            $cur = $up['sponsor_id'] !== null ? (int) $up['sponsor_id'] : null;
        }
    }

    /**
     * Marks the two consumed volume units as CONSUMED and links them to the matching
     * decision, so every paid event traces back to its source sales. Legacy carries
     * without a volume row still pair; only rows that exist are audited.
     */
    private static function consumeVolumePair(int $beneficiaryId, string $treeType, int $saleId, array $legIds): void
    {
        $consumed = [];
        foreach ($legIds as $legId) {
            $v = DB::one('SELECT id FROM lo_volumes WHERE beneficiary_id = ? AND tree_type = ? AND leg_id = ? AND status = "CARRY" ORDER BY id LIMIT 1 FOR UPDATE', [$beneficiaryId, $treeType, $legId]);
            if ($v === null) continue;
            DB::run('UPDATE lo_volumes SET status = "CONSUMED" WHERE id = ?', [(int) $v['id']]);
            $consumed[] = (int) $v['id'];
            if (count($consumed) === 2) break;
        }
        if (count($consumed) === 2) {
            DB::run('INSERT IGNORE INTO lo_volume_pairs (decision_key, sale_id, beneficiary_id, tree_type, first_volume_id, second_volume_id) VALUES (?,?,?,?,?,?)',
                ["S$saleId:B$beneficiaryId", $saleId, $beneficiaryId, $treeType, $consumed[0], $consumed[1]]);
        }
    }

    /**
     * One matching event: enrollment and binary bills are both calculated, the larger
     * eligible bill is selected, ONE payout = MIN(bill, schedule, remaining reserve, remaining daily cap).
     */
    private static function matchingEvent(int $beneficiaryId, int $saleId, int $activationId, ?int $sponsorId, array $types): void
    {
        $sale = DB::one('SELECT * FROM lo_sales WHERE id = ? FOR UPDATE', [$saleId]);
        if (!$sale || $sale['status'] !== 'OPEN') return;
        if ((int) $sale['matching_count'] >= Plan::MAX_MATCHING_EVENTS) {
            DB::run("UPDATE lo_sales SET status = 'EXHAUSTED' WHERE id = ?", [$saleId]);
            return;
        }
        $eventNo = (int) $sale['matching_count'] + 1;
        $schedule = Plan::matchingAmount($eventNo);

        $enrollmentBill = !empty($types['ENROLLMENT']) ? $schedule : 0.0;
        $binaryBill = !empty($types['BINARY']) ? $schedule : 0.0;
        $selectedType = $enrollmentBill >= $binaryBill ? 'ENROLLMENT' : 'BINARY';
        $selected = max($enrollmentBill, $binaryBill);
        if ($selected <= 0) return;

        // Duplicate guard: Sale + Beneficiary may produce at most one matching decision.
        $decisionKey = "S$saleId:B$beneficiaryId";
        if (DB::one('SELECT decision_key FROM lo_matching_decisions WHERE decision_key = ? FOR UPDATE', [$decisionKey]) !== null) return;

        $reserveBefore = max(0.0, (float) $sale['matching_reserve'] - (float) $sale['matching_paid']);
        $today = date('Y-m-d');
        DB::run('INSERT IGNORE INTO lo_daily_caps (user_id, cap_date) VALUES (?, ?)', [$beneficiaryId, $today]);
        $dailyBefore = (float) DB::val('SELECT paid FROM lo_daily_caps WHERE user_id = ? AND cap_date = ? FOR UPDATE', [$beneficiaryId, $today]);
        $storedCap = DB::val("SELECT v FROM lo_settings WHERE k = 'daily_matching_cap'");
        $capSetting = $storedCap === false || $storedCap === null ? Plan::DAILY_MATCHING_CAP : (float) $storedCap;

        // FINAL = MIN(selected bill, event amount, remaining reserve, remaining daily cap); cap can never exceed ৳5,000.
        $payout = Plan::payout($enrollmentBill, $binaryBill, $eventNo, $reserveBefore, $dailyBefore, $capSetting);
        $flushed = $payout <= 0;

        foreach (['ENROLLMENT' => $enrollmentBill, 'BINARY' => $binaryBill] as $type => $bill) {
            DB::run('INSERT INTO lo_matching_bills (sale_id, beneficiary_id, bill_type, amount, status) VALUES (?, ?, ?, ?, ?)',
                [$saleId, $beneficiaryId, $type, $bill, $type === $selectedType ? 'SELECTED' : ($bill > 0 ? 'ELIGIBLE' : 'CALCULATED')]);
        }

        $eventCode = self::code('ME');
        $placementParent = DB::val('SELECT placement_parent_id FROM lo_tree WHERE user_id = ?', [$beneficiaryId]);
        DB::run(
            'INSERT INTO lo_matching_events
             (event_code, sale_id, activation_id, beneficiary_id, sponsor_id, placement_parent_id, event_number,
              enrollment_bill, binary_bill, selected_bill, selected_type, calculated_payout, actual_payout,
              reserve_before, reserve_after, daily_before, daily_after, payout_status, note)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                $eventCode, $saleId, $activationId, $beneficiaryId, $sponsorId, $placementParent, $eventNo,
                $enrollmentBill, $binaryBill, $selected, $selectedType, $schedule, $payout,
                $reserveBefore, $reserveBefore - $payout, $dailyBefore, $dailyBefore + $payout,
                $flushed ? 'FLUSHED' : 'PAID', $flushed ? 'Daily cap reached' : null,
            ]
        );

        // Counter never resets by date; reserve is reduced by the ACTUAL payout only.
        DB::run('UPDATE lo_sales SET matching_count = matching_count + 1, matching_paid = matching_paid + ? WHERE id = ?', [$payout, $saleId]);
        DB::run('UPDATE lo_tree SET lifetime_matchings = lifetime_matchings + 1 WHERE user_id = ?', [$beneficiaryId]);

        if (!$flushed) {
            DB::run('UPDATE lo_daily_caps SET paid = paid + ? WHERE user_id = ? AND cap_date = ?', [$payout, $beneficiaryId, $today]);
            self::ledger('MATCHING', $beneficiaryId, $payout, $activationId, $saleId, null, $eventNo, "Matching #$eventNo ($selectedType)", $eventCode);
        }
        // Unpaid part of this event (cap flush / reserve shortfall) stays as company safety buffer.
        if ($schedule - $payout > 0) self::pool('MATCHING_BUFFER', round($schedule - $payout, 6), $activationId, "BUF-$eventCode");
        DB::run('INSERT INTO lo_matching_decisions (decision_key, event_code) VALUES (?, ?)', [$decisionKey, $eventCode]);
        Rank::check($beneficiaryId);
    }

    private static function isActive(int $userId): bool
    {
        return (int) DB::val('SELECT is_active FROM lo_tree WHERE user_id = ?', [$userId]) === 1;
    }

    private static function ledger(string $type, int $userId, float $amount, ?int $activationId, ?int $saleId, ?int $refId, ?int $level, string $note, ?string $code = null): void
    {
        DB::run(
            'INSERT INTO lo_ledger (payout_code, user_id, ledger_type, amount, activation_id, sale_id, ref_id, level, note) VALUES (?,?,?,?,?,?,?,?,?)',
            [$code ?? self::code('PAY'), $userId, $type, $amount, $activationId, $saleId, $refId, $level, $note]
        );
    }

    /** Pool credit with an audited, idempotent movement row per activation. */
    private static function pool(string $pool, float $amount, ?int $activationId = null, ?string $code = null): void
    {
        if ($activationId !== null) {
            $code ??= "$pool-A$activationId-" . bin2hex(random_bytes(4));
            if (DB::run('INSERT IGNORE INTO lo_pool_movements (movement_code, activation_id, pool, amount) VALUES (?,?,?,?)', [$code, $activationId, $pool, $amount]) === 0) return;
        }
        DB::run('INSERT INTO lo_pools (pool, balance) VALUES (?, ?) ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)', [$pool, $amount]);
    }

    /**
     * Spends from a company pool for audited, non-activation items (rank gifts).
     * Idempotent on the movement code; a pool can never go negative — categories
     * are never borrowed from each other.
     */
    public static function poolSpend(string $pool, float $amount, string $movementCode, string $note): void
    {
        DB::tx(function () use ($pool, $amount, $movementCode, $note) {
            if ($amount <= 0) throw new HttpError('Amount must be positive', 422);
            $row = DB::one('SELECT balance FROM lo_pools WHERE pool = ? FOR UPDATE', [$pool]);
            // Check replay under the pool lock before checking today's remaining funds.
            $existing = DB::one('SELECT pool, amount FROM lo_pool_movements WHERE movement_code = ? FOR UPDATE', [$movementCode]);
            if ($existing !== null) {
                if ($existing['pool'] !== $pool || abs((float) $existing['amount'] + $amount) > 0.0000005) {
                    throw new HttpError('Reward reference already used for a different payment', 409);
                }
                return;
            }
            if (!$row || (float) $row['balance'] < $amount) throw new HttpError('Insufficient ' . $pool . ' pool balance', 422);
            if (DB::run('INSERT IGNORE INTO lo_pool_movements (movement_code, activation_id, pool, amount) VALUES (?, 0, ?, ?)', [$movementCode, $pool, -$amount]) === 0) return; // replay ignored
            DB::run('UPDATE lo_pools SET balance = balance - ? WHERE pool = ?', [$amount, $pool]);
        });
    }

    private static function code(string $prefix): string
    {
        return $prefix . '-' . strtoupper(bin2hex(random_bytes(8)));
    }
}
