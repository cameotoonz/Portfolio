export default function Marquee() {
  const items = [
    "EDITING",
    "MOTION GRAPHICS",
    "STORYTELLING",
    "SOUND DESIGN",
    "COLOR",
    "TYPOGRAPHY",
  ];
  const row = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden border-y border-white/6 bg-surface/40 py-5"
      aria-hidden="true"
    >
      <div className="marquee-track items-center gap-10 pr-10">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="text-[12px] font-semibold tracking-[0.42em] text-mist/80">
              {item}
            </span>
            <span className="size-1 rotate-45 bg-aqua/60" />
          </span>
        ))}
      </div>
    </div>
  );
}
