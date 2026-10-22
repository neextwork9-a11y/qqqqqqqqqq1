import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, fmtDateShort } from "@/components/admin-kit";
import { FilterBar, useAdmin } from "@/components/admin-kit";
import { bdt } from "@/lib/member-api";

export const Route = createFileRoute("/admin/member-report")({
  head: () => ({ meta: [{ title: "Member Report — Life OS Admin" }, { name: "description", content: "Member balances and earnings report." }, { property: "og:title", content: "Member Report — Life OS Admin" }, { property: "og:description", content: "Member balances and earnings report." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MemberReport,
});

type Row = {
  life_id: string; name: string; phone: string; directs: number;
  purchased: number; earned: number; withdrawn: number; balance: number; created_at: string;
};

function MemberReport() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const [all, setAll] = useState(false);
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}${applied.q ? `q=${encodeURIComponent(applied.q)}&` : ""}${all ? "all=1" : ""}`;
  const q = useAdmin<Row[]>("member-report", "/member-report" + (qs ? `?${qs}` : ""));
  const rows = q.data ?? [];
  const totals = rows.reduce((a, r) => ({
    purchased: a.purchased + Number(r.purchased), earned: a.earned + Number(r.earned),
    withdrawn: a.withdrawn + Number(r.withdrawn), balance: a.balance + Number(r.balance),
  }), { purchased: 0, earned: 0, withdrawn: 0, balance: 0 });

  return (
    <Page title="Member Report" center>
      <FilterBar value={applied} onChange={setApplied}>
        <label style={{ marginLeft: 16 }}>
          <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> All members (including zero balance)
        </label>
      </FilterBar>
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Life ID", "Name", "Phone", "Directs", "Purchased", "Earned", "Withdrawn", "Balance"]}
          rows={rows.map((r, i) => [
            i + 1, fmtDateShort(r.created_at), r.life_id, r.name, r.phone, r.directs,
            bdt(r.purchased), bdt(r.earned), bdt(r.withdrawn),
            <b key="b">{bdt(r.balance)}</b>,
          ]).concat(rows.length > 0 ? [[
            <b key="t" style={{ textAlign: "right" }}>Total</b>, "", "", "", "", "",
            <b key="p">{bdt(totals.purchased)}</b>, <b key="e">{bdt(totals.earned)}</b>,
            <b key="w">{bdt(totals.withdrawn)}</b>, <b key="b">{bdt(totals.balance)}</b>,
          ]] : [])}
        />
      )}
    </Page>
  );
}
