import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/senior-management")({ head: () => pageHead("management"), component: Management });
function Management() { return <ReferenceSite page="management" />; }