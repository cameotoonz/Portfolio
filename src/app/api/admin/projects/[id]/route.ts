import { db } from "@/db";
import { projects, projectMedia } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { serializeProject, getProjectMedia, serializeMediaItem } from "@/lib/data";
import { validateProject } from "@/lib/admin-api";
import { uniqueSlug } from "../route";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, Number(id)))
    .limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const media = await getProjectMedia(rows[0].id);
  return NextResponse.json({
    project: serializeProject(rows[0]),
    media: media.map(serializeMediaItem),
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const numId = Number(id);
    const existing = await db
      .select()
      .from(projects)
      .where(eq(projects.id, numId))
      .limit(1);
    if (!existing[0])
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    // lightweight toggles (publish / feature / order / rename)
    if (body.partial === true) {
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (typeof body.published === "boolean") {
        patch.published = body.published;
        patch.status = body.published ? "published" : "unpublished";
      }
      if (typeof body.status === "string") {
        patch.status = body.status;
        patch.published = body.status === "published";
      }
      if (typeof body.privacy === "string") patch.privacy = body.privacy;
      if (typeof body.featured === "boolean") patch.featured = body.featured;
      if (typeof body.displayOrder === "number") patch.displayOrder = body.displayOrder;
      if (body.title !== undefined) patch.title = String(body.title).trim();
      const [updated] = await db
        .update(projects)
        .set(patch)
        .where(eq(projects.id, numId))
        .returning();
      return NextResponse.json({ project: serializeProject(updated) });
    }

    const merged = { ...serializeProject(existing[0]), ...body };
    const result = validateProject(merged);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, issues: result.issues },
        { status: 400 },
      );
    }
    const slug = await uniqueSlug(
      result.data.slug || existing[0].slug,
      result.data.title,
      numId,
    );
    const [updated] = await db
      .update(projects)
      .set({ ...result.data, slug, updatedAt: new Date() })
      .where(eq(projects.id, numId))
      .returning();
    return NextResponse.json({ project: serializeProject(updated) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const numId = Number(id);
  const permanent = new URL(req.url).searchParams.get("permanent") === "1";

  if (permanent) {
    await db.delete(projectMedia).where(eq(projectMedia.projectId, numId));
    await db.delete(projects).where(eq(projects.id, numId));
    return NextResponse.json({ ok: true, permanent: true });
  }
  // soft delete — recoverable, and immediately hidden from the public site
  await db
    .update(projects)
    .set({
      deletedAt: new Date(),
      published: false,
      status: "unpublished",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, numId));
  return NextResponse.json({ ok: true, permanent: false });
}
