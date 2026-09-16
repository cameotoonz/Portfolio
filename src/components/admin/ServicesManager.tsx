"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { ServiceDTO } from "@/lib/data";

function ServiceEditor({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: Partial<ServiceDTO>;
  saving: boolean;
  onSave: (data: { title: string; itemNumber: string; description: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [itemNumber, setItemNumber] = useState(initial.itemNumber ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  return (
    <div className="border border-aqua/30 bg-aqua/4 p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[90px_1fr]">
        <div>
          <label className="admin-label">Number</label>
          <input
            className="admin-input"
            value={itemNumber}
            onChange={(e) => setItemNumber(e.target.value)}
            placeholder="01"
          />
        </div>
        <div>
          <label className="admin-label">Service name</label>
          <input
            className="admin-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VIDEO EDITING"
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Description</label>
          <textarea
            className="admin-input min-h-20 resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One sentence about this service."
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onSave({ title, itemNumber, description })}
          disabled={saving || !title.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} /> : <Check className="size-3.5" strokeWidth={2.5} />}
          Save
        </button>
        <button onClick={onCancel} className="btn-ghost">
          <X className="size-3.5" strokeWidth={2} /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function ServicesManager({ initial }: { initial: ServiceDTO[] }) {
  const [items, setItems] = useState(initial);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  const save = async (
    id: number | "new",
    data: { title: string; itemNumber: string; description: string },
  ) => {
    setError("");
    setBusy(id === "new" ? -1 : id);
    try {
      const res = await fetch(
        id === "new" ? "/api/admin/services" : `/api/admin/services/${id}`,
        {
          method: id === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Save failed.");
        return;
      }
      if (id === "new") setItems((is) => [...is, json.service]);
      else setItems((is) => is.map((s) => (s.id === id ? json.service : s)));
      setEditingId(null);
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (s: ServiceDTO) => {
    setBusy(s.id);
    setItems((is) => is.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)));
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !s.enabled }),
    });
    setBusy(null);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await fetch("/api/admin/services/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((s) => s.id) }),
    });
  };

  const remove = async (id: number) => {
    setBusy(id);
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) setItems((is) => is.filter((s) => s.id !== id));
    setBusy(null);
  };

  return (
    <div>
      <p className="mb-4 max-w-lg text-[12px] leading-relaxed text-mist/80">
        These power the editorial services list on the site. Disabled services
        stay here but disappear publicly.
      </p>

      {error && (
        <p className="mb-4 border border-magenta/40 bg-magenta/10 px-4 py-3 text-[12px] text-[#e08bb4]">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((s, i) =>
          editingId === s.id ? (
            <ServiceEditor
              key={s.id}
              initial={s}
              saving={busy === s.id}
              onSave={(d) => save(s.id, d)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={s.id}
              className={`flex items-center gap-3 border px-4 py-3.5 transition-colors ${
                s.enabled ? "border-white/8 bg-white/2" : "border-white/6 bg-white/1 opacity-60"
              }`}
            >
              <span className="w-8 shrink-0 text-[11px] font-bold tracking-[0.14em] text-aqua/80">
                {s.itemNumber}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold">{s.title}</p>
                <p className="truncate text-[10.5px] text-mist/70">{s.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="flex size-7 items-center justify-center text-mist/70 hover:text-cream disabled:opacity-25"
                  aria-label={`Move ${s.title} up`}
                >
                  <ArrowUp className="size-3.5" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="flex size-7 items-center justify-center text-mist/70 hover:text-cream disabled:opacity-25"
                  aria-label={`Move ${s.title} down`}
                >
                  <ArrowDown className="size-3.5" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => setEditingId(s.id)}
                  className="flex size-7 items-center justify-center text-mist/70 hover:text-cream"
                  aria-label={`Edit ${s.title}`}
                >
                  <Pencil className="size-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => remove(s.id)}
                  disabled={busy === s.id}
                  className="flex size-7 items-center justify-center text-mist/70 hover:text-[#ff7b9c] disabled:opacity-40"
                  aria-label={`Delete ${s.title}`}
                >
                  {busy === s.id ? <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} /> : <Trash2 className="size-3.5" strokeWidth={1.5} />}
                </button>
                <button
                  onClick={() => toggle(s)}
                  disabled={busy === s.id}
                  className={`ml-1 border px-2.5 py-1 text-[8.5px] font-bold tracking-[0.18em] transition-colors ${
                    s.enabled
                      ? "border-aqua/40 bg-aqua/8 text-aqua"
                      : "border-white/15 text-mist/70 hover:text-cream"
                  }`}
                  aria-pressed={s.enabled}
                  aria-label={`${s.enabled ? "Disable" : "Enable"} ${s.title}`}
                >
                  {s.enabled ? "LIVE" : "HIDDEN"}
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {editingId === "new" ? (
        <div className="mt-3">
          <ServiceEditor
            initial={{ itemNumber: String(items.length + 1).padStart(2, "0") }}
            saving={busy === -1}
            onSave={(d) => save("new", d)}
            onCancel={() => setEditingId(null)}
          />
        </div>
      ) : (
        <button onClick={() => setEditingId("new")} className="btn-ghost mt-4">
          <Plus className="size-3.5" strokeWidth={2} /> Add service
        </button>
      )}
    </div>
  );
}
