import { createFileRoute } from "@tanstack/react-router";
import { Page, DataTable } from "@/components/admin-kit";
import { useAdmin } from "@/components/admin-kit";
import { bdt } from "@/lib/member-api";

export const Route = createFileRoute("/admin/plan")({
  head: () => ({ meta: [{ title: "Plan & Ranks — Life OS Admin" }, { name: "description", content: "Life OS compensation plan and rank list." }, { property: "og:title", content: "Plan & Ranks — Life OS Admin" }, { property: "og:description", content: "Life OS compensation plan and rank list." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Plan,
});

type Plan = {
  fee: number; allocations: Record<string, number>; generation: Record<string, number>;
  max_matching_events: number; daily_matching_cap: number; matching_total_limit: number;
};
type Rank = { id: number; name: string; required_matchings: number; achieved: number };

const ALLOC_LABELS: Record<string, string> = {
  CASHBACK: "Cashback Bonus (Service Only)", REFERRAL: "Direct Referral Bonus", MATCHING: "Matching Bonus",
  GENERATION: "Generation Bonus", RANK: "Rank Reward",
};

function Plan() {
  const qp = useAdmin<Plan>("plan", "/plan");
  const qr = useAdmin<Rank[]>("ranks", "/ranks");
  const p = qp.data;
  return (
    <Page title="Plan &amp; Ranks" center>
      {qp.error && <p style={{ color: "#C00", fontWeight: 600 }}>{(qp.error as Error).message}</p>}
      {!p ? <p>Loading…</p> : (
        <>
          <h3>Package</h3>
          <DataTable head={["Item", "Value"]} rows={[
            ["Package Fee", <b key="f">{bdt(p.fee)}</b>],
            ["Max Matching Events per Sale", p.max_matching_events],
            ["Daily Matching Cap (BDT)", p.daily_matching_cap],
            ["Matching Total Limit per Sale", <b key="m">{bdt(p.matching_total_limit)}</b>],
          ]} />
          <h3 style={{ marginTop: 18 }}>Fee Allocation</h3>
          <DataTable head={["Allocation", "Amount (BDT)"]}
            rows={Object.entries(p.allocations).map(([k, v]) => [ALLOC_LABELS[k] ?? k, bdt(v)])} />
          <h3 style={{ marginTop: 18 }}>Generation Bonus (per level)</h3>
          <DataTable head={["Level", "Amount (BDT)"]}
            rows={Object.entries(p.generation).map(([k, v]) => [`Generation ${k}`, bdt(v)])} />
          <h3 style={{ marginTop: 18 }}>Rank List</h3>
          {qr.error ? <p style={{ color: "#C00" }}>{(qr.error as Error).message}</p> : (
            <DataTable head={["Rank", "Required Matchings", "Members Achieved"]}
              rows={(qr.data ?? []).map((r) => [r.name, r.required_matchings > 0 ? r.required_matchings : "—", r.achieved])} />
          )}
        </>
      )}
    </Page>
  );
}
