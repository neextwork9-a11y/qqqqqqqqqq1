import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/halal-certificates")({ head: () => pageHead("halal-certificates"), component: Certificates });
function Certificates() { return <ReferenceSite page="halal-certificates" />; }