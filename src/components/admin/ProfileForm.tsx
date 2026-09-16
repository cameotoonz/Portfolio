"use client";

import { useRef, useState } from "react";
import { Check, Loader2, UserRound } from "lucide-react";
import type { ProfileDTO, ServiceDTO } from "@/lib/data";
import ServicesManager from "./ServicesManager";

const TABS = [
  { key: "personal", label: "PERSONAL" },
  { key: "hero", label: "HERO" },
  { key: "about", label: "ABOUT" },
  { key: "services", label: "SERVICES" },
  { key: "contact", label: "CONTACT" },
  { key: "footer", label: "FOOTER" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProfileForm({
  initial,
  services,
}: {
  initial: ProfileDTO;
  services: ServiceDTO[];
}) {
  const [tab, setTab] = useState<TabKey>("personal");
  const [p, setP] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof ProfileDTO, value: string | number) => {
    setSaved(false);
    setP((prev) => ({ ...prev, [key]: value }));
  };

  const uploadPortrait = async (file: File) => {
    setError("");
    if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) {
      setError("Portrait must be an image — JPG, PNG, WebP or AVIF.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      set("portraitUrl", data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portrait upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setP(data.profile);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    key: keyof ProfileDTO,
    label: string,
    opts: { area?: boolean; hint?: string; span?: boolean } = {},
  ) => (
    <div className={opts.span ? "md:col-span-2" : ""}>
      <label className="admin-label">{label}</label>
      {opts.area ? (
        <textarea
          className="admin-input min-h-28 resize-y"
          value={String(p[key] ?? "")}
          onChange={(e) => set(key, e.target.value)}
        />
      ) : (
        <input
          className="admin-input"
          value={String(p[key] ?? "")}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
      {opts.hint && (
        <p className="mt-2 text-[10px] leading-relaxed text-mist/65">{opts.hint}</p>
      )}
    </div>
  );

  return (
    <div className="mt-10">
      {/* tabs */}
      <div className="mb-9 flex flex-wrap gap-1.5 border-b border-white/8 pb-4" role="tablist" aria-label="Profile sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[10px] font-bold tracking-[0.22em] transition-all duration-300 ${
              tab === t.key
                ? "border border-aqua/50 bg-aqua/8 text-cream"
                : "border border-transparent text-mist/70 hover:text-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "services" ? (
        <ServicesManager initial={services} />
      ) : (
        <>
          {tab === "personal" && (
            <div>
              <div className="flex flex-wrap items-start gap-6">
                <div className="relative w-36 overflow-hidden border border-white/12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.portraitUrl}
                    alt="Current portrait"
                    className="aspect-[4/5] w-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="admin-label">Hero profile image</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadPortrait(f);
                    }}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-ghost"
                  >
                    {uploading ? (
                      <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                    ) : (
                      <UserRound className="size-3.5" strokeWidth={1.75} />
                    )}
                    {uploading ? "Uploading…" : "Replace portrait"}
                  </button>
                  <p className="mt-3 max-w-64 text-[10.5px] leading-relaxed text-mist/70">
                    JPG, PNG, WebP or AVIF. The site crops it editorially (4:5,
                    top-weighted) — never as a small circle.
                  </p>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
                {field("name", "Name")}
                {field("professionalTitle", "Professional title")}
                {field("location", "Location")}
                {field("email", "Email")}
                {field("phone", "Phone number")}
                {field("whatsapp", "WhatsApp number", {
                  hint: "Digits with country code — e.g. 919315841623.",
                })}
                {field("instagramHandle", "Instagram username")}
                {field("instagramUrl", "Instagram link")}
                <div>
                  <label className="admin-label">Projects stat (shown on site)</label>
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    value={p.projectsCount}
                    onChange={(e) => set("projectsCount", Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "hero" && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {field("heroEyebrow", "Eyebrow text")}
              <div />
              {field("heroHeading", "Main hero heading", {
                area: true,
                span: true,
                hint: "Each line on its own line. Wrap words in *asterisks* for italic serif emphasis — e.g. INTO *visual stories*.",
              })}
              {field("heroDescription", "Hero description", { area: true, span: true })}
              {field("heroPrimaryBtn", "Primary button text")}
              {field("heroSecondaryBtn", "Secondary button text")}
            </div>
          )}

          {tab === "about" && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {field("aboutHeading", "About heading", {
                area: true,
                span: true,
                hint: "Text after an em-dash (—) renders in italic serif.",
              })}
              {field("aboutText", "About description", { area: true, span: true })}
              {field("aboutExtra", "Additional text (optional)", {
                area: true,
                span: true,
                hint: "Shown as a highlighted quote-style line below the main paragraph.",
              })}
            </div>
          )}

          {tab === "contact" && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {field("contactHeading", "Contact heading", {
                area: true,
                span: true,
                hint: "Each line on its own line. *Asterisks* mark italic serif emphasis.",
              })}
              {field("contactSubheading", "Contact subheading", {
                hint: "Rendered as the large italic-serif line under the heading.",
              })}
              <div />
              {field("contactIntro", "Contact intro paragraph", { area: true, span: true })}
              {field("email", "Email")}
              {field("phone", "Phone")}
              {field("whatsapp", "WhatsApp")}
              {field("instagramHandle", "Instagram handle")}
              {field("instagramUrl", "Instagram link")}
              {field("location", "Location")}
            </div>
          )}

          {tab === "footer" && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {field("footerName", "Footer name")}
              {field("professionalTitle", "Professional title")}
              {field("copyrightText", "Copyright text", {
                hint: "Shown at the bottom-left of the footer.",
              })}
              <div />
              {field("instagramUrl", "Instagram link")}
              {field("email", "Email")}
              {field("whatsapp", "WhatsApp")}
            </div>
          )}
        </>
      )}

      {error && (
        <p className="mt-6 border border-magenta/40 bg-magenta/10 px-4 py-3 text-[12px] text-[#e08bb4]">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-6 border border-aqua/40 bg-aqua/8 px-4 py-3 text-[12px] text-aqua">
          Profile saved — the public site is updated.
        </p>
      )}

      {tab !== "services" && (
        <div className="mt-10">
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
            ) : (
              <Check className="size-3.5" strokeWidth={2.5} />
            )}
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      )}
    </div>
  );
}
