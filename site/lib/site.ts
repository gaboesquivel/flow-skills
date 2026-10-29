type HeaderLike = Pick<Headers, "get">;

export const SITE_NAME = "Flow";
export const SITE_TAGLINE = "Make ideas flow.";
export const SITE_DESCRIPTION =
  "Flow is a lightweight, human-directed, agent-executed product engineering methodology for building software with AI agents: portable skills, Vercel-first starters, and source-grounded documentation for humans and agents.";

export const NAV = [
  { href: "/methodology", label: "Methodology" },
  { href: "/skills", label: "Skills" },
  { href: "/starters", label: "Starters" },
  { href: "/docs", label: "Docs" },
] as const;

/** Example questions the palette and Home offer to Ask. */
export const SUGGESTED_QUESTIONS = [
  "How do I fix a small bug with Flow?",
  "How does Flow keep PRODUCT.md aligned?",
  "Should I start with flow-next or flow-mono?",
] as const;

/** Canonical origin: explicit env, then the request, then Vercel, then localhost. */
export const resolveSiteOrigin = (request?: Request | HeaderLike) => {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/u, "");
  const production = process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : undefined;
  if (production) return `https://${production.replace(/^https?:\/\//u, "").replace(/\/$/u, "")}`;
  const headers = request && "headers" in request ? request.headers : request;
  const host = headers?.get("x-forwarded-host") ?? headers?.get("host");
  if (host) {
    const proto = headers?.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto.split(",")[0]}://${host.split(",")[0]?.trim()}`;
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//u, "").replace(/\/$/u, "")}`;
  return "http://localhost:3000";
};

/** Static origin for metadata (build time): env or Vercel production URL. */
export const staticSiteOrigin = () => resolveSiteOrigin();

/** Absolutize site-relative Markdown links for agent-facing output. */
export const absolutizeMarkdown = (markdown: string, origin: string) =>
  markdown.replace(/\]\((\/[^)\s]*)/gu, `](${origin}$1`);
