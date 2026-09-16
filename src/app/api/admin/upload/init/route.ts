import { requireAdmin } from "@/lib/auth";
import {
  ensureDirs,
  extensionFor,
  kindFor,
  isSafeToken,
  receivedChunkCount,
  sessionDir,
  MAX_IMAGE,
  MAX_VIDEO,
} from "@/lib/uploads";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Starts (or resumes) a chunked upload session.
 * Passing an existing uploadId returns how many chunks the server already has,
 * so an interrupted upload continues instead of restarting.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const fileName = String(body.fileName ?? "");
    const mimeType = String(body.mimeType ?? "");
    const size = Number(body.size) || 0;
    const totalChunks = Number(body.totalChunks) || 0;

    const ext = extensionFor(mimeType, fileName);
    if (!ext) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Videos: MP4, MOV, WebM. Images: JPG, PNG, WebP, AVIF, GIF.",
        },
        { status: 400 },
      );
    }
    const kind = kindFor(ext);
    const limit = kind === "video" ? MAX_VIDEO : MAX_IMAGE;
    if (size > limit) {
      return NextResponse.json(
        {
          error:
            kind === "video"
              ? "Video exceeds the 2GB limit."
              : "Image exceeds the 25MB limit.",
        },
        { status: 400 },
      );
    }

    await ensureDirs();

    // resume path
    const existingId = String(body.uploadId ?? "");
    if (existingId && isSafeToken(existingId)) {
      const received = await receivedChunkCount(existingId);
      if (received > 0) {
        return NextResponse.json({
          uploadId: existingId,
          receivedChunks: received,
          resumed: true,
          kind,
        });
      }
    }

    const uploadId = randomBytes(12).toString("hex");
    await mkdir(sessionDir(uploadId), { recursive: true });
    await writeFile(
      path.join(sessionDir(uploadId), "meta.json"),
      JSON.stringify({ fileName, mimeType, size, totalChunks, ext, kind }),
    );

    return NextResponse.json({
      uploadId,
      receivedChunks: 0,
      resumed: false,
      kind,
    });
  } catch {
    return NextResponse.json({ error: "Could not start upload." }, { status: 500 });
  }
}
