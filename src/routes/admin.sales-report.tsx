import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDate, FilterBar, useAdmin } from "@/components/admin-kit";

export const Route = createFileRoute("/admin/sales-report")({
  head: () => ({ meta: [{ title: "Sales Report — Life OS Admin" }, { name: "description", content: "Successful package sales with matching status." }, { property: "og:title", content: "Sales Report — Life OS Admin" }, { property: "og:description", content: "Successful package sales with matching status." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SalesReport,
});

type Row = { id: number; sale_code: string; life_id: string; name: string; fee: number; matching_count: number; matching_paid: number; generation_paid: number; status: string; created_at: string };

function SalesReport() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}${applied.q ? `q=${encodeURIComponent(applied.q)}&` : ""}`;
  const q = useAdmin<Row[]>("sales-report", "/sales-report" + (qs ? `?${qs}` : ""));
  const rows = q.data ?? [];
  return (
    <Page title="Sales Report" center>
      <FilterBar value={applied} onChange={setApplied} />
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Sale Code", "Life ID", "Name", "Fee", "Matching", "Matching Paid", "Generation Paid", "Status"]}
          rows={rows.map((s, i) => [
            i + 1, fmtDate(s.created_at), s.sale_code, s.life_id, s.name,
            s.fee, `${s.matching_count}/11`, s.matching_paid, s.generation_paid,
            <b key="st" style={{ color: s.status === "OPEN" ? "#009541" : "#B8860B" }}>{s.status}</b>,
          ])}
        />
      )}
      {!q.error && !q.isLoading && rows.length === 0 && <Msg text="No sales found." />}
    </Page>
  );
}
