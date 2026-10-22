import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
import { awardsHtml } from "@/lib/award-media";
export const Route = createFileRoute("/awards")({ head: () => pageHead("awards"), component: Awards });
function Awards() { return <ReferenceSite page="awards" html={awardsHtml} />; }