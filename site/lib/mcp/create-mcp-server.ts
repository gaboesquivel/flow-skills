import { McpServer } from "@modelcontextprotocol/server";

import { registerFlowTools } from "./register-tools";
import { MCP_SERVER } from "./tool-catalog";

export const createFlowMcpServer = (origin: string) => {
  const server = new McpServer(MCP_SERVER, {
    instructions: `Read-only tools for Flow, a human-led product engineering methodology for AI agents. Start with search_flow or list_skills, then get_skill or get_doc for full Markdown. Index: ${origin}/llms.txt`,
  });
  registerFlowTools(server, origin);
  return server;
};
