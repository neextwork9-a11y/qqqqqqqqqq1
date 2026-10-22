<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';

use LifeOS\Migrations;

function check(bool $condition, string $label): void {
    if (!$condition) throw new RuntimeException($label);
    echo "PASS: $label\n";
}

$sql = "-- heading\nCREATE TABLE users (id INT); DROP TABLE users; INSERT INTO users VALUES (1);";
$safe = Migrations::safeStatements('001_legacy_schema.sql', $sql);
check($safe === ['CREATE TABLE IF NOT EXISTS users (id INT)'], 'Existing user data is not dropped or reseeded');
check(Migrations::databaseName('lifeos') === '`lifeos`', 'Configured XAMPP database name is used');
try { Migrations::databaseName('lifeos`; DROP DATABASE other'); $rejected = false; }
catch (\LifeOS\HttpError $e) { $rejected = true; }
check($rejected, 'Unsafe database identifiers are rejected');
check(Migrations::statements("-- comment\nSELECT 'a;b'; /* ignored ; */ SELECT 'it''s;ok';") === ["SELECT 'a;b'", "SELECT 'it''s;ok'"], 'Quoted semicolons and comments preserve SQL boundaries');
$legacy = Migrations::safeStatements('001_legacy_schema.sql', (string) file_get_contents(dirname(__DIR__) . '/database/001_legacy_schema.sql'));
check(count($legacy) === 56, 'Every legacy table is initialized additively');

// Optional integration mode against an isolated, disposable local MySQL instance.
if (getenv('LIFEOS_SETUP_TEST_PORT')) {
    $port = (int) getenv('LIFEOS_SETUP_TEST_PORT');
    $name = 'lifeos_setup_test';
    $admin = new PDO("mysql:host=127.0.0.1;port=$port", 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    check($admin->query("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '$name'")->fetchColumn() === false, 'Disposable database starts missing');
    $config = new ReflectionProperty(\LifeOS\Config::class, 'c');
    $config->setValue(null, ['db' => ['host' => '127.0.0.1', 'port' => $port, 'name' => $name, 'user' => 'root', 'pass' => ''], 'auto_setup' => true]);
    $pdo = \LifeOS\DB::pdo();
    check($pdo->query('SELECT DATABASE()')->fetchColumn() === $name, 'Missing database is created automatically');
    $expected = count(glob(dirname(__DIR__) . '/database/*.sql') ?: []);
    check((int) $pdo->query('SELECT COUNT(*) FROM lo_migrations')->fetchColumn() === $expected, 'Every packaged migration completes on first connection');
    check($pdo->query("SELECT name FROM lo_migrations WHERE name='003_financial_safeguards.sql'")->fetchColumn() === '003_financial_safeguards.sql', 'Financial safeguards migration is recorded');
    foreach (['lo_pool_movements', 'lo_allocations', 'lo_volumes', 'lo_volume_pairs', 'lo_matching_decisions', 'lo_statements'] as $table) {
        check($pdo->query("SHOW TABLES LIKE '$table'")->fetchColumn() === $table, "$table is ready before activation");
    }
    $pdo->exec("INSERT INTO lo_settings (k,v) VALUES ('setup_preserve_test','existing')");
    check(Migrations::apply($pdo) === [], 'Repeated setup does not rerun migrations');
    check($pdo->query("SELECT v FROM lo_settings WHERE k='setup_preserve_test'")->fetchColumn() === 'existing', 'Existing database rows survive repeated setup');
    $pdo->exec("DELETE FROM lo_migrations WHERE name='001_legacy_schema.sql'");
    Migrations::apply($pdo);
    check($pdo->query("SELECT v FROM lo_settings WHERE k='setup_preserve_test'")->fetchColumn() === 'existing', 'Legacy setup retry preserves existing data');
    $admin->exec("DROP DATABASE `$name`");
}