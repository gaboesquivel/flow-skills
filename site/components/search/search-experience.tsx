"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { type SearchAskMode, SearchAskPanel } from "@/components/search-ask-panel";
import { AnswerMarkdown } from "@/components/search/answer-markdown";
import { KIND_LABEL, distinctHeading } from "@/components/search/kinds";
import { SearchResults } from "@/components/search/search-results";
import { type SearchHit, searchUrl } from "@/components/search/types";
import { ArrowUpRight } from "@/components/ui";
import type { AskMode, Citation } from "@/lib/ask";

type SearchState = { query: string; results: SearchHit[]; status: "idle" | "loading" | "ready" | "error" };

type AskState = {
  question: string;
  status: "idle" | "loading" | "streaming" | "done" | "stopped" | "error";
  answer: string;
  citations: Citation[];
  mode: AskMode | null;
  model: string | null;
  error?: { message: string; resolution?: string };
};

const IDLE_ASK: AskState = { answer: "", citations: [], mode: null, model: null, question: "", status: "idle" };
const DEBOUNCE_MS = 180;

const syncUrl = (query: string, mode: SearchAskMode) => {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (mode === "ask") params.set("mode", "ask");
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `/search?${qs}` : "/search");
};

const parseCitations = (header: string | null): Citation[] => {
  if (!header) return [];
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(header));
    return Array.isArray(parsed) ? (parsed as Citation[]) : [];
  } catch {
    return [];
  }
};

export function SearchExperience({
  initialQuery,
  initialMode,
  initialResults,
}: {
  initialQuery: string;
  initialMode: SearchAskMode;
  initialResults: SearchHit[];
}) {
  const [mode, setMode] = useState<SearchAskMode>(initialMode);
  const [search, setSearch] = useState<SearchState>({
    query: initialQuery,
    results: initialResults,
    status: initialQuery ? "ready" : "idle",
  });
  const [ask, setAsk] = useState<AskState>(IDLE_ASK);
  const [announcement, setAnnouncement] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  const askAbort = useRef<AbortController | null>(null);
  const stopped = useRef(false);

  const runSearch = useCallback(async (query: string) => {
    searchAbort.current?.abort();
    const q = query.trim();
    if (!q) {
      setSearch({ query: "", results: [], status: "idle" });
      return;
    }
    const ctrl = new AbortController();
    searchAbort.current = ctrl;
    setSearch((s) => ({ ...s, query: q, status: "loading" }));
    try {
      const res = await fetch(searchUrl(q), { signal: ctrl.signal });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { results: SearchHit[] };
      setSearch({ query: q, results: data.results, status: "ready" });
      setAnnouncement(data.results.length ? `${data.results.length} results for ${q}.` : `No results for ${q}.`);
    } catch {
      if (ctrl.signal.aborted) return;
      setSearch((s) => ({ ...s, status: "error" }));
      setAnnouncement("Search failed. Try again.");
    }
  }, []);

  const runAsk = useCallback(async (question: string) => {
    askAbort.current?.abort();
    const ctrl = new AbortController();
    askAbort.current = ctrl;
    stopped.current = false;
    setAsk({ ...IDLE_ASK, question, status: "loading" });
    setAnnouncement("Asking Flow. Looking up sources…");
    try {
      const res = await fetch("/api/ask?stream=1", {
        body: JSON.stringify({ question }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => null)) as { error?: string; resolution?: string } | null;
        setAsk((s) => ({
          ...s,
          error: { message: err?.error ?? `The request failed (${res.status}).`, resolution: err?.resolution },
          status: "error",
        }));
        setAnnouncement(`Ask failed. ${err?.error ?? ""}`);
        return;
      }
      const citations = parseCitations(res.headers.get("X-Flow-Citations"));
      const answerMode: AskMode = res.headers.get("X-Flow-Answer-Mode") === "generated" ? "generated" : "extractive";
      const model = res.headers.get("X-Flow-Model") || null;
      setAsk((s) => ({ ...s, citations, mode: answerMode, model, status: "streaming" }));
      setAnnouncement(`${citations.length} related sources found. Writing the answer…`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setAsk((s) => ({ ...s, answer }));
      }
      answer += decoder.decode();
      setAsk((s) => ({ ...s, answer, status: "done" }));
      setAnnouncement(
        `Answer ready${answerMode === "extractive" ? ", showing source passages" : ""}, with ${citations.length} sources.`,
      );
    } catch {
      if (ctrl.signal.aborted) {
        if (stopped.current) {
          setAsk((s) => ({ ...s, status: "stopped" }));
          setAnnouncement("Answer stopped.");
        }
        return;
      }
      setAsk((s) => ({ ...s, error: { message: "The connection was interrupted." }, status: "error" }));
      setAnnouncement("Ask failed. The connection was interrupted.");
    }
  }, []);

  useEffect(() => {
    if (initialMode === "ask" && initialQuery.trim()) void runAsk(initialQuery.trim());
    return () => {
      askAbort.current?.abort();
      searchAbort.current?.abort();
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [initialMode, initialQuery, runAsk]);

  const onQueryChange = (query: string, m: SearchAskMode) => {
    if (m !== "search") return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      syncUrl(query, "search");
      void runSearch(query);
    }, DEBOUNCE_MS);
  };

  const onSubmit = (query: string, m: SearchAskMode) => {
    if (debounce.current) clearTimeout(debounce.current);
    setMode(m);
    syncUrl(query, m);
    if (m === "ask") void runAsk(query);
    else void runSearch(query);
  };

  const onModeChange = (m: SearchAskMode, query: string) => {
    setMode(m);
    syncUrl(query, m);
    if (m === "search" && query.trim() && query.trim() !== search.query) void runSearch(query);
  };

  const stop = () => {
    stopped.current = true;
    askAbort.current?.abort();
  };

  return (
    <>
      <SearchAskPanel
        defaultMode={initialMode}
        defaultQuery={initialQuery}
        onSubmit={onSubmit}
        onQueryChange={onQueryChange}
        onModeChange={onModeChange}
        className="max-w-[62.5rem]"
      />
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className="mt-14 sm:mt-20">
        {mode === "ask" ? <AskView ask={ask} onStop={stop} onRetry={() => void runAsk(ask.question)} /> : <SearchView search={search} />}
      </div>
    </>
  );
}

function SearchView({ search }: { search: SearchState }) {
  if (search.status === "idle")
    return (
      <div className="card px-5 py-6 sm:px-6">
        <p className="text-fg-muted">Search skills, guides, decisions, and starters. Results update as you type.</p>
        <BrowseLinks />
      </div>
    );
  if (search.status === "error")
    return (
      <p className="card px-5 py-6 text-fg-muted sm:px-6" role="alert">
        Search is unavailable right now. Try again in a moment.
      </p>
    );
  const askHref = `/search?mode=ask&q=${encodeURIComponent(search.query)}`;
  return (
    <section aria-labelledby="results-heading" aria-busy={search.status === "loading"}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="results-heading" className="eyebrow">
          {search.results.length ? `${search.results.length} results` : "No results"}
          <span className="sr-only"> for {search.query}</span>
        </h2>
        <Link href={askHref} className="inline-flex items-center gap-1 text-sm font-semibold text-lavender hover:text-lavender-soft">
          Ask Flow about “{search.query}” <ArrowUpRight className="size-3" />
        </Link>
      </div>
      {search.results.length ? (
        <div className={search.status === "loading" ? "opacity-60 transition-opacity" : undefined}>
          <SearchResults results={search.results} query={search.query} />
        </div>
      ) : (
        <div className="card px-5 py-6 sm:px-6">
          <p className="text-fg-muted">
            Nothing matches “{search.query}”. Try fewer or different words, or ask a question instead.
          </p>
          <BrowseLinks />
        </div>
      )}
    </section>
  );
}

const BROWSE = [
  { href: "/skills", label: "Skills" },
  { href: "/methodology", label: "Methodology" },
  { href: "/starters", label: "Starters" },
  { href: "/docs", label: "Docs" },
];

function BrowseLinks() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Browse">
      {BROWSE.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="inline-flex min-h-6 items-center gap-1 text-sm font-semibold text-lavender hover:text-lavender-soft">
            {l.label} <ArrowUpRight className="size-3" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function AskView({ ask, onStop, onRetry }: { ask: AskState; onStop: () => void; onRetry: () => void }) {
  if (ask.status === "idle")
    return (
      <div className="card px-5 py-6 sm:px-6">
        <p className="text-fg-muted">
          Ask a question in your own words. Answers come only from Flow’s published sources, with every claim linked.
        </p>
      </div>
    );

  const busy = ask.status === "loading" || ask.status === "streaming";
  return (
    <div className="grid gap-12">
      <article className="card-prism px-5 py-7 sm:px-9 sm:py-9" aria-labelledby="answer-heading" aria-busy={busy}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label-mono flex items-center gap-2.5">
            <span aria-hidden="true" className="text-violet">
              ✧
            </span>
            {ask.mode === "generated"
              ? "Generated from Flow sources"
              : ask.mode === "extractive"
                ? "No model configured — showing the most relevant source passages"
                : "Looking up sources…"}
          </p>
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              className="min-h-9 rounded-lg border border-line-strong px-3 text-xs font-semibold text-fg-muted hover:border-lavender/50 hover:text-fg"
            >
              Stop
            </button>
          ) : null}
        </div>
        <h2 id="answer-heading" className="mt-4 text-2xl font-bold tracking-[-0.03em] text-fg [overflow-wrap:anywhere] sm:text-3xl">
          {ask.question}
        </h2>
        <div className="mt-5">
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
          {ask.status === "stopped" ? <p className="mt-4 text-sm text-fg-subtle">Stopped. The answer above is incomplete.</p> : null}
        </div>
        {ask.status !== "error" ? (
          <p className="mt-6 border-t border-line-strong pt-4 text-xs leading-relaxed text-fg-subtle">
            Answers can be wrong. Verify against the linked sources before acting on them.
            {ask.model ? <span className="font-mono"> · {ask.model}</span> : null}
          </p>
        ) : null}
      </article>

      {ask.citations.length ? (
        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="eyebrow mb-4">
            Related sources
          </h2>
          <ol className="grid gap-3">
            {ask.citations.map((c) => (
              <li key={c.n}>
                <Link href={c.path} className="card card-link group flex gap-4 px-5 py-5 sm:px-6">
                  <span className="label-mono mt-0.5 shrink-0 text-lavender" aria-hidden="true">
                    [{c.n}]
                  </span>
                  <span className="min-w-0">
                    <span className="label-mono block">{KIND_LABEL[c.kind]}</span>
                    <span className="mt-1.5 block text-lg font-semibold tracking-tight text-fg group-hover:text-lavender-soft [overflow-wrap:anywhere]">
                      <span className="sr-only">Source {c.n}: </span>
                      {c.title} <ArrowUpRight className="inline size-4 align-[-0.1em]" />
                    </span>
                    {distinctHeading(c.title, c.heading) ? <span className="mt-1 block text-sm text-fg-muted">{c.heading}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
