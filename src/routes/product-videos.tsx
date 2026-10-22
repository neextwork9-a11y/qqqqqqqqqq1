import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/product-videos")({ head: () => pageHead("product-videos"), component: Videos });
function Videos() { return <ReferenceSite page="product-videos" />; }