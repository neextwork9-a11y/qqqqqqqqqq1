import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Msg } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/balance-add")({
  head: () => ({ meta: [{ title: "Balance Add — Life OS Admin" }, { name: "description", content: "Add audited balance adjustments to a member wallet." }, { property: "og:title", content: "Balance Add — Life OS Admin" }, { property: "og:description", content: "Add audited balance adjustments to a member wallet." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: BalanceAdd,
});

function BalanceAdd() {
  const [form, setForm] = useState({ life_id: "", amount: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ text: null });
    try {
      await adminApi("/balance-add", { body: { life_id: form.life_id.trim(), amount: Number(form.amount), note: form.note } });
      setMsg({ ok: true, text: `Balance updated for ${form.life_id.trim()}.` });
      setForm({ life_id: "", amount: "", note: "" });
    } catch (x) { setMsg({ text: (x as Error).message }); }
    setBusy(false);
  };

  return (
    <Page title="Balance Add" center>
      <Msg {...msg} />
      <form onSubmit={submit} style={{ maxWidth: 420, margin: "0 auto", textAlign: "left" }}>
        <p><b>Life ID:</b><br />
          <input required value={form.life_id} onChange={(e) => setForm({ ...form, life_id: e.target.value })} placeholder="LOS10001" style={{ width: "100%", padding: 6 }} />
        </p>
        <p><b>Amount (BDT):</b><br />
          <input required type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ width: "100%", padding: 6 }} />
        </p>
        <p><b>Note:</b><br />
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Reason (recorded in ledger)" style={{ width: "100%", padding: 6 }} />
        </p>
        <p style={{ textAlign: "center" }}>
          <button type="submit" disabled={busy} style={{ padding: "8px 28px" }}>{busy ? "Saving…" : "Add Balance"}</button>
        </p>
        <p style={{ fontSize: 12, color: "#555", textAlign: "center" }}>Every adjustment is recorded as an ADJUSTMENT row in the bonus ledger.</p>
      </form>
    </Page>
  );
}
