import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/contact")({ head: () => pageHead("contact"), component: Contact });
function Contact() { return <ReferenceSite page="contact" />; }
