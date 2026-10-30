"use client";

import type { ReactNode } from "react";

import { openSearch } from "@/lib/events";

/** Opens the ⌘K palette and asks `question` there. */
export function AskButton({ question, className, children }: { question: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => openSearch({ ask: true, query: question })} className={className}>
      {children}
    </button>
  );
}
