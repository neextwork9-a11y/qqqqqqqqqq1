import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/member-kit";

export const Route = createFileRoute("/member/notice")({
  head: () => ({ meta: [{ title: "Account Notice — Life OS Member" }, { name: "description", content: "Life OS member notices." }, { property: "og:title", content: "Account Notice — Life OS Member" }, { property: "og:description", content: "Life OS member notices." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <Page title="Account Notice">
      <p style={{ fontSize: 16, margin: "10px 0" }}>Welcome to Life OS. Complete your profile and nominee information. Cashback balance can only be used for Life OS services; it cannot be withdrawn or transferred.</p>
    </Page>
  ),
});
