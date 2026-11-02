import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight, Eyebrow, Headline, Lede } from "@/components/ui";
import { capabilitiesByGroup, capabilityPath } from "@/lib/content";

const description =
  "What Flow contributes to delivery, trust, and shared knowledge, with examples, limits, and links to the skills and decisions that own each rule.";

export const metadata: Metadata = {
  title: "Capabilities",
  description,
  alternates: { canonical: "/capabilities" },
};

export default function CapabilitiesIndex() {
  return (
    <div className="max-w-[66rem]">
      <Eyebrow>Capabilities</Eyebrow>
      <Headline lead="What Flow" accent="contributes." className="mt-6" />
      <Lede className="mt-7">{description}</Lede>
      {capabilitiesByGroup().map((group) => {
        const id = `group-${group.name.toLowerCase().replace(/[^a-z]+/gu, "-")}`;
        return (
          <section key={group.name} aria-labelledby={id} className="mt-16">
            <h2 id={id} className="eyebrow">
              {group.name}
            </h2>
            <ul className="mt-5 border-t border-line">
              {group.items.map((c) => (
                <li key={c.slug} className="border-b border-line">
                  <Link href={capabilityPath(c)} className="group -mx-3 flex items-start justify-between gap-6 rounded-lg px-3 py-7 transition-colors hover:bg-panel">
                    <span>
                      <span className="block text-2xl font-bold tracking-[-0.04em] text-fg group-hover:text-lavender-soft">{c.title}</span>
                      <span className="mt-2 block text-[0.95rem] text-fg-muted">{c.description}</span>
                    </span>
                    <ArrowUpRight className="mt-1.5 size-4 shrink-0 text-lavender transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
