import type { Metadata } from "next";

import { PathsSection, PrinciplesSection, StepsSection } from "@/components/methodology/sections";
import { ButtonLink, Container, Eyebrow, Headline, Lede } from "@/components/ui";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "Flow is a practice, not a pipeline: start with a real problem, plan only when it helps, build independent work in parallel, and verify what ships.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <>
      <Container className="pb-8 pt-14 sm:pt-20 lg:pt-24">
        <Eyebrow>01 / The methodology</Eyebrow>
        <Headline lead="A practice." accent="Not a pipeline." className="mt-6" />
        <Lede className="mt-8">
          Start with a real problem, use only the planning that helps, let independent agents work in parallel, and verify what ships. The product stays
          central; the process stays proportional.
        </Lede>
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
