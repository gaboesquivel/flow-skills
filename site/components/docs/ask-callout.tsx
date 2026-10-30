"use client";

import { cn } from "@/lib/cn";
import { openSearch } from "@/lib/events";

/** Opens the palette with a question about the current document. */
export function AskCallout({ title, label, className }: { title: string; label: "guide" | "decision"; className?: string }) {
  const question = label === "decision" ? `What did the decision "${title}" decide, and why?` : `What are the key points of the "${title}" guide?`;
  return (
    <aside aria-labelledby="ask-callout-heading" className={cn("card-prism flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8", className)}>
      <div>
        <h2 id="ask-callout-heading" className="text-xl font-bold tracking-[-0.04em] text-fg">
          Questions about this {label}?
        </h2>
        <p className="mt-2 text-sm text-fg-muted">Answers cite the guides and decisions they draw on.</p>
      </div>
      <button
        type="button"
        onClick={() => openSearch({ ask: true, query: question })}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-line-strong px-5 text-sm font-semibold text-fg hover:border-lavender/50"
      >
        <span aria-hidden="true" className="text-violet">
          ✧
        </span>
        Ask about it
      </button>
    </aside>
  );
}
