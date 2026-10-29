import type { ReactNode } from "react";

import { DocsNav, type NavGroup } from "@/components/docs/docs-nav";
import { guides } from "@/lib/content";

const groups: NavGroup[] = [
  {
    title: "The field guide",
    items: [
      { href: "/docs", label: "Overview" },
      ...guides.map((g) => ({ href: `/docs/${g.slug}`, label: g.nav })),
      { href: "/docs/decisions", label: "Decisions" },
    ],
  },
  {
    title: "The ecosystem",
    items: [
      { href: "/skills", label: "Skill library" },
      { href: "/starters", label: "Starter templates" },
      { href: "/agents", label: "For agents" },
    ],
  },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="border-line px-5 pt-6 sm:px-8 lg:sticky lg:top-[4.25rem] lg:h-[calc(100dvh-4.25rem)] lg:overflow-y-auto lg:border-r lg:bg-canvas-deep lg:px-6 lg:py-16">
        <DocsNav groups={groups} />
      </aside>
      <div className="min-w-0 px-5 pb-24 pt-10 sm:px-8 lg:px-16 lg:pt-16">{children}</div>
    </div>
  );
}
