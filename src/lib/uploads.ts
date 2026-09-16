import path from "path";
import { mkdir, stat, readdir } from "fs/promises";

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
export const TMP_DIR = path.join(process.cwd(), "tmp-uploads");

export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
  "video/x-m4v": ".m4v",
};

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export const MAX_VIDEO = 2 * 1024 * 1024 * 1024; // 2GB
export const MAX_IMAGE = 25 * 1024 * 1024;

export function extensionFor(mime: string, fileName = ""): string | null {
  if (VIDEO_TYPES[mime]) return VIDEO_TYPES[mime];
  if (IMAGE_TYPES[mime]) return IMAGE_TYPES[mime];
  const ext = path.extname(fileName).toLowerCase();
  if ([".mp4", ".mov", ".webm", ".m4v"].includes(ext)) return ext;
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) return ext;
  return null;
}

export function kindFor(ext: string): "video" | "image" {
  return [".mp4", ".mov", ".webm", ".m4v"].includes(ext) ? "video" : "image";
}

export function safeBaseName(name: string): string {
  return (
    path
      .basename(name || "file")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "media"
  );
}

/** Session id must be a safe token — prevents path traversal. */
export function isSafeToken(token: string): boolean {
  return /^[a-zA-Z0-9_-]{6,80}$/.test(token);
}

export function sessionDir(uploadId: string): string {
  return path.join(TMP_DIR, uploadId);
}

export async function ensureDirs() {
  await mkdir(UPLOADS_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });
}

/** How many contiguous chunks (from 0) already exist — enables resuming. */
export async function receivedChunkCount(uploadId: string): Promise<number> {
  try {
    const files = await readdir(sessionDir(uploadId));
    const indices = new Set(
      files
        .filter((f) => f.endsWith(".part"))
        .map((f) => Number(f.replace(".part", "")))
        .filter((n) => Number.isFinite(n)),
    );
    let i = 0;
    while (indices.has(i)) i += 1;
    return i;
  } catch {
    return 0;
  }
}

export async function fileExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}
