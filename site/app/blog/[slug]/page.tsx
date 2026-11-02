import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExplanationPage } from "@/components/docs/explanation-page";
import { articlePath, capabilityPath, getArticle, getCapability, articles } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return { title: a.title, description: a.description, alternates: { canonical: articlePath(a) }, openGraph: { type: "article", publishedTime: a.published, modifiedTime: a.updated } };
}

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const capability = getCapability(a.capability);
  const related = capability ? [{ href: capabilityPath(capability), kind: "Capability", label: capability.title }] : [];
  return <ExplanationPage entry={a} eyebrow={{ href: "/blog", label: "Articles" }} related={related} />;
}
