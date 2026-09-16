import type { ReactNode } from "react";

/**
 * Parses admin-editable text into editorial lines.
 * Newlines split lines; *asterisks* mark serif-italic emphasis spans.
 */
export function parseEmphasisLines(raw: string): ReactNode[] {
  const text = raw?.trim() || "";
  if (!text) return [];
  return text.split("\n").map((line, li) => {
    const parts = line.split(/\*([^*]+)\*/g);
    return (
      <span key={li}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <em key={i} className="display-serif text-aqua">
              {part}
            </em>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </span>
    );
  });
}
