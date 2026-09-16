import { db } from "@/db";
import { projects, mediaAssets } from "@/db/schema";
import { and, count, eq, isNull, isNotNull } from "drizzle-orm";
import { ensureSeeded } from "@/lib/data";
import Link from "next/link";
import {
  Clapperboard,
  Smartphone,
  Globe2,
  FileEdit,
  Plus,
  Star,
  Film,
  Trash2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await ensureSeeded();
  const live = isNull(projects.deletedAt);

  const [[total], [long], [short], [published], [drafts], [featured], [media], [trashed]] =
    await Promise.all([
      db.select({ c: count() }).from(projects).where(live),
      db.select({ c: count() }).from(projects).where(and(live, eq(projects.category, "long"))),
      db.select({ c: count() }).from(projects).where(and(live, eq(projects.category, "short"))),
      db.select({ c: count() }).from(projects).where(and(live, eq(projects.status, "published"))),
      db.select({ c: count() }).from(projects).where(and(live, eq(projects.status, "draft"))),
      db.select({ c: count() }).from(projects).where(and(live, eq(projects.featured, true))),
      db.select({ c: count() }).from(mediaAssets).where(isNull(mediaAssets.deletedAt)),
      db.select({ c: count() }).from(projects).where(isNotNull(projects.deletedAt)),
    ]);

  const stats = [
    { label: "Total projects", value: total.c, icon: Clapperboard },
    { label: "Long form", value: long.c, icon: Film },
    { label: "Short form", value: short.c, icon: Smartphone },
    { label: "Published", value: published.c, icon: Globe2 },
    { label: "Drafts", value: drafts.c, icon: FileEdit },
    { label: "Featured", value: featured.c, icon: Star },
  ];

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">STUDIO OVERVIEW</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projects/new?category=long" className="btn-primary">
            <Plus className="size-3.5" strokeWidth={2.5} />
            Add long form
          </Link>
          <Link href="/admin/projects/new?category=short" className="btn-ghost">
            <Plus className="size-3.5" strokeWidth={2} />
            Add short form
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group border border-white/8 bg-white/2 p-5 transition-colors duration-300 hover:border-aqua/30 md:p-7"
          >
            <s.icon className="size-4.5 text-aqua/80" strokeWidth={1.5} />
            <p className="mt-5 text-4xl font-extrabold tracking-tight text-cream md:text-5xl">
              {String(s.value).padStart(2, "0")}
            </p>
            <p className="mt-2 text-[9.5px] font-semibold tracking-[0.28em] text-mist/75">
              {s.label.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/admin/projects"
          className="border border-white/8 bg-white/2 p-6 transition-colors hover:border-aqua/30"
        >
          <p className="text-[10px] font-semibold tracking-[0.28em] text-aqua">MANAGE</p>
          <p className="mt-3 text-lg font-bold">Projects &amp; ordering</p>
          <p className="mt-2 text-[12px] leading-relaxed text-mist">
            Search, filter, reorder, publish and feature — the public site follows this list.
          </p>
        </Link>
        <Link
          href="/admin/profile"
          className="border border-white/8 bg-white/2 p-6 transition-colors hover:border-aqua/30"
        >
          <p className="text-[10px] font-semibold tracking-[0.28em] text-aqua">IDENTITY</p>
          <p className="mt-3 text-lg font-bold">Profile &amp; site copy</p>
          <p className="mt-2 text-[12px] leading-relaxed text-mist">
            Hero, about, services, contact and footer text update instantly.
          </p>
        </Link>
        <Link
          href="/admin/media"
          className="border border-white/8 bg-white/2 p-6 transition-colors hover:border-aqua/30"
        >
          <p className="text-[10px] font-semibold tracking-[0.28em] text-aqua">LIBRARY</p>
          <p className="mt-3 text-lg font-bold">Media assets</p>
          <p className="mt-2 text-[12px] leading-relaxed text-mist">
            {media.c} file{media.c === 1 ? "" : "s"} — videos, posters and supporting visuals.
          </p>
        </Link>
      </div>

      {trashed.c > 0 && (
        <p className="mt-8 inline-flex items-center gap-2.5 border border-white/10 bg-white/2 px-4 py-3 text-[11.5px] text-mist">
          <Trash2 className="size-3.5" strokeWidth={1.75} />
          {trashed.c} project{trashed.c === 1 ? "" : "s"} in trash — recoverable via the
          projects API.
        </p>
      )}
    </div>
  );
}
