import { createFileRoute } from "@tanstack/react-router";
import { Page, useMember } from "@/components/member-kit";

export const Route = createFileRoute("/member/statistics")({
  head: () => ({ meta: [{ title: "Statistics View — Life OS Member" }, { name: "description", content: "Life OS team statistics." }, { property: "og:title", content: "Statistics View — Life OS Member" }, { property: "og:description", content: "Life OS team statistics." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Stats,
});

type Node = { active: boolean; left_carry: number; right_carry: number; left: Node | null; right: Node | null };
const count = (n: Node | null): { all: number; active: number } => {
  if (!n) return { all: 0, active: 0 };
  const a = count(n.left), b = count(n.right);
  return { all: 1 + a.all + b.all, active: (n.active ? 1 : 0) + a.active + b.active };
};

function Stats() {
  const t = useMember<Node | null>("tree", "/tree/binary").data ?? null;
  const rank = useMember<{ lifetime_matchings: number; current: { name?: string } | null }>("rank", "/rank").data;
  const L = count(t?.left ?? null), R = count(t?.right ?? null);
  const rows: [string, React.ReactNode, React.ReactNode][] = [
    ["Total Members", L.all, R.all],
    ["Active Members", L.active, R.active],
    ["Inactive Members", L.all - L.active, R.all - R.active],
    ["Lifetime Matchings", rank?.lifetime_matchings ?? 0, "—"],
    ["Carry Forward", t?.left_carry ?? 0, t?.right_carry ?? 0],
  ];
  return (
    <Page title="Statistics Details View">
      <table width="60%" className="table stat" cellSpacing={7} cellPadding={4} style={{ margin: "10px 0" }}>
        <thead>
          <tr>
            <th align="left">On The Position</th>
            <th>Team A's Value</th>
            <th>Team B's Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b]) => (
            <tr key={k}>
              <th align="left">{k}</th>
              <td align="center">{a}</td>
              <td align="center">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ textAlign: "left" }}>Current Rank: <b>{rank?.current?.name ?? "Free Member"}</b> &mdash; <small>(rank list is pending final confirmation; no rank reward is paid until it is approved)</small></p>
    </Page>
  );
}
