import { buildAiCatalog } from "@/lib/mcp/tool-catalog";
import { resolveSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export const GET = (request: Request) =>
  Response.json(buildAiCatalog(resolveSiteOrigin(request)), { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" } });
