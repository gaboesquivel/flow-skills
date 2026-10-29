import { ArrowUpRight as ArrowIcon, Command, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink, Container, Eyebrow, Headline, Lede, Section } from "@/components/ui";
import { comparison, starters } from "@/lib/starters";

const description =
  "Production-minded application foundations for software built by humans and agents. Designed around current standards, useful defaults, and Vercel-first delivery, with room to grow.";

export const metadata: Metadata = {
  title: "Starters",
  description: `Flow starters: flow-next and flow-mono. ${description}`,
  alternates: { canonical: "/starters" },
};

const foundation = [
  {
    icon: Command,
    label: "Capability",
    title: "Agent-ready",
    body: "A public Assistant with chat, GenUI, and MCP beside a protected Operator console, so humans and agents share one product.",
  },
  {
    icon: ListChecks,
    label: "Interoperability",
    title: "Standards-minded",
    body: "MCP Streamable HTTP, shared tool names documented in docs/INTEROP.md, and lint, types, and tests behind one pnpm qa.",
  },
  {
    icon: ArrowIcon,
    label: "Delivery",
    title: "Vercel-first",
    body: "Vercel build configuration and AI Gateway inference ready from the first commit, so the first deployment comes early.",
  },
];

export default function StartersPage() {
  return (
    <>
      <Container className="pt-16 sm:pt-24">
        <Eyebrow>03 / Flow starters</Eyebrow>
        <Headline lead="Start ahead." accent="Stay in Flow." className="mt-6" />
        <Lede className="mt-8">{description}</Lede>

        <ul className="mt-14 grid gap-4 md:grid-cols-2">
          {starters.map((starter) => (
            <li key={starter.slug} className="card-prism flex flex-col p-7 sm:p-9">
              <p className="label-mono text-lavender/90">{starter.kind}</p>
              <h2 className="mt-10 text-[clamp(2rem,4vw,2.6rem)] font-bold tracking-[-0.05em] text-fg">{starter.title}</h2>
              <p className="mt-4 flex-1 text-fg-muted">{starter.tagline}</p>
              <div className="mt-8">
                <ButtonLink href={`/starters/${starter.slug}`}>
                  Explore {starter.title}
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      <Section aria-label="Common foundation">
        <Container>
          <Eyebrow>Common foundation</Eyebrow>
          <Headline as="h2" size="lg" lead="Built for humans" accent="and agents." className="mt-5" />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {foundation.map(({ icon: Icon, label, title, body }) => (
              <li key={title} className="card-prism p-7">
                <Icon aria-hidden="true" className="size-8 text-violet" strokeWidth={1.6} />
                <p className="label-mono mt-6">{label}</p>
                <h3 className="mt-2 text-2xl font-bold tracking-[-0.045em] text-fg">{title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-fg-muted">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-fg-subtle">Capabilities reflect each repository&apos;s current README; verify them against the template revision you start from.</p>
        </Container>
      </Section>

      <Section id="compare" aria-labelledby="compare-heading" className="scroll-mt-20 pt-0 sm:pt-0">
        <Container>
          <Eyebrow>Compare</Eyebrow>
          <h2 id="compare-heading" className="headline mt-5 text-[clamp(1.8rem,3.4vw,2.4rem)] text-fg">
            Same contract. Different shape.
          </h2>
          <div className="mt-8 overflow-x-auto rounded-[14px] border border-line">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead className="bg-panel">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold text-fg-subtle">
                    <span className="sr-only">Aspect</span>
                  </th>
                  {starters.map((s) => (
                    <th key={s.slug} scope="col" className="px-5 py-4 font-mono font-semibold text-fg">
                      <Link href={`/starters/${s.slug}`} className="hover:text-lavender">
                        {s.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <th scope="row" className="px-5 py-4 align-top font-medium text-fg">
                      {row.label}
                    </th>
                    {starters.map((s) => (
                      <td key={s.slug} className="px-5 py-4 align-top text-fg-muted">
                        {row.values[s.slug]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <p className="text-fg-muted">
              Prefer to talk? Say <span className="text-fg">“start a Next.js project”</span> and the <code className="font-mono text-fg">start</code> skill initializes a new
              project from either starter with verified setup and its own Git history.
            </p>
            <ButtonLink href="/skills/start" variant="secondary" className="shrink-0">
              The start skill
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
