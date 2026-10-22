import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/scientists")({ head: () => pageHead("scientists"), component: Scientists });
function Scientists() { return <ReferenceSite page="scientists" />; }