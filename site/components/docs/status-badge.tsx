import { cn } from "@/lib/cn";

import type { DecisionStatus } from "./doc-meta";

const tone: Record<DecisionStatus, string> = {
  Accepted: "border-lavender/40 bg-lavender/10 text-lavender-soft",
  Proposed: "border-pink/40 bg-pink/10 text-pink",
  Amended: "border-periwinkle/40 bg-periwinkle/10 text-periwinkle",
  Superseded: "border-line-strong bg-panel text-fg-subtle",
  Deprecated: "border-line-strong bg-panel text-fg-subtle",
  Rejected: "border-line-strong bg-panel text-fg-subtle",
  Withdrawn: "border-line-strong bg-panel text-fg-subtle",
  Unknown: "border-dashed border-line-strong text-fg-subtle",
};

const dot: Record<DecisionStatus, string> = {
  Accepted: "bg-lavender",
  Proposed: "bg-pink",
  Amended: "bg-periwinkle",
  Superseded: "bg-fg-subtle",
  Deprecated: "bg-fg-subtle",
  Rejected: "bg-fg-subtle",
  Withdrawn: "bg-fg-subtle",
  Unknown: "bg-transparent border border-fg-subtle",
};

export function StatusBadge({ status, className }: { status: DecisionStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em]",
        tone[status],
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dot[status])} />
      {status}
    </span>
  );
}
