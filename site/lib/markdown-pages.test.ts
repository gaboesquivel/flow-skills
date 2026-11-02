import { describe, expect, it } from "vitest";

import { articles, capabilities, chunks, decisions, guides, skills } from "@/lib/content";
import { buildLlmsFullTxt, buildLlmsTxt, markdownForPath, pagePaths } from "@/lib/markdown-pages";
import { starters } from "@/lib/starters";
import { prefersMarkdown } from "@/proxy";

const origin = "https://flow.test";

describe("markdownForPath", () => {
  it("resolves every sitemap page", () => {
    for (const path of pagePaths()) expect(markdownForPath(path, origin), path).toMatch(/^# /u);
  });

  it("covers skills, guides, decisions, and starters", () => {
    expect(markdownForPath("/skills/build", origin)).toContain(`Canonical: ${origin}/skills/build`);
    expect(markdownForPath(`/docs/${guides[0]?.slug}`, origin)).not.toBeNull();
    expect(markdownForPath(`/docs/${decisions[0]?.slug}`, origin)).not.toBeNull();
    expect(markdownForPath(`/starters/${starters[0]?.slug}`, origin)).not.toBeNull();
  });

  it("covers published capabilities and articles with source and status caveats", () => {
    expect(capabilities.length).toBeGreaterThan(0);
    expect(articles.length).toBeGreaterThan(0);
    for (const entry of [...capabilities, ...articles]) {
      const path = entry.kind === "capability" ? `/capabilities/${entry.slug}` : `/blog/${entry.slug}`;
      const md = markdownForPath(path, origin) ?? "";
      expect(md, path).toContain(`Canonical: ${origin}${path}`);
      expect(md, path).toContain(`Source: https://github.com/`);
      expect(md, path).toContain("defines none itself");
      expect(pagePaths()).toContain(path);
    }
    expect(markdownForPath("/capabilities", origin)).toContain("## Delivery & Execution");
    expect(markdownForPath("/blog", origin)).toContain(`(${origin}/blog/${articles[0]?.slug})`);
  });

  it("keeps diagram source and its prose in Markdown", () => {
    const withDiagram = [...capabilities, ...articles].filter((e) => e.markdown.includes("```mermaid"));
    expect(withDiagram.length).toBeGreaterThan(0);
    for (const e of withDiagram) {
      expect(e.html).toContain('<figure class="diagram">');
      const md = markdownForPath(e.kind === "capability" ? `/capabilities/${e.slug}` : `/blog/${e.slug}`, origin) ?? "";
      expect(md).toContain("```mermaid");
      expect(md).toMatch(/accTitle:/u);
    }
  });

  it("links capability and article sources to site routes, and their search citations to real headings", () => {
    const article = articles.find((a) => a.slug === "intent-to-verified-delivery");
    for (const c of capabilities) expect(article?.html).toContain(`href="/capabilities/${c.slug}`);
    const entries = new Map([...capabilities, ...articles].map((e) => [e.kind === "capability" ? `/capabilities/${e.slug}` : `/blog/${e.slug}`, e]));
    const cited = chunks.filter((c) => c.kind === "capability" || c.kind === "article");
    expect(cited.length).toBeGreaterThan(0);
    for (const c of cited) {
      const [page = "", anchor] = c.url.split("#");
      const entry = entries.get(page);
      expect(entry, c.url).toBeDefined();
      if (anchor) expect(entry?.headings.map((h) => h.id), c.url).toContain(anchor);
    }
  });

  it("groups the docs hub by reader task and keeps guide URLs", () => {
    const hub = markdownForPath("/docs", origin) ?? "";
    for (const group of ["Start", "Workflows", "Engineering practices", "Reference", "Agents"]) expect(hub).toContain(`## ${group}`);
    for (const g of guides) expect(hub).toContain(`${origin}/docs/${g.slug}`);
  });

  it("returns null for unknown paths", () => {
    for (const path of ["/nope", "/skills/nope", "/docs/nope", "/starters/nope", "/api/search", "/capabilities/nope", "/blog/nope", "/blog/code-quality-agents", "/capabilities/multi-agent-collaboration"]) expect(markdownForPath(path, origin)).toBeNull();
  });

  it("absolutizes site links", () => {
    expect(markdownForPath("/skills/build", origin)).not.toMatch(/\]\(\/[^/]/u);
  });
});

describe("llms.txt", () => {
  const txt = buildLlmsTxt(origin);
  it("follows llmstxt.org shape", () => {
    expect(txt.startsWith("# Flow\n\n> ")).toBe(true);
    expect(txt).toContain("## Skills");
  });
  it("lists every skill with its Markdown URL", () => {
    for (const s of skills) expect(txt).toContain(`(${origin}/skills/${s.name}.md)`);
  });
  it("lists published capabilities and articles, never drafts", () => {
    for (const c of capabilities) expect(txt).toContain(`(${origin}/capabilities/${c.slug}.md)`);
    for (const a of articles) expect(txt).toContain(`(${origin}/blog/${a.slug}.md)`);
    expect(txt).not.toContain("code-quality-agents");
    expect(txt).not.toContain("transcripts/");
  });
  it("llms-full.txt includes every skill and the content commit", () => {
    const full = buildLlmsFullTxt(origin);
    for (const s of skills) expect(full).toContain(`Source path: \`${s.source}\``);
    for (const e of [...capabilities, ...articles]) expect(full).toContain(`/blob/main/${e.source}`);
    expect(full.match(/defines none itself/gu)?.length).toBeGreaterThanOrEqual(capabilities.length + articles.length);
    expect(full).toContain("commit ");
  });
});

describe("prefersMarkdown", () => {
  it("negotiates on Accept", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.5")).toBe(true);
    expect(prefersMarkdown("text/html,application/xhtml+xml,*/*;q=0.8")).toBe(false);
    expect(prefersMarkdown("text/html, text/markdown;q=0.9")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
  });
});
