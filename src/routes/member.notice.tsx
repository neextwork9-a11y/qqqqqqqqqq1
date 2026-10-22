import { createFileRoute } from "@tanstack/react-router";
import { Msg, Page, useMember, fmtDate } from "@/components/member-kit";

export const Route = createFileRoute("/member/notice")({
  head: () => ({ meta: [{ title: "Account Notice — Life OS Member" }, { name: "description", content: "Life OS member notices." }, { property: "og:title", content: "Account Notice — Life OS Member" }, { property: "og:description", content: "Life OS member notices." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AccountNotice,
});

function AccountNotice() {
  const q = useMember<{ id: number; kind: string; title: string | null; content: string; updated_at: string }[]>("notices", "/notices");
  return <Page title="Account Notice">
    <Msg text={q.error ? (q.error as Error).message : null} />
    {q.isPending ? <p>Loading…</p> : !q.error && !q.data?.length ? <p>No current notices.</p> : null}
    {q.data?.map((n) => <article key={n.id} className="border-b border-border py-4">
      <h3>{n.title || (n.kind === "SCROLL" ? "Latest News" : "Notice")}</h3>
      <p className="whitespace-pre-wrap break-words">{n.content}</p>
      <time className="text-sm text-muted-foreground">{fmtDate(n.updated_at)}</time>
    </article>)}
  </Page>;
}
