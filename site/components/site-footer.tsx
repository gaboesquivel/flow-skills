import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { ArrowUpRight, Container } from "@/components/ui";
import { repo } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" aria-label="Flow home" className="inline-flex items-center gap-2">
          <LogoMark className="h-5 w-7" />
          <span className="headline text-xl">flow</span>
        </Link>
        <p className="text-sm text-fg-muted">Product-first. Agent-agnostic. Built to ship.</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
          <li>
            <Link href="/agents" className="hover:text-fg">
              For agents
            </Link>
          </li>
          <li>
            <a href="/llms.txt" className="hover:text-fg">
              llms.txt
            </a>
          </li>
          <li>
            <a href={repo.url} rel="noopener" className="inline-flex items-center gap-1 hover:text-fg">
              GitHub <ArrowUpRight className="size-3" />
            </a>
          </li>
        </ul>
      </Container>
    </footer>
  );
}
