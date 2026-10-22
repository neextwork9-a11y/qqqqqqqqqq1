import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/faq-general")({ head: () => pageHead("faq-general"), component: FaqGeneral });
function FaqGeneral() { return <ReferenceSite page="faq-general" />; }
