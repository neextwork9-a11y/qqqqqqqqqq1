import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { adminApi, adminToken } from "@/lib/admin-api";
import { fmtDate, fmtDateShort } from "@/components/member-kit";

export { fmtDate, fmtDateShort };
export { Page, DataTable, Msg } from "@/components/member-kit";

/** Menu mirrors the reference admin kit structure (green member-panel style). */
const MENU: { label: string; items: { to: string; label: string }[] }[] = [
  {
    label: "Configs",
    items: [
      { to: "/admin", label: "Dashboard (Company Info)" },
      { to: "/admin/site-config", label: "Site Config" },
      { to: "/admin/plan", label: "Plan & Ranks" },
      { to: "/admin/notice", label: "Account Notice" },
      { to: "/admin/scroll-news", label: "Scroll News" },
      { to: "/admin/password", label: "Password Change" },
    ],
  },
  {
    label: "Member Block",
    items: [
      { to: "/admin/member-list", label: "Member List" },
      { to: "/admin/member-report", label: "Member Report" },
      { to: "/admin/joining-report", label: "Joining Report" },
      { to: "/admin/activations", label: "Package Activation" },
      { to: "/admin/balance-add", label: "Balance Add" },
    ],
  },
  {
    label: "Balance Block",
    items: [
      { to: "/admin/ledger", label: "Bonus Report" },
      { to: "/admin/withdrawals", label: "Withdrawals" },
      { to: "/admin/matching-events", label: "Matching Events" },
      { to: "/admin/rank-reward", label: "Rank Reward" },
      { to: "/admin/statements", label: "Statement Close" },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/admin/sales-report", label: "Sales Report" },
      { to: "/admin/rank-achievers", label: "Rank Achievers" },
    ],
  },
];

export function useAdmin<T>(key: string, path: string, enabled = true) {
  return useQuery({ queryKey: ["admin", key], queryFn: () => adminApi<T>(path), enabled, retry: false });
}

function printInner() {
  const el = document.getElementById("main_admin");
  const w = window.open("", "print", "height=600,width=900");
  if (!el || !w) return;
  w.document.write('<html><head><title>Life OS Admin</title><style>body{font-family:Tahoma;font-size:12px}table{border-collapse:collapse}th{background:#009541;color:#fff;padding:5px 2px}td{padding:4px}</style></head><body>' + el.innerHTML + "</body></html>");
  w.document.close(); w.focus(); w.print(); w.close();
}

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(1, entry.contentRect.width / 1100));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!adminToken.get()) navigate({ to: "/admin/login" });
    else setReady(true);
  }, [navigate]);

  const me = useAdmin<{ name: string; email: string }>("me", "/me", ready);
  useEffect(() => {
    if (me.error) navigate({ to: "/admin/login" });
  }, [me.error, navigate]);

  const logout = () => {
    adminToken.clear();
    navigate({ to: "/admin/login" });
  };

  return (
    <div ref={viewportRef} className="lifeos-member-viewport">
      <div className="lifeos-member lifeos-member-bg" style={{ zoom: scale }}>
        <div className="content_full">
          <div className="header_content lifeos-banner" style={{ backgroundImage: "url(/member-kit/images/admin-banner.jpg)" }}>
            <Link to="/" aria-label="Life OS home" style={{ display: "block", height: 200 }} />
          </div>
        </div>
        <div className="content_menu">
          <div className="ddsmoothmenu" id="menu">
            <ul>
              {MENU.map((m, i) => (
                <li key={m.label} style={{ zIndex: 100 - i }} onMouseEnter={() => setOpen(i)} onMouseLeave={() => setOpen(null)}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setOpen(open === i ? null : i); }}>
                    {m.label} <i className="fa fa-chevron-down" aria-hidden="true" />
                  </a>
                  <ul style={{ top: 50, width: 220, display: open === i ? "block" : "none", visibility: "visible" }}>
                    {m.items.map((it) => (
                      <li key={it.to}>
                        <Link to={it.to} onClick={() => setOpen(null)}>
                          <i className="fa fa-chevron-right" aria-hidden="true" /> {it.label}
                        </Link>
                      </li>
                    ))}
                    <span />
                  </ul>
                </li>
              ))}
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
                  Logout <i className="fa fa-lock" aria-hidden="true" />
                </a>
              </li>
            </ul>
            <br style={{ clear: "left" }} />
          </div>
        </div>
        <div id="wrapper">
          <div className="mid_image">
            <div id="main_admin">{ready && me.data ? children : <div className="main_bg about"><h2 id="heading">Loading…</h2></div>}</div>
            {me.data && <div className="my-userid">Admin: {me.data.name} ({me.data.email})</div>}
            <div className="print"><img src="/member-kit/images/printer.png" width={32} alt="Print" title="Print Inner Content" onClick={() => printInner()} /></div>
          </div>
        </div>
        <div className="lifeos-admin-footer">COPYRIGHT © 2026 LIFE OS | ALL RIGHTS RESERVED.</div>
      </div>
    </div>
  );
}

/** Date / search filter bar shared by the report pages. */
export function FilterBar({ value, onChange, showQuery = true, children }: {
  value: { from: string; to: string; q: string };
  onChange: (v: { from: string; to: string; q: string }) => void;
  showQuery?: boolean;
  children?: ReactNode;
}) {
  const [local, setLocal] = useState(value);
  return (
    <form style={{ margin: "10px 0", textAlign: "center" }} onSubmit={(e) => { e.preventDefault(); onChange(local); }}>
      <b>Date From:</b> <input type="date" value={local.from} onChange={(e) => setLocal({ ...local, from: e.target.value })} style={{ width: 140 }} />
      <b style={{ marginLeft: 16 }}>Date To:</b> <input type="date" value={local.to} onChange={(e) => setLocal({ ...local, to: e.target.value })} style={{ width: 140 }} />
      {showQuery && (<>
        <b style={{ marginLeft: 16 }}>Search:</b> <input type="text" placeholder="Life ID / Phone" value={local.q} onChange={(e) => setLocal({ ...local, q: e.target.value })} style={{ width: 150 }} />
      </>)}
      {children}
      <input type="submit" value="Search" style={{ marginLeft: 16 }} />
    </form>
  );
}
