import { createFileRoute } from "@tanstack/react-router";
import { NoticeManager } from "@/components/notice-manager";

export const Route = createFileRoute("/admin/scroll-news")({
  head: () => ({ meta: [{ title: "Scroll News — Life OS Admin" }, { name: "description", content: "Manage scroll news shown on the site." }, { property: "og:title", content: "Scroll News — Life OS Admin" }, { property: "og:description", content: "Manage scroll news shown on the site." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <NoticeManager kind="SCROLL" title="Scroll News" />,
});
