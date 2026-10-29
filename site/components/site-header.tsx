import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import { SearchTrigger } from "@/components/search-trigger";
import { Wordmark } from "@/components/logo";
import { ArrowUpRight, Container } from "@/components/ui";
import { NAV } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <Container className="flex h-[4.25rem] items-center justify-between gap-4">
        <Link href="/" aria-label="Flow home" className="shrink-0">
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-fg-muted">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2.5">
          <SearchTrigger className="hidden md:inline-flex" />
          <Link
            href="/search?mode=ask"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-lavender-soft px-4 text-sm font-semibold text-ink hover:bg-lavender"
          >
            Ask Flow <ArrowUpRight />
          </Link>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
