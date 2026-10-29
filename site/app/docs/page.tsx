import type { Metadata } from "next";
import Link from "next/link";

import { decisionStatus, decisionsNewestFirst, displayTitle, docHref } from "@/components/docs/doc-meta";
import { StatusBadge } from "@/components/docs/status-badge";
import { ArrowUpRight, Eyebrow, Headline, Lede, TextLink } from "@/components/ui";
import { guides } from "@/lib/content";

const description =
  "Everything you need to understand the practice, choose a skill, or start a new product. Written for humans, accessible to agents.";

export const metadata: Metadata = {
  title: "Field guide",
  description,
  alternates: { canonical: "/docs" },
};

export default function DocsHub() {
  const recent = decisionsNewestFirst().slice(0, 5);
  return (
    <div className="max-w-[66rem]">
      <Eyebrow>The Flow field guide</Eyebrow>
      <Headline lead="Build with" accent="intention." className="mt-6" />
      <Lede className="mt-7">{description}</Lede>

      <section aria-labelledby="guides-heading" className="mt-16">
        <h2 id="guides-heading" className="eyebrow">
          Guides
        </h2>
        <ul className="mt-5 border-t border-line">
          {guides.map((guide) => (
            <li key={guide.slug} className="border-b border-line">
              <Link
                href={docHref(guide)}
                className="group -mx-3 flex items-start justify-between gap-6 rounded-lg px-3 py-7 transition-colors hover:bg-panel"
              >
                <span>
                  <span className="block text-2xl font-bold tracking-[-0.04em] text-fg group-hover:text-lavender-soft">{guide.title}</span>
                  <span className="mt-2 block text-[0.95rem] text-fg-muted">{guide.description}</span>
                </span>
                <ArrowUpRight className="mt-1.5 size-4 shrink-0 text-lavender transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="decisions-heading" className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="decisions-heading" className="eyebrow">
            Recent decisions
          </h2>
          <TextLink href="/docs/decisions">All decisions</TextLink>
        </div>
        <ul className="card mt-5 divide-y divide-line">
          {recent.map((d) => (
            <li key={d.slug}>
              <Link href={docHref(d)} className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-panel-hover sm:flex-nowrap">
                <span className="font-mono text-sm text-fg-subtle">{d.number}</span>
                <span className="min-w-0 flex-1 font-medium text-fg group-hover:text-lavender-soft">{displayTitle(d)}</span>
                <StatusBadge status={decisionStatus(d)} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
