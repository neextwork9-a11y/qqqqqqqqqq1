import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Msg } from "@/components/admin-kit";
import { useAdmin } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/site-config")({
  head: () => ({ meta: [{ title: "Site Config — Life OS Admin" }, { name: "description", content: "Life OS site configuration." }, { property: "og:title", content: "Site Config — Life OS Admin" }, { property: "og:description", content: "Life OS site configuration." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SiteConfig,
});

type Settings = Record<string, string>;

const TOGGLES = [
  ["login_status", "Member Login"],
  ["signup_status", "New Signup / Joining"],
  ["withdrawal_status", "Withdrawal Requests"],
  ["profile_edit_status", "Profile Editing"],
  ["matching_paused", "Pause Matching"],
] as const;

function SiteConfig() {
  const q = useAdmin<Settings>("settings", "/settings");
  const [form, setForm] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });
  const [busy, setBusy] = useState(false);
  const s = form ?? q.data ?? null;
  const set = (k: string, v: string) => setForm({ ...(s ?? {}), [k]: v });

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!s) return;
    setBusy(true);
    try {
      await adminApi("/settings", { body: s });
      setMsg({ ok: true, text: "Settings saved successfully." });
      setForm(null);
      await q.refetch();
    } catch (x) {
      setMsg({ text: (x as Error).message });
    } finally { setBusy(false); }
  };

  const input = (k: string, extra: Record<string, unknown> = {}) => (
    <input type="text" value={s?.[k] ?? ""} onChange={(e) => set(k, e.target.value)} style={{ width: 200 }} {...extra} />
  );

  return (
    <Page title="Site Config" center>
      {q.error && <p style={{ color: "#C00", fontWeight: 600 }}>{(q.error as Error).message}</p>}
      {!s ? <p>Loading…</p> : (
        <form onSubmit={save}>
          <h3>Site Information</h3>
          <table className="table" cellPadding={8} style={{ margin: "8px auto" }}>
            <tbody>
              <tr><th align="right">Site Name</th><td>{input("site_name")}</td></tr>
              <tr><th align="right">Site Slogan</th><td>{input("site_slogan")}</td></tr>
              <tr><th align="right">Site URL</th><td>{input("site_url")}</td></tr>
              <tr><th align="right">Site Email</th><td>{input("site_email")}</td></tr>
            </tbody>
          </table>
          <h3>Feature Switches</h3>
          <table className="table" cellPadding={8} style={{ margin: "8px auto" }}>
            <tbody>
              {TOGGLES.map(([k, label]) => (
                <tr key={k}>
                  <th align="right">{label}</th>
                  <td>
                    <select value={s?.[k] ?? "1"} onChange={(e) => set(k, e.target.value)}>
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Financial Limits</h3>
          <table className="table" cellPadding={8} style={{ margin: "8px auto" }}>
            <tbody>
              <tr><th align="right">Daily Matching Cap (BDT, max 5000)</th><td>{input("daily_matching_cap", { type: "number", min: 0, max: 5000 })}</td></tr>
              <tr><th align="right">Minimum Withdrawal (BDT)</th><td>{input("withdraw_min", { type: "number", min: 0 })}</td></tr>
              <tr><th align="right">Maximum Withdrawal (BDT)</th><td>{input("withdraw_max", { type: "number", min: 0 })}</td></tr>
              <tr><th align="right">Withdrawal Charge (%)</th><td>{input("withdraw_charge_pct", { type: "number", min: 0, max: 100, step: "0.01" })}</td></tr>
            </tbody>
          </table>
          <Msg {...msg} />
          <button type="submit" disabled={busy} style={{ padding: "8px 40px", marginTop: 8 }}>{busy ? "Saving…" : "Save Settings"}</button>
        </form>
      )}
    </Page>
  );
}
