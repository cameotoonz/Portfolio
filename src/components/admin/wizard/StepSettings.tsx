"use client";

import { Info } from "lucide-react";
import { parseVideoUrl } from "@/lib/video";
import { slugify } from "@/lib/admin-api";
import type { WizardState } from "./types";

export default function StepSettings({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  const isUpload = state.videoSourceType === "upload";
  const parsed = isUpload ? null : parseVideoUrl(state.videoUrl);
  const platform = isUpload ? "upload" : (parsed?.platform ?? "other");

  // Only surface controls the selected platform genuinely honours.
  const supports = {
    autoplay: isUpload || platform === "youtube" || platform === "youtube-shorts" || platform === "vimeo",
    muted: isUpload || platform === "youtube" || platform === "youtube-shorts" || platform === "vimeo",
    loop: isUpload || platform === "youtube" || platform === "vimeo",
    controls: isUpload || platform === "youtube" || platform === "youtube-shorts",
    startTime: platform === "youtube" || platform === "vimeo",
  };
  const anySupported = Object.values(supports).some(Boolean);

  const toggle = (key: keyof WizardState["embedSettings"], value: boolean | number) =>
    update({ embedSettings: { ...state.embedSettings, [key]: value } });

  const slugPreview = state.slug || slugify(state.title || "project", false);

  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight">Video &amp; publishing settings</h2>
      <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-mist">
        Playback behaviour, visibility and the public URL for this project.
      </p>

      {/* playback */}
      <div className="mt-7 border border-white/8 bg-white/2 p-5">
        <p className="admin-label">Player settings</p>
        {anySupported ? (
          <div className="flex flex-wrap gap-2.5">
            {supports.autoplay && (
              <label className="flex cursor-pointer items-center gap-2.5 border border-white/10 px-3.5 py-2.5">
                <input type="checkbox" className="size-3.5 accent-[#50ccd2]" checked={state.embedSettings.autoplay} onChange={(e) => toggle("autoplay", e.target.checked)} />
                <span className="text-[10px] font-bold tracking-[0.18em]">AUTOPLAY</span>
              </label>
            )}
            {supports.muted && (
              <label className="flex cursor-pointer items-center gap-2.5 border border-white/10 px-3.5 py-2.5">
                <input type="checkbox" className="size-3.5 accent-[#50ccd2]" checked={state.embedSettings.muted} onChange={(e) => toggle("muted", e.target.checked)} />
                <span className="text-[10px] font-bold tracking-[0.18em]">MUTED</span>
              </label>
            )}
            {supports.loop && (
              <label className="flex cursor-pointer items-center gap-2.5 border border-white/10 px-3.5 py-2.5">
                <input type="checkbox" className="size-3.5 accent-[#50ccd2]" checked={state.embedSettings.loop} onChange={(e) => toggle("loop", e.target.checked)} />
                <span className="text-[10px] font-bold tracking-[0.18em]">LOOP</span>
              </label>
            )}
            {supports.controls && (
              <label className="flex cursor-pointer items-center gap-2.5 border border-white/10 px-3.5 py-2.5">
                <input type="checkbox" className="size-3.5 accent-[#50ccd2]" checked={state.embedSettings.controls} onChange={(e) => toggle("controls", e.target.checked)} />
                <span className="text-[10px] font-bold tracking-[0.18em]">CONTROLS</span>
              </label>
            )}
            {supports.startTime && (
              <label className="flex items-center gap-2.5 border border-white/10 px-3.5 py-2">
                <span className="text-[10px] font-bold tracking-[0.18em]">START AT</span>
                <input
                  type="number"
                  min={0}
                  className="w-16 border border-white/10 bg-transparent px-2 py-1 text-[11px] text-cream"
                  value={state.embedSettings.startTime}
                  onChange={(e) => toggle("startTime", Number(e.target.value) || 0)}
                />
                <span className="text-[10px] text-mist">sec</span>
              </label>
            )}
          </div>
        ) : (
          <p className="text-[11.5px] leading-relaxed text-mist/75">
            This platform doesn&apos;t expose playback options through its embed —
            no settings are shown rather than pretending they work.
          </p>
        )}
        <p className="mt-4 flex items-start gap-2 text-[10.5px] leading-relaxed text-mist/60">
          <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
          Only options supported by <strong className="mx-1 text-cream/80">{platform.replace("-", " ")}</strong>
          are listed. The site always lazy-loads the video behind the poster.
        </p>
      </div>

      {/* visibility */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="admin-label" htmlFor="w-status">Visibility</label>
          <select
            id="w-status"
            className="admin-input"
            value={state.status}
            onChange={(e) =>
              update({ status: e.target.value as WizardState["status"] })
            }
          >
            <option value="draft">Draft — only visible in admin</option>
            <option value="published">Published — live on the site</option>
            <option value="unpublished">Unpublished — hidden from visitors</option>
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="w-privacy">Privacy</label>
          <select
            id="w-privacy"
            className="admin-input"
            value={state.privacy}
            onChange={(e) =>
              update({ privacy: e.target.value as WizardState["privacy"] })
            }
          >
            <option value="public">Public — listed in the portfolio</option>
            <option value="unlisted">Unlisted — direct link only</option>
            <option value="private">Private — admin only</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="admin-label" htmlFor="w-slug">Project URL</label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[11.5px] text-mist/60">/work/</span>
            <input
              id="w-slug"
              className="admin-input"
              value={state.slug}
              onChange={(e) => update({ slug: e.target.value })}
              placeholder={slugPreview}
            />
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-mist/60">
            Leave blank to auto-generate from the title. Saved as{" "}
            <span className="text-aqua">/work/{slugPreview}</span> — duplicates get a
            unique suffix automatically.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="flex w-fit cursor-pointer items-center gap-3 border border-white/10 bg-white/2 px-4 py-3">
            <input
              type="checkbox"
              className="size-4 accent-[#50ccd2]"
              checked={state.featured}
              onChange={(e) => update({ featured: e.target.checked })}
            />
            <span className="text-[10.5px] font-bold tracking-[0.2em] text-cream">
              FEATURED PROJECT
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
