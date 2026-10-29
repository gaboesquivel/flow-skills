"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AskMode, Citation } from "@/lib/ask";

export type AskState = {
  question: string;
  status: "idle" | "loading" | "streaming" | "done" | "stopped" | "error";
  answer: string;
  citations: Citation[];
  mode: AskMode | null;
  model: string | null;
  error?: { message: string; resolution?: string };
};

const IDLE: AskState = { answer: "", citations: [], mode: null, model: null, question: "", status: "idle" };

const parseCitations = (header: string | null): Citation[] => {
  if (!header) return [];
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(header));
    return Array.isArray(parsed) ? (parsed as Citation[]) : [];
  } catch {
    return [];
  }
};

/** Streams a cited answer from /api/ask; `announce` receives screen-reader progress. */
export function useAsk(announce: (text: string) => void) {
  const [ask, setAsk] = useState<AskState>(IDLE);
  const abort = useRef<AbortController | null>(null);
  const stopped = useRef(false);

  const run = useCallback(
    async (question: string) => {
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      stopped.current = false;
      setAsk({ ...IDLE, question, status: "loading" });
      announce("Looking up sources…");
      try {
        const res = await fetch("/api/ask?stream=1", {
          body: JSON.stringify({ question }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const err = (await res.json().catch(() => null)) as { error?: string; resolution?: string } | null;
          const message = res.status === 429 ? "Too many questions in a short time." : (err?.error ?? `The request failed (${res.status}).`);
          setAsk((s) => ({ ...s, error: { message, resolution: err?.resolution }, status: "error" }));
          announce(`Ask failed. ${message}`);
          return;
        }
        const citations = parseCitations(res.headers.get("X-Flow-Citations"));
        const mode: AskMode = res.headers.get("X-Flow-Answer-Mode") === "generated" ? "generated" : "extractive";
        const model = res.headers.get("X-Flow-Model") || null;
        setAsk((s) => ({ ...s, citations, mode, model, status: "streaming" }));
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
        announce(`Answer ready, with ${citations.length} sources.`);
      } catch {
        if (ctrl.signal.aborted) {
          if (stopped.current) {
            setAsk((s) => ({ ...s, status: "stopped" }));
            announce("Answer stopped.");
          }
          return;
        }
        setAsk((s) => ({ ...s, error: { message: "The connection was interrupted." }, status: "error" }));
        announce("Ask failed. The connection was interrupted.");
      }
    },
    [announce],
  );

  const stop = useCallback(() => {
    stopped.current = true;
    abort.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abort.current?.abort();
    setAsk(IDLE);
  }, []);

  useEffect(() => () => abort.current?.abort(), []);

  return { ask, run, stop, reset };
}
