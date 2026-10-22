import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/triple-stemcell-h2o")({ head: () => pageHead("triple-stemcell-h2o"), component: Moisturizer });
function Moisturizer() { return <ReferenceSite page="triple-stemcell-h2o" />; }