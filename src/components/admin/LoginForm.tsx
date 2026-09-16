"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error — try again.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border border-white/10 bg-white/3 p-7 backdrop-blur-xl md:p-9"
    >
      <div className="mb-7 flex items-center gap-3 text-aqua">
        <Lock className="size-4" strokeWidth={1.5} />
        <span className="text-[10px] font-semibold tracking-[0.3em]">
          ADMIN ACCESS
        </span>
      </div>

      <label className="admin-label" htmlFor="username">
        Username
      </label>
      <input
        id="username"
        className="admin-input mb-5"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
        placeholder="admin"
      />

      <label className="admin-label" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        className="admin-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        placeholder="••••••••"
      />

      {error && (
        <p className="mt-4 border border-magenta/40 bg-magenta/10 px-3 py-2 text-[11.5px] tracking-wide text-[#e08bb4]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-7 w-full justify-center disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
        ) : (
          <>
            Enter studio
            <ArrowRight className="btn-arrow size-3.5" strokeWidth={2.5} />
          </>
        )}
      </button>

      <p className="mt-6 text-center text-[10px] leading-relaxed tracking-[0.14em] text-mist/60">
        DEFAULT CREDENTIALS — admin / nitesh2026
        <br />
        (change via ADMIN_USERNAME / ADMIN_PASSWORD env)
      </p>
    </form>
  );
}
