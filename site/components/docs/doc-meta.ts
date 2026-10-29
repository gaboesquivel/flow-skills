import { decisions, guides, type Doc, type Heading } from "@/lib/content";

export const STATUSES = ["Accepted", "Proposed", "Amended", "Superseded", "Deprecated", "Rejected", "Withdrawn", "Unknown"] as const;
export type DecisionStatus = (typeof STATUSES)[number];

type Frontmatter = Record<string, string>;

/** Leading YAML front matter that the content build did not strip (some older decisions). */
const frontmatterOf = (doc: Doc): Frontmatter | null => {
  const match = doc.markdown.match(/^---\n([\s\S]*?)\n---\n/u);
  if (!match?.[1]) return null;
  return Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.match(/^([\w-]+):\s*(.*)$/u))
      .filter((m): m is RegExpMatchArray => Boolean(m))
      .map((m) => [m[1] ?? "", (m[2] ?? "").trim()]),
  );
};

const normalizeStatus = (raw: string | undefined): DecisionStatus => {
  const word = raw?.trim().split(/\s/u)[0]?.toLowerCase() ?? "";
  return STATUSES.find((s) => s.toLowerCase() === word) ?? "Unknown";
};

export const decisionStatus = (doc: Doc): DecisionStatus => {
  const fromFront = frontmatterOf(doc)?.status;
  if (fromFront) return normalizeStatus(fromFront);
  if (doc.status && doc.status !== "Unknown") return normalizeStatus(doc.status);
  return normalizeStatus(doc.markdown.match(/^Status:\s*\**([A-Za-z]+)/mu)?.[1]);
};

/** Decision metadata from front matter (date, replacement) when the build left it in place. */
export const decisionMeta = (doc: Doc) => {
  const fm = frontmatterOf(doc);
  const supersededBy = fm?.superseded_by?.replace(/\.md$/u, "");
  return { date: fm?.date || undefined, supersededBy: supersededBy || undefined };
};

/** Display title without a leading "0003. " number prefix. */
export const displayTitle = (doc: Doc) => doc.title.replace(/^\d{4}\.\s*/u, "");

const frontmatterHeading = /^<hr>\s*<h2 id="(status-[^"]*)"[\s\S]*?<\/h2>\s*/u;

/** Rendered body with any leaked front-matter block removed. */
export const docBody = (doc: Doc) => doc.html.replace(frontmatterHeading, "");

export const docHeadings = (doc: Doc): Heading[] => {
  const leaked = doc.html.match(frontmatterHeading)?.[1];
  return doc.headings.filter((h) => h.depth === 2 && h.id !== leaked);
};

/** Decisions sorted by number, newest first. */
export const decisionsNewestFirst = () => [...decisions].sort((a, b) => Number(b.number) - Number(a.number));

export const docHref = (doc: Doc) => `/docs/${doc.slug}`;

/** Previous and next documents within the same section (guides in curated order, decisions by number). */
export const neighbours = (doc: Doc) => {
  const list = doc.section === "decision" ? [...decisions].sort((a, b) => Number(a.number) - Number(b.number)) : guides;
  const i = list.findIndex((d) => d.slug === doc.slug);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 ? list[i + 1] : undefined };
};

/** Splits a title so the last word or two carry the gradient accent. */
export const splitTitle = (title: string) => {
  const words = title.trim().split(/\s+/u);
  if (words.length === 1) return { lead: undefined, accent: title };
  const take = words.length >= 4 ? 2 : 1;
  return { lead: words.slice(0, -take).join(" "), accent: words.slice(-take).join(" ") };
};
