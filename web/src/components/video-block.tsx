"use client";

import { useState } from "react";
import type { Video } from "@/lib/types";
import { IconPlay } from "./icons";

/** Vidéo courte hébergée en non répertorié (YouTube ou Bunny), intégrée. */
export function VideoBlock({ video, title = "Vidéo" }: { video: NonNullable<Video>; title?: string }) {
  const [open, setOpen] = useState(false);
  const isDemo = video.id === "demo";

  if (open && !isDemo) {
    const src =
      video.provider === "youtube"
        ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&cc_load_policy=1&hl=fr`
        : `https://iframe.mediadelivery.net/embed/${video.id}?autoplay=true`;
    return <iframe title={title} src={src} allow="autoplay; fullscreen" className="aspect-video w-full rounded-xl border-0" />;
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-granit text-white"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-white/25">
        <IconPlay className="size-7 translate-x-0.5" />
      </span>
      <span className="absolute bottom-2 left-3 text-sm font-medium">
        {open && isDemo ? "Vidéo en cours de tournage" : `${title} · ${video.duration} · sous-titrée`}
      </span>
    </button>
  );
}
