import { db } from "@/db";
import { mediaAssets, projects, projectMedia } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const force = new URL(req.url).searchParams.get("force") === "1";

  const rows = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, Number(id)))
    .limit(1);
  const asset = rows[0];
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Protect media still referenced by a project
  const [usingProjects, usingItems] = await Promise.all([
    db
      .select({ id: projects.id, title: projects.title, status: projects.status })
      .from(projects)
      .where(
        or(
          eq(projects.thumbnailUrl, asset.url),
          eq(projects.uploadedVideo, asset.url),
        ),
      ),
    db.select().from(projectMedia).where(eq(projectMedia.url, asset.url)),
  ]);
  const inUse = usingProjects.length > 0 || usingItems.length > 0;

  if (inUse && !force) {
    return NextResponse.json(
      {
        error: "This file is still used by a project.",
        inUse: true,
        usedBy: usingProjects.map((p) => ({ title: p.title, status: p.status })),
      },
      { status: 409 },
    );
  }

  // soft delete keeps the file recoverable on disk
  await db
    .update(mediaAssets)
    .set({ deletedAt: new Date() })
    .where(eq(mediaAssets.id, asset.id));

  if (new URL(req.url).searchParams.get("purge") === "1") {
    if (asset.url.startsWith("/api/uploads/")) {
      const fileName = path.basename(asset.url.replace("/api/uploads/", ""));
      await unlink(path.join(process.cwd(), "uploads", fileName)).catch(() => {});
    }
    await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id));
  }

  return NextResponse.json({ ok: true });
}
