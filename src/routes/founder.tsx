import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/founder")({ head: () => pageHead("founder"), component: Founder });
function Founder() { return <ReferenceSite page="founder" />; }