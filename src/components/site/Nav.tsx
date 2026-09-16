"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

const LINKS = [
  { label: "WORK", href: "#work" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

export default function Nav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/5 bg-ink/75 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-400 items-center justify-between px-6 py-5 md:px-12 md:py-6">
          <a
            href="#top"
            className="text-[13px] font-bold tracking-[0.3em] text-cream transition-colors hover:text-aqua"
          >
            {name}
          </a>

          <div className="hidden items-center gap-12 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="group relative text-[11px] font-semibold tracking-[0.3em] text-mist transition-colors duration-300 hover:text-cream"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-aqua transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex size-10 items-center justify-center text-cream md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-100 flex flex-col bg-ink/97 backdrop-blur-2xl md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-[13px] font-bold tracking-[0.3em]">{name}</span>
              <button
                onClick={() => setOpen(false)}
                className="flex size-10 items-center justify-center text-cream"
                aria-label="Close menu"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2 px-8">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-center justify-between border-b border-white/8 py-6"
                >
                  <span className="font-serif text-4xl italic text-cream transition-colors group-hover:text-aqua">
                    {l.label.charAt(0) + l.label.slice(1).toLowerCase()}
                  </span>
                  <ArrowUpRight className="size-5 text-aqua opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-8 pb-10 text-[10px] tracking-[0.3em] text-mist"
            >
              VIDEO EDITOR · MOTION GRAPHIC DESIGNER
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
