import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
    }
    const ids = orderedIds.map(Number).filter((n) => Number.isFinite(n));
    await Promise.all(
      ids.map((id, i) =>
        db.update(services).set({ displayOrder: i + 1 }).where(eq(services.id, id)),
      ),
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }
}
