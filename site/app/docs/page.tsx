import type { Metadata } from "next";
import Link from "next/link";

import { decisionStatus, decisionsNewestFirst, displayTitle, docHref } from "@/components/docs/doc-meta";
import { StatusBadge } from "@/components/docs/status-badge";
import { ArrowUpRight, Eyebrow, Headline, Lede, TextLink } from "@/components/ui";
import { articles, capabilities } from "@/lib/content";
import { docsTaskGroups } from "@/lib/docs-groups";

const description =
  "Start from what you are trying to do. Each entry leads to the page that owns it, and every page is also available as Markdown.";

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

      {docsTaskGroups().map((group) => {
        const id = `group-${group.title.toLowerCase().replace(/[^a-z]+/gu, "-")}`;
        return (
          <section key={group.title} aria-labelledby={id} className="mt-16">
            <h2 id={id} className="eyebrow">
              {group.title}
            </h2>
            <p className="mt-3 text-[0.95rem] text-fg-muted">{group.summary}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {group.items
                .filter((item) => item.href !== "/docs")
                .map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="card card-link group flex h-full items-start justify-between gap-4 p-5">
                      <span>
                        <span className="block font-semibold text-fg group-hover:text-lavender-soft">{item.label}</span>
                        <span className="mt-1.5 block text-sm text-fg-muted">{item.description}</span>
                      </span>
                      <ArrowUpRight className="mt-1 size-4 shrink-0 text-lavender" />
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        );
      })}

      {capabilities.length || articles.length ? (
        <p className="mt-12 text-[0.95rem] text-fg-muted">
          Want the reasoning behind a practice?{" "}
          {capabilities.length ? <TextLink href="/capabilities">Browse capabilities</TextLink> : null}
          {capabilities.length && articles.length ? " or " : null}
          {articles.length ? <TextLink href="/blog">read the articles</TextLink> : null}.
        </p>
      ) : null}

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
