import { createFileRoute } from "@tanstack/react-router";
import { DataTable, fmtDate, Page, useMember } from "@/components/member-kit";
import { bdt } from "@/lib/member-api";

export const Route = createFileRoute("/member/withdrawals-report")({
  head: () => ({ meta: [{ title: "Withdrawals Reports — Life OS Member" }, { name: "description", content: "Your Life OS withdrawal history." }, { property: "og:title", content: "Withdrawals Reports — Life OS Member" }, { property: "og:description", content: "Your Life OS withdrawal history." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Report,
});

type W = { id: number; method: string; account_number: string; amount: number; charge: number; status: string; admin_note: string | null; created_at: string };

function Report() {
  const q = useMember<W[]>("withdrawals", "/withdrawals");
  return (
    <Page title="Withdrawals Reports" center>
      <DataTable head={["Sl", "Date & Time", "Method", "Account", "Amount", "Charge", "Net", "Status"]}
        rows={(q.data ?? []).map((r, i) => [i + 1, fmtDate(r.created_at), r.method, r.account_number, bdt(r.amount), bdt(r.charge), bdt(r.amount - r.charge), r.status])} />
    </Page>
  );
}
