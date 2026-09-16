"use client";

import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  Check,
  X,
  RotateCcw,
  Loader2,
  Film,
  AlertCircle,
  Link2,
} from "lucide-react";
import {
  UploadController,
  probeVideo,
  formatBytes,
  formatSpeed,
  formatDuration,
  type UploadStage,
} from "@/lib/upload-client";
import { parseVideoUrl, platformLabel } from "@/lib/video";
import type { WizardState } from "./types";

const SOURCES = [
  { key: "upload", label: "Uploaded video" },
  { key: "youtube", label: "YouTube" },
  { key: "shorts", label: "YouTube Shorts" },
  { key: "vimeo", label: "Vimeo" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "other", label: "Other URL" },
] as const;

type SourceKey = (typeof SOURCES)[number]["key"];

interface QueueItem {
  id: string;
  name: string;
  size: number;
  type: string;
  stage: UploadStage;
  percent: number;
  speed: number;
  error?: string;
}

function sourceFromState(s: WizardState): SourceKey {
  if (s.videoSourceType === "upload" || (!s.videoUrl && !s.uploadedVideo)) return "upload";
  const p = parseVideoUrl(s.videoUrl);
  if (p.platform === "youtube") return "youtube";
  if (p.platform === "youtube-shorts") return "shorts";
  if (p.platform === "vimeo") return "vimeo";
  if (p.platform === "instagram") return "instagram";
  if (p.platform === "tiktok") return "tiktok";
  return s.videoUrl ? "other" : "youtube";
}

export default function StepMedia({
  state,
  update,
  onFileSelected,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onFileSelected: (file: File | null) => void;
}) {
  const [source, setSource] = useState<SourceKey>(sourceFromState(state));
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>(
    state.uploadedVideo
      ? [
          {
            id: "existing",
            name: state.uploadedVideo.split("/").pop() ?? "video",
            size: state.fileSize,
            type: state.videoFormat,
            stage: "complete",
            percent: 100,
            speed: 0,
          },
        ]
      : [],
  );
  const controllerRef = useRef<UploadController | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUpload = source === "upload";
  const parsed = !isUpload && state.videoUrl ? parseVideoUrl(state.videoUrl) : null;

  const setQueueItem = (id: string, patch: Partial<QueueItem>) =>
    setQueue((q) => q.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const runUpload = useCallback(
    async (file: File) => {
      const itemId = `${file.name}-${Date.now()}`;
      lastFileRef.current = file;
      onFileSelected(file);
      setQueue([
        {
          id: itemId,
          name: file.name,
          size: file.size,
          type: file.type || file.name.split(".").pop() || "",
          stage: "uploading",
          percent: 0,
          speed: 0,
        },
      ]);

      // detect real dimensions/duration up front
      const meta = await probeVideo(file);
      if (meta && meta.width && meta.height) {
        const vertical = meta.height > meta.width;
        update({
          durationSec: meta.durationSec,
          width: meta.width,
          height: meta.height,
          orientation: vertical ? "vertical" : "horizontal",
          category: vertical ? "short" : "long",
          fileSize: file.size,
          videoFormat: file.type || "",
        });
      } else {
        update({ fileSize: file.size, videoFormat: file.type || "" });
      }

      const controller = new UploadController();
      controllerRef.current = controller;
      try {
        const result = await controller.upload(
          file,
          (stats) =>
            setQueueItem(itemId, {
              percent: stats.percent,
              speed: stats.bytesPerSecond,
              stage: stats.stage,
            }),
          meta,
        );
        update({
          uploadedVideo: result.url,
          videoSourceType: "upload",
          videoUrl: "",
          fileSize: result.size,
        });
        setQueueItem(itemId, { stage: "complete", percent: 100, speed: 0 });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed.";
        setQueueItem(itemId, {
          stage: msg.toLowerCase().includes("cancel") ? "cancelled" : "failed",
          error: msg,
        });
      }
    },
    [onFileSelected, update],
  );

  const validateAndUpload = (file: File) => {
    const okType =
      /^video\/(mp4|quicktime|webm|x-m4v)$/.test(file.type) ||
      /\.(mp4|mov|webm|m4v)$/i.test(file.name);
    if (!okType) {
      setQueue([
        {
          id: "invalid",
          name: file.name,
          size: file.size,
          type: file.type || "unknown",
          stage: "failed",
          percent: 0,
          speed: 0,
          error: "Unsupported format. Use MP4, MOV or WebM.",
        },
      ]);
      return;
    }
    runUpload(file);
  };

  const cancelUpload = () => {
    controllerRef.current?.cancel();
  };

  const retryUpload = () => {
    if (lastFileRef.current) runUpload(lastFileRef.current);
    else inputRef.current?.click();
  };

  const changeSource = (key: SourceKey) => {
    setSource(key);
    if (key === "upload") {
      update({ videoSourceType: "upload", videoUrl: "" });
    } else {
      update({ videoSourceType: "external", uploadedVideo: "" });
    }
  };

  const applyUrl = (url: string) => {
    const p = parseVideoUrl(url);
    const patch: Partial<WizardState> = { videoUrl: url, videoSourceType: "external" };
    if (p.platform === "youtube-shorts" || p.platform === "tiktok") {
      patch.orientation = "vertical";
      patch.category = "short";
    } else if (p.platform === "youtube" || p.platform === "vimeo") {
      patch.orientation = "horizontal";
    }
    if (p.thumbnail && !state.thumbnailUrl) patch.thumbnailUrl = p.thumbnail;
    update(patch);
  };

  const stageLabel: Record<UploadStage, string> = {
    waiting: "Waiting",
    uploading: "Uploading",
    processing: "Processing",
    complete: "Ready",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight">Upload or link your video</h2>
      <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-mist">
        Drop a file for hosted playback, or paste a link from YouTube, Vimeo,
        Instagram or TikTok. Uploads are chunked, so an interrupted transfer resumes
        instead of restarting.
      </p>

      {/* source selector */}
      <div className="mt-7 flex flex-wrap gap-1.5">
        {SOURCES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => changeSource(s.key)}
            className={`border px-3.5 py-2 text-[9.5px] font-bold tracking-[0.16em] transition-all duration-300 ${
              source === s.key
                ? "border-aqua/55 bg-aqua/8 text-cream"
                : "border-white/10 bg-white/2 text-mist hover:border-white/25 hover:text-cream"
            }`}
            aria-pressed={source === s.key}
          >
            {s.label.toUpperCase()}
          </button>
        ))}
      </div>

      {isUpload ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) validateAndUpload(f);
              e.target.value = "";
            }}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) validateAndUpload(f);
            }}
            className={`mt-5 border border-dashed transition-colors duration-300 ${
              dragging ? "border-aqua/70 bg-aqua/6" : "border-white/18 bg-white/1.5"
            }`}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16 text-center"
            >
              <UploadCloud className="size-8 text-mist/70" strokeWidth={1.25} />
              <span className="font-serif text-2xl italic text-cream">
                Drag &amp; drop video here
              </span>
              <span className="text-[10px] font-bold tracking-[0.28em] text-aqua">
                OR SELECT VIDEO
              </span>
              <span className="text-[9.5px] tracking-[0.18em] text-mist/60">
                MP4 · MOV · WEBM — UP TO 2GB
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="mt-5">
          <label className="admin-label" htmlFor="wizardUrl">
            <span className="inline-flex items-center gap-2">
              <Link2 className="size-3" strokeWidth={2} /> Add video URL
            </span>
          </label>
          <input
            id="wizardUrl"
            className="admin-input"
            value={state.videoUrl}
            onChange={(e) => update({ videoUrl: e.target.value })}
            onBlur={(e) => applyUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=… · vimeo.com/… · instagram.com/reel/…"
          />
          {state.videoUrl.trim() && parsed && (
            <div
              className={`mt-3 flex items-start gap-3 border px-4 py-3 text-[11px] leading-relaxed ${
                parsed.platform === "other"
                  ? "border-[#8a7a3a]/50 bg-[#8a7a3a]/10 text-[#d8c98a]"
                  : "border-aqua/30 bg-aqua/5 text-cream/90"
              }`}
            >
              {parsed.platform === "other" ? (
                <>
                  <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                  No embed available for this link — the project card will show the
                  thumbnail with a &quot;WATCH VIDEO ↗&quot; button to the original.
                </>
              ) : (
                <>
                  <Check className="mt-0.5 size-4 shrink-0 text-aqua" strokeWidth={1.5} />
                  Detected <strong>{platformLabel(parsed.platform)}</strong> — plays
                  inside the site with the matching player.
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* upload queue */}
      {isUpload && queue.length > 0 && (
        <div className="mt-6">
          <p className="admin-label">Upload queue</p>
          <div className="flex flex-col gap-2">
            {queue.map((item) => (
              <div key={item.id} className="border border-white/10 bg-white/2 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <Film className="mt-0.5 size-4 shrink-0 text-mist/70" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-cream">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[10px] tracking-[0.1em] text-mist/65">
                        {formatBytes(item.size)}
                        {item.type ? ` · ${item.type.replace("video/", "").toUpperCase()}` : ""}
                        {state.durationSec ? ` · ${formatDuration(state.durationSec)}` : ""}
                        {state.width ? ` · ${state.width}×${state.height}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`text-[9px] font-bold tracking-[0.2em] ${
                        item.stage === "complete"
                          ? "text-aqua"
                          : item.stage === "failed" || item.stage === "cancelled"
                            ? "text-[#ff9eb8]"
                            : "text-mist"
                      }`}
                    >
                      {stageLabel[item.stage].toUpperCase()}
                    </span>
                    {item.stage === "uploading" && (
                      <button
                        onClick={cancelUpload}
                        className="flex size-7 items-center justify-center text-mist/70 hover:text-[#ff9eb8]"
                        aria-label="Cancel upload"
                      >
                        <X className="size-3.5" strokeWidth={2} />
                      </button>
                    )}
                    {(item.stage === "failed" || item.stage === "cancelled") && (
                      <button
                        onClick={retryUpload}
                        className="flex size-7 items-center justify-center text-mist/70 hover:text-aqua"
                        aria-label="Retry upload"
                      >
                        <RotateCcw className="size-3.5" strokeWidth={2} />
                      </button>
                    )}
                    {item.stage === "complete" && (
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="text-[9px] font-bold tracking-[0.18em] text-mist/70 hover:text-aqua"
                      >
                        REPLACE
                      </button>
                    )}
                  </div>
                </div>

                {(item.stage === "uploading" || item.stage === "processing") && (
                  <div className="mt-3">
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-linear-to-r from-aqua to-cyan2 transition-all duration-300"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] tracking-[0.1em] text-mist/70">
                      <span>
                        {item.stage === "processing" ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Loader2 className="size-3 animate-spin" strokeWidth={2} />
                            Assembling &amp; generating preview…
                          </span>
                        ) : (
                          `${item.percent}% · ${formatSpeed(item.speed)}`
                        )}
                      </span>
                      <span>
                        {formatBytes((item.percent / 100) * item.size)} / {formatBytes(item.size)}
                      </span>
                    </div>
                  </div>
                )}

                {item.error && (
                  <p className="mt-3 border border-magenta/40 bg-magenta/10 px-3 py-2 text-[11px] text-[#e08bb4]">
                    {item.error}
                  </p>
                )}

                {item.stage === "complete" && state.uploadedVideo && (
                  <div className="mt-3 flex items-center gap-2 text-[10.5px] text-aqua">
                    <Check className="size-3.5" strokeWidth={2} />
                    Ready — {state.width ? `${state.width}×${state.height}` : "video"} detected as{" "}
                    <strong>{state.orientation === "vertical" ? "9:16 short form" : "16:9 long form"}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
