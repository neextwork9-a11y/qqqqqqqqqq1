import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { adminApi, adminToken, ADMIN_DEMO_TOKEN } from "@/lib/admin-api";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Life OS" },
      { name: "description", content: "Sign in to the Life OS admin panel." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Login — Life OS" },
      { property: "og:description", content: "Sign in to the Life OS admin panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  component: AdminLogin,
});

const DEMO_EMAIL = "demo@lifeos.test";
const DEMO_PASS = "Demo@1234";
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () => Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

function AdminLogin() {
  const navigate = useNavigate();
  const [code, setCode] = useState(makeCode);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErr(null);
    if (String(fd.get("captcha") ?? "").trim().toUpperCase() !== code) {
      setErr("Security code does not match. Try again.");
      setCode(makeCode());
      return;
    }
    if (String(fd.get("email")).trim().toLowerCase() === DEMO_EMAIL && fd.get("password") === DEMO_PASS) {
      adminToken.set(ADMIN_DEMO_TOKEN); navigate({ to: "/admin" }); return;
    }
    setBusy(true);
    try {
      adminToken.clear();
      const r = await adminApi<{ token: string }>("/login", { body: { email: fd.get("email"), password: fd.get("password") } });
      adminToken.set(r.token);
      navigate({ to: "/admin" });
    } catch (x) {
      setErr((x as Error).message === "Failed to fetch" ? "Admin server is not reachable right now." : (x as Error).message);
      setCode(makeCode());
    } finally { setBusy(false); }
  };

  const demo = () => { adminToken.set(ADMIN_DEMO_TOKEN); navigate({ to: "/admin" }); };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <h1 className="admin-login-title">ADMIN LOGIN</h1>
        <form onSubmit={submit}>
          <input className="admin-login-input" type="email" name="email" placeholder="Account Login User ID" required autoComplete="username" />
          <input className="admin-login-input" type="password" name="password" placeholder="Account Login Password" required autoComplete="current-password" />
          <input className="admin-login-input" type="text" name="captcha" placeholder="Login Captcha Code" required maxLength={5} autoComplete="off" />
          <button type="button" className="admin-login-captcha" title="Click for a new code" onClick={() => setCode(makeCode())}>
            {code.split("").map((c, i) => <span key={i}>{c}</span>)}
          </button>
          {err && <p role="alert" className="admin-login-err">{err}</p>}
          <div className="admin-login-actions">
            <button className="admin-login-btn" type="submit" disabled={busy}>{busy ? "Wait…" : "Login"}</button>
            <button className="admin-login-btn" type="reset" onClick={() => setErr(null)}>Cancel</button>
          </div>
        </form>
        <div className="admin-login-err" style={{ textAlign: "left", marginTop: 12 }}>
          ডেমো অ্যাডমিন (শুধু টেস্টের জন্য, আসল টাকার হিসাব বদলায় না):<br />
          User ID: <b>{DEMO_EMAIL}</b><br />Password: <b>{DEMO_PASS}</b>
        </div>
        <button type="button" className="admin-login-demo" onClick={demo}>View demo admin panel</button>
      </div>
    </div>
  );
}
