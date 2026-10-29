import type { Metadata } from "next";

import { FindSection, HomeHero, InstallBand, PillarsSection, PracticeSection, PrincipleStrip } from "@/components/home/sections";
import { content, repo } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_NAME, staticSiteOrigin } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Flow — Make ideas flow" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/", types: { "text/markdown": "/index.md", "text/plain": "/llms.txt" } },
};

const structuredData = () => {
  const origin = staticSiteOrigin();
  const author = { "@type": "Person", name: "Gabo Esquivel", url: `https://github.com/${repo.owner}`, sameAs: ["https://gaboesquivel.com"] };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: SITE_NAME,
        url: origin,
        description: SITE_DESCRIPTION,
        publisher: author,
        potentialAction: { "@type": "SearchAction", target: `${origin}/search?q={query}`, "query-input": "required name=query" },
      },
      {
        "@type": "SoftwareSourceCode",
        name: "Flow Skills",
        description: "Portable agent skills for Flow, installed with npx skills add.",
        codeRepository: repo.url,
        license: "https://opensource.org/licenses/MIT",
        version: content.version,
        programmingLanguage: "Markdown",
        author,
      },
    ],
  };
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint: JSON-LD built from static data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replaceAll("<", "\\u003c") }}
      />
      <HomeHero />
      <PrincipleStrip />
      <PracticeSection />
      <FindSection />
      <PillarsSection />
      <InstallBand />
    </>
  );
}
