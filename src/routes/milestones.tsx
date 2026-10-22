import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/milestones")({ head: () => pageHead("milestones"), component: Milestones });
function Milestones() { return <ReferenceSite page="milestones" />; }