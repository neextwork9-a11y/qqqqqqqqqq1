<?php
declare(strict_types=1);

namespace LifeOS;

/** Additive setup: never execute the destructive legacy dump against live data. */
final class Migrations
{
    public static function databaseName(string $name): string
    {
        if (!preg_match('/\A[a-zA-Z0-9_]{1,64}\z/', $name)) {
            throw new HttpError('Invalid database name in server configuration', 500);
        }
        return '`' . $name . '`';
    }

    /** Split SQL without treating quoted semicolons or comments as statement boundaries. */
    public static function statements(string $sql): array
    {
        $out = []; $buffer = ''; $quote = null; $length = strlen($sql);
        for ($i = 0; $i < $length; $i++) {
            $c = $sql[$i]; $next = $sql[$i + 1] ?? '';
            if ($quote !== null) {
                $buffer .= $c;
                if ($c === '\\' && $next !== '') { $buffer .= $next; $i++; }
                elseif ($c === $quote) {
                    if ($next === $quote) { $buffer .= $next; $i++; }
                    else $quote = null;
                }
                continue;
            }
            if ($c === "'" || $c === '"' || $c === '`') { $quote = $c; $buffer .= $c; continue; }
            if (($c === '-' && $next === '-' && ctype_space($sql[$i + 2] ?? ' ')) || $c === '#') {
                while ($i < $length && $sql[$i] !== "\n") $i++;
                $buffer .= ' '; continue;
            }
            if ($c === '/' && $next === '*') {
                $end = strpos($sql, '*/', $i + 2);
                if ($end === false) throw new \RuntimeException('Unclosed SQL comment');
                $i = $end + 1; $buffer .= ' '; continue;
            }
            if ($c === ';') {
                if (trim($buffer) !== '') $out[] = trim($buffer);
                $buffer = ''; continue;
            }
            $buffer .= $c;
        }
        if ($quote !== null) throw new \RuntimeException('Unclosed SQL string');
        if (trim($buffer) !== '') $out[] = trim($buffer);
        return $out;
    }

    public static function safeStatements(string $name, string $sql): array
    {
        $statements = self::statements($sql);
        if ($name !== '001_legacy_schema.sql') return $statements;
        // The source archive has DROP statements and sample settings. Use structure only.
        $out = [];
        foreach ($statements as $stmt) {
            if (preg_match('/\ACREATE\s+TABLE\s+/i', $stmt)) {
                $out[] = preg_replace('/\ACREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?/i', 'CREATE TABLE IF NOT EXISTS ', $stmt);
            }
        }
        return $out;
    }

    public static function apply(\PDO $pdo): array
    {
        $lock = 'lifeos-setup-' . $pdo->query('SELECT DATABASE()')->fetchColumn();
        $s = $pdo->prepare('SELECT GET_LOCK(?, 30)'); $s->execute([$lock]);
        if ((int) $s->fetchColumn() !== 1) throw new HttpError('Database setup busy; retry shortly', 503);
        try {
            $pdo->exec('CREATE TABLE IF NOT EXISTS lo_migrations (name VARCHAR(190) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
            $applied = [];
            $files = glob(LIFEOS_ROOT . '/database/*.sql') ?: []; sort($files, SORT_STRING);
            foreach ($files as $file) {
                $name = basename($file);
                $s = $pdo->prepare('SELECT name FROM lo_migrations WHERE name = ?'); $s->execute([$name]);
                if ($s->fetchColumn() !== false) continue;
                $sql = file_get_contents($file);
                if ($sql === false) throw new \RuntimeException('Cannot read migration');
                foreach (self::safeStatements($name, $sql) as $stmt) $pdo->exec($stmt);
                $s = $pdo->prepare('INSERT INTO lo_migrations (name) VALUES (?)'); $s->execute([$name]);
                $applied[] = $name;
            }
            return $applied;
        } finally {
            $s = $pdo->prepare('SELECT RELEASE_LOCK(?)'); $s->execute([$lock]);
        }
    }
}