"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Highlight } from "@/components/search/highlight";
import { KIND_LABEL, distinctHeading } from "@/components/search/kinds";
import { type SearchHit, searchUrl } from "@/components/search/types";
import { OPEN_SEARCH_EVENT } from "@/lib/events";

const QUICK_LINKS = [
  { href: "/skills", label: "Skills", hint: "The portable skill catalog" },
  { href: "/methodology", label: "Methodology", hint: "How Flow works" },
  { href: "/starters", label: "Starters", hint: "flow-next and flow-mono" },
  { href: "/docs", label: "Docs", hint: "Guides and decisions" },
  { href: "/agents", label: "For agents", hint: "llms.txt, Markdown, search and ask APIs" },
];

type Option = { id: string; href: string; label: string; meta: string; hit?: SearchHit; ask?: boolean };

const DEBOUNCE_MS = 150;

/** Global ⌘K / Ctrl+K search palette. Idle until opened. */
export function CommandPalette() {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [active, setActive] = useState(0);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const show = useCallback((initial?: string) => {
    const el = dialog.current;
    if (!el || el.open) return;
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (initial !== undefined) {
      setQuery(initial);
      setActive(0);
    }
    setOpen(true);
    el.showModal();
    input.current?.select();
  }, []);

  const close = useCallback(() => dialog.current?.close(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) close();
        else show();
      }
    };
    const onOpen = (e: Event) => show((e as CustomEvent<{ query?: string } | undefined>).detail?.query);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, [show, close]);

  useEffect(() => {
    const q = query.trim();
    if (!open || !q) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(searchUrl(q, 8), { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        setResults(((await res.json()) as { results: SearchHit[] }).results);
        setStatus("ready");
      } catch {
        if (!ctrl.signal.aborted) setStatus("error");
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, open]);

  const q = query.trim();
  const options: Option[] = q
    ? [
        ...results.map((r) => ({
          hit: r,
          href: r.path,
          id: r.path,
          label: r.title,
          meta: KIND_LABEL[r.kind],
        })),
        { ask: true, href: `/search?mode=ask&q=${encodeURIComponent(q)}`, id: "ask", label: `Ask Flow about “${q}”`, meta: "Ask" },
        { href: `/search?q=${encodeURIComponent(q)}`, id: "all", label: `See all results for “${q}”`, meta: "Search" },
      ]
    : QUICK_LINKS.map((l) => ({ href: l.href, id: l.href, label: l.label, meta: l.hint }));

  const go = (o: Option | undefined) => {
    if (!o) return;
    close();
    router.push(o.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = options.length;
      setActive((i) => (e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n));
    } else if (e.key === "Home" && e.ctrlKey) setActive(0);
    else if (e.key === "End" && e.ctrlKey) setActive(options.length - 1);
    else if (e.key === "Enter") {
      e.preventDefault();
      go(options[Math.min(active, options.length - 1)]);
    }
  };

  useEffect(() => {
    if (open) document.getElementById(`${listId}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  const statusText =
    !q || !open
      ? ""
      : status === "loading"
        ? "Searching…"
        : status === "error"
          ? "Search failed."
          : status === "ready"
            ? `${results.length} results.`
            : "";

  return (
    <dialog
      ref={dialog}
      aria-label="Search Flow"
      onClose={() => {
        setOpen(false);
        restoreFocus.current?.focus();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      className="fixed inset-x-0 top-[8vh] mx-auto w-[calc(100%-2rem)] max-w-[40rem] overflow-hidden rounded-2xl border border-line-strong bg-panel-raised p-0 text-fg shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8)] backdrop:bg-canvas-deep/75 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[min(36rem,80dvh)] flex-col">
          <div className="flex items-center gap-3 border-b border-line-strong px-4 sm:px-5">
            <span aria-hidden="true" className="text-lg text-violet">
              ⌕
            </span>
            <input
              ref={input}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={options.length ? optionId(Math.min(active, options.length - 1)) : undefined}
              aria-label="Search Flow"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
                if (!e.target.value.trim()) {
                  setResults([]);
                  setStatus("idle");
                }
              }}
              onKeyDown={onKeyDown}
              placeholder="Search skills, guides, decisions…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="min-h-14 min-w-0 flex-1 bg-transparent text-base text-fg placeholder:text-fg-subtle focus:outline-none"
            />
            <button
              type="button"
              onClick={close}
              className="rounded-md border border-line-strong px-2 py-1 font-mono text-[0.7rem] text-fg-subtle hover:text-fg"
            >
              Esc<span className="sr-only"> to close</span>
            </button>
          </div>
          <p className="label-mono px-5 pb-1 pt-3" id={`${listId}-label`}>
            {q ? (status === "loading" && !results.length ? "Searching…" : "Results") : "Jump to"}
          </p>
          <ul id={listId} role="listbox" aria-labelledby={`${listId}-label`} className="overflow-y-auto px-2 pb-2">
            {options.map((o, i) => {
              const selected = i === Math.min(active, options.length - 1);
              return (
                <li
                  key={o.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={selected}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(o)}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 ${selected ? "bg-panel-hover ring-1 ring-lavender/40" : ""} ${o.ask || o.id === "all" ? "mt-1" : ""}`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className={`min-w-0 truncate font-semibold ${o.ask ? "text-lavender" : "text-fg"}`}>
                      {o.ask ? <span aria-hidden="true">✧ </span> : null}
                      {o.label}
                    </span>
                    <span className="label-mono shrink-0 max-sm:hidden">{o.meta}</span>
                  </div>
                  {o.hit ? (
                    <p className="mt-0.5 line-clamp-2 text-sm text-fg-muted [overflow-wrap:anywhere]">
                      {distinctHeading(o.hit.title, o.hit.heading) ? <span className="text-fg-subtle">{o.hit.heading} · </span> : null}
                      <Highlight text={o.hit.excerpt} query={q} />
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {q && status === "ready" && !results.length ? <p className="px-5 pb-3 text-sm text-fg-muted">No matches. Try asking instead.</p> : null}
          {status === "error" ? <p className="px-5 pb-3 text-sm text-fg-muted">Search is unavailable. Try again.</p> : null}
          <p className="hidden border-t border-line-strong px-5 py-2.5 text-xs text-fg-subtle sm:block" aria-hidden="true">
            ↑↓ to move · Enter to open · Esc to close
          </p>
          <p role="status" aria-live="polite" className="sr-only">
            {statusText}
          </p>
      </div>
    </dialog>
  );
}
