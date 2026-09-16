import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import {
  isSafeToken,
  sessionDir,
  UPLOADS_DIR,
  safeBaseName,
  ensureDirs,
} from "@/lib/uploads";
import { readFile, rm, stat, writeFile, appendFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Stitches all received chunks into the final asset and registers it. */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { uploadId, totalChunks, durationSec, width, height } = await req.json();
    if (!isSafeToken(String(uploadId ?? ""))) {
      return NextResponse.json({ error: "Invalid upload session." }, { status: 400 });
    }
    const dir = sessionDir(String(uploadId));
    const metaRaw = await readFile(path.join(dir, "meta.json"), "utf8").catch(
      () => null,
    );
    if (!metaRaw) {
      return NextResponse.json(
        { error: "Upload session expired — start again." },
        { status: 410 },
      );
    }
    const meta = JSON.parse(metaRaw) as {
      fileName: string;
      mimeType: string;
      size: number;
      ext: string;
      kind: "video" | "image";
    };
    const count = Number(totalChunks) || 0;
    if (count <= 0) {
      return NextResponse.json({ error: "No chunks to assemble." }, { status: 400 });
    }

    await ensureDirs();
    const finalName = `${safeBaseName(meta.fileName)}-${randomBytes(5).toString("hex")}${meta.ext}`;
    const finalPath = path.join(UPLOADS_DIR, finalName);
    await writeFile(finalPath, Buffer.alloc(0));

    for (let i = 0; i < count; i += 1) {
      const partPath = path.join(dir, `${i}.part`);
      const buf = await readFile(partPath).catch(() => null);
      if (!buf) {
        await rm(finalPath, { force: true });
        return NextResponse.json(
          { error: `Chunk ${i + 1} of ${count} is missing — retry the upload.` },
          { status: 409 },
        );
      }
      await appendFile(finalPath, buf);
    }

    const finalStat = await stat(finalPath);
    await rm(dir, { recursive: true, force: true });

    const url = `/api/uploads/${finalName}`;
    const [asset] = await db
      .insert(mediaAssets)
      .values({
        kind: meta.kind,
        url,
        fileName: meta.fileName || finalName,
        mimeType: meta.mimeType,
        size: finalStat.size,
        durationSec: Math.round(Number(durationSec) || 0),
        width: Math.round(Number(width) || 0),
        height: Math.round(Number(height) || 0),
      })
      .returning();

    return NextResponse.json({
      ok: true,
      url,
      kind: meta.kind,
      size: finalStat.size,
      media: {
        id: asset.id,
        kind: asset.kind,
        url: asset.url,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        size: asset.size,
        durationSec: asset.durationSec,
        width: asset.width,
        height: asset.height,
        createdAt: asset.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not finish upload." }, { status: 500 });
  }
}

/** Cancel: discards a partial upload session. */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const uploadId = new URL(req.url).searchParams.get("uploadId") ?? "";
  if (!isSafeToken(uploadId)) {
    return NextResponse.json({ error: "Invalid upload session." }, { status: 400 });
  }
  await rm(sessionDir(uploadId), { recursive: true, force: true });
  return NextResponse.json({ ok: true });
}
