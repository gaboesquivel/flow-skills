import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Prose } from "@/components/prose";
import { QuickStart } from "@/components/starters/quick-start";
import { Breadcrumbs, ButtonLink, Container, Eyebrow, Headline, Lede, Section, TextLink } from "@/components/ui";
import { getStarterReadme } from "@/lib/content";
import { getStarter, starters } from "@/lib/starters";

export const dynamicParams = false;

export function generateStaticParams() {
  return starters.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const starter = getStarter(slug);
  if (!starter) return {};
  return {
    title: `${starter.title} starter`,
    description: starter.description,
    alternates: { canonical: `/starters/${starter.slug}` },
  };
}

export default async function StarterPage({ params }: Props) {
  const { slug } = await params;
  const starter = getStarter(slug);
  if (!starter) notFound();
  const readme = getStarterReadme(starter.slug);

  return (
    <>
      <Container className="pt-10">
        <Breadcrumbs items={[{ href: "/starters", label: "Starters" }, { label: starter.title }]} />
        <header className="mt-14">
          <Eyebrow>{starter.kind}</Eyebrow>
          <Headline lead={starter.hero.lead} accent={starter.hero.accent} className="mt-6" />
          <Lede className="mt-8">{starter.description}</Lede>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={starter.repository}>View repository</ButtonLink>
            <ButtonLink href="/starters#compare" variant="secondary">
              Compare starters
            </ButtonLink>
          </div>
        </header>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          <section aria-labelledby="starter-capabilities" className="card-prism p-7 sm:p-8">
            <p className="label-mono">Capabilities</p>
            <h2 id="starter-capabilities" className="mt-4 text-[clamp(1.6rem,2.6vw,2rem)] font-bold tracking-[-0.05em] text-fg">
              A considered starting point.
            </h2>
            <ul className="mt-5 space-y-2 text-[0.95rem] leading-relaxed text-fg-muted">
              {starter.capabilities.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-violet" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="starter-quick-start" className="card-prism flex flex-col p-7 sm:p-8">
            <p className="label-mono">Quick start</p>
            <h2 id="starter-quick-start" className="mt-4 text-[clamp(1.6rem,2.6vw,2rem)] font-bold tracking-[-0.05em] text-fg">
              From clone to code.
            </h2>
            <QuickStart commands={starter.quickStart} className="mt-6" />
            <p className="mt-5 text-sm leading-relaxed text-fg-muted">{starter.quickStartNote}</p>
            <p className="mt-3 text-sm text-fg-muted">
              <span className="text-fg">Prerequisites:</span> {starter.prerequisites.join(", ")}.
            </p>
            <p className="mt-3 text-sm text-fg-muted">
              Or say <span className="text-fg">“start a Next.js project”</span> and let the{" "}
              <TextLink href="/skills/start" className="text-sm">
                start skill
              </TextLink>{" "}
              set it up.
            </p>
          </section>
        </div>
      </Container>

      <Section aria-labelledby="why-defaults">
        <Container>
          <Eyebrow>Why these defaults?</Eyebrow>
          <h2 id="why-defaults" className="headline mt-5 text-[clamp(2.4rem,5.2vw,3.6rem)] text-fg">
            Spend less time on setup.
            <br />
            More time on the product.
          </h2>
          <Lede className="mt-8">
            The starter supplies engineering conventions and agent-facing capabilities so you can focus on what your application does. Use only the parts you need, and
            measure deployment time in your own environment.
          </Lede>
        </Container>
      </Section>

      <Section aria-labelledby="readme" className="border-t border-line">
        <Container>
          <Eyebrow>From the repository README</Eyebrow>
          <h2 id="readme" className="headline mt-5 text-[clamp(1.8rem,3.4vw,2.4rem)] text-fg">
            {starter.title} README
          </h2>
          {readme?.html ? (
            <>
              <p className="mt-3 text-sm text-fg-subtle">
                Rendered at build time from{" "}
                <a href={starter.repository} rel="noopener" className="text-lavender hover:text-lavender-soft">
                  {starter.repository.replace(/^https:\/\//u, "")}
                </a>
                .
              </p>
              <div className="card mt-8 p-6 sm:p-8">
                <Prose html={readme.html} />
              </div>
            </>
          ) : (
            <div className="card mt-8 p-6 sm:p-8">
              <p className="text-fg-muted">The README could not be loaded when this site was built. Read it on GitHub instead.</p>
              <ButtonLink href={starter.repository} variant="secondary" className="mt-5">
                Open {starter.title} on GitHub
              </ButtonLink>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
