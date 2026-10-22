<?php
declare(strict_types=1);

namespace LifeOS\Engine;

use LifeOS\DB;

/** Rank engine: lifetime matchings determine rank; rewards come from the RANK pool. */
final class Rank
{
    /** Awards any newly reached ranks for the user. Called after each matching event. */
    public static function check(int $userId): void
    {
        $matchings = (int) DB::val('SELECT lifetime_matchings FROM lo_tree WHERE user_id = ?', [$userId]);
        $ranks = DB::all('SELECT * FROM lo_ranks WHERE required_matchings <= ? ORDER BY id', [$matchings]);
        foreach ($ranks as $rank) {
            DB::run('INSERT IGNORE INTO lo_user_ranks (user_id, rank_id) VALUES (?, ?)', [$userId, $rank['id']]);
        }
    }

    public static function current(int $userId): ?array
    {
        return DB::one(
            'SELECT r.* FROM lo_user_ranks ur JOIN lo_ranks r ON r.id = ur.rank_id
             WHERE ur.user_id = ? ORDER BY r.required_matchings DESC LIMIT 1',
            [$userId]
        );
    }
}
