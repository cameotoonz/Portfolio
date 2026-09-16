"use client";

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export type UploadStage =
  | "waiting"
  | "uploading"
  | "processing"
  | "complete"
  | "failed"
  | "cancelled";

export interface UploadStats {
  loaded: number;
  total: number;
  percent: number;
  bytesPerSecond: number;
  stage: UploadStage;
}

export interface UploadResult {
  url: string;
  kind: "video" | "image";
  size: number;
  media?: Record<string, unknown>;
}

export interface VideoMeta {
  durationSec: number;
  width: number;
  height: number;
  fps: number;
}

/** Reads dimensions/duration from a local video file (no server round-trip). */
export function probeVideo(file: File): Promise<VideoMeta | null> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.src = url;
      const done = (v: VideoMeta | null) => {
        URL.revokeObjectURL(url);
        resolve(v);
      };
      video.onerror = () => done(null);
      video.onloadedmetadata = () => {
        done({
          durationSec: Math.round(video.duration || 0),
          width: video.videoWidth || 0,
          height: video.videoHeight || 0,
          fps: 0,
        });
      };
      setTimeout(() => done(null), 10000);
    } catch {
      resolve(null);
    }
  });
}

/** Grabs a JPEG poster frame at a given time from a local file or URL. */
export function captureFrame(
  source: File | string,
  timeSec = 0.6,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const isFile = source instanceof File;
      const url = isFile ? URL.createObjectURL(source) : source;
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.src = url;
      const cleanup = () => {
        if (isFile) URL.revokeObjectURL(url);
      };
      const fail = () => {
        cleanup();
        resolve(null);
      };
      video.onerror = fail;
      video.onloadeddata = () => {
        video.currentTime = Math.min(
          Math.max(timeSec, 0),
          Math.max((video.duration || 1) - 0.05, 0),
        );
      };
      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext("2d");
          if (!ctx) return fail();
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (b) => {
              cleanup();
              resolve(b);
            },
            "image/jpeg",
            0.85,
          );
        } catch {
          fail();
        }
      };
      setTimeout(fail, 12000);
    } catch {
      resolve(null);
    }
  });
}

export class UploadController {
  private aborted = false;
  private currentXhr: XMLHttpRequest | null = null;
  uploadId: string | null = null;

  cancel() {
    this.aborted = true;
    this.currentXhr?.abort();
    if (this.uploadId) {
      fetch(`/api/admin/upload/complete?uploadId=${this.uploadId}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  }

  get isAborted() {
    return this.aborted;
  }

  /** Chunked, resumable upload with progress + speed reporting. */
  async upload(
    file: File,
    onProgress: (stats: UploadStats) => void,
    meta?: VideoMeta | null,
  ): Promise<UploadResult> {
    this.aborted = false;
    const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));

    const initRes = await fetch("/api/admin/upload/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        totalChunks,
        uploadId: this.uploadId ?? undefined,
      }),
    });
    const initData = await initRes.json();
    if (!initRes.ok) throw new Error(initData.error || "Could not start upload.");
    this.uploadId = initData.uploadId as string;

    let startIndex: number = initData.receivedChunks || 0;
    if (startIndex >= totalChunks) startIndex = totalChunks - 1;

    const startedAt = Date.now();
    const baseLoaded = startIndex * CHUNK_SIZE;

    for (let i = startIndex; i < totalChunks; i += 1) {
      if (this.aborted) throw new Error("Upload cancelled.");
      const start = i * CHUNK_SIZE;
      const blob = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        this.currentXhr = xhr;
        xhr.open("POST", "/api/admin/upload/chunk");
        xhr.responseType = "json";
        xhr.upload.onprogress = (e) => {
          const loaded = Math.min(start + e.loaded, file.size);
          const elapsed = (Date.now() - startedAt) / 1000;
          const moved = Math.max(loaded - baseLoaded, 0);
          onProgress({
            loaded,
            total: file.size,
            percent: Math.min(99, Math.round((loaded / file.size) * 100)),
            bytesPerSecond: elapsed > 0.3 ? moved / elapsed : 0,
            stage: "uploading",
          });
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(xhr.response?.error || `Chunk ${i + 1} failed.`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.onabort = () => reject(new Error("Upload cancelled."));
        const form = new FormData();
        form.append("uploadId", this.uploadId as string);
        form.append("index", String(i));
        form.append("chunk", blob);
        xhr.send(form);
      });
    }

    if (this.aborted) throw new Error("Upload cancelled.");
    onProgress({
      loaded: file.size,
      total: file.size,
      percent: 100,
      bytesPerSecond: 0,
      stage: "processing",
    });

    const completeRes = await fetch("/api/admin/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId: this.uploadId,
        totalChunks,
        durationSec: meta?.durationSec ?? 0,
        width: meta?.width ?? 0,
        height: meta?.height ?? 0,
      }),
    });
    const data = await completeRes.json();
    if (!completeRes.ok) throw new Error(data.error || "Could not finish upload.");
    this.uploadId = null;
    return { url: data.url, kind: data.kind, size: data.size, media: data.media };
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function formatSpeed(bps: number): string {
  if (!bps) return "—";
  return `${formatBytes(bps)}/s`;
}

export function formatDuration(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
