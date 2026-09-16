"use client";

import { Reveal } from "./Reveal";

export default function Stats({ projectsCount }: { projectsCount: number }) {
  const padded = String(Math.max(projectsCount, 1)).padStart(2, "0");
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-400 px-6 md:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          <Reveal>
            <div className="border-l border-white/10 pl-6">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-mist/75">PROJECTS</p>
              <p className="mt-4 text-[clamp(2.6rem,5vw,4.2rem)] font-extrabold leading-none tracking-[-0.02em] text-cream">
                {padded}
                <span className="display-serif ml-1 text-[0.55em] text-aqua">+</span>
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="border-l border-white/10 pl-6">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-mist/75">FORMATS</p>
              <p className="mt-4 text-[clamp(1.15rem,2vw,1.5rem)] font-bold leading-tight text-cream">
                SHORT · LONG
                <br />
                <em className="display-serif text-aqua">· social</em>
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="border-l border-white/10 pl-6">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-mist/75">SPECIALTY</p>
              <p className="mt-4 text-[clamp(1.15rem,2vw,1.5rem)] font-bold leading-tight text-cream">
                EDITING <em className="display-serif text-aqua">+</em> MOTION
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
