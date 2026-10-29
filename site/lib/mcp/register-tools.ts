import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { buildSources, extractiveAnswer, toCitations } from "@/lib/ask";
import { catalogGroups, type ChunkKind, getDoc, getSkill, installCommand, skillsInCatalogOrder, sourceUrl } from "@/lib/content";
import { docPath } from "@/lib/markdown-pages";
import { search } from "@/lib/search";
import { absolutizeMarkdown } from "@/lib/site";

import { mcpToolCatalog } from "./tool-catalog";
import { asToolError, asToolResult } from "./tool-result";

const readOnly = { destructiveHint: false, idempotentHint: true, openWorldHint: false, readOnlyHint: true };

const describe = (name: (typeof mcpToolCatalog)[number]["name"]) => mcpToolCatalog.find((t) => t.name === name)?.description ?? "";

const KINDS = ["skill", "doc", "decision", "starter"] as const satisfies readonly ChunkKind[];

export const registerFlowTools = (server: McpServer, origin: string) => {
  const abs = (path: string) => `${origin}${path}`;

  server.registerTool(
    "search_flow",
    {
      annotations: { ...readOnly, title: "Search Flow" },
      description: describe("search_flow"),
      inputSchema: z.object({
        kind: z.enum(KINDS).optional().describe("Restrict to one kind of source."),
        limit: z.number().int().min(1).max(25).optional().describe("Maximum results (default 10)."),
        query: z.string().min(1).max(200).describe("Search terms, for example 'ship a change'."),
      }),
    },
    ({ kind, limit, query }) => {
      const results = search(query, { kinds: kind ? [kind] : undefined, limit: limit ?? 10 }).map((r) => ({
        excerpt: r.excerpt,
        heading: r.heading,
        kind: r.kind,
        path: r.url,
        score: r.score,
        title: r.title,
        url: abs(r.url),
      }));
      return asToolResult({ query, results, total: results.length });
    },
  );

  server.registerTool(
    "list_skills",
    {
      annotations: { ...readOnly, title: "List Flow skills" },
      description: describe("list_skills"),
      inputSchema: z.object({
        group: z.string().optional().describe(`Catalog group: ${catalogGroups.map((g) => g.name).join(", ")}.`),
      }),
    },
    ({ group }) => {
      const wanted = group?.trim().toLowerCase();
      const skills = skillsInCatalogOrder()
        .filter((s) => !wanted || s.group.toLowerCase() === wanted)
        .map((s) => ({ group: s.group, name: s.name, phrases: s.phrases, summary: s.summary, url: abs(`/skills/${s.name}`) }));
      return asToolResult({ groups: catalogGroups.map((g) => g.name), install: installCommand(), skills, total: skills.length });
    },
  );

  server.registerTool(
    "get_skill",
    {
      annotations: { ...readOnly, title: "Get a Flow skill" },
      description: describe("get_skill"),
      inputSchema: z.object({ name: z.string().min(1).max(64).describe("Skill name, for example 'build'.") }),
    },
    ({ name }) => {
      const s = getSkill(name.trim().toLowerCase());
      if (!s) return asToolError(`No skill named "${name}".`, "Call list_skills for valid names.");
      return asToolResult({
        description: s.description,
        group: s.group,
        install: installCommand(s.name),
        markdown: absolutizeMarkdown(s.markdown, origin),
        name: s.name,
        phrases: s.phrases,
        source: sourceUrl(s.source),
        summary: s.summary,
        url: abs(`/skills/${s.name}`),
        when: s.whenMarkdown ? absolutizeMarkdown(s.whenMarkdown, origin) : s.when,
      });
    },
  );

  server.registerTool(
    "get_doc",
    {
      annotations: { ...readOnly, title: "Get a Flow guide or decision" },
      description: describe("get_doc"),
      inputSchema: z.object({
        slug: z.string().min(1).max(160).describe("Guide slug (methodology, principles, get-started) or decisions/NNNN-name."),
      }),
    },
    ({ slug }) => {
      const clean = slug.trim().replace(/^\/?(docs\/)?/u, "").replace(/(\.md)?\/?$/u, "");
      const doc = getDoc(clean);
      if (!doc) return asToolError(`No guide or decision with slug "${slug}".`, "Use search_flow with kind 'doc' or 'decision' to find slugs.");
      return asToolResult({
        description: doc.description,
        markdown: absolutizeMarkdown(doc.markdown, origin),
        section: doc.section,
        slug: doc.slug,
        source: sourceUrl(doc.source),
        status: doc.status ?? null,
        title: doc.title,
        url: abs(docPath(doc)),
      });
    },
  );

  server.registerTool(
    "ask_flow",
    {
      annotations: { ...readOnly, title: "Ask Flow" },
      description: describe("ask_flow"),
      inputSchema: z.object({ question: z.string().min(1).max(500).describe("A question about Flow.") }),
    },
    ({ question }) => {
      const sources = buildSources(question, origin);
      return asToolResult({
        answer: absolutizeMarkdown(extractiveAnswer(question, sources), origin),
        citations: toCitations(sources),
        mode: "extractive",
        question,
        sources: sources.map((s) => ({ n: s.n, text: s.text.slice(0, 2400), url: s.url })),
      });
    },
  );
};
