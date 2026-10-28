// Browser-only client for the standalone PHP admin API (mirrors member-api).
const BASE = ((import.meta.env["VITE_LIFEOS_API_URL"] as string | undefined) ?? "https://server.nexarofx.com/lifeos/backendserver/api").replace(/\/$/, "");
const KEY = "lifeos_admin_token";
export const ADMIN_DEMO_TOKEN = "demo";

export const adminToken = {
  get: () => (typeof window === "undefined" ? null : window.localStorage.getItem(KEY)),
  set: (t: string) => window.localStorage.setItem(KEY, t),
  clear: () => window.localStorage.removeItem(KEY),
};

export async function adminApi<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = adminToken.get();
  const method = init.method ?? (init.body ? "POST" : "GET");
  if (token === ADMIN_DEMO_TOKEN) {
    const { adminDemoApi } = await import("./admin-demo");
    return (await adminDemoApi(path, method, init.body)) as T;
  }
  const res = await fetch(`${BASE}/admin${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}`, "X-Auth-Token": `Bearer ${token}` } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : null,
  });
  let json: any = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok) {
    if (res.status === 401) adminToken.clear();
    throw new Error(json?.error ?? json?.message ?? `Request failed (${res.status})`);
  }
  return (json && "data" in json ? json.data : json) as T;
}

/** Build a query string from non-empty filter values. */
export const qs = (o: Record<string, string | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
};
