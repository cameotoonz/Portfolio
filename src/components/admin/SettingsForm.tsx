"use client";

import { useState } from "react";
import { Check, Loader2, ShieldCheck, Globe2 } from "lucide-react";
import type { SettingsDTO } from "@/lib/data";

export default function SettingsForm({ initial }: { initial: SettingsDTO }) {
  const [siteTitle, setSiteTitle] = useState(initial.siteTitle);
  const [siteDescription, setSiteDescription] = useState(initial.siteDescription);
  const [savingSite, setSavingSite] = useState(false);
  const [siteMsg, setSiteMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const saveSite = async () => {
    setSavingSite(true);
    setSiteMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteTitle, siteDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setSiteMsg({ ok: true, text: "Site settings saved." });
    } catch (e) {
      setSiteMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSavingSite(false);
    }
  };

  const changePassword = async () => {
    setPwdMsg(null);
    if (!currentPassword || !newPassword) {
      setPwdMsg({ ok: false, text: "Fill in both password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ ok: false, text: "New passwords don't match." });
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setPwdMsg({ ok: true, text: "Password changed. Use it next time you log in." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPwdMsg({ ok: false, text: e instanceof Error ? e.message : "Failed." });
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="mt-10 flex flex-col gap-12">
      {/* website settings */}
      <section className="border border-white/8 bg-white/2 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3 text-aqua">
          <Globe2 className="size-4" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold tracking-[0.3em]">WEBSITE SETTINGS</span>
        </div>
        <label className="admin-label">Page title (browser tab / SEO)</label>
        <input
          className="admin-input mb-5"
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
        />
        <label className="admin-label">Meta description (SEO)</label>
        <textarea
          className="admin-input min-h-24 resize-y"
          value={siteDescription}
          onChange={(e) => setSiteDescription(e.target.value)}
        />
        {siteMsg && (
          <p
            className={`mt-4 border px-4 py-2.5 text-[12px] ${
              siteMsg.ok
                ? "border-aqua/40 bg-aqua/8 text-aqua"
                : "border-magenta/40 bg-magenta/10 text-[#e08bb4]"
            }`}
          >
            {siteMsg.text}
          </p>
        )}
        <button onClick={saveSite} disabled={savingSite} className="btn-primary mt-6 disabled:opacity-60">
          {savingSite ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} /> : <Check className="size-3.5" strokeWidth={2.5} />}
          Save site settings
        </button>
      </section>

      {/* security */}
      <section className="border border-white/8 bg-white/2 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3 text-aqua">
          <ShieldCheck className="size-4" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold tracking-[0.3em]">ADMIN SECURITY</span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className="admin-label">Current password</label>
            <input
              type="password"
              className="admin-input"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">New password</label>
            <input
              type="password"
              className="admin-input"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Confirm new password</label>
            <input
              type="password"
              className="admin-input"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-mist/65">
          The username can be changed via the ADMIN_USERNAME / ADMIN_PASSWORD
          environment variables on a fresh deployment.
        </p>
        {pwdMsg && (
          <p
            className={`mt-4 border px-4 py-2.5 text-[12px] ${
              pwdMsg.ok
                ? "border-aqua/40 bg-aqua/8 text-aqua"
                : "border-magenta/40 bg-magenta/10 text-[#e08bb4]"
            }`}
          >
            {pwdMsg.text}
          </p>
        )}
        <button onClick={changePassword} disabled={savingPwd} className="btn-primary mt-6 disabled:opacity-60">
          {savingPwd ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} /> : <Check className="size-3.5" strokeWidth={2.5} />}
          Change password
        </button>
      </section>
    </div>
  );
}
