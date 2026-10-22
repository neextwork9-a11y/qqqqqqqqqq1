import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Msg } from "@/components/admin-kit";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/password")({
  head: () => ({ meta: [{ title: "Password Change — Life OS Admin" }, { name: "description", content: "Change the admin panel password." }, { property: "og:title", content: "Password Change — Life OS Admin" }, { property: "og:description", content: "Change the admin panel password." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PasswordChange,
});

function PasswordChange() {
  const [msg, setMsg] = useState<{ ok?: boolean; text: string | null }>({ text: null });
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("new") !== fd.get("confirm")) { setMsg({ text: "New password and confirmation do not match." }); return; }
    setBusy(true); setMsg({ text: null });
    try {
      await adminApi("/password", { body: { current: fd.get("current"), new: fd.get("new") } });
      setMsg({ ok: true, text: "Password changed successfully." });
      (e.target as HTMLFormElement).reset();
    } catch (x) { setMsg({ text: (x as Error).message }); }
    finally { setBusy(false); }
  };

  return (
    <Page title="Password Change" center>
      <form onSubmit={save}>
        <table className="table" cellPadding={8} style={{ margin: "10px auto" }}>
          <tbody>
            <tr><th align="right">Current Password</th><td><input type="password" name="current" required autoComplete="current-password" /></td></tr>
            <tr><th align="right">New Password (8–72 chars)</th><td><input type="password" name="new" required minLength={8} maxLength={72} autoComplete="new-password" /></td></tr>
            <tr><th align="right">Confirm New Password</th><td><input type="password" name="confirm" required maxLength={72} autoComplete="new-password" /></td></tr>
          </tbody>
        </table>
        <Msg {...msg} />
        <button type="submit" disabled={busy} style={{ padding: "8px 40px" }}>{busy ? "Saving…" : "Change Password"}</button>
      </form>
    </Page>
  );
}
