import { useState } from "react";
import { Page, DataTable, Msg, fmtDate } from "@/components/member-kit";
import { useAdmin } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

type NoticeRow = {
  id: number; kind: string; title: string | null; content: string;
  show_from: string | null; show_to: string | null; is_visible: number;
  updated_by: string | null; updated_at: string;
};

const emptyForm = { id: 0, title: "", content: "", show_from: "", show_to: "" };

export function NoticeManager({ kind, title }: { kind: "NOTICE" | "SCROLL"; title: string }) {
  const q = useAdmin<NoticeRow[]>("notices-" + kind, `/notices?kind=${kind}`);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });
  const [busy, setBusy] = useState(false);
  const rows = q.data ?? [];

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.show_from && form.show_to && form.show_from > form.show_to) return setMsg({ text: "Show From must not be after Show To." });
    setBusy(true); setMsg({ text: null });
    try {
      await adminApi("/notices", { body: { kind, ...form, id: form.id || undefined } });
      setMsg({ ok: true, text: form.id ? "Updated successfully." : "Saved successfully." });
      setForm(emptyForm);
      await q.refetch();
    } catch (x) { setMsg({ text: (x as Error).message }); }
    finally { setBusy(false); }
  };

  const act = async (id: number, action: "toggle" | "delete") => {
    setMsg({ text: null });
    try {
      await adminApi(`/notices/${id}/${action}`, { body: {} });
      if (action === "delete") setMsg({ ok: true, text: "Deleted." });
      await q.refetch();
    } catch (x) { setMsg({ text: (x as Error).message }); }
  };

  return (
    <Page title={title} center>
      <h3>{form.id ? `Edit notice #${form.id}` : "Add New"}</h3>
      <form onSubmit={save}>
        {kind === "NOTICE" && (
          <p style={{ margin: "8px 0" }}>
            <b>Title:</b>{" "}
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: 260 }} />
          </p>
        )}
        <p style={{ margin: "8px 0" }}>
          <b>Content:</b>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={4} style={{ width: 420, marginLeft: 8, verticalAlign: "top" }} />
        </p>
        <p style={{ margin: "8px 0" }}>
          <b>Show From:</b> <input type="date" value={form.show_from} onChange={(e) => setForm({ ...form, show_from: e.target.value })} />
          <b style={{ marginLeft: 12 }}>Show To:</b> <input type="date" value={form.show_to} onChange={(e) => setForm({ ...form, show_to: e.target.value })} />
          <span style={{ marginLeft: 12 }}>(blank = always)</span>
        </p>
        <Msg {...msg} />
        <button type="submit" disabled={busy} style={{ padding: "8px 36px" }}>{busy ? "Saving…" : form.id ? "Update" : "Save"}</button>
        {form.id > 0 && <button type="button" onClick={() => setForm(emptyForm)} style={{ marginLeft: 12, padding: "8px 20px" }}>Cancel</button>}
      </form>

      <h3 style={{ marginTop: 24 }}>Existing Entries</h3>
      {q.error ? <p style={{ color: "#C00" }}>{(q.error as Error).message}</p> : (
        <DataTable
          head={["Sl", "Last Updated", kind === "NOTICE" ? "Title" : "Content", "Show From", "Show To", "Visible", "Actions"]}
          rows={rows.map((n, i) => [
            i + 1,
            fmtDate(n.updated_at),
            kind === "NOTICE" ? <div key="c"><b>{n.title}</b><div style={{ whiteSpace: "pre-wrap" }}>{n.content}</div></div> : <div key="c" style={{ whiteSpace: "pre-wrap" }}>{n.content}</div>,
            n.show_from ?? "—", n.show_to ?? "—", n.is_visible ? "Yes" : "No",
            <span key="a">
              <button type="button" onClick={() => setForm({ id: n.id, title: n.title ?? "", content: n.content, show_from: n.show_from ?? "", show_to: n.show_to ?? "" })}>Edit</button>
              <button type="button" onClick={() => act(n.id, "toggle")} style={{ marginLeft: 6 }}>{n.is_visible ? "Hide" : "Show"}</button>
              <button type="button" onClick={() => act(n.id, "delete")} style={{ marginLeft: 6, color: "#C00" }}>Delete</button>
            </span>,
          ])}
        />
      )}
    </Page>
  );
}
