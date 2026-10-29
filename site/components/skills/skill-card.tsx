import Link from "next/link";

import { ArrowUpRight } from "@/components/ui";
import { cn } from "@/lib/cn";

export type SkillCardData = { name: string; summary: string; group: string; say: string | null; phrases: string[] };

/** Whole-card link to a skill: the heading link stretches over the card. */
export function SkillCard({ skill, headingLevel = "h2", className }: { skill: SkillCardData; headingLevel?: "h2" | "h3"; className?: string }) {
  const Heading = headingLevel;
  return (
    <article className={cn("card card-link group relative flex h-full flex-col p-6 sm:p-7", className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono text-lavender/80">{skill.group}</p>
        <ArrowUpRight className="size-3.5 text-fg-subtle transition-colors group-hover:text-lavender" />
      </div>
      <Heading className="mt-6 text-2xl font-bold tracking-[-0.04em] text-fg sm:text-[1.7rem]">
        <Link href={`/skills/${skill.name}`} className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-lavender focus-visible:after:outline-offset-2">
          {skill.name}
        </Link>
      </Heading>
      <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-fg-muted">{skill.summary}</p>
      {skill.say ? (
        <p className="mt-5 text-sm text-fg">
          Say <span className="text-lavender">“{skill.say}”</span>
        </p>
      ) : null}
    </article>
  );
}
