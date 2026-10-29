"use client";

import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/cn";

import type { DecisionStatus } from "./doc-meta";
import { StatusBadge } from "./status-badge";

export type DecisionItem = { href: string; number: string; title: string; status: DecisionStatus; description: string };

/** Decision list with a status filter. Renders the full list on the server; filtering is client-side. */
export function DecisionList({ items, statuses }: { items: DecisionItem[]; statuses: DecisionStatus[] }) {
  const [filter, setFilter] = useState<DecisionStatus | "All">("All");
  const shown = filter === "All" ? items : items.filter((d) => d.status === filter);
  const options: (DecisionStatus | "All")[] = ["All", ...statuses];
  return (
    <div>
      <fieldset className="flex min-w-0 flex-wrap gap-2">
        <legend className="sr-only">Filter by status</legend>
        {options.map((option) => {
          const count = option === "All" ? items.length : items.filter((d) => d.status === option).length;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                filter === option ? "border-lavender/60 bg-panel-raised text-fg" : "border-line-strong text-fg-muted hover:border-lavender/40 hover:text-fg",
              )}
            >
              {option}
              <span className="font-mono text-xs text-fg-subtle">{count}</span>
            </button>
          );
        })}
      </fieldset>
      <p aria-live="polite" className="sr-only">
        {shown.length} decisions shown
      </p>
      <ul className="mt-8 border-t border-line">
        {shown.map((d) => (
          <li key={d.href} className="border-b border-line">
            <Link href={d.href} className="group -mx-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2 rounded-lg px-3 py-6 transition-colors hover:bg-panel sm:grid-cols-[4rem_minmax(0,1fr)_auto]">
              <span className="font-mono text-sm text-fg-subtle sm:pt-1">{d.number}</span>
              <span className="col-span-2 min-w-0 sm:col-span-1">
                <span className="block text-lg font-semibold tracking-[-0.02em] text-fg group-hover:text-lavender-soft">{d.title}</span>
                <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-fg-muted">{d.description}</span>
              </span>
              <span className="col-start-2 row-start-1 justify-self-end sm:col-start-3 sm:pt-1">
                <StatusBadge status={d.status} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
