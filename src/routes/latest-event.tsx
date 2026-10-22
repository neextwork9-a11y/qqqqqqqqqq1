import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/latest-event")({ head: () => pageHead("latest-event"), component: LatestEvent });
function LatestEvent() { return <ReferenceSite page="latest-event" />; }
