import type { Metadata } from "next";
import Link from "next/link";

import { PathsSection, PrinciplesSection, StepsSection } from "@/components/methodology/sections";
import { ButtonLink, Container, Eyebrow, Headline, Lede } from "@/components/ui";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "Flow is a practice, not a pipeline: start with a real problem, plan only when it helps, build independent pieces in parallel, and check that what ships works.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <>
      <Container className="pb-8 pt-14 sm:pt-20 lg:pt-24">
        <Eyebrow>01 / The methodology</Eyebrow>
        <Headline lead="A practice." accent="Not a pipeline." className="mt-6" />
        <Lede className="mt-8">
          Start with a real problem, plan only when it helps, let agents work on independent pieces in parallel, and check that what ships works. Adopt one
          skill or all of them; the workflow bends to the work.
        </Lede>
        <p className="mt-5 max-w-[46rem] text-fg-muted">
          The <Link href="/starters" className="text-lavender hover:text-lavender-soft">starters</Link> are the exception: they are deliberately opinionated, so a
          new project skips the setup debates and deploys on day one. Prefer other choices? Keep the practice and bring your own repo.
        </p>
        <div className="mt-9">
          <ButtonLink href="/docs/methodology">Read the field guide</ButtonLink>
        </div>
      </Container>
      <StepsSection />
      <PathsSection />
      <PrinciplesSection />
    </>
  );
}
