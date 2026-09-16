import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, eq, max, ne } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getAllProjects, serializeProject } from "@/lib/data";
import { validateProject, slugify } from "@/lib/admin-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Guarantees the slug is unique, appending a suffix when needed. */
export async function uniqueSlug(
  desired: string,
  title: string,
  excludeId?: number,
): Promise<string> {
  const base = desired || slugify(title, false);
  let candidate = base || "project";
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const clash = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        excludeId
          ? and(eq(projects.slug, candidate), ne(projects.id, excludeId))
          : eq(projects.slug, candidate),
      )
      .limit(1);
    if (clash.length === 0) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await getAllProjects();
  return NextResponse.json({ projects: rows.map(serializeProject) });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const result = validateProject(body);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, issues: result.issues },
        { status: 400 },
      );
    }
    const [agg] = await db
      .select({ maxOrder: max(projects.displayOrder) })
      .from(projects)
      .where(eq(projects.category, result.data.category));
    const order = (agg?.maxOrder ?? 0) + 1;
    const slug = await uniqueSlug(result.data.slug, result.data.title);

    const [created] = await db
      .insert(projects)
      .values({ ...result.data, slug, displayOrder: order })
      .returning();
    return NextResponse.json({ project: serializeProject(created) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}
