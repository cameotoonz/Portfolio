"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { parseVideoUrl, platformLabel } from "@/lib/video";
import type { EmbedSettings } from "@/lib/data";

/**
 * Lazy player: shows the poster until the visitor presses play,
 * then mounts the real video/iframe. Never loads media up-front.
 */
export default function ProjectPlayer({
  src,
  poster,
  title,
  vertical,
  embed,
}: {
  src: string;
  poster: string;
  title: string;
  vertical: boolean;
  embed: EmbedSettings;
}) {
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const parsed = parseVideoUrl(src);
  const ratio = vertical ? "aspect-[9/16]" : "aspect-video";
  const frame = vertical ? "mx-auto w-full max-w-100" : "w-full";

  const embedUrl = (() => {
    if (!parsed.embedUrl) return null;
    const u = new URL(parsed.embedUrl);
    u.searchParams.set("autoplay", embed.autoplay ? "1" : "0");
    if (embed.muted) u.searchParams.set("mute", "1");
    if (embed.loop) u.searchParams.set("loop", "1");
    if (!embed.controls) u.searchParams.set("controls", "0");
    if (embed.startTime > 0) u.searchParams.set("start", String(embed.startTime));
    return u.toString();
  })();

  if (!src) {
    return (
      <div className={`${frame} ${ratio} flex items-center justify-center border border-white/10 bg-surface/50`}>
        <p className="text-[10.5px] tracking-[0.24em] text-mist/60">VIDEO COMING SOON</p>
      </div>
    );
  }

  // Non-embeddable platform → clean external action
  if (!parsed.embeddable) {
    return (
      <div className={`${frame} relative ${ratio} overflow-hidden border border-white/10 bg-surface`}>
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={title} className="h-full w-full object-cover opacity-45" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-ink/55 px-6 text-center">
          <p className="text-[10px] tracking-[0.26em] text-mist">
            HOSTED ON {platformLabel(parsed.platform).toUpperCase()}
          </p>
          <a
            href={parsed.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Watch video
            <ExternalLink className="size-3.5" strokeWidth={2.25} />
          </a>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className={`group relative block ${frame} ${ratio} overflow-hidden border border-white/10 bg-surface`}
        aria-label={`Play ${title}`}
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full bg-midnight/50" />
        )}
        <span className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full border border-aqua/45 bg-ink/55 backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
            <Play className="ml-1 size-6 text-aqua" fill="currentColor" strokeWidth={0} />
          </span>
        </span>
      </button>
    );
  }

  if (parsed.platform === "upload") {
    if (failed) {
      return (
        <div className={`${frame} ${ratio} flex flex-col items-center justify-center gap-4 border border-white/10 bg-surface`}>
          <p className="text-[11px] tracking-[0.2em] text-mist">VIDEO FAILED TO LOAD</p>
          <button onClick={() => setFailed(false)} className="btn-ghost">
            Retry
          </button>
        </div>
      );
    }
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={src}
        poster={poster || undefined}
        controls={embed.controls}
        autoPlay={embed.autoplay}
        muted={embed.muted}
        loop={embed.loop}
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className={`${frame} ${ratio} border border-white/10 bg-black object-contain`}
      />
    );
  }

  return (
    <div className={`${frame} ${ratio} border border-white/10 bg-black`}>
      <iframe
        src={embedUrl ?? parsed.embedUrl ?? ""}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
