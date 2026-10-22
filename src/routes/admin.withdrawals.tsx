import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, DataTable, Msg, fmtDate, useAdmin } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/withdrawals")({
  head: () => ({ meta: [{ title: "Withdrawals — Life OS Admin" }, { name: "description", content: "Approve or reject member withdrawal requests." }, { property: "og:title", content: "Withdrawals — Life OS Admin" }, { property: "og:description", content: "Approve or reject member withdrawal requests." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Withdrawals,
});

type Row = { id: number; life_id: string; name: string; phone: string; method: string; account_number: string; amount: number; charge: number; status: string; admin_note: string | null; member_note: string | null; created_at: string; processed_at: string | null };

function Withdrawals() {
  const q = useAdmin<Row[]>("withdrawals", "/withdrawals");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });
  const rows = (q.data ?? []).filter((w) => !status || w.status === status);

  const process = async (id: number, st: string) => {
    setMsg({ text: null });
    setBusy(id);
    try {
      await adminApi(`/withdrawals/${id}/process`, { body: { status: st, note: notes[id] || undefined } });
      setMsg({ ok: true, text: `Withdrawal ${st.toLowerCase()}.` });
      await q.refetch();
    } catch (x) { setMsg({ text: (x as Error).message }); }
    finally { setBusy(null); }
  };

  return (
    <Page title="Withdrawals" center>
      <p style={{ margin: "10px 0", textAlign: "center" }}>
        <b>Status:</b>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="">All</option>
          {["PENDING", "APPROVED", "REJECTED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </p>
      <Msg {...msg} />
      {q.error ? <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Date", "Life ID", "Name", "Method", "Account", "Amount", "Charge", "Status", "Action"]}
          rows={rows.map((w, i) => [
            i + 1, fmtDate(w.created_at), w.life_id, w.name, w.method, w.account_number,
            w.amount, w.charge,
            <b key="s" style={{ color: w.status === "APPROVED" ? "#009541" : w.status === "PENDING" ? "#B8860B" : "#C00" }}>{w.status}</b>,
            w.status === "PENDING" ? (
              <span key="a">
                {w.member_note && <p className="break-words">{w.member_note}</p>}
                <input aria-label={`Admin note for withdrawal ${w.id}`} maxLength={255} placeholder="Admin note" value={notes[w.id] ?? ""} onChange={(e) => setNotes({ ...notes, [w.id]: e.target.value })} />
                <button type="button" disabled={busy !== null} onClick={() => process(w.id, "APPROVED")} style={{ padding: "2px 10px", marginRight: 4 }}>Approve</button>
                <button type="button" disabled={busy !== null} onClick={() => process(w.id, "REJECTED")} style={{ padding: "2px 10px" }}>Reject</button>
              </span>
            ) : w.admin_note ?? "—",
          ])}
        />
      )}
      {!q.error && !q.isLoading && rows.length === 0 && <Msg text="No withdrawals found." />}
    </Page>
  );
}
