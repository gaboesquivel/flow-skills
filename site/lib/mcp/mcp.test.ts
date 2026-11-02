import { describe, expect, it } from "vitest";

import { skills } from "@/lib/content";

import { handleMcpRequest } from "./handle-mcp-request";
import { mcpToolCatalog } from "./tool-catalog";

const rpc = async (method: string, params?: unknown, id = 1) => {
  const response = await handleMcpRequest(
    new Request("http://flow.test/api/mcp", {
      body: JSON.stringify({ id, jsonrpc: "2.0", method, params }),
      headers: { Accept: "application/json, text/event-stream", "Content-Type": "application/json", host: "flow.test", "x-forwarded-proto": "http", "x-forwarded-for": `t-${Math.random()}` },
      method: "POST",
    }),
  );
  expect(response.status).toBe(200);
  return (await response.json()) as { result: Record<string, unknown> & { tools?: { name: string; annotations?: { readOnlyHint?: boolean } }[] } };
};

const call = async (name: string, args: Record<string, unknown>) =>
  (await rpc("tools/call", { arguments: args, name })).result as { isError?: boolean; structuredContent: Record<string, unknown> };

describe("Flow MCP", () => {
  it("initializes as server flow", async () => {
    const { result } = await rpc("initialize", { capabilities: {}, clientInfo: { name: "test", version: "1" }, protocolVersion: "2025-06-18" });
    expect((result.serverInfo as { name: string }).name).toBe("flow");
  });

  it("lists every catalogued tool as read-only", async () => {
    const { result } = await rpc("tools/list");
    const tools = result.tools ?? [];
    expect(tools.map((t) => t.name).sort()).toEqual(mcpToolCatalog.map((t) => t.name).sort());
    expect(tools.every((t) => t.annotations?.readOnlyHint)).toBe(true);
  });

  it("get_skill returns build's SKILL.md with absolute links", async () => {
    const skill = await call("get_skill", { name: "build" });
    expect(skill.isError).toBeFalsy();
    expect(skill.structuredContent.name).toBe("build");
    expect(skill.structuredContent.markdown).toContain("# Build");
    expect(skill.structuredContent.url).toBe("http://flow.test/skills/build");
  });

  it("get_skill reports unknown names as tool errors", async () => {
    expect((await call("get_skill", { name: "nope" })).isError).toBe(true);
  });

  it("get_doc resolves guides and decisions", async () => {
    expect((await call("get_doc", { slug: "methodology" })).structuredContent.section).toBe("guide");
    expect((await call("get_doc", { slug: "/docs/decisions/0004-portable-skill-catalog.md" })).structuredContent.section).toBe("decision");
  });

  it("get_doc resolves published capabilities and articles with existing fields", async () => {
    const capability = await call("get_doc", { slug: "capabilities/security-human-control" });
    expect(capability.isError).toBeFalsy();
    expect(capability.structuredContent).toMatchObject({ section: "capability", slug: "capabilities/security-human-control", url: "http://flow.test/capabilities/security-human-control" });
    expect(Object.keys(capability.structuredContent).sort()).toEqual(["description", "markdown", "section", "slug", "source", "status", "title", "url"]);
    const article = await call("get_doc", { slug: "/blog/intent-to-verified-delivery.md" });
    expect(article.structuredContent).toMatchObject({ section: "article", url: "http://flow.test/blog/intent-to-verified-delivery" });
    expect(String(article.structuredContent.source)).toContain("docs/blog/intent-to-verified-delivery.md");
  });

  it("get_doc reports drafts and unknown slugs as tool errors", async () => {
    for (const slug of ["blog/code-quality-agents", "capabilities/multi-agent-collaboration", "capabilities/nope"]) expect((await call("get_doc", { slug })).isError).toBe(true);
  });

  it("search_flow accepts the capability kind", async () => {
    const found = await call("search_flow", { kind: "capability", query: "security human control" });
    const results = found.structuredContent.results as { kind: string; url: string }[];
    expect(results[0]?.url).toBe("http://flow.test/capabilities/security-human-control");
    expect(results.every((r) => r.kind === "capability")).toBe(true);
  });

  it("list_skills and search_flow return results", async () => {
    expect((await call("list_skills", {})).structuredContent.total).toBe(skills.length);
    const found = await call("search_flow", { kind: "skill", limit: 3, query: "ship" });
    expect((found.structuredContent.results as unknown[]).length).toBeGreaterThan(0);
  });
});
