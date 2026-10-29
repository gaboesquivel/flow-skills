import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { content } from "@/lib/content";
import { pagePaths } from "@/lib/markdown-pages";
import { resolveSiteOrigin } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const origin = resolveSiteOrigin({ get: (name) => h.get(name) });
  const lastModified = new Date(content.generatedAt);
  return pagePaths().map((path) => ({
    changeFrequency: "weekly",
    lastModified,
    priority: path === "/" ? 1 : path.split("/").length > 2 ? 0.6 : 0.8,
    url: `${origin}${path}`,
  }));
}
