"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ExternalLink,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { ProjectDTO } from "@/lib/data";
import { parseVideoUrl, platformLabel } from "@/lib/video";

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/* ───────────────────── custom native player ───────────────────── */
function NativePlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pokeControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 2600);
  }, []);

  useEffect(() => {
    pokeControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pokeControls]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => setError(true));
    } else v.pause();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = (Number(e.target.value) / 100) * duration;
    v.currentTime = t;
    setProgress(Number(e.target.value));
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    const vol = Number(e.target.value) / 100;
    setVolume(vol);
    setMuted(vol === 0);
    if (v) {
      v.volume = vol;
      v.muted = vol === 0;
    }
  };

  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  if (error) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-5 bg-surface text-center">
        <p className="text-[12px] tracking-[0.2em] text-mist">
          THIS VIDEO COULDN&apos;T BE LOADED
        </p>
        <button
          onClick={() => {
            setError(false);
            setLoading(true);
            videoRef.current?.load();
          }}
          className="btn-ghost"
        >
          <RotateCcw className="size-3.5" strokeWidth={2} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="group/player relative w-full bg-black"
      onMouseMove={pokeControls}
      onTouchStart={pokeControls}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        className="max-h-[74svh] w-full object-contain"
        playsInline
        autoPlay
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setLoading(false);
        }}
        onTimeUpdate={(e) =>
          setProgress((e.currentTarget.currentTime / (duration || 1)) * 100)
        }
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => setError(true)}
      />

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-aqua" strokeWidth={1.5} />
        </div>
      )}

      {/* center play toggle when paused */}
      {!playing && !loading && (
        <button
          onClick={toggle}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Play video"
        >
          <span className="flex size-16 items-center justify-center rounded-full border border-aqua/40 bg-ink/60 backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <Play className="ml-1 size-6 text-aqua" fill="currentColor" strokeWidth={0} />
          </span>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent px-4 pt-10 pb-3 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={seek}
          className="lux-range w-full"
          aria-label="Seek"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="text-cream transition-colors hover:text-aqua">
              {playing ? <Pause className="size-4.5" strokeWidth={1.75} /> : <Play className="size-4.5" strokeWidth={1.75} />}
            </button>
            <button
              onClick={() => {
                const v = videoRef.current;
                const m = !muted;
                setMuted(m);
                if (v) v.muted = m;
              }}
              aria-label={muted ? "Unmute" : "Mute"}
              className="text-cream transition-colors hover:text-aqua"
            >
              {muted ? <VolumeX className="size-4.5" strokeWidth={1.75} /> : <Volume2 className="size-4.5" strokeWidth={1.75} />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume * 100}
              onChange={changeVolume}
              className="lux-range hidden w-20 sm:block"
              aria-label="Volume"
            />
            <span className="text-[10.5px] tracking-[0.12em] text-cream/70 tabular-nums">
              {formatTime((progress / 100) * duration)} / {formatTime(duration)}
            </span>
          </div>
          <button onClick={fullscreen} aria-label="Fullscreen" className="text-cream transition-colors hover:text-aqua">
            <Maximize className="size-4.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── modal shell ───────────────────── */
export default function VideoModal({
  project,
  onClose,
}: {
  project: ProjectDTO | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = project ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  const src =
    project?.videoSourceType === "upload"
      ? project.uploadedVideo || project.videoUrl
      : project?.videoUrl ?? "";
  const parsed = project ? parseVideoUrl(src) : null;
  const isNative = parsed?.platform === "upload";
  const vertical = project?.orientation === "vertical";

  return (
    <AnimatePresence>
      {project && parsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-ink/92 p-4 backdrop-blur-xl md:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Now playing: ${project.title}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 44, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={`my-auto w-full ${vertical ? "max-w-105" : "max-w-5xl"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="mb-3 flex items-start justify-between gap-6">
              <div>
                <p className="text-[9.5px] font-semibold tracking-[0.3em] text-aqua">
                  {project.category === "long" ? "LONG FORM" : "SHORT FORM"} ·{" "}
                  {platformLabel(parsed.platform).toUpperCase()}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-cream md:text-2xl">
                  {project.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="flex size-10 shrink-0 items-center justify-center border border-white/12 text-cream transition-all hover:border-aqua/60 hover:text-aqua"
                aria-label="Close player"
              >
                <X className="size-4.5" strokeWidth={1.5} />
              </button>
            </div>

            {/* player */}
            <div className="relative border border-white/10 bg-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
              {isNative ? (
                <NativePlayer src={src} poster={project.thumbnailUrl} />
              ) : parsed.embeddable && parsed.embedUrl ? (
                <div className={`${vertical ? "aspect-[9/16] max-h-[74svh] mx-auto" : "aspect-video"} w-full bg-black`}>
                  <iframe
                    src={parsed.embedUrl}
                    title={project.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : (
                <div
                  className="relative flex aspect-video w-full flex-col items-center justify-center gap-6 bg-cover bg-center"
                  style={{
                    backgroundImage: project.thumbnailUrl
                      ? `url(${project.thumbnailUrl})`
                      : undefined,
                  }}
                >
                  <div className="absolute inset-0 bg-ink/80" aria-hidden="true" />
                  <p className="relative z-10 text-[11px] tracking-[0.28em] text-mist">
                    THIS PLATFORM DOESN&apos;T ALLOW EMBEDDING
                  </p>
                  <a
                    href={parsed.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary relative z-10"
                  >
                    Watch on platform
                    <ExternalLink className="size-3.5" strokeWidth={2} />
                  </a>
                </div>
              )}
            </div>

            {/* meta */}
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-[11px] tracking-[0.16em] text-mist">
              {project.client && (
                <span>
                  <span className="text-mist/60">CLIENT — </span>
                  {project.client}
                </span>
              )}
              {project.year && (
                <span>
                  <span className="text-mist/60">YEAR — </span>
                  {project.year}
                </span>
              )}
              {project.tools && (
                <span>
                  <span className="text-mist/60">TOOLS — </span>
                  {project.tools}
                </span>
              )}
              {!isNative && parsed.embeddable && (
                <a
                  href={parsed.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group ml-auto inline-flex items-center gap-1.5 text-aqua/90 transition-colors hover:text-aqua"
                >
                  OPEN ON {platformLabel(parsed.platform).toUpperCase()}
                  <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </a>
              )}
            </div>
            {project.description && (
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-mist/90">
                {project.description}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
