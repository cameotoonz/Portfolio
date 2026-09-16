"use client";

import { Reveal, MaskedLines } from "./Reveal";
import { GraphCurve } from "./Fragments";

export default function About({
  heading,
  text,
  extra,
  location,
}: {
  heading: string;
  text: string;
  extra: string;
  location: string;
}) {
  // Split heading around the em-dash-ish structure for serif emphasis
  const parts = heading.split("—");
  const first = parts[0]?.trim() ?? heading;
  const second = parts[1]?.trim() ?? "";

  return (
    <section id="about" className="relative overflow-hidden py-28 md:py-44">
      <div
        className="pointer-events-none absolute right-[-6%] top-[10%] opacity-70"
        aria-hidden="true"
      >
        <GraphCurve className="w-105 rotate-[3deg] opacity-20" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-400 grid-cols-1 gap-12 px-6 md:px-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-aqua/70" aria-hidden="true" />
              ABOUT NITESH
            </p>
            <div className="mt-8 hidden lg:block">
              <div className="border-l border-white/10 pl-6">
                <p className="text-[10.5px] leading-loose tracking-[0.25em] text-mist/80">
                  BASED IN {location.toUpperCase()}
                  <br />
                  WORKING WORLDWIDE
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div>
          <h2 className="text-[clamp(1.85rem,3.6vw,3.3rem)] leading-[1.16] font-bold tracking-[-0.01em] text-cream">
            <MaskedLines
              lines={[
                <>{first}</>,
                ...(second
                  ? [
                      <>
                        <em className="display-serif text-aqua">{second}</em>
                      </>,
                    ]
                  : []),
              ]}
            />
          </h2>

          <Reveal delay={0.25} className="mt-10 max-w-2xl">
            <p className="text-[15px] leading-[1.9] text-mist">{text}</p>
          </Reveal>

          {extra && (
            <Reveal delay={0.32} className="mt-8 max-w-xl">
              <p className="border-l border-aqua/40 pl-5 text-[13.5px] leading-[1.85] text-cream/75">
                {extra}
              </p>
            </Reveal>
          )}

          <Reveal delay={0.4} className="mt-12">
            <div className="flex flex-wrap gap-x-14 gap-y-6 border-t border-white/8 pt-8 lg:hidden">
              <div>
                <p className="text-[9.5px] tracking-[0.3em] text-mist/70">LOCATION</p>
                <p className="mt-1.5 text-[12px] font-semibold tracking-[0.14em] text-cream">
                  {location}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
