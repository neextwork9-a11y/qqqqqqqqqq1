import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/business-center")({ head: () => pageHead("business-center"), component: BusinessCenter });
function BusinessCenter() { return <ReferenceSite page="business-center" />; }
