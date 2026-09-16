"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ServiceDTO } from "@/lib/data";
import { Reveal } from "./Reveal";
import { TimelineFragment, GraphCurve, MaskPath, KeyframeRow } from "./Fragments";

const FRAG_KINDS = ["timeline", "keyframes", "graph", "mask"] as const;
type FragKind = (typeof FRAG_KINDS)[number];

function Frag({ kind }: { kind: FragKind }) {
  switch (kind) {
    case "timeline":
      return <TimelineFragment className="w-full" opacity={0.85} />;
    case "graph":
      return <GraphCurve className="w-full" opacity={0.85} />;
    case "mask":
      return <MaskPath className="w-full" opacity={0.85} />;
    case "keyframes":
      return <KeyframeRow className="w-full" opacity={0.9} />;
  }
}

export default function Services({ services }: { services: ServiceDTO[] }) {
  const [active, setActive] = useState<number | null>(null);

  if (services.length === 0) return null;

  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-400 px-6 md:px-12">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6 md:mb-20">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-aqua/70" aria-hidden="true" />
              WHAT I DO
            </p>
            <h2 className="mt-6 text-[clamp(2rem,4vw,3.4rem)] font-bold tracking-[-0.015em] text-cream">
              Services, <em className="display-serif text-aqua">sharpened.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-mist/85">
              Every engagement is scoped around the story you need to tell.
            </p>
          </Reveal>
        </div>

        <div className="border-t border-white/8">
          {services.map((s, i) => {
            const kind = FRAG_KINDS[i % FRAG_KINDS.length];
            return (
              <Reveal key={s.id} delay={i * 0.07}>
                <div
                  className="group relative cursor-default border-b border-white/8 transition-colors duration-500 hover:bg-white/1.5"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${s.title} — ${s.description}`}
                >
                  {/* accent line */}
                  <span
                    className={`absolute left-0 top-0 h-full w-[2px] origin-top bg-linear-to-b from-aqua to-cyan2 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active === i ? "scale-y-100" : "scale-y-0"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="grid grid-cols-1 items-center gap-4 px-2 py-9 md:grid-cols-[80px_1fr_1.1fr_40px] md:gap-8 md:py-12 md:pl-8 lg:px-4 lg:pl-10">
                    <span
                      className={`text-[12px] font-bold tracking-[0.3em] transition-colors duration-500 ${
                        active === i ? "text-aqua" : "text-mist/50"
                      }`}
                    >
                      {s.itemNumber}
                    </span>
                    <h3
                      className={`text-[clamp(1.6rem,3.2vw,2.7rem)] font-extrabold tracking-[-0.01em] transition-all duration-500 ${
                        active === i ? "translate-x-2 text-cream md:translate-x-3" : "text-cream/85"
                      }`}
                    >
                      {s.title}
                    </h3>
                    <p className="max-w-md text-[13.5px] leading-relaxed text-mist">
                      {s.description}
                    </p>
                    <ArrowUpRight
                      className={`hidden size-5 transition-all duration-500 md:block ${
                        active === i ? "translate-x-1 text-aqua opacity-100" : "text-mist/40 opacity-40"
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* hover preview fragment */}
                  <AnimatePresence>
                    {active === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-none absolute right-6 top-1/2 hidden w-64 -translate-y-1/2 lg:block xl:right-16"
                        aria-hidden="true"
                      >
                        <div className="relative border border-white/10 bg-ink/90 p-4 shadow-[0_20px_60px_-20px_rgba(2,186,206,0.25)]">
                          <Frag kind={kind} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
