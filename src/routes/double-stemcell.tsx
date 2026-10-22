import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/double-stemcell")({ head: () => pageHead("double-stemcell"), component: DoubleStemcell });
function DoubleStemcell() { return <ReferenceSite page="double-stemcell" />; }