import { db } from "@/db";
import { services } from "@/db/schema";
import { max } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getAllServices, serializeService } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await getAllServices();
  return NextResponse.json({ services: rows.map(serializeService) });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const b = await req.json();
    const title = String(b.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    const [agg] = await db.select({ m: max(services.displayOrder) }).from(services);
    const [created] = await db
      .insert(services)
      .values({
        title: title.toUpperCase(),
        itemNumber: String(b.itemNumber ?? "").trim() || String((agg?.m ?? 0) + 1).padStart(2, "0"),
        description: String(b.description ?? "").trim(),
        enabled: b.enabled === undefined ? true : Boolean(b.enabled),
        displayOrder: (agg?.m ?? 0) + 1,
      })
      .returning();
    return NextResponse.json({ service: serializeService(created) });
  } catch {
    return NextResponse.json({ error: "Failed to create service." }, { status: 500 });
  }
}
