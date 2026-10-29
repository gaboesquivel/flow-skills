import { describe, expect, it } from "vitest";

import { decisions, guides, skills } from "@/lib/content";
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

  it("returns null for unknown paths", () => {
    for (const path of ["/nope", "/skills/nope", "/docs/nope", "/starters/nope", "/api/search"]) expect(markdownForPath(path, origin)).toBeNull();
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
  it("llms-full.txt includes every skill and the content commit", () => {
    const full = buildLlmsFullTxt(origin);
    for (const s of skills) expect(full).toContain(`Source path: \`${s.source}\``);
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
