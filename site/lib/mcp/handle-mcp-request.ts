import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";

import { createRateLimiter, jsonError } from "@/lib/api";
import { resolveSiteOrigin } from "@/lib/site";

import { createFlowMcpServer } from "./create-mcp-server";

export const MCP_RATE_LIMIT = { limit: 120, windowSeconds: 60 };

const limited = createRateLimiter({ name: "MCP", ...MCP_RATE_LIMIT });

/** Stateless Streamable HTTP: a fresh server and transport per request, JSON responses. */
export const handleMcpRequest = async (request: Request) => {
  const over = limited(request);
  if (over) return over;

  const server = createFlowMcpServer(resolveSiteOrigin(request));
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true, sessionIdGenerator: undefined });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request);
  } catch (error) {
    return jsonError({
      code: "mcp_handler_error",
      message: error instanceof Error ? error.message : "MCP request failed.",
      resolution: "Send a JSON-RPC 2.0 body with POST and Accept: application/json, text/event-stream.",
      status: 500,
    });
  } finally {
    await transport.close();
    await server.close();
  }
};
