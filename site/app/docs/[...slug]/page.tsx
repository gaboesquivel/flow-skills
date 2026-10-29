import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AskCallout } from "@/components/docs/ask-callout";
import { decisionMeta, decisionStatus, docBody, docHeadings, docHref, displayTitle, neighbours, splitTitle } from "@/components/docs/doc-meta";
import { StatusBadge } from "@/components/docs/status-badge";
import { Toc } from "@/components/docs/toc";
import { Prose } from "@/components/prose";
import { Eyebrow, Headline, Lede } from "@/components/ui";
import { content, decisions, getDoc, guides, repo, sourceUrl } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...guides, ...decisions].map((d) => ({ slug: d.slug.split("/") }));
}

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = getDoc((await params).slug.join("/"));
  if (!doc) return {};
  const title = doc.section === "decision" ? `${doc.number} — ${displayTitle(doc)}` : doc.title;
  return { title, description: doc.description, alternates: { canonical: docHref(doc) } };
}

export default async function DocPage({ params }: Props) {
  const doc = getDoc((await params).slug.join("/"));
  if (!doc) notFound();

  const isDecision = doc.section === "decision";
  const title = displayTitle(doc);
  const { lead, accent } = splitTitle(title);
  const status = isDecision ? decisionStatus(doc) : undefined;
  const meta = isDecision ? decisionMeta(doc) : undefined;
  const headings = docHeadings(doc);
  const { prev, next } = neighbours(doc);
  const label = isDecision ? "decision" : "guide";

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-14">
      <article className="min-w-0 max-w-[66rem]">
        <header>
          <Eyebrow>
            {isDecision ? (
              <>
                <Link href="/docs/decisions" className="hover:text-lavender-soft">
                  Decision {doc.number}
                </Link>{" "}
                · {status}
              </>
            ) : (
              "Field guide"
            )}
          </Eyebrow>
          <Headline lead={lead} accent={accent} size={isDecision || title.length > 30 ? "lg" : "xl"} className="mt-6" />
          {doc.description ? <Lede className="mt-7">{doc.description}</Lede> : null}
          <dl className="label-mono mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            {status ? (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Status</dt>
                <dd>
                  <StatusBadge status={status} />
                </dd>
              </div>
            ) : null}
            {meta?.date ? (
              <div className="flex gap-2">
                <dt>Date:</dt>
                <dd className="text-fg-muted">{meta.date}</dd>
              </div>
            ) : null}
            {meta?.supersededBy ? (
              <div className="flex gap-2">
                <dt>Superseded by:</dt>
                <dd>
                  <Link href={`/docs/decisions/${meta.supersededBy}`} className="text-lavender hover:text-lavender-soft">
                    {meta.supersededBy.slice(0, 4)}
                  </Link>
                </dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt>Source:</dt>
              <dd>
                <a href={sourceUrl(doc.source)} rel="noopener" className="normal-case tracking-normal text-lavender hover:text-lavender-soft">
                  {doc.source}
                </a>
              </dd>
            </div>
            {content.commit ? (
              <div className="flex gap-2">
                <dt>Built from:</dt>
                <dd>
                  <a href={`${repo.url}/commit/${content.commit}`} rel="noopener" className="normal-case tracking-normal text-fg-muted hover:text-fg">
                    {content.commit.slice(0, 7)}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </header>

        <Prose html={docBody(doc)} className="mt-12" />

        <AskCallout title={title} label={label} className="mt-16" />

        {prev || next ? (
          <nav aria-label={`More ${label}s`} className="mt-10 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link href={docHref(prev)} className="card card-link flex flex-col gap-1.5 p-5">
                <span className="label-mono">← Previous</span>
                <span className="font-semibold text-fg">{displayTitle(prev)}</span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {next ? (
              <Link href={docHref(next)} className="card card-link flex flex-col gap-1.5 p-5 text-right">
                <span className="label-mono">Next →</span>
                <span className="font-semibold text-fg">{displayTitle(next)}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </article>

      {headings.length > 1 ? <Toc headings={headings} /> : null}
    </div>
  );
}
