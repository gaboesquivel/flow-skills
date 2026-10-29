"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

/** Copyable multi-line command block for a starter's quick start. */
export function QuickStart({ commands, className }: { commands: string[]; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commands.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={cn("relative rounded-xl border border-line-strong bg-canvas-deep px-5 py-4 font-mono text-sm", className)}>
      <pre className="overflow-x-auto pr-16 leading-8">
        <code>
          {commands.map((command) => (
            <span key={command} className="block whitespace-nowrap">
              <span aria-hidden="true" className="mr-3 select-none text-pink">
                $
              </span>
              <span className="text-[#ead9ff]">{command}</span>
            </span>
          ))}
        </code>
      </pre>
      <button type="button" onClick={copy} className="absolute right-3 top-3 rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-panel-raised hover:text-fg">
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        <span className="sr-only"> commands</span>
      </button>
    </div>
  );
}
