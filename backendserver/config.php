<?php
// Local test configuration only. Never deploy this file.
return [
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'lifeos',
        'user' => 'lifeos_user',
        'pass' => 'testpass',
    ],
    'app_secret' => 'test-app-secret-0123456789abcdef0123456789abcdef',
    'master_key' => 'test-master-key-0123456789abcdef0123456789abcdef',
    'master_ip_allowlist' => [],
    'cors_origins' => ['http://localhost:8080', 'http://127.0.0.1:8090'],
    'timezone' => 'Asia/Dhaka',
    'token_ttl' => 60 * 60 * 12,
];
