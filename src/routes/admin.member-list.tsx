import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDateShort } from "@/components/admin-kit";
import { FilterBar, useAdmin } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/member-list")({
  head: () => ({ meta: [{ title: "Member List — Life OS Admin" }, { name: "description", content: "All members with status controls." }, { property: "og:title", content: "Member List — Life OS Admin" }, { property: "og:description", content: "All members with status controls." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MemberList,
});

type Member = {
  id: number; life_id: string; name: string; phone: string; email: string | null;
  status: string; is_active: number; sponsor_life_id: string; created_at: string;
};

function MemberList() {
  const [applied, setApplied] = useState({ from: "", to: "", q: "" });
  const qs = `${applied.from ? `from=${applied.from}&` : ""}${applied.to ? `to=${applied.to}&` : ""}${applied.q ? `q=${encodeURIComponent(applied.q)}` : ""}`;
  const q = useAdmin<Member[]>("member-list", "/member-list" + (qs ? `?${qs}` : ""));
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });
  const rows = q.data ?? [];

  const setStatus = async (id: number, status: string) => {
    setMsg({ text: null });
    try {
      await adminApi(`/members/${id}/status`, { body: { status } });
      setMsg({ ok: true, text: "Status updated." });
      await q.refetch();
    } catch (x) { setMsg({ text: (x as Error).message }); }
  };

  return (
    <Page title="Member List" center>
      <FilterBar value={applied} onChange={setApplied} />
      <Msg {...msg} />
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Life ID", "Name", "Phone", "Email", "Sponsor", "Tree Active", "Status", "Change Status"]}
          rows={rows.map((m, i) => [
            i + 1, fmtDateShort(m.created_at), m.life_id, m.name, m.phone, m.email ?? "—", m.sponsor_life_id,
            m.is_active ? "Yes" : "No",
            <b key="s" style={{ color: m.status === "ACTIVE" ? "#009541" : "#C00" }}>{m.status}</b>,
            <select key="c" defaultValue="" onChange={(e) => { const v = e.target.value; if (v) { e.target.value = ""; setStatus(m.id, v); } }}>
              <option value="" disabled>Change…</option>
              {["ACTIVE", "SUSPENDED", "PENDING"].filter((s) => s !== m.status).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>,
          ])}
        />
      )}
    </Page>
  );
}
