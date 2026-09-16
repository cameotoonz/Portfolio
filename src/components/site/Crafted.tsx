"use client";

import { Reveal } from "./Reveal";
import { TimelineFragment } from "./Fragments";

const TOOLS = [
  { abbr: "Ae", name: "After Effects", hue: "#9a8fd0" },
  { abbr: "Pr", name: "Premiere Pro", hue: "#8f7fc9" },
  { abbr: "Ps", name: "Photoshop", hue: "#7ba7c9" },
  { abbr: "Ai", name: "Illustrator", hue: "#c9a27b" },
];

export default function Crafted() {
  return (
    <section className="relative overflow-hidden border-y border-white/6 bg-surface/35 py-20 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-50" aria-hidden="true">
        <TimelineFragment className="w-[min(900px,90%)] opacity-12" />
      </div>
      <div className="relative z-10 mx-auto max-w-400 px-6 md:px-12">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-aqua/70" aria-hidden="true" />
              CRAFTED WITH
            </p>
            <p className="mt-5 max-w-xs text-[12.5px] leading-relaxed text-mist">
              The tools are fluent — the judgment is the craft.
            </p>
          </Reveal>

          <div className="flex flex-wrap items-center gap-5 md:gap-8">
            {TOOLS.map((t, i) => (
              <Reveal key={t.abbr} delay={0.1 + i * 0.08}>
                <div className="group flex items-center gap-3.5">
                  <span
                    className="flex size-12 items-center justify-center border text-[15px] font-bold transition-all duration-500 group-hover:border-aqua/50 group-hover:shadow-[0_0_30px_-6px_rgba(80,204,210,0.35)]"
                    style={{
                      borderColor: "rgba(243,241,234,0.14)",
                      color: t.hue,
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 3,
                      fontFamily: "var(--font-sans)",
                    }}
                    aria-hidden="true"
                  >
                    {t.abbr}
                  </span>
                  <span className="hidden text-[10.5px] font-semibold tracking-[0.24em] text-mist transition-colors duration-500 group-hover:text-cream sm:block">
                    {t.name.toUpperCase()}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
