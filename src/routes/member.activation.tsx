import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DataTable, fmtDate, Msg, Page, useMember } from "@/components/member-kit";
import { bdt, memberApi } from "@/lib/member-api";

export const Route = createFileRoute("/member/activation")({
  head: () => ({ meta: [{ title: "Package Activation — Life OS Member" }, { name: "description", content: "Activate your Life OS package." }, { property: "og:title", content: "Package Activation — Life OS Member" }, { property: "og:description", content: "Activate your Life OS package." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Activation,
});

type Act = { id: number; activation_code: string; payment_status: string; fee: number; created_at: string };

function Activation() {
  const q = useMember<Act[]>("activations", "/activations");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const done = (q.data ?? []).some((a) => a.payment_status === "SUCCESS");
  const start = async () => {
    try {
      await memberApi("/activations", { body: {} });
      setMsg({ ok: true, t: "Activation request created. It becomes active after the payment is confirmed." });
      q.refetch();
    } catch (e) { setMsg({ ok: false, t: (e as Error).message }); }
  };
  return (
    <Page title="Package Activation" center>
      <Msg ok={msg?.ok} text={msg?.t ?? null} />
      <p style={{ margin: "15px 0" }}>Activation fee: <b>{bdt(1000)}</b> — Status: <b style={{ color: done ? "#009541" : "#C00" }}>{done ? "Active" : "Not active"}</b></p>
      {!done && <input type="button" value="Request Activation" onClick={start} />}
      <DataTable head={["Sl", "Date & Time", "Activation Code", "Fee", "Payment Status"]}
        rows={(q.data ?? []).map((a, i) => [i + 1, fmtDate(a.created_at), a.activation_code, bdt(a.fee), a.payment_status])} />
    </Page>
  );
}
