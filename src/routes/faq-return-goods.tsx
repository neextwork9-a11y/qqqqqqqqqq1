import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/faq-return-goods")({ head: () => pageHead("faq-return-goods"), component: FaqReturn });
function FaqReturn() { return <ReferenceSite page="faq-return-goods" />; }
