"use client";

import { useRef, useState } from "react";
import {
  UploadCloud,
  Loader2,
  Trash2,
  Copy,
  Check,
  Film,
  ImageIcon,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { UploadController, formatBytes, formatDuration } from "@/lib/upload-client";

export interface MediaItem {
  id: number;
  kind: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  durationSec: number;
  width: number;
  height: number;
  createdAt: string;
  usedIn: { title: string; published: boolean }[];
}

export default function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<MediaItem | null>(null);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    setUploading(true);
    setPercent(0);
    try {
      const controller = new UploadController();
      const result = await controller.upload(file, (s) => setPercent(s.percent));
      if (result.media) setItems((is) => [result.media as unknown as MediaItem, ...is]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (item: MediaItem, force = false) => {
    setDeleting(item.id);
    setError("");
    const res = await fetch(
      `/api/admin/media/${item.id}${force ? "?force=1" : ""}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      setItems((is) => is.filter((i) => i.id !== item.id));
      setConfirm(null);
    } else {
      const data = await res.json();
      if (data.inUse) setConfirm(item);
      else setError(data.error || "Delete failed.");
    }
    setDeleting(null);
  };

  const copy = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${item.url}`);
      setCopied(item.id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mt-9">
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-m4v,image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center gap-3 border border-dashed border-white/18 bg-white/1.5 px-6 py-10 transition-colors hover:border-aqua/45 disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 className="size-5 animate-spin text-aqua" strokeWidth={1.5} />
            <span className="text-[10.5px] font-semibold tracking-[0.24em] text-cream">
              UPLOADING — {percent}%
            </span>
            <span className="h-[3px] w-full max-w-60 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full bg-linear-to-r from-aqua to-cyan2 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </span>
          </>
        ) : (
          <>
            <UploadCloud className="size-5 text-mist/70" strokeWidth={1.5} />
            <span className="text-[10.5px] font-semibold tracking-[0.24em] text-cream">
              UPLOAD MEDIA — VIDEO OR IMAGE
            </span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-4 border border-magenta/40 bg-magenta/10 px-4 py-3 text-[12px] text-[#e08bb4]">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="mt-10 border border-dashed border-white/12 px-6 py-12 text-center text-[11px] tracking-[0.22em] text-mist/60">
          NO UPLOADED MEDIA YET
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col border border-white/8 bg-white/2 transition-colors hover:border-white/18"
            >
              <button
                onClick={() => setPreview(item)}
                className="relative aspect-video overflow-hidden bg-midnight/40"
                aria-label={`Preview ${item.fileName}`}
              >
                {item.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.fileName} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                )}
                <span className="absolute left-2 top-2 flex items-center gap-1.5 border border-white/12 bg-ink/70 px-2 py-0.5 text-[8px] font-bold tracking-[0.18em] text-cream/90 backdrop-blur-sm">
                  {item.kind === "video" ? (
                    <Film className="size-2.5" strokeWidth={2} />
                  ) : (
                    <ImageIcon className="size-2.5" strokeWidth={2} />
                  )}
                  {item.kind.toUpperCase()}
                </span>
                {item.durationSec > 0 && (
                  <span className="absolute bottom-2 right-2 border border-white/12 bg-ink/75 px-1.5 py-0.5 text-[8.5px] tabular-nums text-cream/90">
                    {formatDuration(item.durationSec)}
                  </span>
                )}
              </button>
              <div className="flex flex-1 flex-col p-3">
                <p className="truncate text-[10.5px] font-semibold text-cream/90" title={item.fileName}>
                  {item.fileName}
                </p>
                <p className="mt-1 text-[9px] tracking-[0.1em] text-mist/60">
                  {formatBytes(item.size)}
                  {item.width ? ` · ${item.width}×${item.height}` : ""}
                  {` · ${new Date(item.createdAt).toLocaleDateString()}`}
                </p>
                <p className="mt-1.5 text-[9px] tracking-[0.1em]">
                  {item.usedIn.length > 0 ? (
                    <span className="text-aqua/85">
                      USED IN {item.usedIn.length} PROJECT{item.usedIn.length === 1 ? "" : "S"}
                    </span>
                  ) : (
                    <span className="text-mist/50">UNUSED</span>
                  )}
                </p>
                <div className="mt-auto flex items-center gap-1 pt-3">
                  <button
                    onClick={() => setPreview(item)}
                    className="flex size-7 items-center justify-center text-mist/70 transition-colors hover:text-cream"
                    title="Preview"
                    aria-label={`Preview ${item.fileName}`}
                  >
                    <Eye className="size-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => copy(item)}
                    className="flex size-7 items-center justify-center text-mist/70 transition-colors hover:text-aqua"
                    title="Copy URL to use in a project"
                    aria-label={`Copy URL of ${item.fileName}`}
                  >
                    {copied === item.id ? (
                      <Check className="size-3.5 text-aqua" strokeWidth={2} />
                    ) : (
                      <Copy className="size-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    onClick={() => (item.usedIn.length > 0 ? setConfirm(item) : remove(item))}
                    disabled={deleting === item.id}
                    className="flex size-7 items-center justify-center text-mist/70 transition-colors hover:text-[#ff7b9c] disabled:opacity-40"
                    title="Delete"
                    aria-label={`Delete ${item.fileName}`}
                  >
                    {deleting === item.id ? (
                      <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
                    ) : (
                      <Trash2 className="size-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* in-use delete warning */}
      {confirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/85 p-6 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm border border-white/10 bg-surface p-7">
            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] text-[#d8c98a]">
              <AlertTriangle className="size-3.5" strokeWidth={2} /> FILE IN USE
            </p>
            <p className="mt-4 text-[13.5px] leading-relaxed text-cream">
              <span className="font-bold">{confirm.fileName}</span> is still used by:
            </p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {confirm.usedIn.map((u) => (
                <li key={u.title} className="text-[12px] text-mist">
                  · {u.title}{" "}
                  {u.published && <span className="text-aqua">(published)</span>}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11.5px] leading-relaxed text-mist/80">
              Deleting it will leave those projects without this media.
            </p>
            <div className="mt-7 flex gap-3">
              <button
                onClick={() => remove(confirm, true)}
                disabled={deleting === confirm.id}
                className="flex-1 border border-magenta/50 bg-magenta/15 px-4 py-2.5 text-[10.5px] font-bold tracking-[0.22em] text-[#ff9eb8] transition-colors hover:bg-magenta/25 disabled:opacity-50"
              >
                {deleting === confirm.id ? "DELETING…" : "DELETE ANYWAY"}
              </button>
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1 justify-center">
                Keep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-ink/90 p-6 backdrop-blur-xl"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="truncate text-[12px] font-semibold text-cream">{preview.fileName}</p>
              <button onClick={() => setPreview(null)} className="btn-ghost">Close</button>
            </div>
            <div className="border border-white/10 bg-black">
              {preview.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url} alt={preview.fileName} className="max-h-[70svh] w-full object-contain" />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={preview.url} controls autoPlay className="max-h-[70svh] w-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
