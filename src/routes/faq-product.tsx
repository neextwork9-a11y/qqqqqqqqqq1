import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/faq-product")({ head: () => pageHead("faq-product"), component: FaqProduct });
function FaqProduct() { return <ReferenceSite page="faq-product" />; }
