import type { ChunkKind } from "@/lib/content";

/** One /api/search result as the UI consumes it. */
export type SearchHit = {
  title: string;
  kind: ChunkKind;
  url: string;
  path: string;
  heading: string | null;
  excerpt: string;
  score: number;
};

export const searchUrl = (query: string, limit = 20) => `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
