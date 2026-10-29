"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

/** A copyable multi-line snippet with a label. */
export function CodeBlock({ code, label, className }: { code: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <figure className={cn("overflow-hidden rounded-xl border border-line-strong bg-canvas-deep", className)}>
      <figcaption className="flex items-center justify-between border-b border-line px-5 py-2.5">
        <span className="label-mono">{label}</span>
        <button type="button" onClick={copy} className="rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-panel-raised hover:text-fg">
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
          <span className="sr-only"> {label}</span>
        </button>
      </figcaption>
      <pre className="overflow-x-auto px-5 py-4 font-mono text-[0.8rem] leading-relaxed text-[#ead9ff]">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
