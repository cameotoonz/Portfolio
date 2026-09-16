"use client";

import { useMemo, useState } from "react";
import { Play, Sparkles, ArrowUpRight } from "lucide-react";
import type { ProjectDTO } from "@/lib/data";
import { Reveal } from "./Reveal";
import VideoModal from "./VideoModal";

function Thumb({ project }: { project: ProjectDTO }) {
  const [failed, setFailed] = useState(false);
  if (!project.thumbnailUrl || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-midnight/50">
        <Play className="size-8 text-aqua/50" strokeWidth={1} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={project.thumbnailUrl}
      alt={`${project.title} — video thumbnail`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
    />
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
  large = false,
}: {
  project: ProjectDTO;
  index: number;
  onOpen: (p: ProjectDTO) => void;
  large?: boolean;
}) {
  const vertical = project.orientation === "vertical";
  return (
    <Reveal delay={Math.min(index * 0.06, 0.3)}>
      <button
        onClick={() => onOpen(project)}
        className="group relative block w-full overflow-hidden border border-white/10 bg-white/3.5 text-left backdrop-blur-[18px] transition-colors duration-500 hover:border-aqua/35"
        aria-label={`Play ${project.title}`}
      >
        {/* cyan accent line */}
        <span
          className="absolute bottom-0 left-0 z-20 h-[2px] w-0 bg-linear-to-r from-aqua to-cyan2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
          aria-hidden="true"
        />
        <div className={`relative overflow-hidden ${vertical ? "aspect-[9/16]" : "aspect-video"}`}>
          <Thumb project={project} />
          {/* overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" aria-hidden="true" />
          {/* play button */}
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="flex size-14 scale-75 items-center justify-center rounded-full border border-aqua/50 bg-ink/55 opacity-0 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100">
              <Play className="ml-0.5 size-5 text-aqua" fill="currentColor" strokeWidth={0} />
            </span>
          </div>
          {/* number */}
          <span className="absolute left-4 top-4 z-10 text-[10px] font-bold tracking-[0.3em] text-cream/55" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.featured && (
            <span className="absolute right-4 top-4 z-10 flex items-center gap-1.5 border border-aqua/30 bg-ink/60 px-2.5 py-1 text-[8.5px] font-bold tracking-[0.24em] text-aqua backdrop-blur-sm">
              <Sparkles className="size-2.5" strokeWidth={2} />
              FEATURED
            </span>
          )}
          {/* bottom info inside image for vertical cards */}
          {vertical && (
            <div className="absolute inset-x-0 bottom-0 z-10 p-4">
              <p className="text-[9px] font-semibold tracking-[0.26em] text-aqua/90">SHORT FORM</p>
              <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-cream transition-transform duration-500 group-hover:-translate-y-0.5">
                {project.title}
              </h3>
            </div>
          )}
        </div>

        {!vertical && (
          <div className="flex items-start justify-between gap-4 p-5 md:p-6">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.26em] text-aqua/90">
                {project.category === "long" ? "LONG FORM" : "SHORT FORM"}
              </p>
              <h3
                className={`mt-2 font-bold leading-snug text-cream transition-transform duration-500 group-hover:translate-x-1 ${
                  large ? "text-xl md:text-2xl" : "text-lg"
                }`}
              >
                {project.title}
              </h3>
              {large && project.description && (
                <p className="mt-3 hidden max-w-lg text-[13px] leading-relaxed text-mist/90 lg:block">
                  {project.description.split("\n")[0].replace(/[*_#]/g, "")}
                </p>
              )}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/work/${project.slug}`;
                }}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    window.location.href = `/work/${project.slug}`;
                  }
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.22em] text-mist/70 transition-colors hover:text-aqua"
              >
                CASE STUDY <ArrowUpRight className="size-3" strokeWidth={2.5} />
              </span>
            </div>
            <div className="shrink-0 text-right text-[10px] leading-relaxed tracking-[0.18em] text-mist/75">
              {project.client && <p>{project.client.toUpperCase()}</p>}
              {project.year && <p>{project.year}</p>}
            </div>
          </div>
        )}
      </button>
    </Reveal>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-white/12 px-8 py-24 text-center">
      <p className="text-[10px] tracking-[0.34em] text-mist/60">{label}</p>
      <p className="mt-5 font-serif text-3xl italic text-cream/85 md:text-4xl">
        New work coming soon.
      </p>
      <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-mist/75">
        Projects are added through the studio — check back shortly.
      </p>
    </div>
  );
}

export default function WorkSection({ projects }: { projects: ProjectDTO[] }) {
  const [open, setOpen] = useState<ProjectDTO | null>(null);
  const long = useMemo(() => projects.filter((p) => p.category === "long"), [projects]);
  const short = useMemo(() => projects.filter((p) => p.category === "short"), [projects]);

  return (
    <section id="work" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-400 px-6 md:px-12">
        {/* ── section header ── */}
        <div className="mb-20 md:mb-28">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-aqua/70" aria-hidden="true" />
              SELECTED WORK
            </p>
          </Reveal>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <Reveal delay={0.1}>
              <h2 className="max-w-2xl text-[clamp(2.2rem,5vw,4.2rem)] font-extrabold leading-[1.04] tracking-[-0.02em] text-cream">
                A curated <em className="display-serif text-aqua">selection</em> of
                editing &amp; motion design
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-[10.5px] tracking-[0.3em] text-mist/70">
                {projects.length} PROJECT{projects.length === 1 ? "" : "S"} — CLICK ANY PIECE TO WATCH
              </p>
            </Reveal>
          </div>
        </div>

        {/* ── LONG FORM ── */}
        <div className="mb-24 md:mb-32">
          <Reveal>
            <div className="mb-10 flex items-center gap-5">
              <h3 className="text-[12px] font-bold tracking-[0.4em] text-cream">
                LONG FORM VIDEOS
              </h3>
              <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
              <span className="text-[10px] tracking-[0.28em] text-mist/60">
                DOCUMENTARY · YOUTUBE · STORYTELLING
              </span>
            </div>
          </Reveal>
          {long.length === 0 ? (
            <EmptyState label="NO LONG FORM PROJECTS YET" />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {long.map((p, i) => (
                <div key={p.id} className={i === 0 ? "md:col-span-2" : ""}>
                  <ProjectCard project={p} index={i} onOpen={setOpen} large={i === 0} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SHORT FORM ── */}
        <div>
          <Reveal>
            <div className="mb-10 flex items-center gap-5">
              <h3 className="text-[12px] font-bold tracking-[0.4em] text-cream">
                SHORT FORM VIDEOS
              </h3>
              <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
              <span className="text-[10px] tracking-[0.28em] text-mist/60">
                REELS · SHORTS · SOCIAL
              </span>
            </div>
          </Reveal>
          {short.length === 0 ? (
            <EmptyState label="NO SHORT FORM PROJECTS YET" />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
              {short.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onOpen={setOpen} />
              ))}
            </div>
          )}
        </div>
      </div>

      <VideoModal project={open} onClose={() => setOpen(null)} />
    </section>
  );
}
