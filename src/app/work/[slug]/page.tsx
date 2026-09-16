import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  getProjectBySlug,
  getProjectMedia,
  getProfile,
  serializeProject,
  serializeMediaItem,
  serializeProfile,
  parseEmbedSettings,
} from "@/lib/data";
import { platformLabel, parseVideoUrl } from "@/lib/video";
import ProseText from "@/components/site/ProseText";
import ProjectPlayer from "@/components/site/ProjectPlayer";
import Footer from "@/components/site/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Nitesh Kuamr`,
    description: project.description.slice(0, 160) || undefined,
    openGraph: {
      title: project.title,
      description: project.description.slice(0, 160) || undefined,
      images: project.thumbnailUrl ? [{ url: project.thumbnailUrl }] : undefined,
    },
    robots: project.privacy === "unlisted" ? { index: false, follow: false } : undefined,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getProjectBySlug(slug);
  if (!row) notFound();

  const project = serializeProject(row);
  const [mediaRows, profileRow] = await Promise.all([
    getProjectMedia(row.id),
    getProfile(),
  ]);
  const media = mediaRows.map(serializeMediaItem);
  const embed = parseEmbedSettings(project.embedSettings);
  const src =
    project.videoSourceType === "upload" ? project.uploadedVideo : project.videoUrl;
  const parsed = parseVideoUrl(src);
  const tags = project.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const vertical = project.orientation === "vertical";

  const facts = [
    ["CLIENT", project.client],
    ["YEAR", project.year],
    ["ROLE", project.role],
    ["TOOLS", project.tools],
    ["FORMAT", vertical ? "9:16 VERTICAL" : "16:9 HORIZONTAL"],
    ["SOURCE", platformLabel(parsed.platform)],
  ].filter(([, v]) => v);

  return (
    <main className="min-h-svh">
      {/* slim nav */}
      <header className="sticky top-0 z-40 border-b border-white/6 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-300 items-center justify-between px-6 py-4 md:px-12">
          <Link
            href="/#work"
            className="flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.26em] text-mist transition-colors hover:text-aqua"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} /> BACK TO WORK
          </Link>
          <Link
            href="/"
            className="text-[11px] font-bold tracking-[0.3em] text-cream transition-colors hover:text-aqua"
          >
            {profileRow?.name ?? "NITESH KUAMR"}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-300 px-6 py-16 md:px-12 md:py-24">
        {/* title block */}
        <p className="eyebrow">
          {project.category === "long" ? "LONG FORM" : "SHORT FORM"}
          {project.featured ? " · FEATURED" : ""}
        </p>
        <h1 className="mt-5 max-w-3xl text-[clamp(2rem,5vw,3.8rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-cream">
          {project.title}
        </h1>
        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="border border-white/12 px-3 py-1.5 text-[9px] font-semibold tracking-[0.2em] text-mist"
              >
                {t.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* main player */}
        <div className="mt-12">
          <ProjectPlayer
            src={src}
            poster={project.thumbnailUrl}
            title={project.title}
            vertical={vertical}
            embed={embed}
          />
        </div>

        {/* body + facts */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-[10px] font-bold tracking-[0.3em] text-aqua">
              PROJECT OVERVIEW
            </h2>
            {project.description ? (
              <ProseText text={project.description} className="mt-5 max-w-2xl text-[14.5px]" />
            ) : (
              <p className="mt-5 text-[14px] text-mist">
                A {vertical ? "short form" : "long form"} piece edited by{" "}
                {profileRow?.name ?? "Nitesh Kuamr"}.
              </p>
            )}
          </div>

          <aside>
            <h2 className="text-[10px] font-bold tracking-[0.3em] text-aqua">
              PROJECT INFORMATION
            </h2>
            <dl className="mt-5 border-t border-white/8">
              {facts.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-6 border-b border-white/8 py-3.5"
                >
                  <dt className="text-[9.5px] tracking-[0.24em] text-mist/65">{k}</dt>
                  <dd className="text-right text-[12.5px] text-cream">{v}</dd>
                </div>
              ))}
            </dl>
            {!parsed.embeddable && parsed.externalUrl && (
              <a
                href={parsed.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6"
              >
                Watch video
                <ExternalLink className="size-3.5" strokeWidth={2.25} />
              </a>
            )}
          </aside>
        </div>

        {/* supporting media */}
        {media.length > 0 && (
          <section className="mt-20">
            <h2 className="text-[10px] font-bold tracking-[0.3em] text-aqua">
              ADDITIONAL VISUALS
            </h2>
            <div className="mt-7 flex flex-col gap-10">
              {media.map((m) => (
                <figure key={m.id}>
                  <div className="overflow-hidden border border-white/10 bg-surface/40">
                    {m.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.url}
                        alt={m.caption || `${project.title} — supporting visual`}
                        loading="lazy"
                        decoding="async"
                        className="w-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video
                        src={m.url}
                        controls
                        playsInline
                        preload="none"
                        poster={project.thumbnailUrl || undefined}
                        className="w-full"
                      />
                    )}
                  </div>
                  {m.caption && (
                    <figcaption className="mt-3 text-[11px] tracking-[0.12em] text-mist/70">
                      {m.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        <div className="mt-20 border-t border-white/8 pt-10">
          <Link href="/#work" className="btn-ghost">
            <ArrowLeft className="size-3.5" strokeWidth={2} /> All projects
          </Link>
        </div>
      </article>

      {profileRow && <Footer profile={serializeProfile(profileRow)} />}
    </main>
  );
}
