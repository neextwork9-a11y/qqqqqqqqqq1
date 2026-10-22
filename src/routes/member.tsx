import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberShell } from "@/components/member-kit";

export const Route = createFileRoute("/member")({
  head: () => ({
    meta: [
      { title: "Member Panel — Life OS" },
      { name: "description", content: "Life OS member account panel." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Member Panel — Life OS" },
      { property: "og:description", content: "Life OS member account panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: "/member-kit/style.css" },
      { rel: "stylesheet", href: "/member-kit/menu.css" },
      { rel: "stylesheet", href: "/member-kit/lifeos.css" },
      { rel: "stylesheet", href: "https://use.fontawesome.com/b71919079b.css" },
    ],
  }),
  ssr: false,
  component: () => (
    <MemberShell>
      <Outlet />
    </MemberShell>
  ),
});
