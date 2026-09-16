import { requireAdmin } from "@/lib/auth";
import { isSafeToken, sessionDir, fileExists } from "@/lib/uploads";
import { writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Receives one chunk of a resumable upload. */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const uploadId = String(form.get("uploadId") ?? "");
    const index = Number(form.get("index"));
    const chunk = form.get("chunk");

    if (!isSafeToken(uploadId)) {
      return NextResponse.json({ error: "Invalid upload session." }, { status: 400 });
    }
    if (!Number.isFinite(index) || index < 0) {
      return NextResponse.json({ error: "Invalid chunk index." }, { status: 400 });
    }
    if (!(chunk instanceof File)) {
      return NextResponse.json({ error: "Missing chunk data." }, { status: 400 });
    }
    const dir = sessionDir(uploadId);
    if (!(await fileExists(dir))) {
      return NextResponse.json(
        { error: "Upload session expired — start again." },
        { status: 410 },
      );
    }
    const buffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(path.join(dir, `${index}.part`), buffer);
    return NextResponse.json({ ok: true, index });
  } catch {
    return NextResponse.json({ error: "Chunk upload failed." }, { status: 500 });
  }
}
