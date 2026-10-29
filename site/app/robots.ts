import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { resolveSiteOrigin } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const origin = resolveSiteOrigin({ get: (name) => h.get(name) });
  return {
    host: origin,
    rules: [{ allow: ["/", "/llms.txt", "/llms-full.txt", "/.well-known/"], disallow: "/md/", userAgent: "*" }],
    sitemap: [`${origin}/sitemap.xml`],
  };
}
