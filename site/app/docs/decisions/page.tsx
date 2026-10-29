import type { Metadata } from "next";

import { DecisionList, type DecisionItem } from "@/components/docs/decision-list";
import { STATUSES, decisionStatus, decisionsNewestFirst, displayTitle, docHref } from "@/components/docs/doc-meta";
import { Eyebrow, Headline, Lede, TextLink } from "@/components/ui";
import { sourceUrl } from "@/lib/content";

const description = "Numbered records of significant choices behind Flow, with their context, decision, and consequences. Newest first.";

export const metadata: Metadata = {
  title: "Decisions",
  description,
  alternates: { canonical: "/docs/decisions" },
};

export default function DecisionsIndex() {
  const items: DecisionItem[] = decisionsNewestFirst().map((d) => ({
    href: docHref(d),
    number: d.number ?? d.slug.slice(10, 14),
    title: displayTitle(d),
    status: decisionStatus(d),
    description: d.description,
  }));
  const statuses = STATUSES.filter((s) => items.some((d) => d.status === s));
  return (
    <div className="max-w-[66rem]">
      <Eyebrow>The Flow field guide</Eyebrow>
      <Headline lead="Decisions," accent="on the record." size="lg" className="mt-6" />
      <Lede className="mt-7">{description}</Lede>
      <p className="mt-5">
        <TextLink href={sourceUrl("docs/decisions")}>Browse docs/decisions on GitHub</TextLink>
      </p>
      <div className="mt-12">
        <DecisionList items={items} statuses={statuses} />
      </div>
    </div>
  );
}
