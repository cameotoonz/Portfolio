"use client";

import { ArrowUpRight, Mail, Phone, MessageCircle } from "lucide-react";
import { InstagramIcon } from "./Icons";
import type { ProfileDTO } from "@/lib/data";
import { Reveal, MaskedLines } from "./Reveal";
import { parseEmphasisLines } from "./RichText";

export default function Contact({ profile }: { profile: ProfileDTO }) {
  const whatsappDigits = profile.whatsapp.replace(/[^\d]/g, "");
  const phoneDigits = profile.phone.replace(/[^\d+]/g, "");

  const channels = [
    {
      label: "EMAIL",
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: Mail,
      external: false,
    },
    {
      label: "PHONE",
      value: profile.phone,
      href: `tel:${phoneDigits}`,
      icon: Phone,
      external: false,
    },
    {
      label: "WHATSAPP",
      value: profile.whatsapp,
      href: `https://wa.me/${whatsappDigits}`,
      icon: MessageCircle,
      external: true,
    },
    {
      label: "INSTAGRAM",
      value: profile.instagramHandle,
      href: profile.instagramUrl,
      icon: InstagramIcon,
      external: true,
    },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-44">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-[-10%] left-[10%] size-130 rounded-full bg-cyan2/6 blur-[120px]" />
        <div className="absolute top-[0%] right-[5%] size-100 rounded-full bg-magenta/6 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-400 px-6 md:px-12">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="inline-block h-px w-10 bg-aqua/70" aria-hidden="true" />
            CONTACT
          </p>
        </Reveal>

        <h2 className="mt-10 text-[clamp(2.6rem,7vw,6rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-cream">
          <MaskedLines
            lines={[
              ...parseEmphasisLines(profile.contactHeading),
              ...(profile.contactSubheading
                ? [
                    <em key="sub" className="display-serif text-aqua">
                      {profile.contactSubheading}
                    </em>,
                  ]
                : []),
            ]}
            baseDelay={0.15}
          />
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-14 md:mt-24 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <Reveal delay={0.2}>
            <p className="max-w-sm text-[14px] leading-[1.85] text-mist">
              {profile.contactIntro}
            </p>
            <p className="mt-8 text-[11px] font-semibold tracking-[0.3em] text-cream">
              {profile.name}
            </p>
            <p className="mt-2 text-[10px] tracking-[0.28em] text-mist/75">
              {profile.professionalTitle}
            </p>
          </Reveal>

          <div className="border-t border-white/8">
            {channels.map((c, i) => (
              <Reveal key={c.label} delay={0.25 + i * 0.07}>
                <a
                  href={c.href}
                  {...(c.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex items-center justify-between gap-4 border-b border-white/8 py-6 transition-colors duration-500 hover:bg-white/1.5 md:py-7"
                >
                  <div className="flex items-center gap-5 md:gap-7">
                    <c.icon
                      className="size-4.5 text-mist transition-colors duration-500 group-hover:text-aqua"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="text-[9px] font-semibold tracking-[0.3em] text-mist/65">
                        {c.label}
                      </p>
                      <p className="mt-1.5 break-all text-[15px] font-semibold tracking-[0.02em] text-cream transition-colors duration-500 group-hover:text-aqua md:text-lg">
                        {c.value}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="size-5 shrink-0 text-mist/50 transition-all duration-500 group-hover:translate-x-1 group-hover:text-aqua"
                    strokeWidth={1.5}
                  />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
