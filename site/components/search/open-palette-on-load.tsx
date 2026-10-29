"use client";

import { useEffect } from "react";

import { openSearch } from "@/lib/events";

/** Old `/search?mode=ask` links: open the palette and answer the question there. */
export function OpenPaletteOnLoad({ query }: { query: string }) {
  useEffect(() => {
    // The palette mounts in the root layout; wait a tick so its listener is attached.
    const t = setTimeout(() => openSearch({ ask: Boolean(query), query }), 0);
    return () => clearTimeout(t);
  }, [query]);
  return null;
}
