import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { memberApi, memberToken, DEMO_TOKEN } from "@/lib/member-api";
import { useState } from "react";
import { Truck, ShieldCheck, Headphones, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Member Login — Life OS" },
      { name: "description", content: "Sign in to your Life OS member account." },
      { property: "og:title", content: "Member Login — Life OS" },
      { property: "og:description", content: "Sign in to your Life OS member account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

const features = [
  { icon: Truck, title: "Fast Delivery", text: "Prompt dispatch to your doorstep" },
  { icon: ShieldCheck, title: "Secure Payment", text: "100% secure transactions" },
  { icon: Headphones, title: "Customer Support", text: "Monday – Thursday, 9:30 am – 7:00 pm" },
];

function Login() {
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErr(null); setBusy(true);
    try {
      memberToken.clear();
      const r = await memberApi<{ token: string }>("/login", { body: { username: fd.get("username"), password: fd.get("password") } });
      memberToken.set(r.token);
      navigate({ to: "/member" });
    } catch (x) {
      setErr((x as Error).message === "Failed to fetch" ? "Member server is not reachable right now." : (x as Error).message);
    } finally { setBusy(false); }
  };
  const root = () => {
    const u = document.querySelector<HTMLInputElement>('input[name="username"]');
    const pw = document.querySelector<HTMLInputElement>('input[name="password"]');
    if (u) u.value = "ROOT";
    pw?.focus();
  };
  const demo = () => { memberToken.set(DEMO_TOKEN); navigate({ to: "/member" }); };
  return (
    <div className="login-page">
      <div className="login-card">
        <aside className="login-side">
          <p className="login-side-eyebrow">WE ARE THE</p>
          <p className="login-side-brand">Life OS</p>
          <h1 className="login-side-title">Welcome Back!</h1>
          <p className="login-side-sub">Sign in to your Life OS member panel</p>
          <ul className="login-side-features">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="login-side-icon"><Icon size={22} strokeWidth={1.6} /></span>
                <span><strong>{title}</strong><small>{text}</small></span>
              </li>
            ))}
          </ul>
        </aside>
        <section className="login-main">
          <h2 className="login-title">Login to Your Account</h2>
          <p className="login-sub">Enter your username and password to continue.</p>
          <form className="login-form" onSubmit={submit}>
            <input className="login-input" type="text" name="username" placeholder="Life ID / Phone *" required autoComplete="username" />
            <div className="login-password">
              <input className="login-input" type={show ? "text" : "password"} name="password" placeholder="Password *" required autoComplete="current-password" />
              <button type="button" className="login-eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="login-row">
              <label className="login-remember"><input type="checkbox" name="remember" /> Remember my username</label>
              <a className="login-link" href="/contact">Forgot password?</a>
            </div>
            {err && <p role="alert" style={{ color: "#c00", fontWeight: 600 }}>{err}</p>}
            <button className="login-submit" type="submit" disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
            <div className="login-divider"><span>OR</span></div>
            <button type="button" className="login-link login-merchant" onClick={root} style={{ background: "none", border: 0, cursor: "pointer" }}>Login as ROOT (company account)</button>
            <button type="button" className="login-link login-merchant" onClick={demo} style={{ background: "none", border: 0, cursor: "pointer" }}>View demo member panel</button>
          </form>
        </section>
      </div>
    </div>
  );
}
