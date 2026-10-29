import type { Metadata } from "next";
import { headers } from "next/headers";

import { AgentsHero, ContractsSection, ExamplesSection, ObservableSection, PillarsSection } from "@/components/agents/sections";
import { resolveSiteOrigin } from "@/lib/site";

export const metadata: Metadata = {
  title: "For agents",
  description:
    "Flow for agents: llms.txt, Markdown for every page, a search and ask API, and a read-only MCP server. Public, documented, no login.",
  alternates: { canonical: "/agents", types: { "text/markdown": "/agents.md" } },
};

export default async function AgentsPage() {
  const h = await headers();
  const origin = resolveSiteOrigin({ get: (name) => h.get(name) });
  return (
    <>
      <AgentsHero />
      <PillarsSection />
      <ContractsSection />
      <ExamplesSection origin={origin} />
      <ObservableSection host={origin.replace(/^https?:\/\//u, "")} />
    </>
  );
}
