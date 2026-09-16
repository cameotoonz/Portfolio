"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { MaskedLines, FadeIn } from "./Reveal";
import { TimelineFragment, GraphCurve, MaskPath, KeyframeRow } from "./Fragments";
import { parseEmphasisLines } from "./RichText";

export default function Hero({
  eyebrow,
  heading,
  description,
  primaryBtn,
  secondaryBtn,
  portraitUrl,
  name,
  location,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  primaryBtn: string;
  secondaryBtn: string;
  portraitUrl: string;
  name: string;
  location: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const fragY1 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fragY2 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden pt-28 pb-16 md:pt-32"
    >
      {/* ── atmosphere ── */}
      <motion.div style={{ opacity: bgOpacity }} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-drift-a absolute -top-32 -left-40 size-150 rounded-full bg-cyan2/7 blur-[130px]" />
        <div className="animate-drift-b absolute right-[-10%] bottom-[-20%] size-160 rounded-full bg-magenta/6 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 size-120 -translate-x-1/2 rounded-full bg-midnight/60 blur-[110px]" />
      </motion.div>

      {/* ── art-direction fragments (desktop) ── */}
      <motion.div style={{ y: fragY1 }} className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        <TimelineFragment className="absolute -left-24 top-[16%] w-130 rotate-[-4deg]" opacity={0.34} />
        <GraphCurve className="absolute right-[2%] top-[8%] w-96 rotate-[2deg]" opacity={0.3} />
      </motion.div>
      <motion.div style={{ y: fragY2 }} className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        <MaskPath className="absolute bottom-[6%] left-[2%] w-80 rotate-[6deg]" opacity={0.26} />
        <KeyframeRow className="absolute bottom-[26%] right-[3%] w-105" opacity={0.3} />
      </motion.div>
      {/* reduced fragments on mobile */}
      <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden="true">
        <TimelineFragment className="absolute -left-40 top-[10%] w-120 opacity-25" opacity={0.4} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-400 grid-cols-1 items-center gap-14 px-6 md:px-12 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
        {/* ── copy ── */}
        <div>
          <FadeIn delay={0.35}>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-aqua/70" aria-hidden="true" />
              {eyebrow}
            </p>
          </FadeIn>

          <h1 className="mt-8 text-[clamp(2.55rem,6.2vw,5.4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-cream">
            <MaskedLines baseDelay={0.45} lines={parseEmphasisLines(heading)} />
          </h1>

          <FadeIn delay={1}>
            <p className="mt-9 max-w-md text-[15px] leading-relaxed text-mist">
              {description}
            </p>
          </FadeIn>

          <FadeIn delay={1.15}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#work" className="btn-primary">
                {primaryBtn}
                <ArrowRight className="btn-arrow size-3.5" strokeWidth={2.5} />
              </a>
              <a href="#contact" className="btn-ghost">
                {secondaryBtn}
                <ArrowRight className="btn-arrow size-3.5" strokeWidth={2} />
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={1.35}>
            <div className="mt-14 hidden items-center gap-3 text-[10px] tracking-[0.3em] text-mist/70 md:flex">
              <ArrowDown className="size-3.5 animate-bounce text-aqua/70" strokeWidth={1.5} />
              SCROLL TO EXPLORE
            </div>
          </FadeIn>
        </div>

        {/* ── portrait ── */}
        <motion.div
          style={{ y: portraitY }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          <FadeIn delay={0.7} className="relative">
            <div className="relative">
              {/* frame lines */}
              <div className="absolute -top-4 -left-4 h-24 w-24 border-t border-l border-aqua/35" aria-hidden="true" />
              <div className="absolute -right-4 -bottom-4 h-24 w-24 border-r border-b border-aqua/35" aria-hidden="true" />

              <div className="relative overflow-hidden">
                <motion.div
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0 0)" }}
                  transition={{ duration: 1.4, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portraitUrl}
                    alt={`${name} — video editor and motion graphic designer`}
                    className="aspect-[4/5] w-full object-cover object-top saturate-[0.88]"
                    style={{ filter: "saturate(0.88) contrast(1.03)" }}
                  />
                </motion.div>
                {/* cinematic tone overlay */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-ink/15" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-midnight/25 via-transparent to-transparent mix-blend-multiply" aria-hidden="true" />
              </div>

              {/* caption */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.9 }}
                className="mt-4 flex items-baseline justify-between"
              >
                <span className="text-[11px] font-bold tracking-[0.28em] text-cream">{name}</span>
                <span className="text-[10px] tracking-[0.22em] text-mist">{location}</span>
              </motion.div>

              {/* availability badge */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.65, duration: 0.9 }}
                className="absolute -right-3 top-8 hidden items-center gap-2.5 border border-white/10 bg-surface/85 px-4 py-3 backdrop-blur-md md:flex lg:-right-8"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-aqua" />
                </span>
                <span className="text-[9.5px] font-semibold tracking-[0.24em] text-cream/90">
                  OPEN FOR PROJECTS
                </span>
              </motion.div>
            </div>
          </FadeIn>
        </motion.div>
      </div>
    </section>
  );
}
