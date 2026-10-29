import type { ChunkKind } from "@/lib/content";

/** Human labels for search result kinds (client-safe: no content import). */
export const KIND_LABEL: Record<ChunkKind, string> = { decision: "Decision", doc: "Guide", skill: "Skill", starter: "Starter" };

export const KIND_ORDER: ChunkKind[] = ["skill", "doc", "decision", "starter"];

const norm = (s: string) => s.toLowerCase().replace(/^\d+[.\s—-]*/u, "").replace(/[^\p{L}\p{N}]+/gu, "");

/** A section heading worth showing next to its page title (not a restatement of it). */
export const distinctHeading = (title: string, heading: string | null) =>
  heading && !norm(title).includes(norm(heading)) ? heading : null;
