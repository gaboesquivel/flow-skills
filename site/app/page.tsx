import type { Metadata } from "next";

import { FindSection, HomeHero, InstallBand, PillarsSection, PrincipleStrip } from "@/components/home/sections";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Flow — Make ideas flow" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/", types: { "text/markdown": "/index.md", "text/plain": "/llms.txt" } },
};

export default function Home() {
  return (
    <>
      <HomeHero />
      <PrincipleStrip />
      <FindSection />
      <PillarsSection />
      <InstallBand />
    </>
  );
}
