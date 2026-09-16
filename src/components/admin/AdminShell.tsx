"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clapperboard,
  UserRound,
  Images,
  Settings2,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: Clapperboard },
  { label: "Profile", href: "/admin/profile", icon: UserRound },
  { label: "Media", href: "/admin/media", icon: Images },
  { label: "Settings", href: "/admin/settings", icon: Settings2 },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 border-l-2 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] transition-all duration-300 ${
              active
                ? "border-aqua bg-white/3 text-cream"
                : "border-transparent text-mist/75 hover:bg-white/1.5 hover:text-cream"
            }`}
          >
            <item.icon
              className={`size-4 transition-colors ${active ? "text-aqua" : "text-mist/60 group-hover:text-cream"}`}
              strokeWidth={1.5}
            />
            {item.label.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({
  user,
  children,
}: {
  user: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-svh bg-ink">
      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/8 bg-ink/90 px-5 py-4 backdrop-blur-xl lg:hidden">
        <span className="text-[11px] font-bold tracking-[0.3em]">NK — STUDIO</span>
        <button
          onClick={() => setOpen(!open)}
          className="flex size-9 items-center justify-center text-cream"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
        </button>
      </div>
      {open && (
        <div className="border-b border-white/8 bg-surface/60 px-2 py-4 lg:hidden">
          <NavLinks onNavigate={() => setOpen(false)} />
          <div className="mt-3 flex items-center gap-2 px-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-[10px] tracking-[0.22em] text-mist hover:text-aqua"
            >
              <ExternalLink className="size-3.5" strokeWidth={1.5} /> VIEW SITE
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-[10px] tracking-[0.22em] text-mist hover:text-aqua"
            >
              <LogOut className="size-3.5" strokeWidth={1.5} /> LOGOUT
            </button>
          </div>
        </div>
      )}

      {/* sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col justify-between border-r border-white/8 bg-surface/30 py-8 lg:flex">
        <div>
          <div className="px-5 pb-9">
            <p className="text-[11px] font-bold tracking-[0.3em] text-cream">
              NITESH KUAMR
            </p>
            <p className="mt-2 text-[8.5px] tracking-[0.26em] text-aqua/80">
              PORTFOLIO STUDIO
            </p>
          </div>
          <NavLinks />
        </div>
        <div className="flex flex-col gap-1 px-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-semibold tracking-[0.22em] text-mist/75 transition-colors hover:text-aqua"
          >
            <ExternalLink className="size-4" strokeWidth={1.5} /> VIEW SITE
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-left text-[10px] font-semibold tracking-[0.22em] text-mist/75 transition-colors hover:text-aqua"
          >
            <LogOut className="size-4" strokeWidth={1.5} /> LOGOUT — {user.toUpperCase()}
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <main className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}
