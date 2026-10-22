import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/business-opportunity")({ head: () => pageHead("business-opportunity"), component: Opportunity });
function Opportunity() { return <ReferenceSite page="business-opportunity" />; }