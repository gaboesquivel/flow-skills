import type { Metadata } from "next";

import { CommandLine } from "@/components/command-line";
import { SkillFilter } from "@/components/skills/skill-filter";
import { Container, Eyebrow, Headline, Lede } from "@/components/ui";
import { catalogGroups, installCommand, skillsInCatalogOrder } from "@/lib/content";

const description = "Say what you want in plain words and your agent picks the skill. Each skill works on its own, in any order.";

export const metadata: Metadata = {
  title: "Skills",
  description: `Flow's portable agent skills. ${description}`,
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  const skills = skillsInCatalogOrder().map(({ name, summary, group, say, phrases }) => ({ name, summary, group, say, phrases }));
  const groups = catalogGroups.map((g) => g.name).filter((name) => skills.some((s) => s.group === name));

  return (
    <Container className="pb-24 pt-16 sm:pt-24">
      <Eyebrow>02 / Portable skills</Eyebrow>
      <Headline lead="Good judgment." accent="On demand." className="mt-6" />
      <Lede className="mt-8">{description}</Lede>
      <CommandLine command={installCommand()} className="mt-10 max-w-3xl" />
      <section aria-label="Skill catalog" className="mt-16 sm:mt-20">
        <SkillFilter skills={skills} groups={groups} />
      </section>
    </Container>
  );
}
