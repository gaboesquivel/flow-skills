import { buildMcpRegistryManifest } from "@/lib/mcp/tool-catalog";
import { resolveSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export const GET = (request: Request) =>
  Response.json(buildMcpRegistryManifest(resolveSiteOrigin(request)), { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" } });
