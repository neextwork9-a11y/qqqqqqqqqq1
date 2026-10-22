import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { referralJoinUrl, type JoinTeam } from "@/lib/join-fields";
import { Page, useMember } from "@/components/member-kit";
import { bdt, LEDGER_LABELS } from "@/lib/member-api";

export const Route = createFileRoute("/member/")({
  head: () => ({ meta: [{ title: "Dashboard — Life OS Member" }, { name: "description", content: "Life OS member dashboard." }, { property: "og:title", content: "Dashboard — Life OS Member" }, { property: "og:description", content: "Life OS member dashboard." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

type Me = { name: string; life_id: string; referral_code: string; phone: string; email: string | null; status: string; created_at: string; referred_by: string | null; total_referral: number };
type Wallet = { withdrawable: number; pending_withdrawal: number; withdrawn: number; cashback_service_only: number; by_type: Record<string, number> };
type Rank = { lifetime_matchings: number; current: { name?: string } | null };

function Dashboard() {
  const me = useMember<Me>("me", "/me").data;
  const w = useMember<Wallet>("wallet", "/wallet").data;
  const rank = useMember<Rank>("rank", "/rank").data;
  if (!me) return null;
  const by = w?.by_type ?? {};
  const totalIn = Object.values(by).reduce((a, b) => a + Number(b), 0);
  const totalOut = Number(w?.withdrawn ?? 0) + Number(w?.pending_withdrawal ?? 0);

  const rows: [string, React.ReactNode][] = [
    ["Account Full Name", me.name],
    ["Account UserID", me.life_id],
    ["Account Rank", <b key="r">{rank?.current?.name ?? "Member"}</b>],
    ["Account Status", me.status],
    ["Email Address", me.email ?? "N/A"],
    ["Cell Number", me.phone],
    ["Joining Date Time", me.created_at],
    ["Referral Code", me.referral_code],
    ["Left Team Link", <JoinLink key="left" code={me.referral_code} team="L" />],
    ["Right Team Link", <JoinLink key="right" code={me.referral_code} team="R" />],
    ["Referral UserID", me.referred_by ?? "N/A"],
    ["Total Referral", me.total_referral],
    ["Lifetime Matchings", rank?.lifetime_matchings ?? 0],
  ];

  return (
    <Page title="Dashboard">
      <table className="lifeos-dashboard-layout" width="100%" border={0} cellSpacing={0} cellPadding={0}>
        <tbody>
          <tr>
            <td width="5%" style={{ padding: "0 20px" }} />
            <td width="42%" valign="top" className="profile_images">
              <table width="100%" border={0} cellSpacing={0} cellPadding={7}>
                <tbody>
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center" }}>
                      <span className="tree-node"><span className="avatar" style={{ width: 160, height: 160, lineHeight: "160px", fontSize: 48 }}>{me.name.slice(0, 1)}</span></span>
                      <br /><br />
                    </td>
                  </tr>
                  {rows.map(([k, v]) => (
                    <tr key={k}><th style={{ width: "50%" }}>{k}</th><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </td>
            <td width="6%" style={{ padding: "0 20px" }} />
            <td width="42%" valign="top" style={{ padding: "0 20px" }}>
              <h4><u>Cash In</u></h4>
              <table width="100%" border={0} cellSpacing={7} cellPadding={0} className="table_wallet account_images_div">
                <tbody>
                  {["REFERRAL", "MATCHING", "GENERATION", "RANK", "ADJUSTMENT"].map((t) => (
                    <tr key={t}><td width="70%">Total {LEDGER_LABELS[t]}</td><td className="right">{bdt(by[t])}</td></tr>
                  ))}
                  <tr><td colSpan={2}><hr /></td></tr>
                  <tr><td className="right"><b>All Total In Amount</b></td><td className="right">{bdt(totalIn)}</td></tr>
                </tbody>
              </table>
              <br />
              <h4><u>Cash Out</u></h4>
              <table width="100%" border={0} cellSpacing={7} cellPadding={0} className="table_wallet account_images_div">
                <tbody>
                  <tr><td>Total Withdrawals Amount</td><td className="right">{bdt(w?.withdrawn)}</td></tr>
                  <tr><td>Pending Withdrawals</td><td className="right">{bdt(w?.pending_withdrawal)}</td></tr>
                  <tr><td colSpan={2}><hr /></td></tr>
                  <tr><td className="right"><b>All Total Out Amount</b></td><td className="right"><b>{bdt(totalOut)}</b></td></tr>
                </tbody>
              </table>
              <br />
              <h4><u>Current Balance</u></h4>
              <table width="100%" border={0} cellSpacing={7} cellPadding={0} className="table_wallet account_images_div">
                <tbody>
                  <tr><td><b>All Total In Amount</b></td><td className="right">{bdt(totalIn)}</td></tr>
                  <tr><td><b>All Total Out Amount</b></td><td className="right">- {bdt(totalOut)}</td></tr>
                  <tr><td colSpan={2}><hr /></td></tr>
                  <tr><td className="right"><b>Remaining Current Balance</b></td><td className="right"><b>{bdt(w?.withdrawable)}</b></td></tr>
                  <tr><td>Cashback Wallet (service use only)</td><td className="right">{bdt(w?.cashback_service_only)}</td></tr>
                </tbody>
              </table>
            </td>
            <td width="5%" />
          </tr>
        </tbody>
      </table>
    </Page>
  );
}

function JoinLink({ code, team }: { code: string; team: JoinTeam }) {
  const [status, setStatus] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(referralJoinUrl(window.location.origin, code, team)); }, [code, team]);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setStatus("Copied"); }
    catch { setStatus("Copy unavailable — select the link above."); }
  }
  return (
    <span className="member-referral-link">
      <input aria-label={`${team === "L" ? "Left" : "Right"} Team referral link`} readOnly value={url} onFocus={e => e.currentTarget.select()} />
      <span className="member-referral-actions">
        <Button variant="reference" type="button" onClick={copy} disabled={!url} title={`Copy ${team === "L" ? "Left" : "Right"} Team link`}><Copy size={13} /> Copy</Button>
        <Button variant="reference" asChild><a href={url || undefined} target="_blank" rel="noreferrer" title="Open joining form"><ExternalLink size={13} /> Open</a></Button>
      </span>
      <span role="status">{status}</span>
    </span>
  );
}
