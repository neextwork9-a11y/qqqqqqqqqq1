import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDate, FilterBar, useAdmin } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/rank-reward")({
  head: () => ({ meta: [{ title: "Rank Reward — Life OS Admin" }, { name: "description", content: "Pay RANK pool rewards to rank achievers." }, { property: "og:title", content: "Rank Reward — Life OS Admin" }, { property: "og:description", content: "Pay RANK pool rewards to rank achievers." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: RankReward,
});

type Row = { user_id: number; life_id: string; name: string; phone: string; rank_name: string; achieved_at: string };

function RankReward() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}${applied.q ? `q=${encodeURIComponent(applied.q)}&` : ""}`;
  const q = useAdmin<Row[]>("rank-achievers", "/rank-achievers" + (qs ? `?${qs}` : ""));
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });
  const [form, setForm] = useState<{ userId: number | null; amount: string; reference: string }>({ userId: null, amount: "", reference: "" });
  const rows = q.data ?? [];

  const pay = async () => {
    if (form.userId == null) return;
    setMsg({ text: null });
    try {
      await adminApi(`/ranks/${form.userId}/reward`, { body: { amount: Number(form.amount), reference: form.reference.trim() } });
      setMsg({ ok: true, text: "Rank reward recorded." });
      setForm({ userId: null, amount: "", reference: "" });
      await q.refetch();
    } catch (x) { setMsg({ text: (x as Error).message }); }
  };

  return (
    <Page title="Rank Reward" center>
      <FilterBar value={applied} onChange={setApplied} />
      <Msg {...msg} />
      {form.userId != null && (
        <form onSubmit={(e) => { e.preventDefault(); pay(); }} style={{ margin: "10px auto", maxWidth: 460, textAlign: "left", border: "1px solid #ccc", padding: 10 }}>
          <b>Reward for Life ID #{form.userId}</b>
          <p><b>Amount (BDT):</b><br />
            <input required type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ width: "100%", padding: 6 }} />
          </p>
          <p><b>Reference (max 60 chars):</b><br />
            <input required maxLength={60} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. cheque #123 / bkash TrxID" style={{ width: "100%", padding: 6 }} />
          </p>
          <p style={{ textAlign: "center" }}>
            <button type="submit">Pay Reward</button>
            <button type="button" style={{ marginLeft: 8 }} onClick={() => setForm({ userId: null, amount: "", reference: "" })}>Cancel</button>
          </p>
        </form>
      )}
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Life ID", "Name", "Rank", "Reward"]}
          rows={rows.map((r, i) => [
            i + 1, fmtDate(r.achieved_at), r.life_id, r.name, r.rank_name,
            <button key="b" type="button" onClick={() => setForm({ userId: r.user_id, amount: "", reference: "" })} style={{ padding: "2px 12px" }}>Reward</button>,
          ])}
        />
      )}
      {!q.error && !q.isLoading && rows.length === 0 && <Msg text="No rank achievers found." />}
    </Page>
  );
}
