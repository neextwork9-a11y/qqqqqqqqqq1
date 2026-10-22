import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDate, FilterBar, useAdmin } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/activations")({
  head: () => ({ meta: [{ title: "Package Activation — Life OS Admin" }, { name: "description", content: "Confirm or reverse package activations." }, { property: "og:title", content: "Package Activation — Life OS Admin" }, { property: "og:description", content: "Confirm or reverse package activations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Activations,
});

type Row = {
  id: number; life_id: string; name: string; phone: string;
  activation_code: string; payment_ref: string; payment_status: string;
  fee: number; bv: number; processed: number; created_at: string; processed_at: string | null;
};

function Activations() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const [status, setStatus] = useState("");
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}${applied.q ? `q=${encodeURIComponent(applied.q)}&` : ""}${status ? `status=${status}&` : ""}`;
  const q = useAdmin<Row[]>("activations", "/activations" + (qs ? `?${qs}` : ""));
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });
  const rows = q.data ?? [];

  const confirm = async (id: number, st: string) => {
    setMsg({ text: null });
    try {
      await adminApi(`/activations/${id}/confirm`, { body: { status: st } });
      setMsg({ ok: true, text: `Activation marked ${st}.` });
      await q.refetch();
    } catch (x) { setMsg({ text: (x as Error).message }); }
  };

  return (
    <Page title="Package Activation" center>
      <FilterBar value={applied} onChange={setApplied}>
        <b style={{ marginLeft: 16 }}>Status:</b>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {["PENDING", "SUCCESS", "CANCELLED", "REFUNDED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </FilterBar>
      <Msg {...msg} />
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Life ID", "Name", "Code", "Payment Ref", "Fee", "BV", "Status", "Action"]}
          rows={rows.map((a, i) => [
            i + 1, fmtDate(a.created_at), a.life_id, a.name, a.activation_code, a.payment_ref,
            a.fee, a.bv,
            <b key="s" style={{ color: a.payment_status === "SUCCESS" ? "#009541" : a.payment_status === "PENDING" ? "#B8860B" : "#C00" }}>{a.payment_status}</b>,
            a.payment_status === "PENDING" ? (
              <select key="a" defaultValue="" onChange={(e) => { const v = e.target.value; if (v) { e.target.value = ""; confirm(a.id, v); } }}>
                <option value="" disabled>Confirm…</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            ) : a.payment_status === "SUCCESS" ? (
              <select key="a" defaultValue="" onChange={(e) => { const v = e.target.value; if (v) { e.target.value = ""; confirm(a.id, v); } }}>
                <option value="" disabled>Reverse…</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            ) : "—",
          ])}
        />
      )}
      {!q.error && !q.isLoading && rows.length === 0 && <Msg text="No activations found." />}
    </Page>
  );
}
