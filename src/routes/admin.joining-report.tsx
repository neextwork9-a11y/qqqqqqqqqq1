import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDate, FilterBar, useAdmin } from "@/components/admin-kit";

export const Route = createFileRoute("/admin/joining-report")({
  head: () => ({ meta: [{ title: "Joining Report — Life OS Admin" }, { name: "description", content: "Members joined within a date range." }, { property: "og:title", content: "Joining Report — Life OS Admin" }, { property: "og:description", content: "Members joined within a date range." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: JoiningReport,
});

type Row = { id: number; life_id: string; name: string; phone: string; email: string | null; sponsor_life_id: string | null; created_at: string };

function JoiningReport() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}${applied.q ? `q=${encodeURIComponent(applied.q)}&` : ""}`;
  const q = useAdmin<Row[]>("joining-report", "/joining-report" + (qs ? `?${qs}` : ""));
  const rows = q.data ?? [];
  return (
    <Page title="Joining Report" center>
      <FilterBar value={applied} onChange={setApplied} />
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Life ID", "Name", "Phone", "Email", "Sponsor"]}
          rows={rows.map((m, i) => [
            i + 1, fmtDate(m.created_at), m.life_id, m.name, m.phone, m.email ?? "—", m.sponsor_life_id ?? "—",
          ])}
        />
      )}
      {!q.error && !q.isLoading && rows.length === 0 && <Msg text="No joining records found." />}
    </Page>
  );
}
