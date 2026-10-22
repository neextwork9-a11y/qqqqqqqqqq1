import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/news-events")({ head: () => pageHead("news-events"), component: NewsEvents });
function NewsEvents() { return <ReferenceSite page="news-events" />; }
