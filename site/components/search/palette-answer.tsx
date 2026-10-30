"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { AnswerMarkdown } from "@/components/search/answer-markdown";
import { KIND_LABEL, distinctHeading } from "@/components/search/kinds";
import type { AskState } from "@/components/search/use-ask";

/** The palette's answer view: a cited answer, its sources, and stop/retry. */
export function PaletteAnswer({
  ask,
  onBack,
  onStop,
  onRetry,
  onNavigate,
}: {
  ask: AskState;
  onBack: () => void;
  onStop: () => void;
  onRetry: () => void;
  /** A source link was followed; same-page anchors don't change the route, so close explicitly. */
  onNavigate: () => void;
}) {
  const busy = ask.status === "loading" || ask.status === "streaming";
  const back = useRef<HTMLButtonElement>(null);
  // Stop unmounts when streaming ends; don't leave focus on <body>.
  useEffect(() => {
    if (!busy && document.activeElement === document.body) back.current?.focus();
  }, [busy]);
  return (
    <div className="overflow-y-auto px-5 pb-5 pt-4" aria-busy={busy} onClickCapture={(e) => (e.target as Element).closest("a[href]") && onNavigate()}>
      <div className="flex items-center justify-between gap-3">
        <button ref={back} type="button" onClick={onBack} className="label-mono rounded-md hover:text-fg">
          ← Results
        </button>
        {busy ? (
          <button
            type="button"
            onClick={onStop}
            className="min-h-8 rounded-lg border border-line-strong px-3 text-xs font-semibold text-fg-muted hover:border-lavender/50 hover:text-fg"
          >
            Stop
          </button>
        ) : null}
      </div>
      <h2 className="mt-4 text-xl font-bold tracking-[-0.03em] text-fg [overflow-wrap:anywhere]">{ask.question}</h2>
      <p className="label-mono mt-2">
        {ask.mode === "generated"
          ? "Answer from Flow sources"
          : ask.mode === "extractive"
            ? ask.citations.length
              ? "Matching passages from Flow sources"
              : "No matching sources"
            : "Looking up sources…"}
      </p>
      <div className="mt-4 text-[0.95rem]">
        {ask.status === "error" ? (
          <div role="alert">
            <p className="text-fg-muted">{ask.error?.message}</p>
            {ask.error?.resolution ? <p className="mt-1 text-sm text-fg-subtle">{ask.error.resolution}</p> : null}
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-lavender-soft px-4 text-sm font-semibold text-ink hover:bg-lavender"
            >
              Try again
            </button>
          </div>
        ) : ask.answer ? (
          <AnswerMarkdown markdown={ask.answer} citations={ask.citations} />
        ) : (
          <div className="space-y-3" aria-hidden="true">
            <div className="h-4 w-11/12 animate-pulse rounded bg-panel-hover" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-panel-hover" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-panel-hover" />
          </div>
        )}
        {ask.status === "stopped" ? <p className="mt-4 text-sm text-fg-subtle">Stopped. The answer is incomplete.</p> : null}
      </div>
      {ask.citations.length ? (
        <section aria-label="Sources" className="mt-6">
          <p className="label-mono mb-2">Sources</p>
          <ol className="grid gap-1">
            {ask.citations.map((c) => (
              <li key={c.n}>
                <Link href={c.path} className="flex gap-3 rounded-lg px-2 py-2 hover:bg-panel-hover">
                  <span className="font-mono text-xs text-lavender" aria-hidden="true">
                    [{c.n}]
                  </span>
                  <span className="min-w-0 text-sm">
                    <span className="sr-only">Source {c.n}: </span>
                    <span className="font-semibold text-fg">{c.title}</span>
                    {distinctHeading(c.title, c.heading) ? <span className="text-fg-subtle"> · {c.heading}</span> : null}
                    <span className="text-fg-subtle"> · {KIND_LABEL[c.kind]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {ask.status === "done" || ask.status === "stopped" ? (
        <p className="mt-5 border-t border-line-strong pt-3 text-xs text-fg-subtle">
          Answers can be wrong. Check the sources before you act on them.
          {ask.model ? <span className="font-mono"> · {ask.model}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
