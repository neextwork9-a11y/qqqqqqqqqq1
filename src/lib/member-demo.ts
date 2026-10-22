// Browser-only local test database for the member panel (used when the session token is "demo").
// Mirrors the PHP API response shapes so pages behave the same against live and local data.
const KEY = "lifeos_demo_db";

type Db = {
  me: Record<string, any>;
  profile: Record<string, string | null>;
  password: string;
  ledger: any[];
  withdrawals: any[];
  activations: any[];
  directs: any[];
};

function seed(): Db {
  const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 19).replace("T", " ");
  const types = ["REFERRAL", "MATCHING", "GENERATION", "CASHBACK", "MATCHING", "RANK"];
  return {
    me: { id: 1, name: "Demo Member", life_id: "LOS10001", referral_code: "LOS10001", phone: "01700000000", email: "demo@lifeos.test", status: "active", created_at: d(120), referred_by: "LOS10000", total_referral: 6 },
    profile: { name: "Demo Member", father_name: "Abdul Karim", mother_name: "Rahima Begum", nominee_name: "Sadia Akter", nominee_relation: "Sister", dob: "1992-04-12", blood_group: "B+", phone_alt: "01800000000", address_current: "Mirpur, Dhaka" },
    password: "123456",
    ledger: Array.from({ length: 14 }, (_, i) => ({ payout_code: `PO-${5000 + i}`, ledger_type: types[i % types.length], amount: [500, 800, 120, 50, 800, 2000][i % 6], level: types[i % 6] === "GENERATION" ? (i % 5) + 1 : null, status: "PAID", created_at: d(i * 6 + 1) })),
    withdrawals: [
      { id: 2, method: "bKash", account_number: "01700000000", amount: 1500, charge: 75, status: "PENDING", admin_note: null, created_at: d(2) },
      { id: 1, method: "Nagad", account_number: "01700000000", amount: 2000, charge: 100, status: "APPROVED", admin_note: "Paid", created_at: d(20) },
    ],
    activations: [{ id: 1, activation_code: "ACT-DEMO0001", payment_status: "SUCCESS", fee: 1000, processed: 1, created_at: d(119) }],
    directs: ["Rakib Hasan", "Nusrat Jahan", "Tanvir Ahmed", "Mitu Rani", "Shakil Khan", "Farhana Islam"].map((n, i) => ({ id: 2 + i, life_id: `LOS1000${2 + i}`, name: n, phone: `0171000000${i}`, created_at: d(110 - i * 12), is_active: i % 3 !== 2 ? 1 : 0 })),
  };
}

function load(): Db {
  const raw = window.localStorage.getItem(KEY);
  if (raw) try { return JSON.parse(raw); } catch { /* reseed */ }
  const db = seed();
  save(db);
  return db;
}
const save = (db: Db) => window.localStorage.setItem(KEY, JSON.stringify(db));
export const resetDemoDb = () => window.localStorage.removeItem(KEY);

function tree(id: number, depth: number): any {
  if (depth > 3 || (depth === 3 && id % 3 === 0)) return null;
  return { user_id: id, life_id: `LOS${10000 + id}`, active: id % 4 !== 3, left_carry: depth === 0 ? 4000 : 0, right_carry: depth === 0 ? 2000 : 0, left: tree(id * 2, depth + 1), right: tree(id * 2 + 1, depth + 1) };
}

export async function demoApi(path: string, method: string, body: any): Promise<any> {
  const db = load();
  const [p, qs] = path.split("?");
  const err = (m: string) => { throw new Error(m); };
  const paid = db.ledger.reduce((a, r) => a + Number(r.amount), 0);
  const pending = db.withdrawals.filter((w) => w.status === "PENDING").reduce((a, w) => a + Number(w.amount), 0);
  const withdrawn = db.withdrawals.filter((w) => w.status === "APPROVED").reduce((a, w) => a + Number(w.amount), 0);
  const by_type: Record<string, number> = {};
  for (const r of db.ledger) by_type[r.ledger_type] = (by_type[r.ledger_type] ?? 0) + Number(r.amount);

  if (method === "GET") {
    switch (p) {
      case "/me": return { ...db.me, name: db.profile["name"] || db.me["name"] };
      case "/settings": return { withdraw_min: "500", withdraw_max: "25000", withdraw_charge_pct: "5", withdrawal_status: "1", profile_edit_status: "1" };
      case "/notices": return [];
      case "/profile": return db.profile;
      case "/wallet": return { withdrawable: paid - pending - withdrawn - (by_type["CASHBACK"] ?? 0), pending_withdrawal: pending, withdrawn, cashback_service_only: by_type["CASHBACK"] ?? 0, by_type };
      case "/rank": return { lifetime_matchings: 12, current: { name: "Executive" }, next: { name: "Project Director", required_matchings: 25 } };
      case "/ledger": {
        const t = new URLSearchParams(qs).get("type");
        return t ? db.ledger.filter((r) => r.ledger_type === t) : db.ledger;
      }
      case "/tree/binary": return tree(1, 0);
      case "/tree/enrollment": return { directs: db.directs, legs: [] };
      case "/activations": return db.activations;
      case "/withdrawals": return db.withdrawals;
      case "/matching": return [];
    }
  } else {
    switch (p) {
      case "/profile": db.profile = { ...db.profile, ...body }; save(db); return { ok: true };
      case "/password":
        if (body.current_password !== db.password) err("Current password is wrong");
        if (String(body.new_password ?? "").length < 6) err("New password must be at least 6 characters");
        db.password = body.new_password; save(db); return { ok: true };
      case "/withdrawals": {
        const amount = Number(body.amount);
        if (amount < 500) err("Minimum withdrawal is 500");
        if (!body.method || !body.account_number) err("method and account_number required");
        const id = Math.max(0, ...db.withdrawals.map((w) => w.id)) + 1;
        db.withdrawals.unshift({ id, method: body.method, account_number: body.account_number, amount, charge: Math.round(amount * 5) / 100, status: "PENDING", admin_note: null, created_at: new Date().toISOString().slice(0, 19).replace("T", " ") });
        save(db); return { withdrawal_id: id, status: "PENDING" };
      }
      case "/activations":
        if (db.activations.some((a) => a.payment_status === "SUCCESS")) err("Already activated");
        return { status: "PENDING" };
    }
  }
  err("Not available in demo");
}
