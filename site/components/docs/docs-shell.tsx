import type { ReactNode } from "react";

import { DocsNav } from "@/components/docs/docs-nav";
import { docsTaskGroups } from "@/lib/docs-groups";

/** Sidebar layout shared by docs, capabilities, and articles. */
export function DocsShell({ children }: { children: ReactNode }) {
  const groups = docsTaskGroups().map((g) => ({ items: g.items.map(({ href, label }) => ({ href, label })), title: g.title }));
  return (
    <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="border-line px-5 pt-6 sm:px-8 lg:sticky lg:top-[4.25rem] lg:h-[calc(100dvh-4.25rem)] lg:overflow-y-auto lg:border-r lg:bg-canvas-deep lg:px-6 lg:py-16">
        <DocsNav groups={groups} />
      </aside>
      <div className="min-w-0 px-5 pb-24 pt-10 sm:px-8 lg:px-16 lg:pt-16">{children}</div>
    </div>
  );
}
