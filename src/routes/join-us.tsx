import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/join-us")({ head: () => pageHead("join-us"), component: JoinUs });
function JoinUs() { return <ReferenceSite page="join-us" />; }
