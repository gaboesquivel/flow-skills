import type { ReactNode } from "react";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

/** Wraps query terms (3+ characters, prefix match) in <mark>. */
export function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const terms = [...new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 2))];
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.map(escape).join("|")})`, "giu");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={`${i}-${part}`} className="rounded-sm bg-lavender/20 px-0.5 text-fg">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
