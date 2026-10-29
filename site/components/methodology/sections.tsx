import { Fragment } from "react";

import { deliveryPaths, productPrinciples } from "@/components/methodology/data";
import { ButtonLink, Container, Eyebrow, Section, TextLink } from "@/components/ui";

const STEPS = [
  {
    n: "01",
    kicker: "Always",
    title: "Intent",
    body: "Know what matters and why. A plain request is enough; “explore this” asks in proportion to the change, nothing for a fix.",
    skill: "explore",
  },
  {
    n: "02",
    kicker: "When useful",
    title: "Plan?",
    body: "Agree on the approach in conversation. Say “spec it” and “break it down” only for a bet worth tracking.",
    skill: "to-spec",
  },
  {
    n: "03",
    kicker: "Parallel",
    title: "Build",
    body: "“Build it” implements the change, reviews and checks it, and ends with a verified branch that is not merged yet.",
    skill: "build",
  },
  {
    n: "04",
    kicker: "Proof",
    title: "Ship",
    body: "“Ship it” builds when the branch is not verified yet, lands it, and confirms the shipped commit is live.",
    skill: "ship",
  },
];

export function StepsSection() {
  return (
    <Section aria-labelledby="steps-heading">
      <Container>
        <Eyebrow>Intent → Plan? → Build → Ship</Eyebrow>
        <h2 id="steps-heading" className="headline mt-5 text-[clamp(2.2rem,4.6vw,3.4rem)] text-fg">
          One Flow.
          <br />
          Whatever the task.
        </h2>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.title} className="card flex flex-col p-6">
              <p className="label-mono">
                {s.n} / {s.kicker}
              </p>
              <h3 className="mt-10 text-2xl font-bold tracking-[-0.04em] text-fg">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">{s.body}</p>
              <TextLink href={`/skills/${s.skill}`} className="mt-5 self-start font-mono text-xs">
                {s.skill}
              </TextLink>
            </li>
          ))}
        </ol>
        <div className="card-prism mt-4 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-lg font-bold tracking-[-0.03em] text-fg">Explore and Align are independent practices.</p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
              Explore product uncertainty before you build. Align the actual product to its vision, metrics, and roadmap. Neither is a mandatory stage of every
              change.
            </p>
          </div>
          <ButtonLink href="/skills" variant="secondary" className="shrink-0 self-start sm:self-auto">
            Find the right skill
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}

const PATH_NOTES: Record<string, string> = {
  "Quick fix": "Start with the request. No spec, no questions: build, check once, and ship it.",
  "Shaped idea": "Explore asks in proportion to the change; build the confirmed brief directly.",
  "Tracked bet": "A bet worth tracking gets a spec and verifiable tasks before the build.",
  "New project": "Start bootstraps from flow-next or flow-mono while explore shapes the product.",
};

/** Renders a "You say" cell: quoted phrases highlighted, connectives muted. */
function Phrases({ text }: { text: string }) {
  const parts = text.split(/(“[^”]+”|"[^"]+")/u).filter(Boolean);
  return (
    <p className="font-mono text-[0.8rem] leading-relaxed text-fg-subtle">
      {parts.map((p, i) => (
        <Fragment key={i}>{/^["“]/u.test(p) ? <span className="text-lavender">{p}</span> : p}</Fragment>
      ))}
    </p>
  );
}

export function PathsSection() {
  const paths = deliveryPaths();
  return (
    <Section aria-labelledby="paths-heading" className="pt-4 sm:pt-8">
      <Container>
        <Eyebrow>Right-sized planning</Eyebrow>
        <h2 id="paths-heading" className="headline mt-5 text-[clamp(2.2rem,4.6vw,3.4rem)] text-fg">
          Same practice.
          <br />
          Different needs.
        </h2>
        <p className="mt-6 max-w-[40rem] leading-relaxed text-fg-muted">
          There is no required order: start anywhere, skip any step. Say a phrase and the matching skill runs.
        </p>
        <ul className="mt-10 grid gap-3 md:grid-cols-2">
          {paths.map((p) => (
            <li key={p.path} className="card p-6 sm:p-7">
              <h3 className="text-xl font-bold tracking-[-0.035em] text-fg">{p.path}</h3>
              {PATH_NOTES[p.path] ? <p className="mt-2 text-sm leading-relaxed text-fg-muted">{PATH_NOTES[p.path]}</p> : null}
              <div className="mt-5">
                <Phrases text={p.say} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-fg-subtle">Every other skill can run at any time and never blocks delivery.</p>
      </Container>
    </Section>
  );
}

export function PrinciplesSection() {
  const principles = productPrinciples();
  return (
    <Section aria-labelledby="principles-heading" className="pt-4 sm:pt-8">
      <Container>
        <Eyebrow>What Flow holds to</Eyebrow>
        <h2 id="principles-heading" className="headline mt-5 text-[clamp(2.2rem,4.6vw,3.4rem)] text-fg">
          Product before process.
        </h2>
        <ol className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {principles.map((p, i) => (
            <li key={p.title} className="flex gap-4 border-t border-line pt-5">
              <span aria-hidden="true" className="label-mono pt-1 text-violet">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-bold tracking-[-0.02em] text-fg">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          <TextLink href="/docs/product#principles">Principles in context</TextLink>
          <TextLink href="/docs/principles">Practice principles</TextLink>
        </div>
      </Container>
    </Section>
  );
}
