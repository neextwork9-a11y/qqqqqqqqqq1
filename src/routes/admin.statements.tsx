import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Msg } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/statements")({
  head: () => ({ meta: [{ title: "Statement Close — Life OS Admin" }, { name: "description", content: "Close member statements for a date." }, { property: "og:title", content: "Statement Close — Life OS Admin" }, { property: "og:description", content: "Close member statements for a date." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Statements,
});

function Statements() {
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });

  const close = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ text: null });
    try {
      const res = await adminApi<{ date: string; statements_closed: number }>("/statements/close", { body: { date } });
      setMsg({ ok: true, text: `Statements closed for ${res.date}: ${res.statements_closed} statement(s).` });
    } catch (x) { setMsg({ text: (x as Error).message }); }
    setBusy(false);
  };

  return (
    <Page title="Statement Close" center>
      <Msg {...msg} />
      <form onSubmit={close} style={{ maxWidth: 380, margin: "0 auto" }}>
        <p><b>Date:</b><br />
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: 6 }} />
        </p>
        <p style={{ textAlign: "center" }}>
          <button type="submit" disabled={busy} style={{ padding: "8px 28px" }}>{busy ? "Closing…" : "Close Statements"}</button>
        </p>
        <p style={{ fontSize: 12, color: "#555", textAlign: "center" }}>Closes wallet statements up to the selected date for all members.</p>
      </form>
    </Page>
  );
}
