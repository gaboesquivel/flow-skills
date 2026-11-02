import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight, Eyebrow, Headline, Lede } from "@/components/ui";
import { articlePath, articles, getCapability } from "@/lib/content";

const description = "Longer explanations of Flow's practices, each following a real example back to the skills, docs, and decisions that own the rules.";

export const metadata: Metadata = {
  title: "Articles",
  description,
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <div className="max-w-[66rem]">
      <Eyebrow>Articles</Eyebrow>
      <Headline lead="Practice," accent="explained." className="mt-6" />
      <Lede className="mt-7">{description}</Lede>
      <ul className="mt-16 border-t border-line">
        {articles.map((a) => (
          <li key={a.slug} className="border-b border-line">
            <Link href={articlePath(a)} className="group -mx-3 flex items-start justify-between gap-6 rounded-lg px-3 py-7 transition-colors hover:bg-panel">
              <span>
                <span className="label-mono block">
                  <time dateTime={a.published}>{a.published}</time>
                  {getCapability(a.capability) ? ` · ${getCapability(a.capability)?.title}` : null}
                </span>
                <span className="mt-2 block text-2xl font-bold tracking-[-0.04em] text-fg group-hover:text-lavender-soft">{a.title}</span>
                <span className="mt-2 block text-[0.95rem] text-fg-muted">{a.description}</span>
              </span>
              <ArrowUpRight className="mt-1.5 size-4 shrink-0 text-lavender transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
