import { parseVideoUrl } from "@/lib/video";

export interface ProjectPayload {
  title: string;
  slug: string;
  category: "long" | "short";
  description: string;
  thumbnailUrl: string;
  videoSourceType: "upload" | "external";
  videoUrl: string;
  uploadedVideo: string;
  platform: string;
  orientation: "horizontal" | "vertical";
  client: string;
  year: string;
  role: string;
  tools: string;
  tags: string;
  featured: boolean;
  published: boolean;
  status: "draft" | "published" | "unpublished";
  privacy: "public" | "unlisted" | "private";
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  fileSize: number;
  videoFormat: string;
  embedSettings: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export function slugify(title: string, unique = true): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  if (!unique) return base || "project";
  const rand = Math.random().toString(36).slice(2, 7);
  return `${base || "project"}-${rand}`;
}

/**
 * Validates a project payload.
 * Drafts only need a title; publishing enforces the full requirements
 * and reports each missing field individually.
 */
export function validateProject(body: unknown):
  | { ok: true; data: ProjectPayload }
  | { ok: false; error: string; issues: ValidationIssue[] } {
  const b = body as Record<string, unknown>;
  const issues: ValidationIssue[] = [];

  const title = String(b.title ?? "").trim();
  const category = b.category === "short" ? "short" : "long";
  const videoSourceType = b.videoSourceType === "upload" ? "upload" : "external";
  const videoUrl = String(b.videoUrl ?? "").trim();
  const uploadedVideo = String(b.uploadedVideo ?? "").trim();
  const rawStatus = String(b.status ?? "published");
  const status: ProjectPayload["status"] =
    rawStatus === "draft" || rawStatus === "unpublished" ? rawStatus : "published";
  const rawPrivacy = String(b.privacy ?? "public");
  const privacy: ProjectPayload["privacy"] =
    rawPrivacy === "unlisted" || rawPrivacy === "private" ? rawPrivacy : "public";

  const parsed = parseVideoUrl(
    videoSourceType === "upload" ? uploadedVideo : videoUrl,
  );
  const thumbnailUrl =
    String(b.thumbnailUrl ?? "").trim() || (parsed.thumbnail ?? "");

  if (!title) issues.push({ field: "title", message: "Project title is missing." });

  // Full requirements only apply when going live.
  if (status === "published") {
    if (videoSourceType === "external" && !videoUrl) {
      issues.push({ field: "videoUrl", message: "Video source is missing — paste a video URL." });
    }
    if (videoSourceType === "upload" && !uploadedVideo) {
      issues.push({ field: "uploadedVideo", message: "Video source is missing — upload a video file." });
    }
    if (!thumbnailUrl) {
      issues.push({ field: "thumbnailUrl", message: "Thumbnail is missing." });
    }
    if (!category) {
      issues.push({ field: "category", message: "Project type is missing." });
    }
  }

  if (issues.length > 0) {
    return { ok: false, error: issues.map((i) => i.message).join(" "), issues };
  }

  const platform = videoSourceType === "upload" ? "upload" : parsed.platform;
  const orientation: ProjectPayload["orientation"] =
    b.orientation === "vertical"
      ? "vertical"
      : b.orientation === "horizontal"
        ? "horizontal"
        : category === "short" || parsed.platform === "youtube-shorts"
          ? "vertical"
          : "horizontal";

  let embedSettings = "{}";
  if (b.embedSettings !== undefined) {
    try {
      embedSettings =
        typeof b.embedSettings === "string"
          ? JSON.stringify(JSON.parse(b.embedSettings || "{}"))
          : JSON.stringify(b.embedSettings);
    } catch {
      embedSettings = "{}";
    }
  }

  const rawSlug = String(b.slug ?? "").trim();

  return {
    ok: true,
    data: {
      title,
      slug: rawSlug ? slugify(rawSlug, false) : "",
      category,
      description: String(b.description ?? "").trim(),
      thumbnailUrl,
      videoSourceType,
      videoUrl,
      uploadedVideo,
      platform,
      orientation,
      client: String(b.client ?? "").trim(),
      year: String(b.year ?? "").trim(),
      role: String(b.role ?? "").trim(),
      tools: String(b.tools ?? "").trim(),
      tags: String(b.tags ?? "").trim(),
      featured: Boolean(b.featured),
      published: status === "published",
      status,
      privacy,
      durationSec: Math.max(0, Math.round(Number(b.durationSec) || 0)),
      width: Math.max(0, Math.round(Number(b.width) || 0)),
      height: Math.max(0, Math.round(Number(b.height) || 0)),
      fps: Math.max(0, Math.round(Number(b.fps) || 0)),
      fileSize: Math.max(0, Math.round(Number(b.fileSize) || 0)),
      videoFormat: String(b.videoFormat ?? "").trim(),
      embedSettings,
    },
  };
}
