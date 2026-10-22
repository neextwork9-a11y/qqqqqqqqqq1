// Browser-only local test database for the admin panel (session token "demo").
// Mirrors the PHP admin API response shapes so pages behave the same against live and local data.
const KEY = "lifeos_admin_demo_db";

type Db = {
  settings: Record<string, string>;
  members: any[];
  activations: any[];
  ledger: any[];
  withdrawals: any[];
  notices: any[];
  userRanks: any[];
  seq: number;
};

const NAMES = ["Rakib Hasan", "Nusrat Jahan", "Tanvir Ahmed", "Mitu Rani", "Shakil Khan", "Farhana Islam", "Arif Hossain", "Sumaiya Akter", "Jahid Hasan", "Rumana Begum", "Sabbir Rahman", "Tania Sultana"];
const ts = (daysAgo: number, h = 10) => {
  const d = new Date(Date.now() - daysAgo * 86400000);
  d.setHours(h, 15, 0, 0);
  return d.toISOString().slice(0, 19).replace("T", " ");
};

function seed(): Db {
  const members: any[] = [{ id: 1, life_id: "LOS10000", name: "Life OS Company", phone: "01700000000", email: "info@lifeos.test", status: "active", referred_by: null, created_at: ts(200), is_active: 1, lifetime_matchings: 120, placement_side: null, sponsor_life_id: null }];
  NAMES.forEach((n, i) => members.push({ id: i + 2, life_id: `LOS${10001 + i}`, name: n, phone: `0171${String(1000000 + i * 7311).slice(0, 7)}`, email: null, status: i === 10 ? "suspended" : "active", referred_by: members[Math.floor(i / 2)]!.life_id, created_at: ts(180 - i * 12), is_active: i % 4 === 3 ? 0 : 1, lifetime_matchings: Math.max(0, 40 - i * 4), placement_side: i % 2 ? "R" : "L", sponsor_life_id: members[Math.floor(i / 2)]!.life_id }));
  const activations = members.slice(1).map((m, i) => ({ id: i + 1, activation_code: `ACT-${7000 + i}`, payment_ref: i % 4 === 3 ? `PENDING-${m.id}` : `TRX${88000 + i}`, payment_status: i % 4 === 3 ? "PENDING" : "SUCCESS", fee: 1000, bv: 1000, processed: i % 4 === 3 ? 0 : 1, created_at: m.created_at, processed_at: i % 4 === 3 ? null : m.created_at, user_id: m.id }));
  const ledger: any[] = [];
  let n = 1;
  for (const a of activations.filter((x) => x.payment_status === "SUCCESS")) {
    const buyer = members.find((m) => m.id === a.user_id)!;
    const sponsor = members.find((m) => m.life_id === buyer.sponsor_life_id)!;
    ledger.push({ id: n++, payout_code: `CB-${a.id}`, ledger_type: "CASHBACK", amount: 100, level: null, status: "PAID", note: "Service cashback", created_at: a.created_at, user_id: buyer.id });
    ledger.push({ id: n++, payout_code: `RF-${a.id}`, ledger_type: "REFERRAL", amount: 200, level: null, status: "PAID", note: `Referral from ${buyer.life_id}`, created_at: a.created_at, user_id: sponsor.id });
    ledger.push({ id: n++, payout_code: `GN-${a.id}-1`, ledger_type: "GENERATION", amount: 50, level: 1, status: "PAID", note: null, created_at: a.created_at, user_id: sponsor.id });
    if (a.id % 2 === 0) ledger.push({ id: n++, payout_code: `MT-${a.id}`, ledger_type: "MATCHING", amount: 150, level: null, status: "PAID", note: "Matching event", created_at: a.created_at, user_id: 1 + (a.id % 4) });
  }
  const withdrawals = [
    { id: 3, user_id: 2, method: "bKash", account_number: "01711000000", amount: 600, charge: 0, status: "PENDING", admin_note: null, created_at: ts(1, 14), processed_at: null },
    { id: 2, user_id: 3, method: "Nagad", account_number: "01711007311", amount: 500, charge: 0, status: "APPROVED", admin_note: "Paid", created_at: ts(9), processed_at: ts(8) },
    { id: 1, user_id: 1, method: "Bank", account_number: "1234567890", amount: 1000, charge: 0, status: "REJECTED", admin_note: "Wrong account", created_at: ts(20), processed_at: ts(19) },
  ];
  return {
    settings: { site_name: "Life OS", site_slogan: "Healthy Life, Better Tomorrow", site_url: "lifeos.com.bd", site_email: "info@lifeos.com.bd", login_status: "1", signup_status: "1", withdrawal_status: "1", profile_edit_status: "1", matching_paused: "0", daily_matching_cap: "5000", withdraw_min: "500", withdraw_max: "25000", withdraw_charge_pct: "0" },
    members, activations, ledger, withdrawals,
    notices: [
      { id: 1, kind: "NOTICE", title: "Welcome", content: "Welcome to Life OS. Complete your profile and nominee information.", show_from: null, show_to: null, is_visible: 1, updated_by: "Demo Admin", created_at: ts(30), updated_at: ts(30) },
      { id: 2, kind: "SCROLL", title: null, content: "Life OS annual celebration program will be announced soon.", show_from: null, show_to: null, is_visible: 1, updated_by: "Demo Admin", created_at: ts(5), updated_at: ts(5) },
    ],
    userRanks: [{ user_id: 1, rank_id: 2, achieved_at: ts(40) }, { user_id: 2, rank_id: 2, achieved_at: ts(15) }],
    seq: 100,
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
export const resetAdminDemoDb = () => window.localStorage.removeItem(KEY);

const RANKS = [[1, "Member", 0], [2, "Silver Executive", 100], [3, "Gold Executive", 300], [4, "Gold/Executive", 1000], [5, "Platinum Executive", 5000], [6, "Diamond Executive", 25000], [7, "Crown Executive", 125000], [8, "Ambassador", 500000], [9, "Global Ambassador", 1500000]] as const;
const GEN: Record<number, number> = { 1: 50, 2: 30, 3: 25, 4: 20, 5: 18, 6: 15, 7: 12, 8: 10, 9: 10, 10: 10 };

export async function adminDemoApi(path: string, method: string, body: any): Promise<any> {
  const db = load();
  const [p = "", query = ""] = path.split("?");
  const q = new URLSearchParams(query);
  const fail = (m: string) => { throw new Error(m); };
  const user = (id: number) => db.members.find((m) => m.id === id)!;
  const withUser = (r: any) => ({ ...r, life_id: user(r.user_id).life_id, phone: user(r.user_id).phone, name: user(r.user_id).name });
  const inRange = (d: string) => (!q.get("from") || d.slice(0, 10) >= q.get("from")!) && (!q.get("to") || d.slice(0, 10) <= q.get("to")!);
  const match = (r: any) => { const s = q.get("q"); return !s || r.life_id?.includes(s) || r.phone?.includes(s); };
  const filt = (rows: any[], dateKey = "created_at") => rows.filter((r) => inRange(r[dateKey]) && match(r));
  const paid = (t: string) => db.ledger.filter((l) => l.ledger_type === t && l.status === "PAID").reduce((a, l) => a + Number(l.amount), 0);
  const wsum = (s: string) => db.withdrawals.filter((w) => w.status === s).reduce((a, w) => a + Number(w.amount), 0);

  if (method === "GET") {
    switch (p) {
      case "/me": return { id: 1, name: "Demo Admin", email: "admin@lifeos.test" };
      case "/settings": return db.settings;
      case "/company-info": return {
        members: db.members.length, active_members: db.members.filter((m) => m.is_active).length,
        sales_count: db.activations.filter((a) => a.payment_status === "SUCCESS").length,
        sales_amount: db.activations.filter((a) => a.payment_status === "SUCCESS").reduce((s, a) => s + a.fee, 0),
        activations_pending: db.activations.filter((a) => a.payment_status === "PENDING").length,
        bonus: Object.fromEntries(["CASHBACK", "REFERRAL", "MATCHING", "GENERATION", "RANK", "ADJUSTMENT"].map((t) => [t, paid(t)])),
        withdraw: { APPROVED: wsum("APPROVED"), PENDING: wsum("PENDING"), REJECTED: wsum("REJECTED"), charges: 0 },
        pools: [{ pool: "RANK", balance: 1800 }, { pool: "GENERATION_UNPAID", balance: 950 }, { pool: "MATCHING_BUFFER", balance: 420 }, { pool: "REFERRAL_UNPAID", balance: 0 }],
      };
      case "/plan": return { fee: 1000, allocations: { CASHBACK: 100, REFERRAL: 200, MATCHING: 300, GENERATION: 200, RANK: 200 }, generation: GEN, max_matching_events: 11, daily_matching_cap: 5000, matching_total_limit: 299.854 };
      case "/ranks": return RANKS.map(([id, name, req]) => ({ id, name, required_matchings: req, achieved: db.userRanks.filter((u) => u.rank_id === id).length }));
      case "/rank-achievers": return filt(db.userRanks.map((r) => ({ ...withUser(r), rank_name: RANKS.find((x) => x[0] === r.rank_id)![1] })), "achieved_at");
      case "/member-list": return filt(db.members);
      case "/joining-report": return filt(db.members);
      case "/member-report": return filt(db.members).map((m) => {
        const earned = db.ledger.filter((l) => l.user_id === m.id && l.status === "PAID" && l.ledger_type !== "CASHBACK").reduce((a, l) => a + Number(l.amount), 0);
        const withdrawn = db.withdrawals.filter((w) => w.user_id === m.id && w.status !== "REJECTED").reduce((a, w) => a + Number(w.amount) + Number(w.charge), 0);
        return { ...m, directs: db.members.filter((c) => c.sponsor_life_id === m.life_id).length, purchased: db.activations.filter((a) => a.user_id === m.id && a.payment_status === "SUCCESS").reduce((s, a) => s + a.fee, 0), earned, withdrawn, balance: earned - withdrawn };
      }).filter((r) => r.balance > 0 || q.get("all"));
      case "/activations": return filt(db.activations.map(withUser)).filter((a) => !q.get("status") || a.payment_status === q.get("status")).sort((a, b) => b.id - a.id);
      case "/sales-report": return filt(db.activations.filter((a) => a.payment_status === "SUCCESS").map((a) => ({ ...withUser(a), id: a.id, sale_code: `SALE-${a.id}`, matching_count: a.id % 3, matching_paid: a.id % 2 ? 0 : 150, generation_paid: 50, status: "OPEN" }))).sort((a, b) => b.id - a.id);
      case "/ledger": return filt(db.ledger.map(withUser)).filter((l) => !q.get("type") || l.ledger_type === q.get("type")).sort((a, b) => b.id - a.id);
      case "/withdrawals": return db.withdrawals.map(withUser).sort((a, b) => b.id - a.id);
      case "/notices": return db.notices.filter((n) => n.kind === (q.get("kind") === "SCROLL" ? "SCROLL" : "NOTICE")).sort((a, b) => b.id - a.id);
      case "/matching-events": return db.ledger.filter((l) => l.ledger_type === "MATCHING").map((l, i) => ({ id: l.id, event_code: `EV-${l.id}`, sale_id: l.id, beneficiary_id: l.user_id, event_number: (i % 11) + 1, enrollment_bill: 150, binary_bill: 150, selected_bill: 150, selected_type: "BINARY", actual_payout: l.amount, payout_status: "PAID", created_at: l.created_at }));
    }
    return fail("Not found");
  }

  let m: RegExpMatchArray | null;
  if (p === "/settings") {
    const cap = Number(body.daily_matching_cap);
    if (!(cap >= 0 && cap <= 5000)) fail("daily_matching_cap must be between 0 and 5000");
    const pct = Number(body.withdraw_charge_pct);
    if (!(pct >= 0 && pct <= 100)) fail("withdraw_charge_pct must be between 0 and 100");
    db.settings = { ...db.settings, ...Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v)])) };
  } else if ((m = p.match(/^\/members\/(\d+)\/status$/))) {
    user(Number(m[1])).status = body.status;
  } else if ((m = p.match(/^\/activations\/(\d+)\/confirm$/))) {
    const a = db.activations.find((x) => x.id === Number(m![1])) ?? fail("Activation not found");
    if (a.payment_status === "PENDING") {
      a.payment_status = body.status;
      if (body.payment_ref) a.payment_ref = body.payment_ref;
      if (body.status === "SUCCESS") {
        a.processed = 1; a.processed_at = ts(0, new Date().getHours());
        user(a.user_id).is_active = 1;
        const sp = db.members.find((x) => x.life_id === user(a.user_id).sponsor_life_id);
        db.ledger.push({ id: ++db.seq, payout_code: `CB-${a.id}`, ledger_type: "CASHBACK", amount: 100, level: null, status: "PAID", note: "Service cashback", created_at: a.processed_at, user_id: a.user_id });
        if (sp) db.ledger.push({ id: ++db.seq, payout_code: `RF-${a.id}`, ledger_type: "REFERRAL", amount: 200, level: null, status: "PAID", note: `Referral from ${user(a.user_id).life_id}`, created_at: a.processed_at, user_id: sp.id });
      }
    } else if (a.payment_status === "SUCCESS" && ["CANCELLED", "REFUNDED"].includes(body.status)) {
      a.payment_status = body.status;
      for (const l of db.ledger.filter((x) => x.payout_code.endsWith(`-${a.id}`))) db.ledger.push({ ...l, id: ++db.seq, payout_code: `RV-${l.payout_code}`, amount: -l.amount, status: "PAID", note: "Reversal", created_at: ts(0) });
    }
  } else if ((m = p.match(/^\/withdrawals\/(\d+)\/process$/))) {
    const w = db.withdrawals.find((x) => x.id === Number(m![1]));
    if (w && w.status === "PENDING") Object.assign(w, { status: body.status, admin_note: body.note ?? null, processed_at: ts(0) });
  } else if (p === "/balance-add") {
    const u = db.members.find((x) => x.life_id === String(body.life_id ?? "").trim()) ?? fail("Member not found");
    const amount = Number(body.amount);
    if (!amount || !isFinite(amount)) fail("Enter a valid amount");
    db.ledger.push({ id: ++db.seq, payout_code: `ADJ-${db.seq}`, ledger_type: "ADJUSTMENT", amount, level: null, status: "PAID", note: `By Demo Admin: ${body.note || "Balance add"}`, created_at: ts(0, new Date().getHours()), user_id: u.id });
  } else if (p === "/notices") {
    if (!String(body.content ?? "").trim()) fail("Content is required");
    const row = { title: body.title || null, content: body.content, show_from: body.show_from || null, show_to: body.show_to || null, updated_by: "Demo Admin", updated_at: ts(0) };
    const ex = body.id && db.notices.find((n) => n.id === body.id);
    if (ex) Object.assign(ex, row);
    else db.notices.push({ id: ++db.seq, kind: body.kind === "SCROLL" ? "SCROLL" : "NOTICE", is_visible: 1, created_at: ts(0), ...row });
  } else if ((m = p.match(/^\/notices\/(\d+)\/(toggle|delete)$/))) {
    const id = Number(m[1]);
    if (m[2] === "delete") db.notices = db.notices.filter((n) => n.id !== id);
    else { const n = db.notices.find((x) => x.id === id); if (n) n.is_visible = n.is_visible ? 0 : 1; }
  } else if ((m = p.match(/^\/ranks\/(\d+)\/reward$/))) {
    if (!db.userRanks.some((r) => r.user_id === Number(m![1]) && r.rank_id > 1)) fail("Member has no achieved rank");
    if (!(Number(body.amount) > 0)) fail("amount must be positive");
    if (!body.reference) fail("reference required (max 60 chars)");
    db.ledger.push({ id: ++db.seq, payout_code: `RR-U${m[1]}-${body.reference}`, ledger_type: "RANK", amount: Number(body.amount), level: null, status: "PAID", note: "Rank reward", created_at: ts(0), user_id: Number(m[1]) });
  } else if (p === "/statements/close") {
    return { date: body.date, statements_closed: 0 };
  } else if (p === "/password") {
    if (String(body.new ?? "").length < 8) fail("New password must be at least 8 characters");
  } else return fail("Not found");
  save(db);
  return null;
}
