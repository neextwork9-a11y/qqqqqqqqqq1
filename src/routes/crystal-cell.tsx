import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/crystal-cell")({ head: () => pageHead("crystal-cell"), component: CrystalCell });
function CrystalCell() { return <ReferenceSite page="crystal-cell" />; }