import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/")({
  head: () => pageHead("home"),
  component: Index,
});
function Index() {
  return <ReferenceSite page="home" />;
}
