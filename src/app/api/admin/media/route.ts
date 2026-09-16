import { db } from "@/db";
import { mediaAssets, projects, projectMedia } from "@/db/schema";
import { desc, isNull } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Lists media with the projects each asset is used by. */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [rows, allProjects, allItems] = await Promise.all([
    db
      .select()
      .from(mediaAssets)
      .where(isNull(mediaAssets.deletedAt))
      .orderBy(desc(mediaAssets.createdAt)),
    db.select().from(projects),
    db.select().from(projectMedia),
  ]);

  const usage = new Map<string, { title: string; published: boolean }[]>();
  const track = (url: string, title: string, published: boolean) => {
    if (!url) return;
    const list = usage.get(url) ?? [];
    if (!list.some((u) => u.title === title)) list.push({ title, published });
    usage.set(url, list);
  };
  for (const p of allProjects) {
    const live = p.status === "published" && !p.deletedAt;
    track(p.thumbnailUrl, p.title, live);
    track(p.uploadedVideo, p.title, live);
  }
  for (const item of allItems) {
    const parent = allProjects.find((p) => p.id === item.projectId);
    if (parent) {
      track(item.url, parent.title, parent.status === "published" && !parent.deletedAt);
    }
  }

  return NextResponse.json({
    media: rows.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      fileName: m.fileName,
      mimeType: m.mimeType,
      size: m.size,
      durationSec: m.durationSec,
      width: m.width,
      height: m.height,
      createdAt: m.createdAt.toISOString(),
      usedIn: usage.get(m.url) ?? [],
    })),
  });
}
