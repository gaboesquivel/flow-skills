import { buildLlmsFullTxt } from "@/lib/markdown-pages";
import { resolveSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export const GET = (request: Request) =>
  new Response(buildLlmsFullTxt(resolveSiteOrigin(request)), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600", "Content-Type": "text/plain; charset=utf-8" },
  });
