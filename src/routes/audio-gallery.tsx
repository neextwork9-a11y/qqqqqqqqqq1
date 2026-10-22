import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ReferenceSite, BrandedPhoto } from "@/components/reference-site";
import speech from "@/assets/lifeos-smart-solutions.mp3";
import cover from "@/assets/lifeos-join-team.jpg";

export const Route = createFileRoute("/audio-gallery")({
  head: () => ({ meta: [
    { title: "Audio Gallery | Life OS BD" },
    { name: "description", content: "Listen to Life OS BD — Smart Solutions, an introduction to connected everyday services in Bangladesh." },
    { property: "og:title", content: "Audio Gallery | Life OS BD" },
    { property: "og:description", content: "Life OS BD — Smart Solutions. Listen to our brand introduction." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AudioGallery,
});

function AudioGallery() {
  const [error, setError] = useState(false);
  return <ReferenceSite page="video-gallery" content={<section className="section lifeos-audio-gallery" id="profile"><div className="container"><h2 className="h-bold text-center">Audio Gallery</h2><article className="lifeos-audio-track"><BrandedPhoto src={cover} alt="Life OS team connecting everyday services" /><div className="lifeos-audio-details"><p className="lifeos-audio-meta">LIFE OS BD · ENGLISH · 0:29</p><h3>Life OS BD — Smart Solutions</h3><p>Connecting lives through digital identity and everyday services in Bangladesh.</p><audio controls preload="metadata" src={speech} aria-label="Life OS BD Smart Solutions narration" onError={() => setError(true)} />{error && <p role="alert">The audio could not load. Please refresh and try again.</p>}</div></article></div></section>} />;
}