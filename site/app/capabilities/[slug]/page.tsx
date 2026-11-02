import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExplanationPage } from "@/components/docs/explanation-page";
import { articlePath, articles, capabilities, capabilityPath, getCapability } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return capabilities.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCapability((await params).slug);
  if (!c) return {};
  return { title: c.title, description: c.description, alternates: { canonical: capabilityPath(c) } };
}

export default async function CapabilityPage({ params }: Props) {
  const c = getCapability((await params).slug);
  if (!c) notFound();
  const related = [
    ...articles.filter((a) => a.capability === c.slug).map((a) => ({ href: articlePath(a), kind: "Article", label: a.title })),
    ...capabilities.filter((o) => o.slug !== c.slug).map((o) => ({ href: capabilityPath(o), kind: "Capability", label: o.title })),
  ];
  return <ExplanationPage entry={c} eyebrow={{ detail: c.group, href: "/capabilities", label: "Capabilities" }} related={related} />;
}
