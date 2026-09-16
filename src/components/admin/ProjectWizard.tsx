"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Save,
  Rocket,
  AlertCircle,
  CloudUpload,
  ExternalLink,
} from "lucide-react";
import type { ProjectDTO, ProjectMediaDTO } from "@/lib/data";
import StepMedia from "./wizard/StepMedia";
import StepDetails from "./wizard/StepDetails";
import StepThumbnail from "./wizard/StepThumbnail";
import StepSettings from "./wizard/StepSettings";
import StepPreview from "./wizard/StepPreview";
import {
  STEPS,
  emptyWizardState,
  type StepKey,
  type SupportingMedia,
  type WizardState,
} from "./wizard/types";

const DRAFT_KEY = "nk_project_wizard_draft";

function stateFromProject(p: ProjectDTO): WizardState {
  let embed = {
    autoplay: true,
    muted: false,
    loop: false,
    controls: true,
    startTime: 0,
  };
  try {
    embed = { ...embed, ...JSON.parse(p.embedSettings || "{}") };
  } catch {
    /* defaults */
  }
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    description: p.description,
    thumbnailUrl: p.thumbnailUrl,
    videoSourceType: p.videoSourceType,
    videoUrl: p.videoUrl,
    uploadedVideo: p.uploadedVideo,
    orientation: p.orientation,
    client: p.client,
    year: p.year,
    role: p.role,
    tools: p.tools,
    tags: p.tags,
    featured: p.featured,
    status: p.status,
    privacy: p.privacy,
    durationSec: p.durationSec,
    width: p.width,
    height: p.height,
    fps: p.fps,
    fileSize: p.fileSize,
    videoFormat: p.videoFormat,
    embedSettings: embed,
  };
}

export default function ProjectWizard({
  initial,
  initialMedia = [],
  initialCategory = "long",
}: {
  initial?: ProjectDTO;
  initialMedia?: ProjectMediaDTO[];
  initialCategory?: "long" | "short";
}) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [state, setState] = useState<WizardState>(() =>
    initial ? stateFromProject(initial) : emptyWizardState(initialCategory),
  );
  const [media, setMedia] = useState<SupportingMedia[]>(
    initialMedia.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      caption: m.caption,
      persisted: true,
    })),
  );
  const [step, setStep] = useState<StepKey>("media");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [saving, setSaving] = useState<"idle" | "draft" | "publish">("idle");
  const [issues, setIssues] = useState<{ field: string; message: string }[]>([]);
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savedAgo, setSavedAgo] = useState("");
  const [restored, setRestored] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const dirtyRef = useRef(false);

  const update = useCallback((patch: Partial<WizardState>) => {
    dirtyRef.current = true;
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  /* ── local draft recovery (new projects only) ── */
  useEffect(() => {
    if (editing) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.title || parsed?.description || parsed?.videoUrl) {
          setState((s) => ({ ...s, ...parsed }));
          setRestored(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, [editing]);

  useEffect(() => {
    if (editing) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
      } catch {
        /* quota */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [state, editing]);

  /* ── "last saved" ticker ── */
  useEffect(() => {
    if (!lastSaved) return;
    const tick = () => {
      const sec = Math.round((Date.now() - lastSaved.getTime()) / 1000);
      setSavedAgo(
        sec < 5 ? "just now" : sec < 60 ? `${sec} seconds ago` : `${Math.round(sec / 60)} min ago`,
      );
    };
    tick();
    const i = setInterval(tick, 5000);
    return () => clearInterval(i);
  }, [lastSaved]);

  /* ── warn before losing unsaved work ── */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current && saving === "idle") e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saving]);

  const syncMedia = async (projectId: number) => {
    const existingIds = initialMedia.map((m) => m.id);
    const keptIds = media.filter((m) => m.persisted).map((m) => Number(m.id));
    // delete removed
    await Promise.all(
      existingIds
        .filter((id) => !keptIds.includes(id))
        .map((id) =>
          fetch(`/api/admin/projects/${projectId}/media/${id}`, { method: "DELETE" }),
        ),
    );
    // create new
    const created: number[] = [];
    for (const item of media) {
      if (item.persisted) continue;
      const res = await fetch(`/api/admin/projects/${projectId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: item.kind, url: item.url, caption: item.caption }),
      });
      if (res.ok) {
        const data = await res.json();
        created.push(data.media.id);
      }
    }
    // caption updates + ordering
    await Promise.all(
      media
        .filter((m) => m.persisted)
        .map((m) =>
          fetch(`/api/admin/projects/${projectId}/media/${m.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caption: m.caption }),
          }),
        ),
    );
    let ci = 0;
    const orderedIds = media.map((m) => (m.persisted ? Number(m.id) : created[ci++]));
    await fetch(`/api/admin/projects/${projectId}/media`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: orderedIds.filter(Boolean) }),
    });
  };

  const persist = async (
    mode: "draft" | "publish",
  ): Promise<{ ok: boolean; project?: ProjectDTO }> => {
    setSaving(mode);
    setIssues([]);
    setBanner(null);
    const payload = {
      ...state,
      status: mode === "publish" ? "published" : state.status === "published" ? "published" : "draft",
      embedSettings: JSON.stringify(state.embedSettings),
    };
    try {
      const url = state.id
        ? `/api/admin/projects/${state.id}`
        : "/api/admin/projects";
      const res = await fetch(url, {
        method: state.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setIssues(data.issues ?? [{ field: "general", message: data.error || "Save failed." }]);
        setBanner({ ok: false, text: data.error || "Save failed." });
        setSaving("idle");
        return { ok: false };
      }
      const project = data.project as ProjectDTO;
      setState((s) => ({ ...s, id: project.id, slug: project.slug, status: project.status }));
      await syncMedia(project.id);
      setMedia((ms) => ms.map((m) => ({ ...m, persisted: true })));
      dirtyRef.current = false;
      setLastSaved(new Date());
      if (!editing) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
      }
      setSaving("idle");
      return { ok: true, project };
    } catch {
      setBanner({ ok: false, text: "Network error — try again." });
      setSaving("idle");
      return { ok: false };
    }
  };

  const saveDraft = async () => {
    const r = await persist("draft");
    if (r.ok) setBanner({ ok: true, text: "Draft saved." });
  };

  const publish = async () => {
    const r = await persist("publish");
    if (r.ok) {
      setBanner({ ok: true, text: "Project published ✓" });
      setTimeout(() => {
        router.push("/admin/projects");
        router.refresh();
      }, 900);
    }
  };

  const go = (dir: -1 | 1) => {
    const next = STEPS[stepIndex + dir];
    if (next) setStep(next.key);
  };

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => router.push("/admin/projects")}
        className="mb-7 flex items-center gap-2 text-[10px] font-semibold tracking-[0.26em] text-mist transition-colors hover:text-aqua"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} /> BACK TO PROJECTS
      </button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{editing ? "EDIT PROJECT" : "CREATE PROJECT"}</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            {editing ? initial!.title : "New project"}
          </h1>
        </div>
        <div className="text-right">
          {state.id && (
            <span className="text-[9.5px] tracking-[0.2em] text-mist/60">
              {state.status === "published" ? "LIVE" : state.status.toUpperCase()} · /work/{state.slug}
            </span>
          )}
          {lastSaved && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-aqua/90">
              <CloudUpload className="size-3" strokeWidth={2} /> Draft saved {savedAgo}
            </p>
          )}
        </div>
      </div>

      {restored && (
        <p className="mt-5 border border-aqua/30 bg-aqua/6 px-4 py-2.5 text-[11.5px] text-aqua">
          Recovered your unsaved draft from this browser.
        </p>
      )}

      {/* stepper */}
      <ol className="mt-8 flex flex-wrap gap-1.5" aria-label="Project steps">
        {STEPS.map((s, i) => {
          const active = s.key === step;
          const done = i < stepIndex;
          return (
            <li key={s.key}>
              <button
                onClick={() => setStep(s.key)}
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-2 border px-3.5 py-2 text-[9.5px] font-bold tracking-[0.18em] transition-all duration-300 ${
                  active
                    ? "border-aqua/55 bg-aqua/8 text-cream"
                    : done
                      ? "border-white/12 text-aqua/80 hover:text-cream"
                      : "border-white/10 text-mist/65 hover:text-cream"
                }`}
              >
                {done ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <span className="tabular-nums">{i + 1}</span>
                )}
                {s.label.toUpperCase()}
              </button>
            </li>
          );
        })}
      </ol>

      {/* step body */}
      <div className="mt-9 border border-white/8 bg-white/2 p-6 md:p-8">
        {step === "media" && (
          <StepMedia state={state} update={update} onFileSelected={setLocalFile} />
        )}
        {step === "details" && (
          <StepDetails state={state} update={update} descRef={descRef} />
        )}
        {step === "thumbnail" && (
          <StepThumbnail
            state={state}
            update={update}
            localFile={localFile}
            media={media}
            setMedia={(m) => {
              dirtyRef.current = true;
              setMedia(m);
            }}
          />
        )}
        {step === "settings" && <StepSettings state={state} update={update} />}
        {step === "preview" && <StepPreview state={state} media={media} />}
        {step === "publish" && (
          <div>
            <div className="flex items-center gap-3">
              <Rocket className="size-4 text-aqua" strokeWidth={1.5} />
              <h2 className="text-lg font-bold tracking-tight">Publish</h2>
            </div>
            <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-mist">
              Everything required is checked before the project goes live.
            </p>
            <ul className="mt-6 flex flex-col gap-2">
              {[
                { label: "Project title", ok: Boolean(state.title.trim()) },
                { label: "Project type", ok: Boolean(state.category) },
                {
                  label: "Video source",
                  ok: Boolean(
                    state.videoSourceType === "upload" ? state.uploadedVideo : state.videoUrl,
                  ),
                },
                { label: "Thumbnail", ok: Boolean(state.thumbnailUrl) },
              ].map((c) => (
                <li
                  key={c.label}
                  className={`flex items-center gap-3 border px-4 py-3 text-[12px] ${
                    c.ok
                      ? "border-aqua/25 bg-aqua/5 text-cream/90"
                      : "border-magenta/40 bg-magenta/8 text-[#e08bb4]"
                  }`}
                >
                  {c.ok ? (
                    <Check className="size-4 shrink-0 text-aqua" strokeWidth={2.5} />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" strokeWidth={2} />
                  )}
                  {c.label}
                  {!c.ok && <span className="ml-auto text-[10px] tracking-[0.18em]">MISSING</span>}
                </li>
              ))}
            </ul>
            {state.id && state.status === "published" && (
              <a
                href={`/work/${state.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost mt-6"
              >
                <ExternalLink className="size-3.5" strokeWidth={1.75} /> View live page
              </a>
            )}
          </div>
        )}
      </div>

      {issues.length > 0 && (
        <ul className="mt-5 flex flex-col gap-1.5">
          {issues.map((i) => (
            <li
              key={i.field + i.message}
              className="flex items-center gap-2.5 border border-magenta/40 bg-magenta/10 px-4 py-2.5 text-[12px] text-[#e08bb4]"
            >
              <AlertCircle className="size-3.5 shrink-0" strokeWidth={2} />
              {i.message}
            </li>
          ))}
        </ul>
      )}
      {banner && (
        <p
          className={`mt-5 border px-4 py-3 text-[12px] ${
            banner.ok
              ? "border-aqua/40 bg-aqua/8 text-aqua"
              : "border-magenta/40 bg-magenta/10 text-[#e08bb4]"
          }`}
        >
          {banner.text}
        </p>
      )}

      {/* footer actions */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => go(-1)}
          disabled={stepIndex === 0}
          className="btn-ghost disabled:opacity-35"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2} /> Back
        </button>
        {stepIndex < STEPS.length - 1 && (
          <button onClick={() => go(1)} className="btn-ghost">
            Next
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </button>
        )}
        <div className="ml-auto flex flex-wrap gap-3">
          <button
            onClick={saveDraft}
            disabled={saving !== "idle"}
            className="btn-ghost disabled:opacity-60"
          >
            {saving === "draft" ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Save className="size-3.5" strokeWidth={1.75} />
            )}
            Save as draft
          </button>
          <button
            onClick={publish}
            disabled={saving !== "idle"}
            className="btn-primary disabled:opacity-60"
          >
            {saving === "publish" ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
            ) : (
              <Rocket className="size-3.5" strokeWidth={2.25} />
            )}
            {state.status === "published" ? "Update & publish" : "Publish project"}
          </button>
        </div>
      </div>
    </div>
  );
}
