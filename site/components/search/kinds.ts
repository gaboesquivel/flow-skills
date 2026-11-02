import type { ChunkKind } from "@/lib/content";

/** Human labels for search result kinds (client-safe: no content import). */
export const KIND_LABEL: Record<ChunkKind, string> = {
  article: "Article",
  capability: "Capability",
  decision: "Decision",
  doc: "Guide",
  skill: "Skill",
  starter: "Starter",
};

export const KIND_ORDER: ChunkKind[] = ["skill", "doc", "capability", "article", "decision", "starter"];

const norm = (s: string) => s.toLowerCase().replace(/^\d+[.\s—-]*/u, "").replace(/[^\p{L}\p{N}]+/gu, "");

/** A section heading worth showing next to its page title (not a restatement of it). */
export const distinctHeading = (title: string, heading: string | null) =>
  heading && !norm(title).includes(norm(heading)) ? heading : null;
