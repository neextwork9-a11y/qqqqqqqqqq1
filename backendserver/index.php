<?php
declare(strict_types=1);

require __DIR__ . '/src/bootstrap.php';

use LifeOS\Http;
use LifeOS\Router;

Http::cors();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$router = new Router();
require __DIR__ . '/src/Api/routes_member.php';
require __DIR__ . '/src/Api/routes_admin.php';
require __DIR__ . '/src/Api/routes_master.php';

try {
    $router->dispatch($_SERVER['REQUEST_METHOD'], Http::path());
} catch (\LifeOS\HttpError $e) {
    Http::json(['ok' => false, 'error' => $e->getMessage()], $e->status);
} catch (\Throwable $e) {
    error_log('[lifeos] ' . $e);
    @mkdir(__DIR__ . '/storage/logs', 0775, true);
    @file_put_contents(__DIR__ . '/storage/logs/error.log', date('c') . ' ' . $e . "\n\n", FILE_APPEND);
    Http::json(['ok' => false, 'error' => 'Server error'], 500);
}
