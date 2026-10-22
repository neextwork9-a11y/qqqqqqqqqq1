import { createFileRoute } from "@tanstack/react-router";
import { ReferenceSite, pageHead } from "@/components/reference-site";
export const Route = createFileRoute("/video-gallery")({ head: () => pageHead("video-gallery"), component: VideoGallery });
function VideoGallery() { return <ReferenceSite page="video-gallery" />; }
