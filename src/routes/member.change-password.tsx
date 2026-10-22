import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Msg, Page } from "@/components/member-kit";
import { memberApi } from "@/lib/member-api";

export const Route = createFileRoute("/member/change-password")({
  head: () => ({ meta: [{ title: "Change Password — Life OS Member" }, { name: "description", content: "Change your Life OS password." }, { property: "og:title", content: "Change Password — Life OS Member" }, { property: "og:description", content: "Change your Life OS password." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ChangePassword,
});

const inp: React.CSSProperties = { width: 293, maxWidth: "100%", height: 35, border: "1px solid #AAA", background: "#FAFAFA", padding: "0 10px", fontSize: 16, boxSizing: "border-box" };
const lbl: React.CSSProperties = { fontSize: 16, height: 42, width: "36%" };

function ChangePassword() {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [cf, setCf] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nw !== cf) return setMsg({ ok: false, t: "New password and confirm password do not match." });
    try {
      await memberApi("/password", { body: { current_password: cur, new_password: nw } });
      setMsg({ ok: true, t: "Password changed successfully." });
      setCur(""); setNw(""); setCf("");
    } catch (err) {
      setMsg({ ok: false, t: (err as Error).message });
    }
  };
  return (
    <Page title="Change Password">
      <form onSubmit={submit}>
        <Msg ok={msg?.ok} text={msg?.t ?? null} />
        <table border={0} cellSpacing={0} cellPadding={0} style={{ width: "100%" }}>
          <tbody>
            <tr><td style={lbl}>Old Password *</td><td style={{ width: "2%", fontSize: 16 }}>:</td><td><input style={inp} type="password" value={cur} onChange={(e) => setCur(e.target.value)} required /></td></tr>
            <tr><td style={lbl}>New Password *</td><td style={{ fontSize: 16 }}>:</td><td><input style={inp} type="password" value={nw} onChange={(e) => setNw(e.target.value)} required minLength={6} maxLength={72} /></td></tr>
            <tr><td style={lbl}>Confirm New Password *</td><td style={{ fontSize: 16 }}>:</td><td><input style={inp} type="password" value={cf} onChange={(e) => setCf(e.target.value)} required maxLength={72} /></td></tr>
            <tr><td /><td /><td><input type="submit" value="Save" style={{ fontSize: 16, border: "1px solid #AAA", background: "#fff", padding: "2px 8px" }} /></td></tr>
          </tbody>
        </table>
      </form>
    </Page>
  );
}
