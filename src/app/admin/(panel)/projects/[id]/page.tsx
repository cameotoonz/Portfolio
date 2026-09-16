import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  serializeProject,
  ensureSeeded,
  getProjectMedia,
  serializeMediaItem,
} from "@/lib/data";
import ProjectWizard from "@/components/admin/ProjectWizard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await ensureSeeded();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, Number(id)))
    .limit(1);
  if (!rows[0]) notFound();
  const media = await getProjectMedia(rows[0].id);
  return (
    <ProjectWizard
      initial={serializeProject(rows[0])}
      initialMedia={media.map(serializeMediaItem)}
    />
  );
}
