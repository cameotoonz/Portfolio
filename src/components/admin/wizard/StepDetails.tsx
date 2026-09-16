"use client";

import { useState } from "react";
import { X, Plus, Bold, Italic, Heading2, List, Link2 } from "lucide-react";
import { TAG_SUGGESTIONS, type WizardState } from "./types";

/** Lightweight markdown-ish toolbar — wraps the current selection. */
function useFormatting(
  value: string,
  onChange: (v: string) => void,
  ref: React.RefObject<HTMLTextAreaElement | null>,
) {
  return (before: string, after = before, placeholder = "text") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
    });
  };
}

export default function StepDetails({
  state,
  update,
  descRef,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  descRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [tagInput, setTagInput] = useState("");
  const tags = state.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const format = useFormatting(
    state.description,
    (v) => update({ description: v }),
    descRef,
  );

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean || tags.includes(clean)) return;
    update({ tags: [...tags, clean].join(", ") });
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    update({ tags: tags.filter((t) => t !== tag).join(", ") });

  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight">Project details</h2>
      <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-mist">
        The information that makes this feel like a case study rather than a
        video card.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="admin-label" htmlFor="w-title">Project title *</label>
          <input
            id="w-title"
            className="admin-input"
            value={state.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. A Startup Killed Retail Kings"
          />
        </div>

        <div className="md:col-span-2">
          <label className="admin-label" htmlFor="w-desc">Project description</label>
          <div className="mb-2 flex flex-wrap gap-1">
            {[
              { icon: Bold, label: "Bold", fn: () => format("**", "**", "bold text") },
              { icon: Italic, label: "Italic", fn: () => format("_", "_", "italic text") },
              { icon: Heading2, label: "Heading", fn: () => format("\n## ", "", "Heading") },
              { icon: List, label: "Bullet list", fn: () => format("\n- ", "", "List item") },
              { icon: Link2, label: "Link", fn: () => format("[", "](https://)", "link text") },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={b.fn}
                title={b.label}
                aria-label={b.label}
                className="flex size-8 items-center justify-center border border-white/10 bg-white/2 text-mist transition-colors hover:border-aqua/40 hover:text-aqua"
              >
                <b.icon className="size-3.5" strokeWidth={1.75} />
              </button>
            ))}
          </div>
          <textarea
            id="w-desc"
            ref={descRef}
            className="admin-input min-h-40 resize-y font-mono text-[12.5px] leading-relaxed"
            value={state.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder={"Overview of the piece…\n\n## Approach\n- Pacing built around the hook\n- Sound design driving the cuts"}
          />
          <p className="mt-2 text-[10px] leading-relaxed text-mist/60">
            Supports paragraphs, **bold**, _italic_, ## headings, - bullets and
            [links](https://example.com).
          </p>
        </div>

        <div>
          <label className="admin-label" htmlFor="w-type">Project type</label>
          <select
            id="w-type"
            className="admin-input"
            value={state.category}
            onChange={(e) => {
              const c = e.target.value as "long" | "short";
              update({
                category: c,
                orientation: c === "short" ? "vertical" : "horizontal",
              });
            }}
          >
            <option value="long">Long form — 16:9</option>
            <option value="short">Short form — 9:16</option>
          </select>
        </div>

        <div>
          <label className="admin-label" htmlFor="w-aspect">Aspect ratio</label>
          <select
            id="w-aspect"
            className="admin-input"
            value={state.orientation}
            onChange={(e) =>
              update({ orientation: e.target.value as "horizontal" | "vertical" })
            }
          >
            <option value="horizontal">Horizontal — 16:9</option>
            <option value="vertical">Vertical — 9:16</option>
          </select>
          {state.width > 0 && (
            <p className="mt-2 text-[10px] text-mist/60">
              Detected {state.width}×{state.height} — auto-set, override if needed.
            </p>
          )}
        </div>

        <div>
          <label className="admin-label" htmlFor="w-client">Project / client name</label>
          <input
            id="w-client"
            className="admin-input"
            value={state.client}
            onChange={(e) => update({ client: e.target.value })}
            placeholder="Client or Self-initiated"
          />
        </div>

        <div>
          <label className="admin-label" htmlFor="w-year">Year / date</label>
          <input
            id="w-year"
            className="admin-input"
            value={state.year}
            onChange={(e) => update({ year: e.target.value })}
          />
        </div>

        <div>
          <label className="admin-label" htmlFor="w-role">Role</label>
          <input
            id="w-role"
            className="admin-input"
            value={state.role}
            onChange={(e) => update({ role: e.target.value })}
            placeholder="Editor, Motion Designer"
          />
        </div>

        <div>
          <label className="admin-label" htmlFor="w-tools">Tools used</label>
          <input
            id="w-tools"
            className="admin-input"
            value={state.tools}
            onChange={(e) => update({ tools: e.target.value })}
            placeholder="Premiere Pro, After Effects"
          />
        </div>

        {/* tags */}
        <div className="md:col-span-2">
          <label className="admin-label" htmlFor="w-tags">Tags / categories</label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 border border-aqua/30 bg-aqua/8 px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-cream"
              >
                {t.toUpperCase()}
                <button
                  onClick={() => removeTag(t)}
                  aria-label={`Remove tag ${t}`}
                  className="text-mist hover:text-[#ff9eb8]"
                >
                  <X className="size-3" strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              id="w-tags"
              className="admin-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="Type a tag and press Enter"
            />
            <button onClick={() => addTag(tagInput)} className="btn-ghost shrink-0">
              <Plus className="size-3.5" strokeWidth={2} /> Add
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).map((t) => (
              <button
                key={t}
                onClick={() => addTag(t)}
                className="border border-white/10 px-2.5 py-1 text-[9.5px] tracking-[0.14em] text-mist/75 transition-colors hover:border-aqua/40 hover:text-aqua"
              >
                + {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
