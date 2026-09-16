import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
  "video/x-m4v": ".m4v",
};
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

const MAX_VIDEO = 750 * 1024 * 1024; // 750 MB
const MAX_IMAGE = 25 * 1024 * 1024; // 25 MB

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    const mime = file.type;
    const videoExt = VIDEO_TYPES[mime];
    const imageExt = IMAGE_TYPES[mime];
    if (!videoExt && !imageExt) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Videos: MP4, MOV, WebM. Images: JPG, PNG, WebP.",
        },
        { status: 400 },
      );
    }
    const kind = videoExt ? "video" : "image";
    const limit = videoExt ? MAX_VIDEO : MAX_IMAGE;
    if (file.size > limit) {
      return NextResponse.json(
        {
          error:
            kind === "video"
              ? "Video exceeds the 750MB limit."
              : "Image exceeds the 25MB limit.",
        },
        { status: 400 },
      );
    }

    const base = path
      .basename(file.name || "file")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .slice(0, 40);
    const ext = videoExt ?? imageExt;
    const name = `${base}-${randomBytes(5).toString("hex")}${ext}`;
    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, name), buffer);

    const url = `/api/uploads/${name}`;
    const [asset] = await db
      .insert(mediaAssets)
      .values({
        kind,
        url,
        fileName: file.name || name,
        mimeType: mime,
        size: file.size,
      })
      .returning();

    return NextResponse.json({
      ok: true,
      url,
      kind,
      media: {
        id: asset.id,
        kind: asset.kind,
        url: asset.url,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        size: asset.size,
        createdAt: asset.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
