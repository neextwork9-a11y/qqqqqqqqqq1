import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Msg, Page, useMember } from "@/components/member-kit";
import { bdt, memberApi } from "@/lib/member-api";

export const Route = createFileRoute("/member/withdrawals")({
  head: () => ({ meta: [{ title: "Withdrawals Form — Life OS Member" }, { name: "description", content: "Request a Life OS withdrawal." }, { property: "og:title", content: "Withdrawals Form — Life OS Member" }, { property: "og:description", content: "Request a Life OS withdrawal." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Withdraw,
});

function Withdraw() {
  const w = useMember<{ withdrawable: number; pending_withdrawal: number }>("wallet", "/wallet");
  const [f, setF] = useState({ method: "bKash", account_number: "", amount: "" });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(f.amount) > Number(w.data?.withdrawable ?? 0)) return setMsg({ ok: false, t: "Amount is more than your withdrawable balance." });
    try {
      await memberApi("/withdrawals", { body: { ...f, amount: Number(f.amount) } });
      setMsg({ ok: true, t: "Withdrawal request submitted successfully." });
      setF({ ...f, amount: "" });
      w.refetch();
    } catch (err) { setMsg({ ok: false, t: (err as Error).message }); }
  };
  const inp: React.CSSProperties = { width: 293, maxWidth: "100%", height: 35, border: "1px solid #AAA", background: "#FAFAFA", padding: "0 10px", fontSize: 16, boxSizing: "border-box" };
  const L = (t: string) => <td style={{ fontSize: 16, height: 42, width: "36%" }}>{t}</td>;
  const C = <td style={{ width: "2%", fontSize: 16 }}>:</td>;
  return (
    <Page title="Withdrawal From">
      <form onSubmit={submit}>
        <Msg ok={msg?.ok} text={msg?.t ?? null} />
        <table border={0} cellSpacing={0} cellPadding={0} className="lifeos-form-table" style={{ width: "100%" }}>
          <tbody>
            <tr>{L("Your Withdraw Amount")}{C}<td style={{ fontSize: 16, overflowWrap: "anywhere" }}>{bdt(w.data?.withdrawable)} <span style={{ color: "#C00" }}>(Pending {bdt(w.data?.pending_withdrawal)})</span></td></tr>
            <tr>{L("Enter Withdraw Amount *")}{C}<td><input style={inp} type="number" min={500} placeholder="Min 500" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></td></tr>
            <tr>{L("Select a Payment Method *")}{C}<td>
              <select style={{ ...inp, width: 200 }} value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>
                {["bKash", "Nagad", "Rocket", "Bank"].map((m) => <option key={m}>{m}</option>)}
              </select></td></tr>
            <tr>{L("Account Number *")}{C}<td><input style={inp} type="text" required value={f.account_number} onChange={(e) => setF({ ...f, account_number: e.target.value })} /></td></tr>
            <tr><td style={{ fontSize: 16, height: 110 }}>Withdraw Note</td>{C}<td><textarea style={{ ...inp, height: 97, width: 200, padding: 10 }} /></td></tr>
            <tr><td /><td /><td><input type="submit" value="Withdraw Request Now" style={{ fontSize: 16, border: "1px solid #AAA", background: "#fff", padding: "2px 8px" }} /></td></tr>
          </tbody>
        </table>
      </form>
    </Page>
  );
}
