import { content } from "@/lib/content";
import { mcpToolCatalog } from "@/lib/mcp/tool-catalog";
import { SITE_DESCRIPTION } from "@/lib/site";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const errorResponse = (description: string) => ({
  content: { "application/json": { schema: ref("ApiError") } },
  description,
});

const rateLimited = {
  ...errorResponse("Too many requests from this client."),
  headers: { "Retry-After": { description: "Seconds to wait before retrying.", schema: { type: "integer" } } },
};

const kind = { enum: ["skill", "doc", "decision", "starter"], type: "string" };

/** OpenAPI 3.1 for the public HTTP API: search, ask, and the MCP endpoint. */
export const buildOpenApiDocument = (origin: string) => ({
  openapi: "3.1.0",
  info: {
    description: `${SITE_DESCRIPTION} Read-only, no authentication. Agent index: ${origin}/llms.txt`,
    title: "Flow API",
    version: content.version,
  },
  servers: [{ url: origin }],
  externalDocs: { description: "For agents", url: `${origin}/agents` },
  paths: {
    "/api/search": {
      get: {
        operationId: "search",
        summary: "Search Flow skills, guides, decisions, and starters",
        parameters: [
          { in: "query", name: "q", required: true, schema: { maxLength: 200, minLength: 1, type: "string" }, example: "ship it" },
          { in: "query", name: "limit", required: false, schema: { default: 10, maximum: 25, minimum: 1, type: "integer" } },
          {
            description: "Repeat or comma-separate to include several kinds.",
            in: "query",
            name: "kind",
            required: false,
            schema: { items: kind, type: "array" },
            style: "form",
            explode: true,
          },
        ],
        responses: {
          "200": { content: { "application/json": { schema: ref("SearchResponse") } }, description: "Ranked results." },
          "400": errorResponse("Missing or invalid parameter."),
          "429": rateLimited,
        },
      },
    },
    "/api/ask": {
      post: {
        operationId: "ask",
        summary: "Answer a question from Flow's sources with numbered citations",
        parameters: [
          {
            description: "Set to 1 to stream the answer as text/plain; citations arrive in the X-Flow-Citations header (URI-encoded JSON).",
            in: "query",
            name: "stream",
            required: false,
            schema: { enum: ["1"], type: "string" },
          },
        ],
        requestBody: {
          content: { "application/json": { schema: ref("AskRequest") } },
          required: true,
        },
        responses: {
          "200": {
            content: {
              "application/json": { schema: ref("AskResponse") },
              "text/plain": { schema: { description: "Streamed answer when stream=1.", type: "string" } },
            },
            description: "Answer with citations. mode is extractive when no model is configured or generation fails.",
          },
          "400": errorResponse("Invalid JSON or question."),
          "413": errorResponse("Body too large."),
          "429": rateLimited,
        },
      },
    },
    "/api/mcp": {
      post: {
        operationId: "mcp",
        summary: "MCP Streamable HTTP endpoint (stateless, JSON-RPC 2.0)",
        description: `Send JSON-RPC 2.0 with Accept: application/json, text/event-stream. Read-only tools: ${mcpToolCatalog.map((t) => t.name).join(", ")}. Server card: ${origin}/.well-known/mcp/server-card.json`,
        requestBody: {
          content: { "application/json": { schema: ref("JsonRpcRequest") } },
          required: true,
        },
        responses: {
          "200": { content: { "application/json": { schema: { type: "object" } } }, description: "JSON-RPC response." },
          "406": { description: "Accept header must include application/json and text/event-stream." },
          "429": rateLimited,
        },
        "x-mcp-tools": mcpToolCatalog,
      },
    },
  },
  components: {
    schemas: {
      ApiError: {
        properties: {
          code: { description: "Stable machine-readable code.", type: "string" },
          error: { description: "Human-readable message.", type: "string" },
          resolution: { description: "What to do next.", type: "string" },
          type: { format: "uri", type: "string" },
        },
        required: ["code", "error", "resolution", "type"],
        type: "object",
      },
      SearchResult: {
        properties: {
          excerpt: { type: "string" },
          heading: { type: ["string", "null"] },
          kind,
          path: { description: "Site-relative path with anchor.", type: "string" },
          score: { type: "number" },
          title: { type: "string" },
          url: { format: "uri", type: "string" },
        },
        required: ["title", "kind", "url", "path", "heading", "excerpt", "score"],
        type: "object",
      },
      SearchResponse: {
        properties: { query: { type: "string" }, results: { items: ref("SearchResult"), type: "array" }, total: { type: "integer" } },
        required: ["query", "total", "results"],
        type: "object",
      },
      AskRequest: {
        properties: { question: { maxLength: 500, minLength: 1, type: "string" } },
        required: ["question"],
        type: "object",
      },
      Citation: {
        properties: {
          heading: { type: ["string", "null"] },
          kind,
          n: { type: "integer" },
          path: { type: "string" },
          title: { type: "string" },
          url: { format: "uri", type: "string" },
        },
        required: ["n", "title", "kind", "heading", "url", "path"],
        type: "object",
      },
      AskResponse: {
        properties: {
          answer: { description: "Markdown with [n] citation markers.", type: "string" },
          citations: { items: ref("Citation"), type: "array" },
          mode: { enum: ["generated", "extractive"], type: "string" },
          model: { type: ["string", "null"] },
          question: { type: "string" },
        },
        required: ["question", "answer", "mode", "model", "citations"],
        type: "object",
      },
      JsonRpcRequest: {
        properties: {
          id: { type: ["string", "integer"] },
          jsonrpc: { const: "2.0" },
          method: { examples: ["initialize", "tools/list", "tools/call"], type: "string" },
          params: { type: "object" },
        },
        required: ["jsonrpc", "method"],
        type: "object",
      },
    },
  },
});
