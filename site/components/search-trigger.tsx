"use client";

import { cn } from "@/lib/cn";
import { openSearch } from "@/lib/events";

/** Header control that opens the ⌘K palette. The label hides on narrow screens. */
export function SearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      className={cn(
        "inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-line-strong bg-panel px-2.5 text-sm text-fg-muted hover:border-lavender/40 hover:text-fg sm:px-3.5",
        className,
      )}
      aria-keyshortcuts="Meta+K Control+K"
    >
      <svg viewBox="0 0 16 16" className="size-4 sm:size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3 3" strokeLinecap="round" />
      </svg>
      <span className="max-sm:sr-only">Search or ask</span>
      <kbd className="hidden font-sans text-xs text-fg-subtle md:inline">⌘K</kbd>
    </button>
  );
}
