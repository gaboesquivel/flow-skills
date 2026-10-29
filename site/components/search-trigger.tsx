"use client";

import { cn } from "@/lib/cn";
import { OPEN_SEARCH_EVENT } from "@/lib/events";

export function SearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
      className={cn(
        "min-h-10 items-center gap-2 rounded-lg border border-line-strong bg-panel px-3.5 text-sm text-fg-muted hover:border-lavender/40 hover:text-fg",
        className,
      )}
      aria-keyshortcuts="Meta+K Control+K"
    >
      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3 3" strokeLinecap="round" />
      </svg>
      Search
      <kbd className="font-sans text-xs text-fg-subtle">⌘K</kbd>
    </button>
  );
}
