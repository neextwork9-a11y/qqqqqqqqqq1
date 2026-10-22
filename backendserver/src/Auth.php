<?php
declare(strict_types=1);

namespace LifeOS;

/** Stateless HMAC-signed bearer tokens for members ("m") and admins ("a"). */
final class Auth
{
    public static function issue(string $kind, int $id): string
    {
        $payload = self::b64(json_encode(['k' => $kind, 'id' => $id, 'exp' => time() + (int) Config::get('token_ttl', 43200)]));
        return $payload . '.' . self::b64(hash_hmac('sha256', $payload, Config::get('app_secret'), true));
    }

    private static function verify(string $kind): int
    {
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
        if (!preg_match('/^Bearer\s+([\w-]+)\.([\w-]+)$/', $h, $m)) throw new HttpError('Login required', 401);
        $sig = self::b64(hash_hmac('sha256', $m[1], Config::get('app_secret'), true));
        if (!hash_equals($sig, $m[2])) throw new HttpError('Invalid session', 401);
        $p = json_decode(self::unb64($m[1]), true);
        if (!$p || $p['k'] !== $kind || $p['exp'] < time()) throw new HttpError('Session expired', 401);
        return (int) $p['id'];
    }

    public static function member(): array
    {
        $u = DB::one('SELECT * FROM users WHERE id = ?', [self::verify('m')]);
        if (!$u || $u['status'] === 'suspended') throw new HttpError('Account unavailable', 403);
        return $u;
    }

    public static function admin(): array
    {
        $a = DB::one('SELECT * FROM admin_users WHERE id = ?', [self::verify('a')]);
        if (!$a) throw new HttpError('Admin only', 403);
        return $a;
    }

    private static function b64(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
    private static function unb64(string $s): string { return (string) base64_decode(strtr($s, '-_', '+/')); }
}
