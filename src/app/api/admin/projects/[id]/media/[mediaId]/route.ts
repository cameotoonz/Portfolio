import { db } from "@/db";
import { projectMedia } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { serializeMediaItem } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; mediaId: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { mediaId } = await ctx.params;
  const b = await req.json();
  const patch: Record<string, unknown> = {};
  if (b.url !== undefined) patch.url = String(b.url).trim();
  if (b.caption !== undefined) patch.caption = String(b.caption).trim();
  if (b.kind !== undefined) patch.kind = String(b.kind);
  const [updated] = await db
    .update(projectMedia)
    .set(patch)
    .where(eq(projectMedia.id, Number(mediaId)))
    .returning();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ media: serializeMediaItem(updated) });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { mediaId } = await ctx.params;
  await db.delete(projectMedia).where(eq(projectMedia.id, Number(mediaId)));
  return NextResponse.json({ ok: true });
}
