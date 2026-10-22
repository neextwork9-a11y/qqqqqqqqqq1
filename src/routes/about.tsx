import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/about")({ head: () => pageHead("about"), component: About });
function About() { return <ReferenceSite page="about" />; }