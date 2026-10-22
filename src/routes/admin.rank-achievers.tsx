import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDate, FilterBar, useAdmin } from "@/components/admin-kit";

export const Route = createFileRoute("/admin/rank-achievers")({
  head: () => ({ meta: [{ title: "Rank Achievers — Life OS Admin" }, { name: "description", content: "Members who achieved company ranks." }, { property: "og:title", content: "Rank Achievers — Life OS Admin" }, { property: "og:description", content: "Members who achieved company ranks." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: RankAchievers,
});

type Row = { user_id: number; life_id: string; name: string; phone: string; rank_name: string; achieved_at: string };

function RankAchievers() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}${applied.q ? `q=${encodeURIComponent(applied.q)}&` : ""}`;
  const q = useAdmin<Row[]>("rank-achievers", "/rank-achievers" + (qs ? `?${qs}` : ""));
  const rows = q.data ?? [];
  return (
    <Page title="Rank Achievers" center>
      <FilterBar value={applied} onChange={setApplied} />
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Life ID", "Name", "Phone", "Rank"]}
          rows={rows.map((r, i) => [
            i + 1, fmtDate(r.achieved_at), r.life_id, r.name, r.phone,
            <b key="r" style={{ color: "#009541" }}>{r.rank_name}</b>,
          ])}
        />
      )}
      {!q.error && !q.isLoading && rows.length === 0 && <Msg text="No rank achievers found." />}
    </Page>
  );
}
