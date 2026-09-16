"use client";

import { Play, Eye, AlertCircle } from "lucide-react";
import ProseText from "@/components/site/ProseText";
import { parseVideoUrl, platformLabel } from "@/lib/video";
import { formatDuration } from "@/lib/upload-client";
import type { SupportingMedia, WizardState } from "./types";

export default function StepPreview({
  state,
  media,
}: {
  state: WizardState;
  media: SupportingMedia[];
}) {
  const src =
    state.videoSourceType === "upload" ? state.uploadedVideo : state.videoUrl;
  const parsed = parseVideoUrl(src);
  const vertical = state.orientation === "vertical";
  const tags = state.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div>
      <div className="flex items-center gap-3">
        <Eye className="size-4 text-aqua" strokeWidth={1.5} />
        <h2 className="text-lg font-bold tracking-tight">Preview</h2>
      </div>
      <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-mist">
        This is how visitors will see the project. Nothing is public until you
        press publish.
      </p>

      {/* card preview */}
      <div className="mt-7">
        <p className="admin-label">Project card</p>
        <div
          className={`group relative overflow-hidden border border-white/10 bg-white/3.5 backdrop-blur-[18px] ${
            vertical ? "w-48" : "w-full max-w-md"
          }`}
        >
          <div className={`relative overflow-hidden ${vertical ? "aspect-[9/16]" : "aspect-video"}`}>
            {state.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-midnight/50 text-[9px] tracking-[0.2em] text-mist/60">
                NO THUMBNAIL
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-transparent opacity-70" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-12 items-center justify-center rounded-full border border-aqua/50 bg-ink/55 backdrop-blur-md">
                <Play className="ml-0.5 size-4 text-aqua" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
            {vertical && (
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-[8.5px] font-semibold tracking-[0.24em] text-aqua/90">SHORT FORM</p>
                <p className="mt-1 text-[13px] font-bold leading-snug text-cream">
                  {state.title || "Untitled project"}
                </p>
              </div>
            )}
          </div>
          {!vertical && (
            <div className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-[8.5px] font-semibold tracking-[0.24em] text-aqua/90">
                  {state.category === "long" ? "LONG FORM" : "SHORT FORM"}
                </p>
                <p className="mt-1.5 text-[15px] font-bold text-cream">
                  {state.title || "Untitled project"}
                </p>
              </div>
              <div className="shrink-0 text-right text-[9.5px] tracking-[0.16em] text-mist/70">
                {state.client && <p>{state.client.toUpperCase()}</p>}
                {state.year && <p>{state.year}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* player preview */}
      <div className="mt-8">
        <p className="admin-label">Player — {vertical ? "9:16 vertical" : "16:9 horizontal"}</p>
        {!src ? (
          <div className="flex items-center gap-3 border border-[#8a7a3a]/50 bg-[#8a7a3a]/10 px-4 py-3 text-[11.5px] text-[#d8c98a]">
            <AlertCircle className="size-4 shrink-0" strokeWidth={1.5} />
            No video source yet — add one in step 1.
          </div>
        ) : (
          <div className={`border border-white/10 bg-black ${vertical ? "mx-auto w-full max-w-64" : "w-full max-w-2xl"}`}>
            {parsed.platform === "upload" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={src}
                poster={state.thumbnailUrl || undefined}
                controls
                playsInline
                preload="none"
                className={`w-full object-contain ${vertical ? "aspect-[9/16]" : "aspect-video"}`}
              />
            ) : parsed.embeddable && parsed.embedUrl ? (
              <div className={vertical ? "aspect-[9/16]" : "aspect-video"}>
                <iframe
                  src={parsed.embedUrl.replace("autoplay=1", "autoplay=0")}
                  title="Preview"
                  className="h-full w-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
                <p className="text-[10.5px] tracking-[0.22em] text-mist">
                  NO EMBED — VISITORS GET A CLEAN LINK
                </p>
                <span className="btn-primary pointer-events-none">WATCH VIDEO ↗</span>
              </div>
            )}
          </div>
        )}
        <p className="mt-2 text-[10px] tracking-[0.12em] text-mist/60">
          SOURCE — {platformLabel(parsed.platform).toUpperCase()}
          {state.durationSec ? ` · ${formatDuration(state.durationSec)}` : ""}
          {state.width ? ` · ${state.width}×${state.height}` : ""}
        </p>
      </div>

      {/* case study preview */}
      <div className="mt-10 border-t border-white/8 pt-8">
        <p className="admin-label">Project page</p>
        <h3 className="text-2xl font-extrabold tracking-tight text-cream">
          {state.title || "Untitled project"}
        </h3>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="border border-white/12 px-2.5 py-1 text-[9px] tracking-[0.18em] text-mist">
                {t.toUpperCase()}
              </span>
            ))}
          </div>
        )}
        <ProseText text={state.description} className="mt-4 max-w-xl text-[13.5px]" />
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-[11px]">
          {[
            ["CLIENT", state.client],
            ["YEAR", state.year],
            ["ROLE", state.role],
            ["TOOLS", state.tools],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-[9px] tracking-[0.24em] text-mist/60">{k}</dt>
                <dd className="mt-1 text-cream">{v}</dd>
              </div>
            ))}
        </dl>
        {media.length > 0 && (
          <div className="mt-6">
            <p className="text-[9px] tracking-[0.24em] text-mist/60">
              {media.length} SUPPORTING MEDIA ITEM{media.length === 1 ? "" : "S"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {media.map((m) => (
                <div key={m.id} className="h-16 w-24 overflow-hidden border border-white/10">
                  {m.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={m.url} muted preload="metadata" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
