import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
    }
    const ids = orderedIds.map(Number).filter((n) => Number.isFinite(n));
    await db
      .update(projects)
      .set({ updatedAt: new Date() })
      .where(inArray(projects.id, ids));
    await Promise.all(
      ids.map((id, i) =>
        db
          .update(projects)
          .set({ displayOrder: i + 1 })
          .where(eq(projects.id, id)),
      ),
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }
}
