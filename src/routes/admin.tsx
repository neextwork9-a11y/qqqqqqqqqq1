import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-kit";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Life OS" },
      { name: "description", content: "Life OS administration panel." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Panel — Life OS" },
      { property: "og:description", content: "Life OS administration panel." },
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
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
