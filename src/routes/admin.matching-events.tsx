import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDate, FilterBar, useAdmin } from "@/components/admin-kit";

export const Route = createFileRoute("/admin/matching-events")({
  head: () => ({ meta: [{ title: "Matching Events — Life OS Admin" }, { name: "description", content: "Matching event history and payouts." }, { property: "og:title", content: "Matching Events — Life OS Admin" }, { property: "og:description", content: "Matching event history and payouts." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MatchingEvents,
});

type Row = { id: number; event_code: string; beneficiary_id: number; life_id?: string; event_number: number; enrollment_bill: number; binary_bill: number; selected_bill: number; selected_type: string; actual_payout: number; payout_status: string; created_at: string };

function MatchingEvents() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}`;
  const q = useAdmin<Row[]>("matching-events", "/matching-events" + (qs ? `?${qs}` : ""));
  const rows = q.data ?? [];
  return (
    <Page title="Matching Events" center>
      <FilterBar value={applied} onChange={setApplied} showQuery={false} />
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Event Code", "Beneficiary", "Event #", "Enrollment", "Binary", "Selected", "Type", "Payout", "Status"]}
          rows={rows.map((e, i) => [
            i + 1, fmtDate(e.created_at), e.event_code, e.beneficiary_id,
            `${e.event_number}/11`,
            e.enrollment_bill, e.binary_bill, e.selected_bill, e.selected_type,
            <b key="p">{e.actual_payout}</b>,
            e.payout_status,
          ])}
        />
      )}
      {!q.error && !q.isLoading && rows.length === 0 && <Msg text="No matching events found." />}
    </Page>
  );
}
