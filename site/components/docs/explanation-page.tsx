import Link from "next/link";

import { splitTitle } from "@/components/docs/doc-meta";
import { Toc } from "@/components/docs/toc";
import { Prose } from "@/components/prose";
import { Eyebrow, Headline, Lede } from "@/components/ui";
import { type Article, type Capability, content, repo, sourceUrl } from "@/lib/content";

type Related = { href: string; label: string; kind: string };

/** Detail page for a published capability or article: header, source facts, body, optional media, related links. */
export function ExplanationPage({
  entry,
  eyebrow,
  related,
}: {
  entry: Capability | Article;
  eyebrow: { href: string; label: string; detail?: string };
  related: Related[];
}) {
  const { lead, accent } = splitTitle(entry.title);
  const headings = entry.headings.filter((h) => h.depth === 2);
  const article = entry.kind === "article" ? entry : null;
  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-14">
      <article className="min-w-0 max-w-[66rem]">
        <header>
          <Eyebrow>
            <Link href={eyebrow.href} className="hover:text-lavender-soft">
              {eyebrow.label}
            </Link>
            {eyebrow.detail ? ` · ${eyebrow.detail}` : null}
          </Eyebrow>
          <Headline lead={lead} accent={accent} size={entry.title.length > 30 ? "lg" : "xl"} className="mt-6" />
          <Lede className="mt-7">{entry.description}</Lede>
          <dl className="label-mono mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex gap-2">
              <dt>Published:</dt>
              <dd className="text-fg-muted">
                <time dateTime={entry.published}>{entry.published}</time>
              </dd>
            </div>
            {entry.updated !== entry.published ? (
              <div className="flex gap-2">
                <dt>Updated:</dt>
                <dd className="text-fg-muted">
                  <time dateTime={entry.updated}>{entry.updated}</time>
                </dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt>Source:</dt>
              <dd>
                <a href={sourceUrl(entry.source)} rel="noopener" className="normal-case tracking-normal text-lavender hover:text-lavender-soft">
                  {entry.source}
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
          <p className="mt-5 text-sm text-fg-subtle">
            This page explains and links to the skills, docs, and decisions that own each rule; it defines none itself.
          </p>
        </header>

        {article?.video ? (
          <figure className="mt-12">
            <div className="aspect-video overflow-hidden rounded-xl border border-line bg-panel">
              <iframe
                src={article.video.embed}
                title={`Recording: ${entry.title}`}
                className="size-full"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <figcaption className="mt-3 text-sm text-fg-muted">
              Recording of this article.{" "}
              <a href={article.video.url} rel="noopener" className="text-lavender hover:text-lavender-soft">
                Watch it on the video site
              </a>
              {article.transcript ? " · the transcript follows the article." : "."}
            </figcaption>
          </figure>
        ) : null}

        <Prose html={entry.html} className="mt-12" />

        {article?.transcript ? (
          <details className="card mt-12 p-6">
            <summary className="cursor-pointer font-semibold text-fg">Transcript of the recording</summary>
            <Prose html={article.transcript.html} className="mt-6" />
          </details>
        ) : null}

        {related.length ? (
          <nav aria-labelledby="related-heading" className="mt-16">
            <h2 id="related-heading" className="eyebrow">
              Related
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="card card-link flex flex-col gap-1.5 p-5">
                    <span className="label-mono">{r.kind}</span>
                    <span className="font-semibold text-fg">{r.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </article>

      {headings.length > 1 ? <Toc headings={headings} /> : null}
    </div>
  );
}
