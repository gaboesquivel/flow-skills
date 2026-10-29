import { content } from "@/lib/content";

export const MCP_SERVER = { name: "flow", title: "Flow", version: content.version } as const;

export const mcpToolCatalog = [
  { description: "Search Flow skills, guides, decisions, and starters; returns ranked results with canonical URLs and excerpts.", name: "search_flow" },
  { description: "List Flow skills with summary, trigger phrases, and group; optionally filter by catalog group.", name: "list_skills" },
  { description: "Get one skill's SKILL.md as Markdown with metadata, install command, and source URL.", name: "get_skill" },
  { description: "Get a guide or decision record as Markdown by slug (for example methodology or decisions/0044-fast-delivery).", name: "get_doc" },
  { description: "Answer a question about Flow from its sources: an extractive cited answer plus the source passages to ground your own answer.", name: "ask_flow" },
] as const;

export const buildMcpServerCard = (origin: string) => ({
  authentication: { required: false },
  description: "Read-only access to the Flow methodology: skills, guides, decision records, and source-grounded search.",
  documentation: `${origin}/agents`,
  serverInfo: MCP_SERVER,
  tools: mcpToolCatalog,
  transport: { endpoint: `${origin}/api/mcp`, type: "streamable-http" },
  version: "1.0",
});

export const buildMcpRegistryManifest = (origin: string) => ({
  mcpServers: { flow: { transport: { type: "http", url: `${origin}/api/mcp` } } },
  serverCard: `${origin}/.well-known/mcp/server-card.json`,
});

export const buildAiCatalog = (origin: string) => ({
  apis: [{ description: "Flow search and ask HTTP API", name: "flow-api", openapi: `${origin}/openapi.json` }],
  documentation: { llms: `${origin}/llms.txt`, llmsFull: `${origin}/llms-full.txt` },
  servers: [
    {
      description: "Flow MCP: search and read skills, guides, and decisions.",
      name: MCP_SERVER.name,
      transport: { type: "streamable-http", url: `${origin}/api/mcp` },
      url: `${origin}/.well-known/mcp/server-card.json`,
    },
  ],
  version: "1.0",
});
