"use client";

import { cn } from "@/lib/cn";
import { openSearch } from "@/lib/events";
import { SUGGESTED_QUESTIONS } from "@/lib/site";

/** A search-field-shaped button that opens the ⌘K palette, with example questions. Not a second search box. */
export function PaletteLauncher({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line-strong bg-panel-raised/80 p-4 shadow-[0_30px_80px_-40px_rgb(167_139_250/0.35)] sm:p-5", className)}>
      <button
        type="button"
        onClick={() => openSearch()}
        aria-keyshortcuts="Meta+K Control+K"
        className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-line-strong bg-canvas-deep/60 px-4 text-left text-base text-fg-subtle hover:border-lavender/40 hover:text-fg-muted"
      >
        <span aria-hidden="true" className="text-lg text-violet">
          ⌕
        </span>
        <span className="min-w-0 flex-1 truncate">Search skills and docs, or ask a question</span>
        <kbd className="hidden rounded-md border border-line-strong px-1.5 py-0.5 font-sans text-xs sm:inline">⌘K</kbd>
      </button>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Example questions">
        {SUGGESTED_QUESTIONS.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => openSearch({ ask: true, query: q })}
              className="min-h-9 rounded-full border border-line-strong px-3.5 text-left text-xs text-fg-muted hover:border-lavender/50 hover:text-fg"
            >
              <span aria-hidden="true" className="text-violet">
                ✧{" "}
              </span>
              {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
