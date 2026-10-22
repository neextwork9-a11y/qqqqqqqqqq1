import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Msg, Page, useMember } from "@/components/member-kit";

export const Route = createFileRoute("/member/tree")({
  head: () => ({ meta: [{ title: "Genealogy Tree — Life OS Member" }, { name: "description", content: "Life OS binary genealogy tree." }, { property: "og:title", content: "Genealogy Tree — Life OS Member" }, { property: "og:description", content: "Life OS binary genealogy tree." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Tree,
});

type Node = { user_id: number; life_id: string; active: boolean; left_carry: number; right_carry: number; left: Node | null; right: Node | null };

function find(n: Node | null, id: string): Node | null {
  if (!n) return null;
  if (n.life_id.toLowerCase() === id.toLowerCase()) return n;
  return find(n.left, id) ?? find(n.right, id);
}

function Cell({ n, size, onPick }: { n: Node | null; size: number; onPick: (n: Node) => void }) {
  return (
    <td valign="top" style={{ textAlign: "center" }}>
      {n ? (
        <>
          <span className="tree-node" title={`Left carry: ${n.left_carry} | Right carry: ${n.right_carry}`}>
            <span className="avatar" style={{ width: size, height: size, lineHeight: `${size}px`, opacity: n.active ? 1 : 0.45 }}>{n.life_id.slice(-2)}</span>
          </span>
          <br />
          <a href="#" style={{ color: "#009541" }} onClick={(e) => { e.preventDefault(); onPick(n); }}>User ID: {n.life_id}</a>
        </>
      ) : (
        <span style={{ color: "#999" }}>Empty</span>
      )}
    </td>
  );
}

function Tree() {
  const q = useMember<Node | null>("tree", "/tree/binary");
  const [root, setRoot] = useState<Node | null>(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const top = root ?? q.data ?? null;
  const l1 = [top?.left ?? null, top?.right ?? null];
  const l2 = l1.flatMap((n) => [n?.left ?? null, n?.right ?? null]);
  const line = () => <div aria-hidden="true" className="mx-auto h-6 w-1/2 border-x border-t border-primary" />;

  return (
    <Page title="Genealogy Tree">
      <Msg text={q.error ? (q.error as Error).message : null} />
      <form style={{ textAlign: "left", margin: "10px 0" }} onSubmit={(e) => {
        e.preventDefault();
        const f = find(q.data ?? null, search.trim());
        setMsg(f ? null : "User not found in your tree");
        if (f) setRoot(f);
      }}>
        <input type="text" aria-label="Search Life ID" value={search} onChange={(e) => setSearch(e.target.value)} size={12} />{" "}
        <input type="submit" value="View tree" id="submit" />
        {root && <input type="button" value="My tree" style={{ marginLeft: 8 }} onClick={() => { setRoot(null); setSearch(""); }} />}
        {msg && <span style={{ color: "#c00", marginLeft: 10 }}>{msg}</span>}
      </form>
      {!top ? <p>{q.isLoading ? "Loading…" : "No tree data yet."}</p> : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table width="100%" cellSpacing={0} cellPadding={2} id="demo" style={{ minWidth: 460 }}>
          <tbody>
            <tr><td colSpan={4} style={{ textAlign: "center" }}><table width="100%"><tbody><tr><Cell n={top} size={80} onPick={setRoot} /></tr></tbody></table></td></tr>
            <tr><td colSpan={4} style={{ padding: 0, textAlign: "center" }}>{line()}</td></tr>
            <tr>{l1.map((n, i) => <td key={i} colSpan={2} style={{ textAlign: "center" }}><table width="100%"><tbody><tr><Cell n={n} size={70} onPick={setRoot} /></tr></tbody></table></td>)}</tr>
            <tr>{l1.map((_, i) => <td key={i} colSpan={2} style={{ padding: 0, textAlign: "center" }}>{line()}</td>)}</tr>
            <tr>{l2.map((n, i) => <Cell key={i} n={n} size={60} onPick={setRoot} />)}</tr>
          </tbody>
        </table>
        </div>
      )}
    </Page>
  );
}
