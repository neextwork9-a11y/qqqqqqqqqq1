import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/photo-gallery")({ head: () => pageHead("photo-gallery"), component: Gallery });
function Gallery() { return <ReferenceSite page="photo-gallery" />; }