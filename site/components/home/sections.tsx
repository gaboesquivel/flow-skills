import { Command, LayoutList, Target, type LucideIcon } from "lucide-react";

import { CommandLine } from "@/components/command-line";
import { PrismDiagram } from "@/components/home/prism-diagram";
import { SearchAskPanel } from "@/components/search-ask-panel";
import { ButtonLink, Container, Eyebrow, Lede, Section, TextLink } from "@/components/ui";
import { installCommand, skills } from "@/lib/content";

export function HomeHero() {
  return (
    <Container className="grid items-center gap-12 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24 lg:pt-28">
      <div>
        <Eyebrow className="flex items-center gap-3">
          <span aria-hidden="true" className="text-violet">
            •
          </span>
          Open product engineering ecosystem
        </Eyebrow>
        <h1 className="headline mt-6 text-[clamp(3rem,8vw,5.4rem)] text-fg">
          Make
          <br />
          ideas <span className="text-prism">flow.</span>
        </h1>
        <Lede className="mt-8 max-w-[34rem] sm:text-lg">
          For humans who think in products. For agents who build them. One flexible practice, from the first question to verified production.
        </Lede>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/methodology">Explore the practice</ButtonLink>
          <ButtonLink href="/skills" variant="secondary">
            Browse skills
          </ButtonLink>
        </div>
      </div>
      <PrismDiagram className="mx-auto max-w-[30rem]" />
    </Container>
  );
}

// Each claim is grounded in PRODUCT.md / README.md: product before code, parallel independent work, no spec required, ship verifies liveness.
const PRINCIPLES = ["Product first", "Parallel by default", "No mandatory specs", "Verified delivery"];

export function PrincipleStrip() {
  return (
    <div className="border-y border-line">
      <Container>
        <ul aria-label="Flow in brief" className="grid grid-cols-2 gap-x-4 gap-y-3 py-5 sm:flex sm:justify-between">
          {PRINCIPLES.map((p, i) => (
            <li key={p} className={`label-mono flex items-center gap-2.5 whitespace-nowrap tracking-[0.06em] text-fg-muted sm:gap-3 sm:tracking-[0.12em] ${i % 2 ? "justify-end sm:justify-start" : ""}`}>
              {i > 0 ? (
                <span aria-hidden="true" className="text-violet">
                  •
                </span>
              ) : null}
              {p}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

export function FindSection() {
  return (
    <Section aria-labelledby="find-heading">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>Knowledge for humans and agents</Eyebrow>
            <h2 id="find-heading" className="headline mt-5 text-[clamp(2.2rem,4.6vw,3.4rem)] text-fg">
              Find the skill.
              <br />
              <span className="text-prism">Ask the question.</span>
            </h2>
          </div>
          <p className="max-w-[24rem] text-base leading-relaxed text-fg-muted">
            Search skills, methodology, docs, and starter capabilities. Source-backed answers meet you where you work.
          </p>
        </div>
        <SearchAskPanel className="mt-10" />
        <p className="mt-4 text-sm text-fg-subtle">Ask answers link to the source. Search remains available without an LLM.</p>
      </Container>
    </Section>
  );
}

type Pillar = { n: string; kicker: string; title: string; body: string; href: string; cta: string; Icon: LucideIcon };

export function PillarsSection() {
  const pillars: Pillar[] = [
    {
      n: "01",
      kicker: "The practice",
      title: "Methodology",
      body: "Product thinking, proportionate planning, and durable decisions.",
      href: "/methodology",
      cta: "Discover the practice",
      Icon: Target,
    },
    {
      n: "02",
      kicker: "The capabilities",
      title: "Portable skills",
      body: `${skills.length} focused skills for the coding agent you already use.`,
      href: "/skills",
      cta: "Browse skills",
      Icon: Command,
    },
    {
      n: "03",
      kicker: "The foundations",
      title: "Flow Starters",
      body: "Agent-ready, Vercel-first foundations for shipping products.",
      href: "/starters",
      cta: "Explore starters",
      Icon: LayoutList,
    },
  ];
  return (
    <Section aria-labelledby="pillars-heading" className="pt-4 sm:pt-8">
      <Container>
        <Eyebrow>Three connected pillars</Eyebrow>
        <h2 id="pillars-heading" className="headline mt-5 text-[clamp(2.2rem,4.6vw,3.4rem)] text-fg">
          Everything connects.
          <br />
          Nothing is mandatory.
        </h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {pillars.map(({ Icon, ...p }) => (
            <li key={p.title} className="card-prism flex flex-col p-7">
              <Icon aria-hidden="true" className="size-8 text-lavender" strokeWidth={1.5} />
              <p className="label-mono mt-8">
                {p.n} / {p.kicker}
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-fg">{p.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-fg-muted">{p.body}</p>
              <TextLink href={p.href} className="mt-6 self-start">
                {p.cta}
              </TextLink>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function InstallBand() {
  return (
    <Section aria-labelledby="install-heading" className="pt-4 sm:pt-8">
      <Container>
        <div className="grid grid-cols-1 items-center gap-8 rounded-[20px] bg-[linear-gradient(110deg,#9ea6f8_0%,#c6a8f6_55%,#f0a6cf_100%)] p-5 sm:p-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="eyebrow text-ink/80">Start where you are</p>
            <h2 id="install-heading" className="headline mt-5 text-[clamp(2.2rem,4.2vw,3.2rem)] text-ink">
              Your agent.
              <br />
              Your workflow.
            </h2>
          </div>
          <div className="min-w-0 rounded-xl border border-line-strong bg-canvas-deep shadow-[0_30px_60px_-30px_rgb(23_18_31/0.8)]">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span aria-hidden="true" className="flex gap-1.5">
                <span className="size-2 rounded-full bg-fg-subtle" />
                <span className="size-2 rounded-full bg-fg-subtle" />
                <span className="size-2 rounded-full bg-fg-subtle" />
              </span>
              <span className="label-mono">terminal</span>
            </div>
            <div className="p-3 sm:p-5">
              <CommandLine command={installCommand()} />
              <p className="mt-4 text-sm text-fg-muted">One command. No mandatory setup ritual.</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
