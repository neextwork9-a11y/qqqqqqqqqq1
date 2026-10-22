import { createFileRoute } from "@tanstack/react-router";
import { Page, DataTable, fmtDate } from "@/components/admin-kit";
import { useAdmin } from "@/components/admin-kit";
import { bdt } from "@/lib/member-api";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Life OS Admin" }, { name: "description", content: "Life OS admin company overview." }, { property: "og:title", content: "Dashboard — Life OS Admin" }, { property: "og:description", content: "Life OS admin company overview." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

type Info = {
  members: number; active_members: number; sales_count: number; sales_amount: number; activations_pending: number;
  bonus: Record<string, number>;
  withdraw: { APPROVED: number; PENDING: number; REJECTED: number; charges: number };
  pools: { pool: string; balance: number }[];
};

const BONUS_LABELS: Record<string, string> = {
  CASHBACK: "Cashback Bonus (Service Only)", REFERRAL: "Direct Referral Bonus", MATCHING: "Matching Bonus",
  GENERATION: "Generation Bonus", RANK: "Rank Reward Bonus", ADJUSTMENT: "Adjustment",
};

function Dashboard() {
  const q = useAdmin<Info>("company-info", "/company-info");
  const d = q.data;
  return (
    <Page title="Company Info (Dashboard)">
      {q.error && <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p>}
      {!d ? <p>Loading…</p> : (
        <>
          <h3 style={{ margin: "14px 0 4px" }}>Member &amp; Sales Summary</h3>
          <DataTable
            head={["Description", "Value"]}
            rows={[
              ["Total Members", d.members],
              ["Active Members", d.active_members],
              ["Total Sales (packages)", d.sales_count],
              ["Sales Amount", <b key="sa">{bdt(d.sales_amount)}</b>],
              ["Pending Activations", d.activations_pending],
            ]}
          />
          <h3 style={{ margin: "18px 0 4px" }}>Bonus Paid (by category)</h3>
          <DataTable
            head={["Bonus Type", "Total Paid"]}
            rows={Object.entries(d.bonus).map(([k, v]) => [
              BONUS_LABELS[k] ?? k,
              <b key="v">{bdt(v)}</b>,
            ])}
          />
          <h3 style={{ margin: "18px 0 4px" }}>Withdrawals</h3>
          <DataTable
            head={["Status", "Amount"]}
            rows={[
              ["Approved", <b key="a">{bdt(d.withdraw.APPROVED)}</b>],
              ["Pending", <b key="p">{bdt(d.withdraw.PENDING)}</b>],
              ["Rejected", <b key="r">{bdt(d.withdraw.REJECTED)}</b>],
              ["Charges Collected", bdt(d.withdraw.charges)],
            ]}
          />
          <h3 style={{ margin: "18px 0 4px" }}>Bonus Pools (remaining balance)</h3>
          <DataTable
            head={["Pool", "Balance"]}
            rows={(d.pools ?? []).map((p) => [p.pool, <b key="b">{bdt(p.balance)}</b>])}
            empty="No pool information"
          />
          <p style={{ marginTop: 14 }}>Report generated: {fmtDate(new Date().toISOString())}</p>
        </>
      )}
    </Page>
  );
}
