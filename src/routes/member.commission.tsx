import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DataTable, fmtDate, Page, useMember } from "@/components/member-kit";
import { bdt, LEDGER_LABELS } from "@/lib/member-api";

export const Route = createFileRoute("/member/commission")({
  head: () => ({ meta: [{ title: "Bonus Report — Life OS Member" }, { name: "description", content: "Life OS member bonus report." }, { property: "og:title", content: "Bonus Report — Life OS Member" }, { property: "og:description", content: "Life OS member bonus report." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Commission,
});

type Row = { payout_code: string; ledger_type: string; amount: number; level: number | null; status: string; created_at: string };

function Commission() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("All");
  const [applied, setApplied] = useState({ from: "", to: "", type: "All" });
  const q = useMember<Row[]>(`ledger-${applied.type}`, applied.type === "All" ? "/ledger" : `/ledger?type=${applied.type}`);
  const rows = (q.data ?? []).filter((r) => {
    const d = r.created_at.slice(0, 10);
    return (!applied.from || d >= applied.from) && (!applied.to || d <= applied.to);
  });
  return (
    <Page title="Bonus Report" center>
      <form style={{ margin: "10px 0", textAlign: "center" }} onSubmit={(e) => { e.preventDefault(); setApplied({ from, to, type }); }}>
        <b>Date From:</b> <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 140 }} />
        <b style={{ marginLeft: 20 }}>Date To:</b> <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 140 }} />
        <b style={{ marginLeft: 20 }}>Report Type:</b>{" "}
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: 160 }}>
          <option value="All">All</option>
          {Object.entries(LEDGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="submit" value="Search" style={{ marginLeft: 20 }} />
      </form>
      <DataTable
        head={["Sl", "Date & Time", "Reference", "Bonus Type", "Status", "Cashout Amount"]}
        rows={rows.map((r, i) => [
          i + 1, fmtDate(r.created_at), r.payout_code,
          `${LEDGER_LABELS[r.ledger_type] ?? r.ledger_type}${r.level ? ` [${r.level}]` : ""}`, r.status,
          <span key="a" style={{ display: "block", textAlign: "right" }}>{bdt(r.amount)}</span>,
        ])}
      />
    </Page>
  );
}
