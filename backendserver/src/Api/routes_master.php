<?php
declare(strict_types=1);

use LifeOS\DB;
use LifeOS\Http;
use LifeOS\HttpError;
use LifeOS\MasterAuth;

/**
 * Master Worker API — signed server-to-server management of the backend itself:
 * file CRUD inside backendserver/, database management, and signed live updates
 * with backup + rollback. Every call is HMAC-verified and audited.
 *
 * Signature: X-Master-Ts (unix), X-Master-Sig = HMAC_SHA256(master_key,
 * "{ts}.{METHOD}.{path}.{sha256(raw body)}").
 */

$master = function () {
    // Signature path includes the query string so GET reads are bound to their exact request.
    $path = Http::path() . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : '');
    MasterAuth::verify($_SERVER['REQUEST_METHOD'], $path);
};

/** Resolves a relative path safely inside LIFEOS_ROOT; blocks traversal and config.php writes. */
function masterPath(string $rel, bool $forWrite = false): string
{
    $rel = ltrim(str_replace('\\', '/', $rel), '/');
    if (preg_match('/(^|\/)\.\.(\/|$)|:/', $rel) || str_contains($rel, "\0")) {
        throw new HttpError('Path outside server root', 403);
    }
    $root = realpath(LIFEOS_ROOT);
    if ($root === false) throw new HttpError('Server root unavailable', 500);
    $candidate = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $rel);
    $parent = $candidate;
    $suffix = [];
    while (realpath($parent) === false) {
        if (is_link($parent)) throw new HttpError('Path outside server root', 403);
        $suffix[] = basename($parent);
        $next = dirname($parent);
        if ($next === $parent) throw new HttpError('Path outside server root', 403);
        $parent = $next;
    }
    $canonical = realpath($parent);
    $normalize = static fn(string $path): string => str_replace('\\', '/', $path);
    $rootCheck = rtrim($normalize($root), '/');
    $parentCheck = rtrim($normalize($canonical), '/');
    if (DIRECTORY_SEPARATOR === '\\') {
        $rootCheck = strtolower($rootCheck);
        $parentCheck = strtolower($parentCheck);
    }
    if ($parentCheck !== $rootCheck && !str_starts_with($parentCheck, $rootCheck . '/')) {
        throw new HttpError('Path outside server root', 403);
    }
    $full = $canonical . ($suffix ? DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, array_reverse($suffix)) : '');
    if ($forWrite && basename($full) === 'config.php') throw new HttpError('config.php is protected', 403);
    return $full;
}

// ---- Health ----
$router->get('/api/master/ping', function () use ($master) {
    $master();
    MasterAuth::audit('ping', null, true);
    Http::ok(['time' => date(DATE_ATOM), 'php' => PHP_VERSION]);
});

// ---- File CRUD ----
$router->get('/api/master/files/list', function () use ($master) {
    $master();
    $rel = $_GET['path'] ?? '';
    $dir = masterPath($rel);
    if (!is_dir($dir)) throw new HttpError('Not a directory', 404);
    $out = [];
    foreach (scandir($dir) ?: [] as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = $dir . '/' . $f;
        $out[] = ['name' => $f, 'dir' => is_dir($p), 'size' => is_file($p) ? filesize($p) : null, 'mtime' => filemtime($p)];
    }
    MasterAuth::audit('files.list', $rel, true);
    Http::ok($out);
});

$router->get('/api/master/files/read', function () use ($master) {
    $master();
    $p = masterPath((string) ($_GET['path'] ?? ''));
    if (!is_file($p)) throw new HttpError('Not found', 404);
    if (filesize($p) > 2 * 1024 * 1024) throw new HttpError('File too large to read via API', 413);
    MasterAuth::audit('files.read', $_GET['path'], true);
    Http::ok(['content' => base64_encode((string) file_get_contents($p))]);
});

$router->post('/api/master/files/write', function () use ($master) {
    $master();
    $b = Http::body();
    if (empty($b['path']) || !isset($b['content'])) throw new HttpError('path and content required');
    $p = masterPath((string) $b['path'], true);
    $dir = dirname($p);
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) throw new HttpError('Cannot create directory', 500);
    // Auto-backup before overwrite.
    if (is_file($p)) {
        $bak = LIFEOS_ROOT . '/storage/backups/' . date('Ymd-His') . '-' . str_replace('/', '_', (string) $b['path']);
        @mkdir(dirname($bak), 0755, true);
        copy($p, $bak);
    }
    $data = base64_decode((string) $b['content'], true);
    if ($data === false) throw new HttpError('content must be base64');
    file_put_contents($p, $data, LOCK_EX);
    MasterAuth::audit('files.write', $b['path'], true);
    Http::ok(['bytes' => strlen($data)]);
});

$router->post('/api/master/files/delete', function () use ($master) {
    $master();
    $b = Http::body();
    $p = masterPath((string) ($b['path'] ?? ''), true);
    if (!is_file($p)) throw new HttpError('Not found', 404);
    $bak = LIFEOS_ROOT . '/storage/backups/' . date('Ymd-His') . '-' . str_replace('/', '_', (string) $b['path']);
    @mkdir(dirname($bak), 0755, true);
    copy($p, $bak);
    unlink($p);
    MasterAuth::audit('files.delete', $b['path'], true);
    Http::ok();
});

// ---- Database management ----
$router->post('/api/master/db/query', function () use ($master) {
    $master();
    $b = Http::body();
    $sql = trim((string) ($b['sql'] ?? ''));
    if ($sql === '') throw new HttpError('sql required');
    $verb = strtoupper(strtok($sql, " \t\n"));
    if (in_array($verb, ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'], true)) {
        $rows = DB::all($sql, $b['params'] ?? []);
        MasterAuth::audit('db.query', $verb, true);
        Http::ok(['rows' => $rows]);
    }
    // Write statements allowed only with explicit confirm flag.
    if (empty($b['confirm_write'])) throw new HttpError('Write queries need confirm_write=true', 403);
    $n = DB::run($sql, $b['params'] ?? []);
    MasterAuth::audit('db.write', $verb, true, substr($sql, 0, 200));
    Http::ok(['affected' => $n]);
});

$router->get('/api/master/db/tables', function () use ($master) {
    $master();
    $tables = DB::all('SHOW TABLES');
    $out = [];
    foreach ($tables as $t) {
        $name = array_values($t)[0];
        $out[] = ['table' => $name, 'rows' => (int) DB::val("SELECT COUNT(*) FROM `$name`")];
    }
    MasterAuth::audit('db.tables', null, true);
    Http::ok($out);
});

$router->post('/api/master/db/migrate', function () use ($master) {
    $master();
    $applied = \LifeOS\Migrations::apply(DB::pdo());
    MasterAuth::audit('db.migrate', null, true, implode(',', $applied));
    Http::ok(['applied' => $applied]);
});

// ---- Live update: signed package deploy with backup + rollback ----
$router->post('/api/master/deploy', function () use ($master) {
    $master();
    $b = Http::body();
    if (empty($b['files']) || !is_array($b['files'])) throw new HttpError('files[] required: [{path, content(base64)}]');
    $stamp = date('Ymd-His');
    $backupDir = LIFEOS_ROOT . "/storage/backups/deploy-$stamp";
    @mkdir($backupDir, 0755, true);
    $written = [];
    try {
        foreach ($b['files'] as $f) {
            $p = masterPath((string) ($f['path'] ?? ''), true);
            $rel = (string) $f['path'];
            if (is_file($p)) {
                @mkdir(dirname($backupDir . '/' . $rel), 0755, true);
                copy($p, $backupDir . '/' . $rel);
            }
            @mkdir(dirname($p), 0755, true);
            $data = base64_decode((string) $f['content'], true);
            if ($data === false) throw new HttpError("Bad base64 for $rel");
            file_put_contents($p, $data, LOCK_EX);
            $written[] = $rel;
        }
    } catch (\Throwable $e) {
        // Roll back whatever was written in this deploy.
        foreach ($written as $rel) {
            $bak = $backupDir . '/' . $rel;
            if (is_file($bak)) copy($bak, masterPath($rel, true));
        }
        MasterAuth::audit('deploy', null, false, $e->getMessage());
        throw $e;
    }
    file_put_contents("$backupDir/manifest.json", json_encode(['files' => $written, 'time' => $stamp]));
    MasterAuth::audit('deploy', null, true, count($written) . ' files');
    Http::ok(['deploy_id' => "deploy-$stamp", 'files' => $written]);
});

$router->post('/api/master/rollback', function () use ($master) {
    $master();
    $b = Http::body();
    $id = (string) ($b['deploy_id'] ?? '');
    if (!preg_match('/^deploy-\d{8}-\d{6}$/', $id)) throw new HttpError('Invalid deploy_id');
    $dir = LIFEOS_ROOT . "/storage/backups/$id";
    $manifest = is_file("$dir/manifest.json") ? json_decode((string) file_get_contents("$dir/manifest.json"), true) : null;
    if (!$manifest) throw new HttpError('Deploy not found', 404);
    $restored = [];
    foreach ($manifest['files'] as $rel) {
        $bak = "$dir/$rel";
        if (is_file($bak)) { copy($bak, masterPath($rel, true)); $restored[] = $rel; }
    }
    MasterAuth::audit('rollback', $id, true, count($restored) . ' files');
    Http::ok(['restored' => $restored]);
});

$router->get('/api/master/audit', function () use ($master) {
    $master();
    Http::ok(DB::all('SELECT * FROM lo_master_audit ORDER BY id DESC LIMIT 200'));
});

// ---- Root (company) member: created once, active, at the top of both trees. ----
$router->post('/api/master/root/ensure', function () use ($master) {
    $master();
    $b = \LifeOS\Http::body();
    $pw = (string) ($b['password'] ?? '');
    if (strlen($pw) < 10 || strlen($pw) > 72) throw new HttpError('Root password must be 10–72 characters');
    $id = DB::tx(function () use ($pw) {
        $u = DB::one("SELECT id FROM users WHERE life_id = 'ROOT' FOR UPDATE");
        if ($u) {
            DB::run('UPDATE users SET pin_hash = ?, status = "active" WHERE id = ?', [password_hash($pw, PASSWORD_DEFAULT), (int) $u['id']]);
            $id = (int) $u['id'];
        } else {
            $id = DB::insert(
                'INSERT INTO users (life_id, membership_no, referral_code, phone, pin_hash, status, accepted_terms) VALUES ("ROOT","ROOT","ROOT","00000000000",?,"active",1)',
                [password_hash($pw, PASSWORD_DEFAULT)]
            );
            DB::insert('INSERT INTO user_wallets (user_id) VALUES (?)', [$id]);
            DB::insert('INSERT INTO user_profiles (user_id, name) VALUES (?, ?)', [$id, 'Life OS Root']);
        }
        \LifeOS\Engine\Placement::ensureNode($id, null);
        // Company root is an active ID (no sale, so it creates no commission itself).
        DB::run('UPDATE lo_tree SET is_active = 1 WHERE user_id = ?', [$id]);
        return $id;
    });
    \LifeOS\Http::ok(['root_user_id' => $id, 'life_id' => 'ROOT', 'referral_code' => 'ROOT']);
});
