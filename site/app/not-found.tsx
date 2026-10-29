import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink, Container, Eyebrow, Headline, Lede } from "@/components/ui";

export const metadata: Metadata = { robots: { follow: true, index: false }, title: "Page not found" };

const LINKS = [
  { href: "/skills", label: "Skills", text: "Every skill, with the phrase that reaches it." },
  { href: "/methodology", label: "Methodology", text: "How Flow works, in practice." },
  { href: "/docs", label: "Docs", text: "Guides and decision records." },
  { href: "/agents", label: "For agents", text: "llms.txt, Markdown, search API, MCP." },
];

export default function NotFound() {
  return (
    <Container className="py-20 sm:py-28">
      <Eyebrow>404 / Not found</Eyebrow>
      <Headline className="mt-5" lead="This page" accent="isn't here." />
      <Lede className="mt-6">The link may be old or mistyped. Search Flow's skills and docs, or pick a starting point below.</Lede>

      <search className="mt-10 block max-w-xl">
        <form action="/search" method="get" className="flex gap-3">
          <label htmlFor="not-found-q" className="sr-only">
            Search Flow
          </label>
          <input
            id="not-found-q"
            name="q"
            type="search"
            placeholder="Search skills, guides, decisions"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-line-strong bg-panel px-4 text-sm text-fg placeholder:text-fg-subtle focus:border-lavender/60"
          />
          <button type="submit" className="min-h-11 rounded-lg bg-lavender-soft px-5 text-sm font-semibold text-ink hover:bg-lavender">
            Search
          </button>
        </form>
      </search>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="card card-link block h-full p-5">
              <span className="font-semibold text-fg">{l.label}</span>
              <span className="mt-1.5 block text-sm text-fg-muted">{l.text}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12">
        <ButtonLink href="/" variant="secondary" arrow={false}>
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
