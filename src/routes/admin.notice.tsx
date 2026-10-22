import { createFileRoute } from "@tanstack/react-router";
import { NoticeManager } from "@/components/notice-manager";

export const Route = createFileRoute("/admin/notice")({
  head: () => ({ meta: [{ title: "Account Notice — Life OS Admin" }, { name: "description", content: "Manage member account notices." }, { property: "og:title", content: "Account Notice — Life OS Admin" }, { property: "og:description", content: "Manage member account notices." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <NoticeManager kind="NOTICE" title="Account Notice" />,
});
