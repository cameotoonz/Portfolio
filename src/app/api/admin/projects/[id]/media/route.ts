import { db } from "@/db";
import { projectMedia } from "@/db/schema";
import { eq, max } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getProjectMedia, serializeMediaItem } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const rows = await getProjectMedia(Number(id));
  return NextResponse.json({ media: rows.map(serializeMediaItem) });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const projectId = Number(id);
    const b = await req.json();
    const url = String(b.url ?? "").trim();
    if (!url) return NextResponse.json({ error: "Media URL is required." }, { status: 400 });
    const kindRaw = String(b.kind ?? "image");
    const kind = ["image", "video", "embed"].includes(kindRaw) ? kindRaw : "image";
    const [agg] = await db
      .select({ m: max(projectMedia.displayOrder) })
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectId));
    const [created] = await db
      .insert(projectMedia)
      .values({
        projectId,
        kind,
        url,
        caption: String(b.caption ?? "").trim(),
        displayOrder: (agg?.m ?? 0) + 1,
      })
      .returning();
    return NextResponse.json({ media: serializeMediaItem(created) });
  } catch {
    return NextResponse.json({ error: "Failed to add media." }, { status: 500 });
  }
}

/** Reorder supporting media within the project. */
export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ctx.params;
    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
    }
    const ids = orderedIds.map(Number).filter((n) => Number.isFinite(n));
    await Promise.all(
      ids.map((mid, i) =>
        db
          .update(projectMedia)
          .set({ displayOrder: i + 1 })
          .where(eq(projectMedia.id, mid)),
      ),
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Reorder failed." }, { status: 500 });
  }
}
