import { getAllProjects, serializeProject } from "@/lib/data";
import ProjectsList from "@/components/admin/ProjectsList";
import Link from "next/link";
import { Plus, Film, Smartphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const rows = await getAllProjects();
  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">PROJECT MANAGEMENT</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Projects
          </h1>
          <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-mist">
            Drag to reorder within a category — the public site updates
            automatically. Unpublished projects stay hidden from visitors.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projects/new?category=long" className="btn-primary">
            <Film className="size-3.5" strokeWidth={2.25} />
            <Plus className="-ml-1 size-3" strokeWidth={3} />
            Add long form
          </Link>
          <Link href="/admin/projects/new?category=short" className="btn-ghost">
            <Smartphone className="size-3.5" strokeWidth={2} />
            <Plus className="-ml-1 size-3" strokeWidth={3} />
            Add short form
          </Link>
        </div>
      </div>
      <ProjectsList initial={rows.map(serializeProject)} />
    </div>
  );
}
