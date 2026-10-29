import { CORS_HEADERS } from "@/lib/api";
import { content } from "@/lib/content";
import { mcpToolCatalog } from "@/lib/mcp/tool-catalog";
import { resolveSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export const GET = (request: Request) => {
  const origin = resolveSiteOrigin(request);
  return Response.json(
    {
      description: "Flow public API: read-only, no authentication.",
      documentation: `${origin}/agents`,
      endpoints: [
        { description: "Ranked search over skills, guides, decisions, and starters.", method: "GET", url: `${origin}/api/search?q={query}&limit={1-25}&kind={skill|doc|decision|starter}` },
        { description: "Source-grounded answer with citations; ?stream=1 streams text.", method: "POST", url: `${origin}/api/ask` },
        { description: "MCP Streamable HTTP (JSON-RPC 2.0).", method: "POST", tools: mcpToolCatalog.map((t) => t.name), url: `${origin}/api/mcp` },
      ],
      llms: `${origin}/llms.txt`,
      mcp: `${origin}/.well-known/mcp.json`,
      name: "flow",
      openapi: `${origin}/openapi.json`,
      version: content.version,
    },
    { headers: CORS_HEADERS },
  );
};
