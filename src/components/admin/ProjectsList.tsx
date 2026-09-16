"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  Pencil,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  Play,
  Search,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import type { ProjectDTO } from "@/lib/data";
import { platformLabel } from "@/lib/video";

type Filter = "all" | "long" | "short" | "published" | "draft" | "featured" | "unpublished";
type Sort = "manual" | "newest" | "oldest" | "alpha";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "long", label: "Long form" },
  { key: "short", label: "Short form" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Draft" },
  { key: "unpublished", label: "Unpublished" },
  { key: "featured", label: "Featured" },
];

function StatusPill({ p }: { p: ProjectDTO }) {
  const map: Record<string, { text: string; cls: string }> = {
    published: { text: "LIVE", cls: "border-aqua/40 bg-aqua/8 text-aqua" },
    draft: { text: "DRAFT", cls: "border-[#8a7a3a]/50 bg-[#8a7a3a]/10 text-[#d8c98a]" },
    unpublished: { text: "HIDDEN", cls: "border-white/15 text-mist/75" },
  };
  const s = map[p.status] ?? map.draft;
  return (
    <span className={`border px-2 py-0.5 text-[8px] font-bold tracking-[0.18em] ${s.cls}`}>
      {s.text}
    </span>
  );
}

function Row({
  p,
  index,
  busy,
  draggable,
  dragId,
  setDragId,
  overId,
  setOverId,
  onDrop,
  onPatch,
  onDuplicate,
  onDelete,
}: {
  p: ProjectDTO;
  index: number;
  busy: number | null;
  draggable: boolean;
  dragId: number | null;
  setDragId: (n: number | null) => void;
  overId: number | null;
  setOverId: (n: number | null) => void;
  onDrop: (id: number) => void;
  onPatch: (id: number, patch: Record<string, unknown>) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const live = p.status === "published";
  return (
    <div
      draggable={draggable}
      onDragStart={() => draggable && setDragId(p.id)}
      onDragEnd={() => {
        setDragId(null);
        setOverId(null);
      }}
      onDragOver={(e) => {
        if (!draggable) return;
        e.preventDefault();
        setOverId(p.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(p.id);
      }}
      className={`group flex flex-wrap items-center gap-3 border bg-white/2 px-3 py-3 transition-all duration-300 md:flex-nowrap md:gap-4 md:px-4 ${
        overId === p.id && dragId !== p.id
          ? "border-aqua/50 bg-aqua/5"
          : "border-white/8 hover:border-white/16"
      } ${dragId === p.id ? "opacity-40" : ""} ${!live ? "opacity-75" : ""}`}
    >
      {draggable ? (
        <span className="cursor-grab text-mist/40 transition-colors hover:text-cream active:cursor-grabbing">
          <GripVertical className="size-4" strokeWidth={1.5} />
        </span>
      ) : (
        <span className="w-4" />
      )}
      <span className="w-7 shrink-0 text-[10.5px] font-bold tabular-nums text-mist/60">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative h-11 w-19 shrink-0 overflow-hidden border border-white/10 bg-midnight/40">
        {p.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <Play className="size-3.5 text-aqua/50" strokeWidth={1.5} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[13.5px] font-semibold text-cream">{p.title}</p>
          <StatusPill p={p} />
          {p.featured && (
            <span className="border border-aqua/30 bg-aqua/8 px-2 py-0.5 text-[8px] font-bold tracking-[0.18em] text-aqua">
              FEATURED
            </span>
          )}
          {p.privacy !== "public" && (
            <span className="border border-white/15 px-2 py-0.5 text-[8px] font-bold tracking-[0.18em] text-mist/70">
              {p.privacy.toUpperCase()}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-[10px] tracking-[0.12em] text-mist/65">
          {[
            p.category === "long" ? "LONG FORM" : "SHORT FORM",
            platformLabel(p.platform).toUpperCase(),
            p.client,
            p.year,
            p.updatedAt ? `UPD ${new Date(p.updatedAt).toLocaleDateString()}` : "",
          ]
            .filter(Boolean)
            .join("  ·  ")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          onClick={() => onPatch(p.id, { status: live ? "unpublished" : "published" })}
          disabled={busy === p.id}
          className="flex size-8 items-center justify-center text-mist/70 transition-colors hover:text-aqua disabled:opacity-40"
          title={live ? "Unpublish" : "Publish"}
          aria-label={live ? `Unpublish ${p.title}` : `Publish ${p.title}`}
        >
          {busy === p.id ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
          ) : live ? (
            <Eye className="size-4" strokeWidth={1.5} />
          ) : (
            <EyeOff className="size-4" strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={() => onPatch(p.id, { featured: !p.featured })}
          disabled={busy === p.id}
          className={`flex size-8 items-center justify-center transition-colors disabled:opacity-40 ${
            p.featured ? "text-aqua" : "text-mist/70 hover:text-aqua"
          }`}
          title={p.featured ? "Unfeature" : "Feature"}
          aria-label={p.featured ? `Unfeature ${p.title}` : `Feature ${p.title}`}
        >
          <Star className="size-4" strokeWidth={1.5} fill={p.featured ? "currentColor" : "none"} />
        </button>
        <a
          href={`/work/${p.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-8 items-center justify-center text-mist/70 transition-colors hover:text-cream"
          title="Preview"
          aria-label={`Preview ${p.title}`}
        >
          <ExternalLink className="size-4" strokeWidth={1.5} />
        </a>
        <a
          href={`/admin/projects/${p.id}`}
          className="flex size-8 items-center justify-center text-mist/70 transition-colors hover:text-cream"
          title="Edit"
          aria-label={`Edit ${p.title}`}
        >
          <Pencil className="size-4" strokeWidth={1.5} />
        </a>
        <button
          onClick={() => onDuplicate(p.id)}
          disabled={busy === p.id}
          className="flex size-8 items-center justify-center text-mist/70 transition-colors hover:text-cream disabled:opacity-40"
          title="Duplicate as draft"
          aria-label={`Duplicate ${p.title}`}
        >
          <Copy className="size-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => onDelete(p.id)}
          disabled={busy === p.id}
          className="flex size-8 items-center justify-center text-mist/70 transition-colors hover:text-[#ff7b9c] disabled:opacity-40"
          title="Delete"
          aria-label={`Delete ${p.title}`}
        >
          <Trash2 className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default function ProjectsList({ initial }: { initial: ProjectDTO[] }) {
  const [projects, setProjects] = useState(initial);
  const [busy, setBusy] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("manual");
  const [query, setQuery] = useState("");
  const [trashNote, setTrashNote] = useState<{ id: number; title: string } | null>(null);
  const router = useRouter();

  const manual = sort === "manual" && !query.trim();

  const apply = (list: ProjectDTO[]) => {
    let out = list;
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.tags.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    switch (filter) {
      case "published":
        out = out.filter((p) => p.status === "published");
        break;
      case "draft":
        out = out.filter((p) => p.status === "draft");
        break;
      case "unpublished":
        out = out.filter((p) => p.status === "unpublished");
        break;
      case "featured":
        out = out.filter((p) => p.featured);
        break;
    }
    const sorted = [...out];
    if (sort === "newest")
      sorted.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    else if (sort === "oldest")
      sorted.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    else if (sort === "alpha") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else sorted.sort((a, b) => a.displayOrder - b.displayOrder);
    return sorted;
  };

  const long = useMemo(
    () => apply(projects.filter((p) => p.category === "long")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, filter, sort, query],
  );
  const short = useMemo(
    () => apply(projects.filter((p) => p.category === "short")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, filter, sort, query],
  );

  const patch = async (id: number, body: Record<string, unknown>) => {
    setBusy(id);
    setProjects((ps) => ps.map((p) => (p.id === id ? ({ ...p, ...body } as ProjectDTO) : p)));
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partial: true, ...body }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((ps) => ps.map((p) => (p.id === id ? data.project : p)));
      }
    } finally {
      setBusy(null);
    }
  };

  const duplicate = async (id: number) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setProjects((ps) => [...ps, data.project]);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const doDelete = async (id: number) => {
    const target = projects.find((p) => p.id === id);
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((ps) => ps.filter((p) => p.id !== id));
        if (target) setTrashNote({ id, title: target.title });
      }
    } finally {
      setBusy(null);
      setConfirmId(null);
    }
  };

  const restore = async (id: number) => {
    const res = await fetch(`/api/admin/projects/${id}/restore`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setProjects((ps) => [...ps, data.project]);
      setTrashNote(null);
      router.refresh();
    }
  };

  const reorder = async (items: ProjectDTO[], targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const ids = items.map((p) => p.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setOverId(null);
    setProjects((ps) => {
      const next = ps.map((p) => {
        const idx = ids.indexOf(p.id);
        return idx >= 0 ? { ...p, displayOrder: idx + 1 } : p;
      });
      return next;
    });
    await fetch("/api/admin/projects/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: ids }),
    });
  };

  const Section = ({ title, items }: { title: string; items: ProjectDTO[] }) => {
    if ((filter === "long" && title !== "LONG FORM") || (filter === "short" && title !== "SHORT FORM"))
      return null;
    return (
      <section className="mb-12">
        <div className="mb-5 flex items-center gap-4">
          <h2 className="text-[11px] font-bold tracking-[0.34em] text-cream">{title}</h2>
          <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
          <span className="text-[9.5px] tracking-[0.24em] text-mist/70">
            {items.length} SHOWN
          </span>
        </div>
        {items.length === 0 ? (
          <p className="border border-dashed border-white/12 px-6 py-10 text-center text-[11px] tracking-[0.2em] text-mist/60">
            NOTHING MATCHES THIS VIEW
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((p, i) => (
              <Row
                key={p.id}
                p={p}
                index={i}
                busy={busy}
                draggable={manual}
                dragId={dragId}
                setDragId={setDragId}
                overId={overId}
                setOverId={setOverId}
                onDrop={(tid) => reorder(items, tid)}
                onPatch={patch}
                onDuplicate={duplicate}
                onDelete={setConfirmId}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div>
      {/* toolbar */}
      <div className="mb-7 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-52 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-mist/60"
              strokeWidth={1.75}
            />
            <input
              className="admin-input !pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, clients, tags…"
              aria-label="Search projects"
            />
          </div>
          <select
            className="admin-input w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort projects"
          >
            <option value="manual">Manual order</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alpha">A → Z</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`border px-3.5 py-1.5 text-[9.5px] font-bold tracking-[0.18em] transition-all duration-300 ${
                filter === f.key
                  ? "border-aqua/50 bg-aqua/8 text-cream"
                  : "border-white/10 text-mist/70 hover:text-cream"
              }`}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>
        {!manual && (
          <p className="text-[10px] tracking-[0.16em] text-mist/60">
            DRAG-REORDER IS AVAILABLE IN MANUAL ORDER WITHOUT A SEARCH QUERY
          </p>
        )}
      </div>

      {trashNote && (
        <div className="mb-6 flex flex-wrap items-center gap-4 border border-white/12 bg-white/2 px-4 py-3">
          <p className="text-[12px] text-cream">
            &quot;{trashNote.title}&quot; moved to trash.
          </p>
          <button
            onClick={() => restore(trashNote.id)}
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-aqua hover:underline"
          >
            <RotateCcw className="size-3.5" strokeWidth={2} /> UNDO
          </button>
          <button
            onClick={() => setTrashNote(null)}
            className="ml-auto text-[10px] tracking-[0.2em] text-mist/60 hover:text-cream"
          >
            DISMISS
          </button>
        </div>
      )}

      <Section title="LONG FORM" items={long} />
      <Section title="SHORT FORM" items={short} />

      {/* delete confirm */}
      {confirmId !== null && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-ink/85 p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm border border-white/10 bg-surface p-7">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-[#ff9eb8]">
              DELETE PROJECT
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-cream">
              Delete &quot;
              <span className="font-bold">
                {projects.find((p) => p.id === confirmId)?.title}
              </span>
              &quot;?
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-mist">
              This removes it from your portfolio immediately. It moves to trash and
              can be restored — the media files stay in your library.
            </p>
            <div className="mt-7 flex gap-3">
              <button
                onClick={() => doDelete(confirmId)}
                disabled={busy === confirmId}
                className="flex-1 border border-magenta/50 bg-magenta/15 px-4 py-2.5 text-[10.5px] font-bold tracking-[0.22em] text-[#ff9eb8] transition-colors hover:bg-magenta/25 disabled:opacity-50"
              >
                {busy === confirmId ? "DELETING…" : "DELETE"}
              </button>
              <button onClick={() => setConfirmId(null)} className="btn-ghost flex-1 justify-center">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
