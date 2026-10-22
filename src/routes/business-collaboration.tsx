import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/business-collaboration")({ head: () => pageHead("business-collaboration"), component: Collaboration });
function Collaboration() { return <ReferenceSite page="business-collaboration" />; }