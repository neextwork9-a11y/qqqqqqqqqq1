// Browser-only client for the standalone PHP member API.
const BASE = ((import.meta.env["VITE_LIFEOS_API_URL"] as string | undefined) ?? "https://server.nexarofx.com/lifeos/backendserver/api").replace(/\/$/, "");
const KEY = "lifeos_member_token";

export const memberToken = {
  get: () => (typeof window === "undefined" ? null : window.localStorage.getItem(KEY)),
  set: (t: string) => window.localStorage.setItem(KEY, t),
  clear: () => window.localStorage.removeItem(KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const DEMO_TOKEN = "demo";

export async function memberApi<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = memberToken.get();
  if (token === DEMO_TOKEN) {
    const { demoApi } = await import("./member-demo");
    return (await demoApi(path, init.method ?? (init.body ? "POST" : "GET"), init.body)) as T;
  }
  const res = await fetch(`${BASE}/member${path}`, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      // X-Auth-Token is a fallback for servers where Apache strips Authorization.
      ...(token ? { Authorization: `Bearer ${token}`, "X-Auth-Token": `Bearer ${token}` } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : null,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    if (res.status === 401) memberToken.clear();
    throw new ApiError(res.status, json?.error ?? json?.message ?? `Request failed (${res.status})`);
  }
  return (json && "data" in json ? json.data : json) as T;
}

export const bdt = (n: unknown) =>
  `${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;

export const LEDGER_LABELS: Record<string, string> = {
  CASHBACK: "Cashback Bonus (Service Only)",
  REFERRAL: "Direct Referral Bonus",
  MATCHING: "Matching Bonus",
  GENERATION: "Generation Bonus",
  RANK: "Rank Reward Bonus",
  ADJUSTMENT: "Adjustment",
};
