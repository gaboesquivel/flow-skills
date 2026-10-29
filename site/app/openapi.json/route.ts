import { buildOpenApiDocument } from "@/lib/openapi";
import { resolveSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export const GET = (request: Request) =>
  Response.json(buildOpenApiDocument(resolveSiteOrigin(request)), {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" },
  });
