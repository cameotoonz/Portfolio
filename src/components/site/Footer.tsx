import type { ProfileDTO } from "@/lib/data";

export default function Footer({ profile }: { profile: ProfileDTO }) {
  const whatsappDigits = profile.whatsapp.replace(/[^\d]/g, "");

  return (
    <footer className="relative border-t border-white/8">
      <div className="mx-auto max-w-400 px-6 py-14 md:px-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div>
            <p className="text-[13px] font-bold tracking-[0.3em] text-cream">
              {profile.footerName || profile.name}
            </p>
            <p className="mt-3 text-[9.5px] tracking-[0.3em] text-mist/70">
              {profile.professionalTitle}
            </p>
          </div>

          <nav aria-label="Footer" className="flex items-center gap-9">
            {[
              { label: "Instagram", href: profile.instagramUrl, external: true },
              { label: "Email", href: `mailto:${profile.email}`, external: false },
              {
                label: "WhatsApp",
                href: `https://wa.me/${whatsappDigits}`,
                external: true,
              },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-[10.5px] font-semibold tracking-[0.26em] text-mist transition-colors duration-300 hover:text-aqua"
              >
                {l.label.toUpperCase()}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/6 pt-7">
          <p className="text-[9.5px] tracking-[0.28em] text-mist/55">
            {profile.copyrightText || `© ${new Date().getFullYear()} ${profile.name}`}
          </p>
          <p className="text-[9.5px] tracking-[0.28em] text-mist/45">
            CUT WITH INTENT — {(profile.location || "INDIA").toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  );
}
