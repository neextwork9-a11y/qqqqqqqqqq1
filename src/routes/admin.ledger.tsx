import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDate, FilterBar, useAdmin } from "@/components/admin-kit";

export const Route = createFileRoute("/admin/ledger")({
  head: () => ({ meta: [{ title: "Bonus Report — Life OS Admin" }, { name: "description", content: "Full bonus ledger with type filters." }, { property: "og:title", content: "Bonus Report — Life OS Admin" }, { property: "og:description", content: "Full bonus ledger with type filters." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Ledger,
});

type Row = { id: number; life_id: string; name: string; phone: string; ledger_type: string; amount: number; level: number | null; status: string; note: string | null; created_at: string };

const TYPES = ["CASHBACK", "REFERRAL", "MATCHING", "GENERATION", "RANK", "ADJUSTMENT"];

function Ledger() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const [type, setType] = useState("");
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}${applied.q ? `q=${encodeURIComponent(applied.q)}&` : ""}${type ? `type=${type}&` : ""}`;
  const q = useAdmin<Row[]>("ledger", "/ledger" + (qs ? `?${qs}` : ""));
  const rows = q.data ?? [];
  const total = rows.reduce((s, r) => s + Number(r.amount), 0);
  return (
    <Page title="Bonus Report" center>
      <FilterBar value={applied} onChange={setApplied}>
        <b style={{ marginLeft: 16 }}>Type:</b>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </FilterBar>
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <>
          <DataTable
            head={["Sl", "Date", "Life ID", "Name", "Type", "Level", "Amount", "Status", "Note"]}
            rows={rows.map((l, i) => [
              i + 1, fmtDate(l.created_at), l.life_id, l.name, l.ledger_type,
              l.level ?? "—",
              <b key="a" style={{ color: Number(l.amount) < 0 ? "#C00" : "#009541" }}>{l.amount}</b>,
              l.status, l.note ?? "—",
            ])}
          />
          <p style={{ textAlign: "right", fontWeight: 700 }}>Total: {total}</p>
        </>
      )}
      {!q.error && !q.isLoading && rows.length === 0 && <Msg text="No ledger entries found." />}
    </Page>
  );
}
