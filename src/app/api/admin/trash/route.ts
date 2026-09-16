import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc, isNotNull } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { serializeProject } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(projects)
    .where(isNotNull(projects.deletedAt))
    .orderBy(desc(projects.deletedAt));
  return NextResponse.json({ projects: rows.map(serializeProject) });
}
