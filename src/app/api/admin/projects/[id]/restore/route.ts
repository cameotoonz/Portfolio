import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { serializeProject } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Restores a soft-deleted project back into the admin as a draft. */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const [restored] = await db
    .update(projects)
    .set({ deletedAt: null, status: "draft", published: false, updatedAt: new Date() })
    .where(eq(projects.id, Number(id)))
    .returning();
  if (!restored) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project: serializeProject(restored) });
}
