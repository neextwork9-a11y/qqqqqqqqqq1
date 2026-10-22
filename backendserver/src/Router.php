<?php
declare(strict_types=1);

namespace LifeOS;

final class Router
{
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
        $this->routes[] = [$method, $regex, $handler];
    }
    public function get(string $p, callable $h): void { $this->add('GET', $p, $h); }
    public function post(string $p, callable $h): void { $this->add('POST', $p, $h); }

    public function dispatch(string $method, string $path): void
    {
        foreach ($this->routes as [$m, $re, $h]) {
            if ($m === $method && preg_match($re, $path, $mt)) {
                $h(array_filter($mt, 'is_string', ARRAY_FILTER_USE_KEY));
                return;
            }
        }
        throw new HttpError('Not found', 404);
    }
}
