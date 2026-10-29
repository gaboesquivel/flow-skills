import type { Metadata } from "next";

import { SearchExperience } from "@/components/search/search-experience";
import { SearchResults } from "@/components/search/search-results";
import type { SearchHit } from "@/components/search/types";
import { Container, Eyebrow, Headline, Lede } from "@/components/ui";
import { search } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search and Ask",
  description: "Search Flow's skills, guides, decisions, and starters, or ask a question answered only from Flow's published sources.",
  alternates: { canonical: "/search" },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = first(params.q).trim().slice(0, 500);
  const mode = first(params.mode) === "ask" ? "ask" : "search";
  const results: SearchHit[] = search(query.slice(0, 200), { limit: 20 }).map((r) => ({ ...r, path: r.url }));

  return (
    <Container className="pb-24 pt-16 sm:pb-32 sm:pt-24">
      <Eyebrow>Discover Flow</Eyebrow>
      <Headline lead="Find answers." accent="Keep moving." className="mt-6" />
      <Lede className="mt-8">
        Search the same public knowledge humans read, or ask a question and follow the sources. Agents can discover these
        capabilities through documented interfaces.
      </Lede>
      <div className="mt-10">
        <SearchExperience key={`${mode}:${query}`} initialQuery={query} initialMode={mode} initialResults={results} />
      </div>
      {mode === "ask" && results.length ? (
        <noscript>
          <div className="mt-10">
            <p className="mb-4 text-sm text-fg-muted">Ask needs JavaScript. These sources match your question:</p>
            <SearchResults results={results.slice(0, 8)} query={query} />
          </div>
        </noscript>
      ) : null}
    </Container>
  );
}
