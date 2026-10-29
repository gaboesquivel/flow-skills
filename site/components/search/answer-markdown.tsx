import Link from "next/link";
import type { ReactNode } from "react";

import { distinctHeading } from "@/components/search/kinds";
import type { Citation } from "@/lib/ask";

/** Model output links only to site paths; anything else renders as text, so a prompt cannot plant outbound links. */
export const safeHref = (href: string) => {
  const h = href.trim();
  return /^\/(?!\/)[^\s]*$/u.test(h) ? h : null;
};

const INLINE = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\[(\d{1,2})\]|(?<![\p{L}\p{N}])_([^_]+)_(?![\p{L}\p{N}]))/gu;

const linkClass = "text-lavender underline decoration-lavender/40 underline-offset-2 hover:text-lavender-soft";

function renderInline(text: string, citations: Citation[], key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}-${i++}`;
    if (m[2] !== undefined) out.push(<strong key={k} className="font-semibold text-fg">{m[2]}</strong>);
    else if (m[3] !== undefined)
      out.push(
        <code key={k} className="rounded bg-panel-raised px-1.5 py-0.5 font-mono text-[0.88em] text-lavender-soft">
          {m[3]}
        </code>,
      );
    else if (m[4] !== undefined) {
      const href = safeHref(m[5] ?? "");
      out.push(
        href === null ? (
          m[4]
        ) : href.startsWith("/") ? (
          <Link key={k} href={href} className={linkClass}>
            {m[4]}
          </Link>
        ) : (
          <a key={k} href={href} rel="noopener noreferrer" className={linkClass}>
            {m[4]}
          </a>
        ),
      );
    } else if (m[6] !== undefined) {
      const c = citations.find((x) => x.n === Number(m[6]));
      out.push(
        c ? (
          <Link
            key={k}
            href={c.path}
            className="mx-0.5 inline-flex min-w-5 items-center justify-center rounded bg-lavender/15 px-1 align-[0.1em] font-mono text-[0.72em] font-semibold text-lavender no-underline hover:bg-lavender/30"
            aria-label={`Source ${c.n}: ${c.title}${distinctHeading(c.title, c.heading) ? `, ${c.heading}` : ""}`}
          >
            {c.n}
          </Link>
        ) : (
          m[0]
        ),
      );
    } else if (m[7] !== undefined) out.push(<em key={k}>{m[7]}</em>);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block = { type: "p"; text: string } | { type: "ul" | "ol"; items: string[] };

const parseBlocks = (markdown: string): Block[] => {
  const blocks: Block[] = [];
  for (const chunk of markdown.replace(/\r\n?/gu, "\n").split(/\n{2,}/u)) {
    const lines = chunk.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim());
    if (!lines.length) continue;
    let para: string[] = [];
    const flush = () => {
      if (para.length) blocks.push({ text: para.join(" ").replace(/^#{1,6}\s+/u, ""), type: "p" });
      para = [];
    };
    for (const line of lines) {
      const ul = /^\s*[-*+]\s+(.*)$/u.exec(line);
      const ol = /^\s*\d+[.)]\s+(.*)$/u.exec(line);
      const item = ul?.[1] ?? ol?.[1];
      if (item !== undefined) {
        flush();
        const type = ul ? "ul" : "ol";
        const prev = blocks.at(-1);
        if (prev && prev.type === type) prev.items.push(item);
        else blocks.push({ items: [item], type });
      } else {
        const prev = blocks.at(-1);
        // Continuation line of a list item.
        if (!para.length && prev && prev.type !== "p" && /^\s+/u.test(line)) prev.items[prev.items.length - 1] += ` ${line.trim()}`;
        else para.push(line.trim());
      }
    }
    flush();
  }
  return blocks;
};

/** Minimal, safe Markdown for model output: paragraphs, lists, bold, italics, inline code, safe links, [n] citations. */
export function AnswerMarkdown({ markdown, citations }: { markdown: string; citations: Citation[] }) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-fg-muted sm:text-[1.0625rem]">
      {parseBlocks(markdown).map((b, i) => {
        const key = `b${i}`;
        if (b.type === "p") return <p key={key}>{renderInline(b.text, citations, key)}</p>;
        const List = b.type;
        return (
          <List key={key} className={`space-y-2 pl-5 marker:text-violet ${b.type === "ul" ? "list-disc" : "list-decimal"}`}>
            {b.items.map((item, j) => (
              <li key={`${key}-${j}`}>{renderInline(item, citations, `${key}-${j}`)}</li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
