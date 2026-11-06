"use client";

import { useEffect, useRef, useState } from "react";
import type { loop } from "../lib/content.ts";

type Props = { src: string; poster: string; label: string; copy: typeof loop; className: string };

// Plays only while on screen and while motion is welcome. With JavaScript off or reduced motion, it's the still poster.
export function Loop({ src, poster, label, copy, className }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState<boolean | null>(null); // null until hydrated, so there's no button that can't work

  useEffect(() => setPaused(matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  useEffect(() => {
    const element = video.current;
    if (!element || paused === null) return;
    if (paused) {
      element.pause();
      return;
    }
    const seen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) element.play().catch(() => {}); // a blocked play just leaves the poster showing
      else element.pause();
    });
    seen.observe(element);
    return () => seen.disconnect();
  }, [paused]);

  return (
    <div className={`loop ${className}`}>
      <video ref={video} src={src} poster={poster} aria-label={label} muted loop playsInline preload="none" />
      {paused === null ? null : (
        <button type="button" className="loop-toggle" onClick={() => setPaused(!paused)}>
          {paused ? copy.play : copy.pause}
        </button>
      )}
    </div>
  );
}
