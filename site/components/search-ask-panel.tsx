"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { ArrowUpRight } from "@/components/ui";
import { cn } from "@/lib/cn";

export type SearchAskMode = "search" | "ask";

export const SUGGESTIONS = [
  { label: "Small bug?", query: "How do I fix a small bug with Flow?" },
  { label: "Product alignment", query: "How does Flow keep PRODUCT.md aligned?" },
  { label: "Choose a starter", query: "Should I start with flow-next or flow-mono?" },
] as const;

/**
 * Search + Ask entry panel. Submitting navigates to /search with the query and mode.
 * Used on Home, Docs hub, and (with live results) the /search page.
 */
export function SearchAskPanel({
  defaultMode = "search",
  defaultQuery = "",
  onSubmit,
  onQueryChange,
  onModeChange,
  className,
}: {
  defaultMode?: SearchAskMode;
  defaultQuery?: string;
  onSubmit?: (query: string, mode: SearchAskMode) => void;
  /** Called on every keystroke (live search). */
  onQueryChange?: (query: string, mode: SearchAskMode) => void;
  onModeChange?: (mode: SearchAskMode, query: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<SearchAskMode>(defaultMode);
  const [query, setQuery] = useState(defaultQuery);
  const inputId = useId();

  const submit = (q: string, m: SearchAskMode = mode) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    if (onSubmit) onSubmit(trimmed, m);
    else router.push(`/search?q=${encodeURIComponent(trimmed)}&mode=${m}`);
  };

  const tabs: { id: SearchAskMode; label: string }[] =
    defaultMode === "ask"
      ? [
          { id: "ask", label: "Ask Flow" },
          { id: "search", label: "Search" },
        ]
      : [
          { id: "search", label: "Search" },
          { id: "ask", label: "Ask Flow" },
        ];

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line-strong bg-panel-raised/80 shadow-[0_30px_80px_-40px_rgb(167_139_250/0.35)]", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line-strong px-4 py-3 sm:px-5">
        <div role="radiogroup" aria-label="Mode" className="flex gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={mode === t.id}
              onClick={() => {
                setMode(t.id);
                onModeChange?.(t.id, query);
              }}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium",
                mode === t.id ? "bg-[#3d3256] text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              <span aria-hidden="true">{t.id === "ask" ? "✧" : "⌕"}</span>
              {t.label}
            </button>
          ))}
        </div>
        <p className="label-mono hidden sm:block">One source · Two interfaces</p>
      </div>
      <form
        role="search"
        action="/search"
        method="get"
        className="px-4 pb-5 pt-5 sm:px-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-lg text-violet">
            {mode === "ask" ? "✧" : "⌕"}
          </span>
          <label htmlFor={inputId} className="sr-only">
            {mode === "ask" ? "Ask Flow a question" : "Search Flow"}
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            name="q"
            onChange={(e) => {
              setQuery(e.target.value);
              onQueryChange?.(e.target.value, mode);
            }}
            placeholder={mode === "ask" ? "How does Flow keep PRODUCT.md aligned?" : "Find skills, practices, or setup instructions…"}
            className="min-w-0 flex-1 bg-transparent py-2 text-base text-fg placeholder:text-fg-subtle focus:outline-none sm:text-lg"
            autoComplete="off"
            enterKeyHint={mode === "ask" ? "send" : "search"}
          />
          <input type="hidden" name="mode" value={mode} />
          <button type="submit" className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg bg-lavender-soft px-4 text-sm font-semibold text-ink hover:bg-lavender">
            {mode === "ask" ? "Ask" : "Search"} <ArrowUpRight />
          </button>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Suggested questions">
          {SUGGESTIONS.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => {
                  setQuery(s.query);
                  submit(s.query);
                }}
                className="min-h-9 rounded-full border border-line-strong px-3.5 text-xs text-fg-muted hover:border-lavender/50 hover:text-fg"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </form>
    </div>
  );
}
