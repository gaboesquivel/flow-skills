import MiniSearch from "minisearch";

import { type Chunk, type ChunkKind, chunks } from "@/lib/content";

export type SearchResult = {
  id: string;
  kind: ChunkKind;
  url: string;
  title: string;
  heading: string | null;
  excerpt: string;
  score: number;
};

const index = new MiniSearch<Chunk>({
  fields: ["title", "heading", "text"],
  storeFields: ["kind", "url", "title", "heading", "text"],
  searchOptions: {
    boost: { title: 4, heading: 2 },
    combineWith: "OR",
    fuzzy: (term) => (term.length > 4 ? 0.2 : false),
    prefix: (term) => term.length > 2,
  },
});
index.addAll(chunks);

type Hit = Chunk & { score: number; terms: string[] };

const rank = (hits: Hit[]) =>
  hits.map((r) => ({ ...r, score: r.score * KIND_WEIGHT[r.kind] })).sort((a, b) => b.score - a.score);

const KIND_WEIGHT: Record<ChunkKind, number> = { decision: 0.8, doc: 1, skill: 1.15, starter: 0.95 };

const excerptFor = (text: string, terms: string[], length = 220) => {
  const lower = text.toLowerCase();
  const hit = terms.map((t) => lower.indexOf(t.toLowerCase())).filter((i) => i >= 0).sort((a, b) => a - b)[0];
  const start = hit === undefined ? 0 : Math.max(0, hit - 60);
  const slice = text.slice(start, start + length).trim();
  return `${start > 0 ? "…" : ""}${slice}${start + length < text.length ? "…" : ""}`;
};

export type SearchOptions = { limit?: number; kinds?: ChunkKind[]; dedupePages?: boolean };

/** Lexical search over every published source section. No model or network required. */
export const search = (query: string, { limit = 10, kinds, dedupePages = true }: SearchOptions = {}) => {
  const q = query.trim().slice(0, 200);
  if (!q) return [];
  const ranked = rank(
    index.search(q, kinds ? { filter: (r) => kinds.includes(r.kind as ChunkKind) } : undefined) as unknown as Hit[],
  );
  const results: SearchResult[] = [];
  const seenPages = new Set<string>();
  for (const r of ranked) {
    const page = r.url.split("#")[0] ?? r.url;
    if (dedupePages && seenPages.has(page)) continue;
    seenPages.add(page);
    results.push({
      excerpt: excerptFor(r.text, r.terms),
      heading: r.heading,
      id: r.id,
      kind: r.kind,
      score: Math.round(r.score * 100) / 100,
      title: r.title,
      url: r.url,
    });
    if (results.length >= limit) break;
  }
  return results;
};

/** Full text of the best-matching sections, for grounding Ask. */
export const retrieve = (query: string, limit = 8) => {
  const q = query.trim().slice(0, 500);
  if (!q) return [];
  return rank(index.search(q) as unknown as Hit[])
    .slice(0, limit)
    .map(({ heading, kind, text, title, url }) => ({ heading, kind, text, title, url }));
};
