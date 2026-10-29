"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Highlight } from "@/components/search/highlight";
import { KIND_LABEL, distinctHeading } from "@/components/search/kinds";
import { PaletteAnswer } from "@/components/search/palette-answer";
import { type SearchHit, searchUrl } from "@/components/search/types";
import { useAsk } from "@/components/search/use-ask";
import { OPEN_SEARCH_EVENT, type OpenSearchDetail } from "@/lib/events";
import { SUGGESTED_QUESTIONS } from "@/lib/site";

const QUICK_LINKS = [
  { href: "/skills", label: "Skills", hint: "Find a skill by name or phrase" },
  { href: "/methodology", label: "Methodology", hint: "How Flow works" },
  { href: "/starters", label: "Starters", hint: "flow-next and flow-mono" },
  { href: "/docs", label: "Docs", hint: "Guides and decisions" },
  { href: "/agents", label: "For agents", hint: "llms.txt, Markdown, APIs, MCP" },
];

type Option = { id: string; label: string; meta: string; href?: string; hit?: SearchHit; question?: string };

const DEBOUNCE_MS = 150;

/** A query that reads as a question puts Ask first; a keyword query puts pages first. */
const looksLikeQuestion = (q: string) => q.endsWith("?") || q.split(/\s+/u).length >= 4;

/** Global ⌘K / Ctrl+K palette: search Flow's sources, or ask and get a cited answer. Idle until opened. */
export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "answer">("list");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const { ask, run, stop, reset } = useAsk(setAnnouncement);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const askQuestion = useCallback(
    (question: string) => {
      const q = question.trim();
      if (!q) return;
      setView("answer");
      void run(q);
    },
    [run],
  );

  const show = useCallback(
    (detail?: OpenSearchDetail) => {
      const el = dialog.current;
      if (!el) return;
      if (!el.open) {
        restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setOpen(true);
        el.showModal();
      }
      if (detail?.query !== undefined) {
        setQuery(detail.query);
        setActive(0);
      }
      if (detail?.ask && detail.query) askQuestion(detail.query);
      else {
        setView("list");
        input.current?.select();
      }
    },
    [askQuestion],
  );

  const close = useCallback(() => dialog.current?.close(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) close();
        else show();
      }
    };
    const onOpen = (e: Event) => show((e as CustomEvent<OpenSearchDetail | undefined>).detail);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, [show, close]);

  // A citation or result link navigated: the palette's job is done.
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  useEffect(() => {
    const q = query.trim();
    if (!open || !q) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(searchUrl(q, 10), { signal: ctrl.signal });
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
  const askOption: Option = { id: "ask", label: `Ask: ${q}`, meta: "⌘↵", question: q };
  const hits: Option[] = results.map((r) => ({ hit: r, href: r.path, id: r.path, label: r.title, meta: KIND_LABEL[r.kind] }));
  const options: Option[] = q
    ? looksLikeQuestion(q)
      ? [askOption, ...hits]
      : [...hits, askOption]
    : [
        ...QUICK_LINKS.map((l) => ({ href: l.href, id: l.href, label: l.label, meta: l.hint })),
        ...SUGGESTED_QUESTIONS.map((s) => ({ id: `ask:${s}`, label: s, meta: "Ask", question: s })),
      ];

  const pick = (o: Option | undefined) => {
    if (!o) return;
    if (o.question) askQuestion(o.question);
    else if (o.href) {
      close();
      router.push(o.href);
    }
  };

  const backToList = () => {
    reset();
    setView("list");
    input.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      askQuestion(q);
    } else if (view === "answer") {
      return;
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = options.length;
      setActive((i) => (e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n));
    } else if (e.key === "Home" && e.ctrlKey) setActive(0);
    else if (e.key === "End" && e.ctrlKey) setActive(options.length - 1);
    else if (e.key === "Enter") {
      e.preventDefault();
      // Keyword results are still arriving: don't let Enter fall through to Ask.
      if (q && !looksLikeQuestion(q) && status !== "ready" && status !== "error") return;
      pick(options[Math.min(active, options.length - 1)]);
    }
  };

  useEffect(() => {
    if (open && view === "list") document.getElementById(`${listId}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, view, listId]);

  const searchStatus =
    !q || !open || view === "answer"
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
      aria-label="Search and ask Flow"
      onCancel={(e) => {
        // Esc steps back from an answer before it closes the palette.
        if (view === "answer") {
          e.preventDefault();
          backToList();
        }
      }}
      onClose={() => {
        setOpen(false);
        stop();
        setView("list");
        restoreFocus.current?.focus();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      className="fixed inset-x-0 top-[8vh] mx-auto w-[calc(100%-2rem)] max-w-[40rem] overflow-hidden rounded-2xl border border-line-strong bg-panel-raised p-0 text-fg shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8)] backdrop:bg-canvas-deep/75 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[min(40rem,84dvh)] flex-col">
        <div className="flex items-center gap-3 border-b border-line-strong px-4 sm:px-5">
          <span aria-hidden="true" className="text-lg text-violet">
            {view === "answer" ? "✧" : "⌕"}
          </span>
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded={view === "list"}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={view === "list" && options.length ? optionId(Math.min(active, options.length - 1)) : undefined}
            aria-label="Search or ask Flow"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              if (view === "answer") backToList();
              if (!e.target.value.trim()) {
                setResults([]);
                setStatus("idle");
              }
            }}
            onKeyDown={onKeyDown}
            placeholder="Search, or ask a question…"
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
        {view === "answer" ? (
          <PaletteAnswer ask={ask} onBack={backToList} onStop={stop} onRetry={() => askQuestion(ask.question)} />
        ) : (
          <>
            <p className="label-mono px-5 pb-1 pt-3" id={`${listId}-label`}>
              {q ? "Results" : "Jump to, or try a question"}
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
                    onClick={() => pick(o)}
                    className={`cursor-pointer rounded-lg px-3 py-2.5 ${selected ? "bg-panel-hover ring-1 ring-lavender/40" : ""}`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`min-w-0 truncate font-semibold ${o.question ? "text-lavender" : "text-fg"}`}>
                        {o.question ? <span aria-hidden="true">✧ </span> : null}
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
            {q && status === "ready" && !results.length ? <p className="px-5 pb-3 text-sm text-fg-muted">No pages match. Ask it as a question instead.</p> : null}
            {status === "error" ? <p className="px-5 pb-3 text-sm text-fg-muted">Search is unavailable. Try again.</p> : null}
          </>
        )}
        <p className="hidden border-t border-line-strong px-5 py-2.5 text-xs text-fg-subtle sm:block" aria-hidden="true">
          {view === "answer" ? "Esc to go back" : "↑↓ to move · Enter to open · ⌘Enter to ask · Esc to close"}
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {searchStatus || announcement}
        </p>
      </div>
    </dialog>
  );
}
