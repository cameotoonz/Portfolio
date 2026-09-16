import type { ReactNode } from "react";

/** Renders inline **bold**, _italic_ and [links](url). */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-cream">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("_")) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-aqua underline underline-offset-4 transition-opacity hover:opacity-75"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Minimal block renderer: paragraphs, ## headings and - bullet lists. */
export default function ProseText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  if (!text?.trim()) return null;
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={key} className="my-4 flex list-none flex-col gap-2 pl-0">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-3 text-mist">
            <span className="mt-2 size-1 shrink-0 rotate-45 bg-aqua/70" aria-hidden="true" />
            <span>{inline(b, `${key}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  const flushParagraph = (key: string) => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={key} className="my-4 leading-[1.9] text-mist">
        {inline(paragraph.join(" "), key)}
      </p>,
    );
    paragraph = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushParagraph(`p-${idx}`);
      flushBullets(`u-${idx}`);
      blocks.push(
        <h3
          key={`h-${idx}`}
          className="mt-8 mb-3 text-[11px] font-bold tracking-[0.28em] text-cream"
        >
          {line.slice(3).toUpperCase()}
        </h3>,
      );
    } else if (line.startsWith("- ")) {
      flushParagraph(`p-${idx}`);
      bullets.push(line.slice(2));
    } else if (line === "") {
      flushParagraph(`p-${idx}`);
      flushBullets(`u-${idx}`);
    } else {
      flushBullets(`u-${idx}`);
      paragraph.push(line);
    }
  });
  flushParagraph("p-end");
  flushBullets("u-end");

  return <div className={className}>{blocks}</div>;
}
