import { describe, expect, it } from "vitest";

import { createRenderer, createSiteRoutes, diagramSyntaxProblems, readCollection, renderDiagram, sanitizeSvg, videoLinks } from "@/scripts/content-lib.mjs";

const page = (fields: Record<string, string>, body = "# Title\n\nBody text that explains the page.\n") =>
  `---\n${Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}\n---\n${body}`;

const capability = { description: "A summary.", group: "Trust & Reliability", published: "2026-11-02", status: "published", title: "Security", updated: "2026-11-02" };
const article = { capability: "security", description: "A summary.", published: "2026-11-02", status: "published", title: "An article", updated: "2026-11-03" };

const collect = (
  kind: "capability" | "article",
  files: Record<string, string>,
  extra: { capabilitySlugs?: Set<string>; exists?: (p: string) => boolean } = {},
) =>
  readCollection({ kind, read: (p: string) => files[p] ?? null, sources: Object.keys(files), ...extra });

describe("readCollection", () => {
  it("publishes listed files marked published and skips listed drafts", () => {
    const { entries, problems } = collect("capability", {
      "docs/capabilities/security.md": page(capability),
      "docs/capabilities/later.md": page({ ...capability, status: "draft", title: "Draft only" }),
    });
    expect(problems).toEqual([]);
    expect(entries.map((e) => e.slug)).toEqual(["security"]);
  });

  it("rejects missing or unknown status, duplicate keys, unknown keys, and bad dates with the source path", () => {
    const { entries, problems } = collect("capability", {
      "docs/capabilities/a.md": page({ ...capability, status: "" }),
      "docs/capabilities/b.md": page({ ...capability, status: "live" }),
      "docs/capabilities/c.md": `---\ntitle: X\ntitle: Y\ndescription: d\nstatus: published\npublished: 2026-11-02\nupdated: 2026-11-02\ngroup: Trust & Reliability\n---\n# X\n`,
      "docs/capabilities/d.md": page({ ...capability, route: "/elsewhere" }),
      "docs/capabilities/e.md": page({ ...capability, published: "2026-13-40" }),
      "docs/capabilities/f.md": page({ ...capability, updated: "2026-11-01" }),
      "docs/capabilities/g.md": page({ ...capability, group: "Marketing" }),
    });
    expect(entries).toEqual([]);
    for (const letter of "abcdefg") expect(problems.some((p) => p.startsWith(`docs/capabilities/${letter}.md: `))).toBe(true);
  });

  it("requires an article's capability to be published and its media to be safe", () => {
    const capabilitySlugs = new Set(["security"]);
    const { entries, problems } = collect(
      "article",
      {
        "docs/blog/ok.md": page({ ...article, transcript: "docs/blog/transcripts/ok.md", video_url: "https://www.youtube.com/watch?v=abcdefghijk" }),
        "docs/blog/orphan.md": page({ ...article, capability: "unpublished" }),
        "docs/blog/js.md": page({ ...article, video_url: "javascript:alert(1)" }),
        "docs/blog/http.md": page({ ...article, video_url: "http://vimeo.com/123456789" }),
        "docs/blog/iframe.md": page({ ...article, video_url: "https://evil.example/embed" }),
        "docs/blog/missing.md": page({ ...article, transcript: "docs/blog/transcripts/none.md" }),
        "docs/blog/escape.md": page({ ...article, transcript: "../../secrets.md" }),
      },
      { capabilitySlugs, exists: (p: string) => p === "docs/blog/transcripts/ok.md" },
    );
    expect(entries.map((e) => e.slug)).toEqual(["ok"]);
    expect(problems).toHaveLength(6);
  });

  it("reports a listed file that does not exist and duplicate routes", () => {
    const { problems } = readCollection({
      kind: "capability",
      read: (p: string) => (p.endsWith("dup.md") ? page(capability) : null),
      sources: ["docs/capabilities/gone.md", "docs/capabilities/dup.md", "other/dup.md"],
    });
    expect(problems).toEqual(["docs/capabilities/gone.md: listed but missing", "other/dup.md: duplicate capability route /dup"]);
  });

  it("requires prose next to each published diagram", () => {
    const lonely = "# T\n\n## Section\n\n```mermaid\nflowchart LR\n  A-->B\n```\n\n## Next\n";
    const explained = "# T\n\nThe agent hands work to review, which reports back.\n\n```mermaid\nflowchart LR\n  A-->B\n```\n";
    const { problems } = collect("capability", {
      "docs/capabilities/lonely.md": page(capability, lonely),
      "docs/capabilities/explained.md": page(capability, explained),
    });
    expect(problems).toEqual(["docs/capabilities/lonely.md: line 13: a diagram needs an adjacent prose explanation"]);
  });
});

describe("renderDiagram", () => {
  const flow = "flowchart LR\n  accTitle: Trust boundary\n  accDescr: Rules inform the agent.\n  R[Rules] --> A[Agent]";

  it("renders a static image with an accessible name, description, and source", () => {
    const html = renderDiagram(flow, { requireTitle: true });
    expect(html).toMatch(/^<figure class="diagram"><div class="diagram-scroll"[^>]*><img src="data:image\/svg\+xml;base64,/u);
    expect(html).toContain('alt="Trust boundary"');
    expect(html).toContain('class="diagram-scroll" role="region" aria-label="Trust boundary, scrollable" tabindex="0"');
    expect(html).toContain("<figcaption>Rules inform the agent.</figcaption>");
    expect(html).toContain("Diagram source");
    const svg = Buffer.from(html.match(/base64,([^"]+)"/u)?.[1] ?? "", "base64").toString();
    expect(svg).toContain("<svg");
    expect(svg).not.toMatch(/@import|display=swap|<script|foreignObject|\son[a-z]+=/iu);
  });

  it("rejects interactions, directives, HTML labels, missing titles, and invalid Mermaid", () => {
    const t = "  accTitle: T\n";
    expect(() => renderDiagram(`flowchart LR\n${t}  A-->B\n  click A "javascript:alert(1)"`)).toThrow(/click/u);
    expect(() => renderDiagram(`%%{init: {}}%%\nflowchart LR\n${t}  A-->B`)).toThrow(/directives/u);
    expect(() => renderDiagram(`flowchart LR\n${t}  A[<img src=x onerror=alert(1)>]-->B`)).toThrow(/HTML/u);
    expect(() => renderDiagram("flowchart LR\n  A-->B")).toThrow(/accTitle/u);
    expect(() => renderDiagram(`not a diagram\n${t}  A`)).toThrow(/invalid Mermaid/u);
    expect(() => renderDiagram(`flowchart LR\n${t}  A[one<br/>two]-->B`)).not.toThrow();
  });

  it("fails malformed diagrams the renderer would silently drop", () => {
    const t = "  accTitle: T\n";
    for (const bad of [
      `flowchart TD\n${t}  A[unclosed --> B`,
      `flowchart TD\n${t}  A -->>>> `,
      `flowchart LR\n${t}  A --> B\n  }}}}`,
      `flowchart LR\n${t}  subgraph S [Group]\n  A --> B`,
      `sequenceDiagram\n${t}  participant A\n  A->>: oops`,
      `sequenceDiagram\n${t}  A->>B no text`,
      `stateDiagram-v2\n${t}  [*] --> A`,
    ])
      expect(() => renderDiagram(bad), bad).toThrow(/invalid Mermaid/u);
  });

  it("accepts the supported flowchart and sequence statements", () => {
    const flow = `flowchart LR\n  accTitle: T\n  start["start<br/>new"] ==> explore\n  subgraph g [Shape]\n    explore["explore"]\n  end\n  A -.-> B -.-> C\n  T[Text] -. data only .-> A\n  A -- label --> B\n  A -->|yes| B\n  classDef x fill:#fff\n  class A,B x`;
    const seq = `sequenceDiagram\n  accTitle: T\n  participant M as Maintainer\n  M->>A: build it\n  A-->>M: done\n  Note over M,A: a note\n  loop each push\n    A->>G: push\n  end`;
    expect(diagramSyntaxProblems(flow)).toEqual([]);
    expect(diagramSyntaxProblems(seq)).toEqual([]);
  });

  it("keeps small message labels at AA contrast", () => {
    const html = renderDiagram("sequenceDiagram\n  accTitle: T\n  A->>B: hello");
    const svg = Buffer.from(html.match(/base64,([^"]+)"/u)?.[1] ?? "", "base64").toString();
    expect(svg).toContain("--muted:#b5afc6");
  });

  it("sanitizes active SVG content", () => {
    const dirty = `<svg><style>@import url('https://x');</style><script>alert(1)</script><a href="https://x" onclick="y()"><foreignObject><div/></foreignObject><use href="#m"/><use href=https://x/#a /><rect fill="url(https://x/p.png)" stroke="url(#g)"/></a></svg>`;
    const clean = sanitizeSvg(dirty);
    expect(clean).not.toMatch(/@import|<script|onclick|foreignObject|https:\/\/x/u);
    expect(clean).toContain('href="#m"');
    expect(clean).toContain('stroke="url(#g)"');
  });
});

describe("createSiteRoutes", () => {
  const routes = createSiteRoutes({
    articles: [{ slug: "post", source: "docs/blog/post.md" }],
    capabilities: [{ slug: "security", source: "docs/capabilities/security.md" }],
    docs: [{ slug: "get-started", source: "README.md" }],
    skillNames: ["build"],
  });

  it("routes published entries, their indexes, and existing sources; drafts and other files stay on GitHub", () => {
    expect(routes("docs/capabilities/security.md")).toBe("/capabilities/security");
    expect(routes("docs/blog/post.md")).toBe("/blog/post");
    expect(routes("docs/capabilities/README.md")).toBe("/capabilities");
    expect(routes("docs/blog/README.md")).toBe("/blog");
    expect(routes("docs/capabilities/draft.md")).toBeNull();
    expect(routes("docs/blog/code-quality-agents.md")).toBeNull();
    expect(routes("README.md")).toBe("/docs/get-started");
    expect(routes("skills/build/SKILL.md")).toBe("/skills/build");
    expect(routes("docs/decisions/0057-draft-workspace-ready-checks.md")).toBe("/docs/decisions/0057-draft-workspace-ready-checks");
  });

  it("does not route collection indexes while nothing in them is published", () => {
    const none = createSiteRoutes({ docs: [], skillNames: [] });
    expect(none("docs/capabilities/README.md")).toBeNull();
    expect(none("docs/blog/README.md")).toBeNull();
  });
});

describe("createRenderer", () => {
  const routes: Record<string, string> = { "docs/capabilities/security.md": "/capabilities/security" };
  const { render } = createRenderer({ branch: "main", repoName: "flow-skills", repoUrl: "https://github.com/o/flow-skills", siteRouteFor: (p: string) => routes[p] ?? null });

  it("links published sources to site routes with fragments and drafts to GitHub", () => {
    const { html, markdown } = render("[a](../capabilities/security.md#limits) [b](../capabilities/draft.md)", "docs/blog/post.md");
    expect(html).toContain('href="/capabilities/security#limits"');
    expect(html).toContain('href="https://github.com/o/flow-skills/blob/main/docs/capabilities/draft.md"');
    expect(markdown).toContain("(/capabilities/security#limits)");
  });

  it("keeps raw HTML escaped and other repositories' diagrams as source", () => {
    expect(render("<script>alert(1)</script>", "x.md").html).not.toContain("<script>");
    const other = render("```mermaid\nflowchart LR\n  A-->B\n```", "README.md", { githubBase: "https://github.com/o/other/blob/main" }).html;
    expect(other).not.toContain("<figure");
    expect(other).toContain("language-mermaid");
  });

  it("does not treat protocol-relative links as internal", () => {
    expect(render("[x](//evil.example/a)", "docs/x.md").html).not.toContain("href=");
  });

  it("reports an invalid repository diagram with its location instead of a fallback note", () => {
    const problems: string[] = [];
    const { html } = render("# T\n\ntext\n\n```mermaid\nflowchart LR\n  accTitle: T\n  A[unclosed --> B\n```\n", "docs/x.md", { problems });
    expect(problems).toEqual([expect.stringMatching(/^docs\/x\.md:6: invalid Mermaid/u)]);
    expect(html).not.toContain("diagram-note");
  });
});

describe("videoLinks", () => {
  it("maps supported providers to privacy-enhanced embeds and canonical watch URLs, and rejects everything else", () => {
    expect(videoLinks("https://youtu.be/abcdefghijk")).toEqual({ embed: "https://www.youtube-nocookie.com/embed/abcdefghijk", watch: "https://www.youtube.com/watch?v=abcdefghijk" });
    expect(videoLinks("https://vimeo.com/123456789")).toEqual({ embed: "https://player.vimeo.com/video/123456789?dnt=1", watch: "https://vimeo.com/123456789" });
    for (const bad of ["http://youtu.be/abcdefghijk", "https://user:pw@youtube.com/watch?v=abcdefghijk", "https://youtube.com/watch?v=abcdefghijk&v=other12", "https://example.com/v.mp4", "data:text/html,x", "nonsense"])
      expect(videoLinks(bad)).toBeNull();
  });
});
