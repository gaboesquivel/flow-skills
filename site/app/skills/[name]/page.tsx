import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommandLine } from "@/components/command-line";
import { Prose } from "@/components/prose";
import { AskButton } from "@/components/search/ask-button";
import { SkillCard } from "@/components/skills/skill-card";
import { ArrowUpRight, Breadcrumbs, Container, Eyebrow, Lede } from "@/components/ui";
import { getSkill, installCommand, skillsInCatalogOrder, sourceUrl } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return skillsInCatalogOrder().map((s) => ({ name: s.name }));
}

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const skill = getSkill(name);
  if (!skill) return {};
  return {
    title: `${skill.name} skill`,
    description: skill.summary,
    alternates: { canonical: `/skills/${skill.name}` },
  };
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-[clamp(1.7rem,3vw,2.2rem)] font-bold leading-tight tracking-[-0.045em] text-fg">
      {children}
    </h2>
  );
}

export default async function SkillPage({ params }: Props) {
  const { name } = await params;
  const skill = getSkill(name);
  if (!skill) notFound();

  const ordered = skillsInCatalogOrder();
  const index = ordered.findIndex((s) => s.name === skill.name);
  const prev = index > 0 ? ordered[index - 1] : undefined;
  const next = index < ordered.length - 1 ? ordered[index + 1] : undefined;
  const related = ordered.filter((s) => s.group === skill.group && s.name !== skill.name);
  const groupHref = `/skills?group=${encodeURIComponent(skill.group)}`;
  const askQuestion = `When should I use the ${skill.name} skill, and what does it do?`;
  const sourceDir = skill.source.replace(/\/SKILL\.md$/u, "");

  return (
    <Container className="pb-24 pt-10">
      <Breadcrumbs items={[{ href: "/skills", label: "Skills" }, { href: groupHref, label: skill.group }, { label: skill.name }]} />

      <header className="mt-14 max-w-4xl">
        <Eyebrow>{skill.group} · Portable skill</Eyebrow>
        <h1 className="headline mt-6 text-[clamp(2.75rem,8vw,5.4rem)] [overflow-wrap:anywhere]">
          <span className="text-prism">{skill.name}</span>
          <span className="text-fg">/</span>
        </h1>
        <Lede className="mt-8">{skill.summary}</Lede>
        <CommandLine command={installCommand(skill.name)} className="mt-10" />
      </header>

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="say-it">
            <SectionHeading id="say-it">Say it</SectionHeading>
            <p className="mt-3 text-fg-muted">Natural language is the interface. Any of these, or your own words, reach the skill.</p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {skill.phrases.map((phrase) => (
                <li key={phrase} className="rounded-lg border border-line-strong bg-panel-raised px-3.5 py-2 text-[0.95rem] text-fg">
                  “{phrase}”
                </li>
              ))}
            </ul>
          </section>

          {skill.when ? (
            <section aria-labelledby="when-to-use-it">
              <SectionHeading id="when-to-use-it">When to use it</SectionHeading>
              <p className="mt-4 max-w-[46rem] text-[1.0625rem] leading-relaxed text-fg-muted">{skill.when}</p>
            </section>
          ) : null}

          <section aria-labelledby="the-skill">
            <SectionHeading id="the-skill">The skill</SectionHeading>
            <p className="mt-3 text-fg-muted">
              The authoritative, versioned instruction your agent follows, from{" "}
              <a href={sourceUrl(skill.source)} rel="noopener" className="font-mono text-[0.9em] text-lavender underline decoration-lavender/35 underline-offset-[3px] hover:decoration-lavender">
                {skill.source}
              </a>
              .
            </p>
            <div className="card mt-6 p-6 sm:p-8">
              <Prose html={skill.html} />
            </div>
          </section>

          {related.length > 0 ? (
            <section aria-labelledby="related">
              <SectionHeading id="related">More in {skill.group}</SectionHeading>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {related.map((s) => (
                  <li key={s.name}>
                    <SkillCard skill={s} headingLevel="h3" />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <nav aria-label="Previous and next skill" className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
            {prev ? (
              <Link href={`/skills/${prev.name}`} className="card card-link flex flex-col gap-1 p-5">
                <span className="label-mono inline-flex items-center gap-1.5">
                  <ArrowLeft aria-hidden="true" className="size-3.5" /> Previous
                </span>
                <span className="text-lg font-semibold text-fg">{prev.name}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/skills/${next.name}`} className="card card-link flex flex-col items-end gap-1 p-5 text-right">
                <span className="label-mono inline-flex items-center gap-1.5">
                  Next <ArrowRight aria-hidden="true" className="size-3.5" />
                </span>
                <span className="text-lg font-semibold text-fg">{next.name}</span>
              </Link>
            ) : null}
          </nav>
        </div>

        <aside aria-labelledby="at-a-glance" className="lg:row-start-1 lg:col-start-2">
          <div className="card p-6 lg:sticky lg:top-24">
            <h2 id="at-a-glance" className="text-sm font-bold uppercase tracking-wide text-fg">
              At a glance
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="label-mono">Group</dt>
                <dd className="mt-1 text-fg">
                  <Link href={groupHref} className="hover:text-lavender">
                    {skill.group}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="label-mono">Invocation</dt>
                <dd className="mt-1 text-fg">Natural language</dd>
              </div>
              {skill.say ? (
                <div>
                  <dt className="label-mono">Leading phrase</dt>
                  <dd className="mt-1 text-fg">“{skill.say}”</dd>
                </div>
              ) : null}
              <div>
                <dt className="label-mono">Source</dt>
                <dd className="mt-1 break-all font-mono text-xs text-fg-muted">{skill.source}</dd>
              </div>
              <div>
                <dt className="label-mono">Files in the package</dt>
                <dd className="mt-1.5">
                  <ul className="space-y-1 font-mono text-xs text-fg-muted">
                    {skill.files.map((file) => (
                      <li key={file} className="break-all">
                        {sourceDir}/{file}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
              <li>
                <AskButton question={askQuestion} className="inline-flex items-center gap-1.5 font-semibold text-lavender hover:text-lavender-soft">
                  <Sparkles aria-hidden="true" className="size-3.5" /> Ask about this skill
                </AskButton>
              </li>
              <li>
                <a href={sourceUrl(skill.source)} rel="noopener" className="inline-flex items-center gap-1.5 font-semibold text-lavender hover:text-lavender-soft">
                  View source on GitHub <ArrowUpRight className="size-3" />
                </a>
              </li>
              <li>
                <Link href="/skills" className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg">
                  <ArrowLeft aria-hidden="true" className="size-3.5" /> All skills
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  );
}
