/**
 * Art-direction fragments — abstract editing-timeline / keyframe / graph-editor
 * motifs rendered as fine-line SVG. Used at very low opacity behind content.
 */

export function TimelineFragment({
  className = "",
  opacity = 0.5,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 640 190"
      fill="none"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* ruler */}
      <line x1="0" y1="20" x2="640" y2="20" stroke="#9A9CA5" strokeOpacity="0.5" strokeWidth="0.75" />
      {Array.from({ length: 33 }).map((_, i) => (
        <line
          key={i}
          x1={i * 20}
          y1="14"
          x2={i * 20}
          y2={i % 4 === 0 ? 20 : 17}
          stroke="#9A9CA5"
          strokeOpacity="0.5"
          strokeWidth="0.75"
        />
      ))}
      {/* playhead */}
      <line x1="268" y1="6" x2="268" y2="184" stroke="#50CCD2" strokeOpacity="0.85" strokeWidth="1" />
      <path d="M262 6h12l-6 8z" fill="#50CCD2" fillOpacity="0.9" />
      {/* video track 1 */}
      <rect x="12" y="34" width="180" height="34" rx="2" stroke="#50CCD2" strokeOpacity="0.45" fill="#50CCD2" fillOpacity="0.05" />
      <rect x="196" y="34" width="128" height="34" rx="2" stroke="#50CCD2" strokeOpacity="0.45" fill="#50CCD2" fillOpacity="0.05" />
      <rect x="328" y="34" width="220" height="34" rx="2" stroke="#50CCD2" strokeOpacity="0.45" fill="#50CCD2" fillOpacity="0.05" />
      {/* video track 2 - b-roll */}
      <rect x="88" y="74" width="96" height="26" rx="2" stroke="#AA0158" strokeOpacity="0.4" fill="#AA0158" fillOpacity="0.05" />
      <rect x="338" y="74" width="140" height="26" rx="2" stroke="#AA0158" strokeOpacity="0.4" fill="#AA0158" fillOpacity="0.05" />
      {/* audio waveform */}
      {Array.from({ length: 64 }).map((_, i) => {
        const h = 4 + Math.abs(Math.sin(i * 1.7) * 14 + Math.sin(i * 0.6) * 8);
        return (
          <line
            key={i}
            x1={10 + i * 9.6}
            y1={132 - h / 2}
            x2={10 + i * 9.6}
            y2={132 + h / 2}
            stroke="#A8B79D"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        );
      })}
      {/* markers */}
      <line x1="120" y1="160" x2="620" y2="160" stroke="#9A9CA5" strokeOpacity="0.3" strokeWidth="0.75" />
      {[120, 268, 420, 560].map((x) => (
        <path key={x} d={`M${x} 154l5 6-5 6-5-6z`} fill="#02BACE" fillOpacity="0.7" />
      ))}
    </svg>
  );
}

export function GraphCurve({
  className = "",
  opacity = 0.5,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 420 300"
      fill="none"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* grid */}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 70} y1="0" x2={i * 70} y2="300" stroke="#9A9CA5" strokeOpacity="0.14" strokeWidth="0.75" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 60} x2="420" y2={i * 60} stroke="#9A9CA5" strokeOpacity="0.14" strokeWidth="0.75" />
      ))}
      {/* ease curve */}
      <path
        d="M10 260 C 120 260, 150 40, 240 40 S 390 200, 410 60"
        stroke="#50CCD2"
        strokeOpacity="0.85"
        strokeWidth="1.25"
      />
      {/* value curve */}
      <path
        d="M10 200 C 90 120, 170 250, 250 150 S 380 90, 410 150"
        stroke="#AA0158"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      {/* keyframes */}
      {[
        [10, 260], [240, 40], [410, 60],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 5} y={y - 5} width="10" height="10" transform={`rotate(45 ${x} ${y})`} fill="#08090D" stroke="#50CCD2" strokeOpacity="0.9" />
        </g>
      ))}
      {[[10, 200], [250, 150], [410, 150]].map(([x, y], i) => (
        <rect key={i} x={x - 4} y={y - 4} width="8" height="8" transform={`rotate(45 ${x} ${y})`} fill="#08090D" stroke="#AA0158" strokeOpacity="0.7" />
      ))}
      {/* bezier handles */}
      <line x1="10" y1="260" x2="120" y2="260" stroke="#50CCD2" strokeOpacity="0.35" strokeWidth="0.75" />
      <circle cx="120" cy="260" r="3" fill="#50CCD2" fillOpacity="0.5" />
      <line x1="240" y1="40" x2="150" y2="40" stroke="#50CCD2" strokeOpacity="0.35" strokeWidth="0.75" />
      <circle cx="150" cy="40" r="3" fill="#50CCD2" fillOpacity="0.5" />
    </svg>
  );
}

export function MaskPath({
  className = "",
  opacity = 0.5,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 360 260"
      fill="none"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <path
        d="M60 40 L200 20 L330 90 L280 210 L110 230 Z"
        stroke="#9A9CA5"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="1 6"
        strokeLinecap="round"
      />
      {[
        [60, 40], [200, 20], [330, 90], [280, 210], [110, 230],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 4.5} y={y - 4.5} width="9" height="9" fill="#08090D" stroke={i === 0 ? "#50CCD2" : "#9A9CA5"} strokeOpacity="0.8" />
          {i === 2 && (
            <>
              <line x1={x} y1={y} x2={x - 40} y2={y - 30} stroke="#50CCD2" strokeOpacity="0.4" strokeWidth="0.75" />
              <circle cx={x - 40} cy={y - 30} r="3" fill="#50CCD2" fillOpacity="0.5" />
            </>
          )}
        </g>
      ))}
      <text x="74" y="58" fill="#50CCD2" fillOpacity="0.7" fontSize="9" letterSpacing="2" fontFamily="monospace">
        MASK 01
      </text>
    </svg>
  );
}

export function KeyframeRow({
  className = "",
  opacity = 0.5,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg viewBox="0 0 500 46" fill="none" className={className} style={{ opacity }} aria-hidden="true">
      <line x1="0" y1="23" x2="500" y2="23" stroke="#9A9CA5" strokeOpacity="0.25" strokeWidth="0.75" />
      {[24, 96, 188, 260, 342, 428, 480].map((x, i) => (
        <rect
          key={i}
          x={x - 5}
          y="18"
          width="10"
          height="10"
          transform={`rotate(45 ${x} 23)`}
          fill={i === 3 ? "#50CCD2" : "#08090D"}
          stroke="#50CCD2"
          strokeOpacity={i === 3 ? 1 : 0.55}
        />
      ))}
    </svg>
  );
}

export function FilmStrip({
  className = "",
  opacity = 0.4,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg viewBox="0 0 220 640" fill="none" className={className} style={{ opacity }} aria-hidden="true">
      <rect x="0" y="0" width="220" height="640" stroke="#9A9CA5" strokeOpacity="0.2" strokeWidth="1" />
      {Array.from({ length: 14 }).map((_, i) => (
        <g key={i}>
          <rect x="12" y={16 + i * 45} width="10" height="22" stroke="#9A9CA5" strokeOpacity="0.35" strokeWidth="0.75" />
          <rect x="198" y={16 + i * 45} width="10" height="22" stroke="#9A9CA5" strokeOpacity="0.35" strokeWidth="0.75" />
        </g>
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <rect key={i} x="34" y={14 + i * 158} width="152" height={120} stroke="#9A9CA5" strokeOpacity="0.3" strokeWidth="0.75" fill="#F3F1EA" fillOpacity="0.015" />
      ))}
    </svg>
  );
}
