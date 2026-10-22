<?php
// Copy to config.php on the server and fill in real values. config.php is never deployed or overwritten.
return [
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'lifeos',
        'user' => 'lifeos_user',
        'pass' => 'change-me',
    ],
    // XAMPP: start Apache + MySQL; use your local MySQL credentials above.
    // Missing database and tables are created automatically. Existing rows stay untouched.
    // The configured MySQL user needs CREATE permission. Set false for manual provisioning.
    'auto_setup' => true,
    // Long random string (64+ chars). Signs member/admin login tokens.
    'app_secret' => 'change-me-app-secret',
    // Long random string shared ONLY with the Master Worker push tool. Never put it in browser code.
    'master_key' => 'change-me-master-key',
    // Optional: restrict Master Worker calls to these IPs (empty = any IP with a valid signature).
    'master_ip_allowlist' => [],
    // Origins allowed to call the member API from the browser.
    'cors_origins' => ['https://lifeosbd.com', 'https://id-preview--b56a99d6-48a2-4afe-b8e0-87018393c06e.lovable.app', 'http://localhost:8080'],
    'timezone' => 'Asia/Dhaka',
    'token_ttl' => 60 * 60 * 12,
];
