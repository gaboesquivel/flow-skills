"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

/** A copyable shell command. */
export function CommandLine({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={cn("flex items-center gap-4 rounded-xl border border-line-strong bg-canvas-deep px-5 py-4 font-mono text-sm", className)}>
      <span aria-hidden="true" className="select-none text-pink">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-[#ead9ff]">{command}</code>
      <button type="button" onClick={copy} className="shrink-0 rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-panel-raised hover:text-fg">
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        <span className="sr-only"> command</span>
      </button>
    </div>
  );
}
