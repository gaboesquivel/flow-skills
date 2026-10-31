import { Command, LayoutList, Target, Undo2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { CommandLine } from "@/components/command-line";
import { HeroOrbit } from "@/components/home/hero-orbit";
import { PaletteLauncher } from "@/components/search/palette-launcher";
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
          Product engineering with AI
        </Eyebrow>
        <h1 className="headline mt-6 text-[clamp(2.6rem,6.4vw,4.6rem)] text-fg">
          Agent skills for
          <br />
          <span className="text-prism">product engineers.</span>
        </h1>
        <Lede className="mt-8 max-w-[34rem] sm:text-lg">
          You decide what to build. Your agent explores, builds, checks, and ships it. Adopt one skill or the whole practice, in your own repo or from an opinionated starter.
        </Lede>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/methodology">Explore the practice</ButtonLink>
          <ButtonLink href="/skills" variant="secondary">
            Browse skills
          </ButtonLink>
        </div>
      </div>
      <HeroOrbit className="mx-auto max-w-[30rem]" />
    </Container>
  );
}

// Each claim is grounded in PRODUCT.md / README.md: product before code, parallel work when it pays, no spec required, ship verifies liveness.
const PRINCIPLES = ["Product first", "Parallel when it pays", "No mandatory specs", "Verified delivery"];

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

type Stage = {
  n: string;
  kicker: string;
  title: string;
  body: string;
  skills: string[];
  dot: string;
  example: { kicker: string; title: string; body: ReactNode };
};

// One continuous, illustrative product journey: the examples describe intended evidence, not claimed results.
const STAGES: Stage[] = [
  {
    n: "01",
    kicker: "Product thinking",
    title: "Intent",
    body: "Define who the product is for, why it matters, what success means, and which assumptions to test first.",
    skills: ["explore", "design", "to-spec"],
    dot: "#9ea6f8",
    example: {
      kicker: "Product direction",
      title: "A better way to find a home",
      body: (
        <>
          <p>
            <b>Identity &amp; goal:</b> Help renters quickly discover suitable homes.
          </p>
          <p>
            <b>Success:</b> OMTM = successful shortlists; support with time-to-shortlist and return usage.
          </p>
          <p>
            <b>First bet:</b> MVP search → results → shortlist, with a clear validation plan.
          </p>
        </>
      ),
    },
  },
  {
    n: "02",
    kicker: "Execution",
    title: "Build",
    body: "Implement the smallest useful vertical slice with thoughtful design, tests, and measurement built in.",
    skills: ["build", "review", "debug"],
    dot: "#b1a0f8",
    example: {
      kicker: "First useful slice",
      title: "Search to shortlist",
      body: <p>Renters can describe their needs, compare relevant homes and save a shortlist. The journey works end-to-end and records completion.</p>,
    },
  },
  {
    n: "03",
    kicker: "Delivery",
    title: "Ship",
    body: "Get the product into real use. Verify deployment and the experience—not merely that a build passed.",
    skills: ["ship", "push"],
    dot: "#c6a8f6",
    example: {
      kicker: "Product in use",
      title: "A renter completes the journey",
      body: <p>The live product supports search, comparison and saving. The release and core user journey have been verified.</p>,
    },
  },
  {
    n: "04",
    kicker: "Learning",
    title: "Measure",
    body: "Evaluate results against intent. Learn whether to improve, change direction, expand or stop.",
    skills: ["measure", "align", "retro"],
    dot: "#f0a6cf",
    example: {
      kicker: "Evidence & next decision",
      title: "Are renters finding the right homes?",
      body: <p>Compare shortlist completion with the baseline, check time-to-shortlist and return usage, then decide whether to improve relevance before expanding.</p>,
    },
  },
];

const skillNames = new Set(skills.map((s) => s.name));

export function PracticeSection() {
  return (
    <Section aria-labelledby="practice-heading">
      <Container>
        <div className="max-w-[67rem]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,37.5rem)_minmax(0,22.5rem)] lg:items-end lg:justify-between">
            <div>
              <Eyebrow>A product-first practice</Eyebrow>
              <h2 id="practice-heading" className="headline mt-5 text-[clamp(2.2rem,4.6vw,3.4rem)] text-fg">
                Build what matters.
              </h2>
              <Lede className="mt-8 leading-[1.8] sm:text-xl sm:leading-[1.8]">
                Design thinking to find the right problem. Lean practices to test the smallest useful bet. Velocity measured by meaningful progress, not just code shipped.
              </Lede>
            </div>
            <p className="leading-[1.8] text-fg-muted">
              <strong className="block font-semibold text-fg">From intent to outcomes that matter.</strong>
              Start anywhere. Use only the skills you need. What you learn informs what comes next.
            </p>
          </div>

          <ol className="mt-14 sm:mt-20">
            {STAGES.map((stage, i) => (
              <li
                key={stage.title}
                className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-4 border-t border-line pb-12 pt-10 md:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1.15fr)] md:gap-x-8 md:pb-18 md:pt-14 lg:grid-cols-[3.75rem_minmax(0,1fr)_33rem] lg:gap-x-10"
              >
                {/* Timeline axis: from this stage's dot to the next one. */}
                {i < STAGES.length - 1 ? (
                  <span aria-hidden="true" className="absolute bottom-[calc(-2.5rem-10px)] left-[9.5px] top-[calc(2.5rem+10px)] w-px bg-[#62527c] md:bottom-[calc(-3.5rem-10px)] md:top-[calc(3.5rem+10px)] lg:left-[29.5px]" />
                ) : null}
                <span
                  aria-hidden="true"
                  className="relative z-10 mt-0.5 size-4 justify-self-start rounded-full border-2 bg-canvas shadow-[0_0_11px_rgb(187_156_228/0.23)] max-lg:ml-[2px] lg:ml-[22px]"
                  style={{ borderColor: stage.dot }}
                />
                <div className="min-w-0">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em]" style={{ color: stage.dot }}>
                    {stage.n} / {stage.kicker}
                  </p>
                  <h3 className="mt-3 text-[1.75rem] font-medium leading-tight tracking-[-0.04em] text-fg sm:text-[2rem]">{stage.title}</h3>
                  <p className="mt-4 max-w-[22rem] leading-[1.75] text-fg-muted">{stage.body}</p>
                  <ul aria-label={`${stage.title} skills`} className="mt-6 flex flex-wrap gap-2">
                    {stage.skills.map((name) => (
                      <li key={name}>
                        {skillNames.has(name) ? (
                          <Link
                            href={`/skills/${name}`}
                            className="inline-flex min-h-8 items-center rounded-full border border-line-strong px-3 font-mono text-xs text-fg-muted transition-colors hover:border-lavender/50 hover:text-fg"
                          >
                            {name}
                          </Link>
                        ) : (
                          <span className="inline-flex min-h-8 items-center rounded-full border border-line-strong px-3 font-mono text-xs text-fg-muted">{name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={`col-start-2 mt-8 min-w-0 self-start p-6 sm:p-8 md:col-start-3 md:row-start-1 md:mt-0 ${
                    i === 0 ? "card-prism border-lavender/35 bg-[linear-gradient(160deg,rgb(52_40_76/0.7)_0%,rgb(30_25_44/0.95)_60%,rgb(32_24_42/0.95)_100%)]" : "card-prism"
                  }`}
                >
                  <p className="label-mono text-lavender/80">Example · {stage.example.kicker}</p>
                  <h4 className="mt-3 text-xl font-medium leading-snug tracking-[-0.025em] text-fg sm:text-[1.375rem]">{stage.example.title}</h4>
                  <div className="mt-4 leading-[1.75] text-fg-muted [&_b]:font-semibold [&_b]:text-fg">{stage.example.body}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="pl-9 md:pl-[4.5rem] lg:pl-[6.25rem]">
            <p className="flex items-center gap-3 font-mono text-sm text-lavender">
              <Undo2 aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              Learning shapes the next intent.
              <span aria-hidden="true" className="h-px flex-1 bg-[linear-gradient(90deg,#8f6bb8,transparent)]" />
            </p>
            <p className="mt-4 text-sm text-fg-subtle">Illustrative product journey · Examples describe intended evidence, not claimed production results.</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function FindSection() {
  return (
    <Section aria-labelledby="find-heading">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>Search and ask</Eyebrow>
            <h2 id="find-heading" className="headline mt-5 text-[clamp(2.2rem,4.6vw,3.4rem)] text-fg">
              Find the skill.
              <br />
              Ask the question.
            </h2>
          </div>
          <p className="max-w-[24rem] text-base leading-relaxed text-fg-muted">
            Search every skill, guide, and decision. Or ask a question and get a short answer that links to its sources.
          </p>
        </div>
        <PaletteLauncher className="mt-10" />
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
      body: "Start from the problem, plan only as much as the change needs, and keep decisions written down.",
      href: "/methodology",
      cta: "Discover the practice",
      Icon: Target,
    },
    {
      n: "02",
      kicker: "The capabilities",
      title: "Portable skills",
      body: `${skills.length} skills for the coding agent you already use. Install one or all of them.`,
      href: "/skills",
      cta: "Browse skills",
      Icon: Command,
    },
    {
      n: "03",
      kicker: "The foundations",
      title: "Flow Starters",
      body: "Opinionated Next.js foundations that make the stack choices for you and deploy to Vercel on day one.",
      href: "/starters",
      cta: "Explore starters",
      Icon: LayoutList,
    },
  ];
  return (
    <Section aria-labelledby="pillars-heading" className="pt-4 sm:pt-8">
      <Container>
        <Eyebrow>Three parts</Eyebrow>
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
            <p className="eyebrow text-ink/80">Install</p>
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
              <p className="mt-4 text-sm text-fg-muted">Adds the skills to your agent. Then say what you want in plain words.</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
