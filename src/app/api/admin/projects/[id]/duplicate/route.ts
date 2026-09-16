import { db } from "@/db";
import { projects, projectMedia } from "@/db/schema";
import { eq, max } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { serializeProject, getProjectMedia } from "@/lib/data";
import { slugify } from "@/lib/admin-api";
import { uniqueSlug } from "../../route";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Duplicates a project — always as an unpublished DRAFT with a fresh id/slug. */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, Number(id)))
    .limit(1);
  const src = rows[0];
  if (!src) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [agg] = await db
    .select({ maxOrder: max(projects.displayOrder) })
    .from(projects)
    .where(eq(projects.category, src.category));

  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = src;
  const title = `${src.title} (Copy)`;
  const slug = await uniqueSlug(slugify(title, false), title);

  const [created] = await db
    .insert(projects)
    .values({
      ...rest,
      title,
      slug,
      status: "draft",
      published: false,
      featured: false,
      deletedAt: null,
      displayOrder: (agg?.maxOrder ?? 0) + 1,
    })
    .returning();

  // carry the supporting-media arrangement across
  const media = await getProjectMedia(src.id);
  if (media.length > 0) {
    await db.insert(projectMedia).values(
      media.map((m) => ({
        projectId: created.id,
        kind: m.kind,
        url: m.url,
        caption: m.caption,
        displayOrder: m.displayOrder,
      })),
    );
  }

  return NextResponse.json({ project: serializeProject(created) });
}
