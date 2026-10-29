import { getDoc } from "@/lib/content";

const plain = (s: string) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replace(/\*\*|`/gu, "")
    .trim();

const section = (markdown: string, heading: string) => {
  const start = markdown.indexOf(`\n${heading}\n`);
  if (start === -1) return "";
  const rest = markdown.slice(start + heading.length + 2);
  const end = rest.search(/\n#{1,2} /u);
  return end === -1 ? rest : rest.slice(0, end);
};

/** PRODUCT.md "## Principles": numbered `**Title.** body` items. */
export function productPrinciples() {
  const md = getDoc("product")?.markdown ?? "";
  return [...section(md, "## Principles").matchAll(/^\d+\.\s+\*\*(.+?)\*\*\s*(.*)$/gmu)].map((m) => ({
    title: plain(m[1] ?? "").replace(/\.$/u, ""),
    body: plain(m[2] ?? ""),
  }));
}

/** README.md "How it works" path table: | Path | You say |. */
export function deliveryPaths() {
  const md = getDoc("get-started")?.markdown ?? "";
  const rows = section(md, "## How it works")
    .split("\n")
    .filter((l) => l.startsWith("|") && !/^\|\s*-/u.test(l));
  return rows.slice(1).flatMap((row) => {
    const [path, say] = row.split("|").slice(1, -1).map((c) => c.trim());
    return path && say ? [{ path, say: plain(say) }] : [];
  });
}
