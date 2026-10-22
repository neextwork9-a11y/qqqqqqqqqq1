<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';

// Register handlers without executing any signed request or touching a database.
$router = new class {
    public function get(string $path, callable $handler): void {}
    public function post(string $path, callable $handler): void {}
};
require dirname(__DIR__) . '/src/Api/routes_master.php';

function checkPath(bool $condition, string $label): void {
    if (!$condition) throw new RuntimeException($label);
    echo "PASS: $label\n";
}
function rejectsPath(string $path, bool $write = false): bool {
    try { masterPath($path, $write); return false; }
    catch (\LifeOS\HttpError $e) { return $e->status === 403; }
}
$root = realpath(LIFEOS_ROOT);
checkPath(masterPath('src/new_setup_file.php', true) === $root . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'new_setup_file.php', 'Missing setup file resolves inside canonical root');
checkPath(masterPath('src\\new_setup_file.php', true) === masterPath('src/new_setup_file.php', true), 'Windows and Unix relative separators resolve identically');
checkPath(rejectsPath('../outside/missing.php', true), 'Missing traversal target rejected');
checkPath(rejectsPath('src/../../outside.php', true), 'Nested traversal rejected');
checkPath(rejectsPath('C:/outside.php', true), 'Windows drive path rejected');
checkPath(rejectsPath('config.php', true), 'Private configuration cannot be overwritten');
$link = LIFEOS_ROOT . '/storage/master-path-test-link';
if (function_exists('symlink') && @symlink(sys_get_temp_dir(), $link)) {
    try { checkPath(rejectsPath('storage/master-path-test-link/missing.php', true), 'Missing target under external symlink rejected'); }
    finally { unlink($link); }
}