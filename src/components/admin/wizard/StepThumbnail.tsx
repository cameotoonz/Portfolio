"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Trash2,
  Camera,
  Check,
  GripVertical,
  Plus,
  X,
} from "lucide-react";
import { UploadController, captureFrame, probeVideo } from "@/lib/upload-client";
import type { SupportingMedia, WizardState } from "./types";

async function uploadBlob(blob: Blob, name: string): Promise<string> {
  const file = new File([blob], name, { type: blob.type || "image/jpeg" });
  const controller = new UploadController();
  const result = await controller.upload(file, () => {});
  return result.url;
}

export default function StepThumbnail({
  state,
  update,
  localFile,
  media,
  setMedia,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  localFile: File | null;
  media: SupportingMedia[];
  setMedia: (m: SupportingMedia[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0.6);
  const [duration, setDuration] = useState(state.durationSec || 0);
  const [error, setError] = useState("");
  const [supportUploading, setSupportUploading] = useState(false);
  const [dragId, setDragId] = useState<string | number | null>(null);
  const thumbInput = useRef<HTMLInputElement>(null);
  const supportInput = useRef<HTMLInputElement>(null);
  const previewVideo = useRef<HTMLVideoElement>(null);

  const videoSource = localFile
    ? undefined
    : state.uploadedVideo || undefined;
  const [objectUrl, setObjectUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!localFile) return;
    const url = URL.createObjectURL(localFile);
    setObjectUrl(url);
    probeVideo(localFile).then((m) => m && setDuration(m.durationSec));
    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  const scrubSrc = objectUrl ?? videoSource;
  const canScrub = Boolean(scrubSrc);

  const onScrub = (t: number) => {
    setScrubTime(t);
    if (previewVideo.current) previewVideo.current.currentTime = t;
  };

  const captureCurrentFrame = async () => {
    if (!scrubSrc) return;
    setError("");
    setCapturing(true);
    try {
      const blob = await captureFrame(localFile ?? scrubSrc, scrubTime);
      if (!blob) throw new Error("Couldn't read a frame from this video.");
      const url = await uploadBlob(blob, "frame-poster.jpg");
      update({ thumbnailUrl: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Frame capture failed.");
    } finally {
      setCapturing(false);
    }
  };

  const uploadThumb = async (file: File) => {
    setError("");
    if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) {
      setError("Thumbnail must be JPG, JPEG, PNG or WebP.");
      return;
    }
    setUploading(true);
    try {
      const controller = new UploadController();
      const result = await controller.upload(file, () => {});
      update({ thumbnailUrl: result.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Thumbnail upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const addSupporting = async (file: File) => {
    setError("");
    setSupportUploading(true);
    try {
      const controller = new UploadController();
      const result = await controller.upload(file, () => {});
      setMedia([
        ...media,
        {
          id: `tmp-${Date.now()}`,
          kind: result.kind,
          url: result.url,
          caption: "",
          persisted: false,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Media upload failed.");
    } finally {
      setSupportUploading(false);
    }
  };

  const reorder = (targetId: string | number) => {
    if (dragId === null || dragId === targetId) return;
    const next = [...media];
    const from = next.findIndex((m) => m.id === dragId);
    const to = next.findIndex((m) => m.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setMedia(next);
  };

  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight">Thumbnail &amp; presentation</h2>
      <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-mist">
        Pick the frame that sells the piece — the card never loads the full video,
        only this poster.
      </p>

      {/* thumbnail */}
      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <div>
          <p className="admin-label">Current thumbnail</p>
          <div
            className={`relative overflow-hidden border border-white/12 bg-midnight/40 ${
              state.orientation === "vertical" ? "aspect-[9/16] w-36" : "aspect-video w-full"
            }`}
          >
            {state.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[9px] tracking-[0.2em] text-mist/50">
                NO THUMBNAIL
              </span>
            )}
          </div>
          <input
            ref={thumbInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadThumb(f);
              e.target.value = "";
            }}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => thumbInput.current?.click()} disabled={uploading} className="btn-ghost">
              {uploading ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2} /> : <ImagePlus className="size-3.5" strokeWidth={1.75} />}
              {state.thumbnailUrl ? "Replace" : "Upload"}
            </button>
            {state.thumbnailUrl && (
              <button
                onClick={() => update({ thumbnailUrl: "" })}
                className="btn-ghost !text-[#ff9eb8] hover:!border-magenta/50"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} /> Remove
              </button>
            )}
          </div>
        </div>

        {/* frame scrubber */}
        <div>
          <p className="admin-label">Select frame from video</p>
          {canScrub ? (
            <div className="border border-white/10 bg-white/2 p-4">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={previewVideo}
                src={scrubSrc}
                muted
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
                className="max-h-56 w-full bg-black object-contain"
                onLoadedMetadata={(e) => {
                  setDuration(e.currentTarget.duration || 0);
                  e.currentTarget.currentTime = scrubTime;
                }}
              />
              <input
                type="range"
                min={0}
                max={Math.max(duration, 0.1)}
                step={0.05}
                value={scrubTime}
                onChange={(e) => onScrub(Number(e.target.value))}
                className="lux-range mt-4 w-full"
                aria-label="Scrub to frame"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10.5px] tabular-nums text-mist/70">
                  {scrubTime.toFixed(2)}s / {duration ? duration.toFixed(2) : "—"}s
                </span>
                <button onClick={captureCurrentFrame} disabled={capturing} className="btn-primary">
                  {capturing ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} /> : <Camera className="size-3.5" strokeWidth={2.25} />}
                  Use this frame
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-white/12 px-5 py-10 text-center text-[11px] leading-relaxed text-mist/65">
              Frame selection is available for uploaded videos.
              <br />
              For YouTube links the platform thumbnail is pulled in automatically —
              you can still upload a custom one.
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-5 border border-magenta/40 bg-magenta/10 px-4 py-3 text-[12px] text-[#e08bb4]">
          {error}
        </p>
      )}

      {/* supporting media */}
      <div className="mt-10">
        <p className="admin-label">Supporting media (optional)</p>
        <p className="mb-3 max-w-lg text-[11.5px] leading-relaxed text-mist/75">
          Stills, before/after frames, behind-the-scenes or extra clips — shown in
          order below the main video on the project page. Drag to rearrange.
        </p>
        <div className="flex flex-col gap-2">
          {media.map((m, i) => (
            <div
              key={m.id}
              draggable
              onDragStart={() => setDragId(m.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                reorder(m.id);
              }}
              className={`flex items-center gap-3 border border-white/8 bg-white/2 p-3 ${
                dragId === m.id ? "opacity-40" : ""
              }`}
            >
              <GripVertical className="size-4 cursor-grab text-mist/40" strokeWidth={1.5} />
              <span className="w-6 text-[10px] font-bold text-mist/60">{String(i + 1).padStart(2, "0")}</span>
              <div className="h-12 w-20 shrink-0 overflow-hidden border border-white/10 bg-midnight/40">
                {m.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={m.url} muted preload="metadata" className="h-full w-full object-cover" />
                )}
              </div>
              <input
                className="admin-input flex-1"
                value={m.caption}
                onChange={(e) =>
                  setMedia(media.map((x) => (x.id === m.id ? { ...x, caption: e.target.value } : x)))
                }
                placeholder="Caption (optional)"
              />
              <button
                onClick={() => setMedia(media.filter((x) => x.id !== m.id))}
                className="flex size-8 items-center justify-center text-mist/70 hover:text-[#ff9eb8]"
                aria-label="Remove media item"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
        <input
          ref={supportInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addSupporting(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => supportInput.current?.click()}
          disabled={supportUploading}
          className="btn-ghost mt-3"
        >
          {supportUploading ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <Plus className="size-3.5" strokeWidth={2} />
          )}
          {supportUploading ? "Uploading…" : "Add media"}
        </button>
      </div>

      {state.thumbnailUrl && (
        <p className="mt-6 inline-flex items-center gap-2 text-[11px] text-aqua">
          <Check className="size-3.5" strokeWidth={2} /> Thumbnail ready — this becomes the project card image.
        </p>
      )}
    </div>
  );
}
