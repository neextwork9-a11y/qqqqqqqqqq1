<?php
declare(strict_types=1);

namespace LifeOS\Engine;

use LifeOS\DB;
use LifeOS\HttpError;

/**
 * Binary placement tree. Sponsor (enrollment tree) and placement are fully separate.
 * Team links extend only the selected same-side chain from the sponsor.
 * Legacy requests without a team retain breadth-first placement.
 */
final class Placement
{
    /** Ensures a lo_tree row exists for the user. */
    public static function ensureNode(int $userId, ?int $sponsorId): void
    {
        DB::run(
            'INSERT IGNORE INTO lo_tree (user_id, sponsor_id) VALUES (?, ?)',
            [$userId, $sponsorId]
        );
    }

    /**
     * Places $userId at the end of the sponsor's selected same-side chain.
     * Without a team, legacy placement searches for the first free binary slot.
     * Must be called inside a transaction.
     */
    public static function place(int $userId, ?int $sponsorId, ?string $team = null): void
    {
        // All placements share one transaction-held lock, including first-root creation.
        DB::one('SELECT id FROM lo_placement_lock WHERE id = 1 FOR UPDATE');
        $node = DB::one('SELECT * FROM lo_tree WHERE user_id = ? FOR UPDATE', [$userId]);
        if (!$node) throw new HttpError('Tree node missing', 500);
        if ($node['placement_parent_id'] !== null) return; // already placed

        $slot = self::preview($sponsorId, $team, $userId);
        $parentId = $slot['parent_id'] ?? null;
        if ($parentId === null) {
            // Very first node in the whole tree — becomes the root.
            DB::run('UPDATE lo_tree SET placement_parent_id = NULL, placement_side = NULL WHERE user_id = ?', [$userId]);
            return;
        }

        $parent = DB::one('SELECT left_child_id, right_child_id FROM lo_tree WHERE user_id = ? FOR UPDATE', [$parentId]);
        if (!$parent) throw new HttpError('Placement parent missing', 500);
        if ($slot['side'] === 'L' && $parent['left_child_id'] === null) {
            // The parent's child pointer stores the CHILD's id.
            DB::run('UPDATE lo_tree SET left_child_id = ? WHERE user_id = ?', [$userId, $parentId]);
            $side = 'L';
        } elseif ($slot['side'] === 'R' && $parent['right_child_id'] === null) {
            DB::run('UPDATE lo_tree SET right_child_id = ? WHERE user_id = ?', [$userId, $parentId]);
            $side = 'R';
        } else {
            throw new HttpError('Placement race detected, retry', 409);
        }
        DB::run('UPDATE lo_tree SET placement_parent_id = ?, placement_side = ? WHERE user_id = ?', [$parentId, $side, $userId]);
        DB::run('UPDATE users SET placement_id = ?, position = ? WHERE id = ?', [$parentId, $side === 'L' ? 'left' : 'right', $userId]);
    }

    /** Advisory preview. Registration recomputes this under the placement lock. */
    public static function preview(?int $sponsorId, ?string $team = null, int $excludeId = 0): ?array
    {
        if ($team !== null && !in_array($team, ['L', 'R'], true)) throw new HttpError('Invalid team');
        $root = $sponsorId;
        if ($team !== null) {
            // Team links follow the sponsor's outer leg: keep walking the same side
            // until that side is free, so a Left link always lands on the last
            // left-most member's left (and Right on the right-most member's right).
            $col = $team === 'L' ? 'left_child_id' : 'right_child_id';
            $cur = (int) $sponsorId;
            for ($i = 0; $i < 100000; $i++) {
                $node = DB::one("SELECT $col AS c FROM lo_tree WHERE user_id = ?", [$cur]);
                if (!$node) throw new HttpError('Sponsor tree missing');
                if ($node['c'] === null || (int) $node['c'] === $excludeId) return ['parent_id' => $cur, 'side' => $team];
                $cur = (int) $node['c'];
            }
            throw new HttpError('Placement leg too deep');
        }
        $parentId = self::findSlot($root, $excludeId);
        if ($parentId === null) return null;
        $parent = DB::one('SELECT left_child_id FROM lo_tree WHERE user_id = ?', [$parentId]);
        return ['parent_id' => $parentId, 'side' => $parent['left_child_id'] === null ? 'L' : 'R'];
    }

    /**
     * Breadth-first search for the first node with a free slot, starting at $startId.
     * $excludeId is the node being placed — it can never become its own parent.
     */
    private static function findSlot(?int $startId, int $excludeId): ?int
    {
        $root = $startId;
        if ($root === null || $root === $excludeId || !DB::one('SELECT user_id FROM lo_tree WHERE user_id = ?', [$root])) {
            $row = DB::one('SELECT user_id FROM lo_tree WHERE placement_parent_id IS NULL AND placement_side IS NULL AND user_id <> ? ORDER BY user_id LIMIT 1', [$excludeId]);
            $root = $row ? (int) $row['user_id'] : null;
            if ($root === null) return null; // empty tree
        }
        $queue = [$root];
        while ($queue) {
            $batch = array_splice($queue, 0, 50);
            $in = implode(',', array_map('intval', $batch));
            $rows = DB::all("SELECT user_id, left_child_id, right_child_id FROM lo_tree WHERE user_id IN ($in)");
            $indexed = array_column($rows, null, 'user_id');
            // SQL IN does not preserve queue order: explicitly visit left before right.
            foreach ($batch as $id) {
                $r = $indexed[$id] ?? null;
                if (!$r) continue;
                if ((int) $r['user_id'] === $excludeId) continue; // never self-parent
                if ($r['left_child_id'] === null || $r['right_child_id'] === null) return (int) $r['user_id'];
                if ($r['left_child_id'] !== null) $queue[] = (int) $r['left_child_id'];
                if ($r['right_child_id'] !== null) $queue[] = (int) $r['right_child_id'];
            }
        }
        return null;
    }

    /** Upline chain via placement parents (for binary volume propagation). */
    public static function binaryUpline(int $userId, int $maxDepth = 500): array
    {
        $chain = [];
        $cur = DB::one('SELECT placement_parent_id, placement_side FROM lo_tree WHERE user_id = ?', [$userId]);
        while ($cur && $cur['placement_parent_id'] !== null && $maxDepth-- > 0) {
            $chain[] = ['user_id' => (int) $cur['placement_parent_id'], 'side' => $cur['placement_side']];
            $cur = DB::one('SELECT placement_parent_id, placement_side FROM lo_tree WHERE user_id = ?', [(int) $cur['placement_parent_id']]);
        }
        return $chain;
    }

    /** Upline chain via sponsors (for generation bonus). Index 0 = direct sponsor (generation 1). */
    public static function sponsorUpline(int $userId, int $maxDepth = 10): array
    {
        $chain = [];
        $cur = DB::one('SELECT sponsor_id FROM lo_tree WHERE user_id = ?', [$userId]);
        while ($cur && $cur['sponsor_id'] !== null && $maxDepth-- > 0) {
            $chain[] = (int) $cur['sponsor_id'];
            $cur = DB::one('SELECT sponsor_id FROM lo_tree WHERE user_id = ?', [(int) $cur['sponsor_id']]);
        }
        return $chain;
    }
}
