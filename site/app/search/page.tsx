import type { Metadata } from "next";

import { SearchResults } from "@/components/search/search-results";
import type { SearchHit } from "@/components/search/types";
import { Container } from "@/components/ui";
import { search } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Flow's skills, guides, decisions, and starters.",
  alternates: { canonical: "/search" },
  robots: { index: false },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Fallback for shared links and visitors without JavaScript. The ⌘K palette is the search interface. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = first(params.q).trim().slice(0, 500);
  const results: SearchHit[] = search(query.slice(0, 200), { limit: 20 }).map((r) => ({ ...r, path: r.url }));

  return (
    <Container className="max-w-[48rem] pb-24 pt-16 sm:pb-32 sm:pt-20">
      <h1 className="headline text-[clamp(2rem,4vw,2.6rem)] text-fg">Search</h1>
      <form role="search" action="/search" method="get" className="mt-6 flex gap-2">
        <label htmlFor="search-q" className="sr-only">
          Search Flow
        </label>
        <input
          id="search-q"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Skills, guides, decisions…"
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-line-strong bg-panel px-4 text-base text-fg placeholder:text-fg-subtle focus:border-lavender/60 focus:outline-none"
        />
        <button type="submit" className="min-h-11 shrink-0 rounded-lg bg-lavender-soft px-4 text-sm font-semibold text-ink hover:bg-lavender">
          Search
        </button>
      </form>
      <p className="mt-3 text-sm text-fg-subtle">
        Press <kbd className="font-sans">⌘K</kbd> anywhere to search as you type or ask a question.
      </p>
      <div className="mt-10">
        {query ? (
          results.length ? (
            <SearchResults results={results} query={query} />
          ) : (
            <p className="text-fg-muted">Nothing matches “{query}”. Try fewer or different words.</p>
          )
        ) : null}
      </div>
    </Container>
  );
}
