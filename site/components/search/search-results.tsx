import Link from "next/link";

import { Highlight } from "@/components/search/highlight";
import { KIND_LABEL, distinctHeading } from "@/components/search/kinds";
import type { SearchHit } from "@/components/search/types";
import { ArrowUpRight } from "@/components/ui";

export function SearchResults({ results, query }: { results: SearchHit[]; query: string }) {
  return (
    <ol className="grid gap-3" aria-label={`Search results for ${query}`}>
      {results.map((r) => (
        <li key={r.path}>
          <Link href={r.path} className="card card-link group block px-5 py-5 sm:px-6">
            <p className="label-mono">
              {KIND_LABEL[r.kind]}
              {distinctHeading(r.title, r.heading) ? <span className="normal-case tracking-normal"> · {r.heading}</span> : null}
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-fg group-hover:text-lavender-soft [overflow-wrap:anywhere] sm:text-xl">
              {r.title} <ArrowUpRight className="inline size-4 align-[-0.1em]" />
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">
              <Highlight text={r.excerpt} query={query} />
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
