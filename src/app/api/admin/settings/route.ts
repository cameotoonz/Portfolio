import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getSettings, serializeSettings } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = await getSettings();
  return NextResponse.json({ settings: s ? serializeSettings(s) : null });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const b = await req.json();
    const current = await getSettings();
    if (!current) return NextResponse.json({ error: "Settings missing" }, { status: 500 });
    const [updated] = await db
      .update(settings)
      .set({
        siteTitle:
          b.siteTitle === undefined ? current.siteTitle : String(b.siteTitle ?? "").trim(),
        siteDescription:
          b.siteDescription === undefined
            ? current.siteDescription
            : String(b.siteDescription ?? "").trim(),
        updatedAt: new Date(),
      })
      .where(eq(settings.id, current.id))
      .returning();
    return NextResponse.json({ settings: serializeSettings(updated) });
  } catch {
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
