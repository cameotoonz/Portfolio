import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { serializeService } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const { id: _, createdAt: __, ...body } = await req.json();
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) {
      patch.title = String(body.title).trim().toUpperCase();
      if (!patch.title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (body.itemNumber !== undefined) patch.itemNumber = String(body.itemNumber).trim();
    if (body.description !== undefined) patch.description = String(body.description).trim();
    if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled);
    if (body.displayOrder !== undefined) patch.displayOrder = Number(body.displayOrder) || 0;
    const [updated] = await db
      .update(services)
      .set(patch)
      .where(eq(services.id, Number(id)))
      .returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ service: serializeService(updated) });
  } catch {
    return NextResponse.json({ error: "Failed to update service." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await db.delete(services).where(eq(services.id, Number(id)));
  return NextResponse.json({ ok: true });
}
