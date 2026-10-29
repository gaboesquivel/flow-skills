import {
  catalogGroups,
  content,
  decisions,
  type Doc,
  getDoc,
  getSkill,
  getStarterReadme,
  guides,
  installCommand,
  repo,
  type Skill,
  skillsInCatalogOrder,
  sourceUrl,
} from "@/lib/content";
import { mcpToolCatalog } from "@/lib/mcp/tool-catalog";
import { search } from "@/lib/search";
import { type Starter, starters } from "@/lib/starters";
import { absolutizeMarkdown, SITE_DESCRIPTION } from "@/lib/site";

export const MCP_TOOLS = mcpToolCatalog.map((t) => t.name);

/** Site path for a guide or decision slug. */
export const docPath = (doc: Pick<Doc, "slug">) => `/docs/${doc.slug}`;

const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

const frame = (title: string, path: string, origin: string, body: string, summary?: string) =>
  absolutizeMarkdown(
    [`# ${title}`, summary ? `> ${summary}` : null, `Canonical: ${origin}${path === "/" ? "/" : path}`, body.trim()]
      .filter(Boolean)
      .join("\n\n"),
    origin,
  ) + "\n";

/** Drop a leading H1 so a page header can replace it. */
const withoutTitle = (markdown: string) => markdown.replace(/^\s*# [^\n]*\n+/u, "");

export const skillHeader = (skill: Skill) =>
  [
    `- Group: ${skill.group}`,
    `- Say: ${skill.phrases.map((p) => `"${p}"`).join(", ")}`,
    `- Install all skills: \`${installCommand()}\``,
    `- Install this skill: \`${installCommand(skill.name)}\``,
    `- Source: ${sourceUrl(skill.source)}`,
    skill.whenMarkdown ? `\n**When:** ${skill.whenMarkdown}` : null,
  ]
    .filter(Boolean)
    .join("\n");

const home = (origin: string) =>
  frame(
    "Flow — Make ideas flow",
    "/",
    origin,
    `
Flow is used by talking to your existing agent. Install the portable skills once, then say what you want: "explore this", "spec it", "build it", "ship it".

## Install

\`\`\`sh
${installCommand()}
\`\`\`

## Skills by group

${catalogGroups.map((g) => `- **${g.name}:** ${g.skills.map((s) => `[${s}](/skills/${s})`).join(", ")}`).join("\n")}

## Explore

${list([
  "[Methodology](/methodology): the practice, not a pipeline",
  "[Skills](/skills): the full catalog with phrases and install commands",
  "[Starters](/starters): flow-next and flow-mono templates",
  "[Docs](/docs): guides and decision records",
  "[Search and Ask](/search): source-grounded answers with citations",
  "[For agents](/agents): llms.txt, Markdown, search API, MCP",
])}

Source: ${repo.url} (v${content.version})
`,
    SITE_DESCRIPTION,
  );

const methodology = (origin: string) => {
  const doc = getDoc("methodology");
  return frame(
    "Methodology",
    "/methodology",
    origin,
    `${doc ? `Source: ${sourceUrl(doc.source)}\n\n${withoutTitle(doc.markdown)}` : ""}\n\nSee also: [principles](/docs/principles), [product](/docs/product), [skills](/skills).`,
    "A practice, not a pipeline. Flow keeps people in charge of intent and judgment while agents do the work.",
  );
};

const skillsIndex = (origin: string) =>
  frame(
    "Skills",
    "/skills",
    origin,
    `
Install every skill with \`${installCommand()}\`, or one with \`${installCommand("<name>")}\`. You reach skills by talking to your agent; no skill must be named.

${catalogGroups
  .map(
    (g) =>
      `## ${g.name}\n\n${g.skills
        .map((name) => getSkill(name))
        .filter((s): s is Skill => Boolean(s))
        .map((s) => `- [${s.name}](/skills/${s.name}) (say "${s.say ?? s.phrases[0] ?? s.name}"): ${s.summary}`)
        .join("\n")}`,
  )
  .join("\n\n")}
`,
    "Portable agent skills for Flow, grouped by where they fit in the work.",
  );

const skillPage = (skill: Skill, origin: string) =>
  frame(skill.name, `/skills/${skill.name}`, origin, `${skillHeader(skill)}\n\n---\n\n${withoutTitle(skill.markdown)}`, skill.summary);

const startersIndex = (origin: string) =>
  frame(
    "Starters",
    "/starters",
    origin,
    `
Start a new project by telling your agent "start a Next.js project" or "start a monorepo"; the [start](/skills/start) skill clones a starter, renames it, verifies setup, and makes an independent first commit.

${starters.map((s) => `## [${s.title}](/starters/${s.slug})\n\n${s.kind}. ${s.tagline}\n\nRepository: ${s.repository}`).join("\n\n")}
`,
    "Vercel-first templates for agent-first Next.js apps.",
  );

const starterPage = (starter: Starter, origin: string) => {
  const readme = getStarterReadme(starter.slug);
  return frame(
    starter.title,
    `/starters/${starter.slug}`,
    origin,
    `${starter.description}\n\n${list(starter.capabilities)}\n\n- Kind: ${starter.kind}\n- Prerequisites: ${starter.prerequisites.join(", ")}\n- Quick start: ${starter.quickStart.map((c) => `\`${c}\``).join(", ")}\n- Repository: ${starter.repository}\n- Start it with an agent: install Flow and say "start a new project" ([start](/skills/start))\n\n## README\n\n${readme?.markdown ? withoutTitle(readme.markdown).replace(/^(#{1,5}) /gmu, "#$1 ") : "README unavailable; see the repository."}`,
    starter.tagline,
  );
};

const docsHub = (origin: string) =>
  frame(
    "Docs",
    "/docs",
    origin,
    `
## Guides

${guides.map((d) => `- [${d.title}](${docPath(d)}): ${d.description}`).join("\n")}

## Decisions

${decisions.length} decision records. See the [decisions index](/docs/decisions).
`,
    "The Flow field guide: how to install, practice, and extend Flow.",
  );

const decisionsIndex = (origin: string) =>
  frame(
    "Decisions",
    "/docs/decisions",
    origin,
    decisions.map((d) => `- [${d.title}](${docPath(d)}) (${d.status ?? "unknown"}): ${d.description}`).join("\n"),
    "Numbered decision records with the rationale behind Flow.",
  );

const docPage = (doc: Doc, origin: string) =>
  frame(
    doc.title,
    docPath(doc),
    origin,
    `${[doc.status ? `- Status: ${doc.status}` : null, `- Source: ${sourceUrl(doc.source)}`].filter(Boolean).join("\n")}\n\n---\n\n${withoutTitle(doc.markdown)}`,
    doc.description,
  );

const searchPage = (origin: string, query?: string | null) => {
  const q = query?.trim();
  const results = q ? search(q, { limit: 10 }) : [];
  return frame(
    "Search and Ask",
    "/search",
    origin,
    `
Lexical search over every skill, guide, decision, and starter README, plus Ask: answers grounded in those sources with numbered citations.

- Search API: \`GET ${origin}/api/search?q=<query>\`
- Ask API: \`POST ${origin}/api/ask\` with \`{"question": "..."}\`
- Ask in the browser: ${origin}/search?mode=ask
${
  q
    ? `\n## Results for "${q}"\n\n${results.length ? results.map((r) => `- [${r.title}${r.heading ? ` › ${r.heading}` : ""}](${r.url}): ${r.excerpt}`).join("\n") : "No results."}`
    : `\nAdd \`?q=<query>\` to this Markdown URL to include results.`
}
`,
    "Find a skill, guide, or decision, or ask a question answered from Flow's sources.",
  );
};

export const agentsPage = (origin: string) =>
  frame(
    "For agents",
    "/agents",
    origin,
    `
Every page is a semantic HTML page and a Markdown document. No login is needed.

## Discover

${list([
  `\`GET ${origin}/llms.txt\`: curated index of skills, guides, decisions, and interfaces`,
  `\`GET ${origin}/llms-full.txt\`: every guide and skill as Markdown`,
  `\`GET ${origin}/sitemap.xml\`: every page`,
  `\`GET ${origin}/.well-known/mcp.json\`, \`${origin}/.well-known/mcp/server-card.json\`, \`${origin}/.well-known/ai-catalog.json\`: MCP discovery`,
  `\`GET ${origin}/openapi.json\`: OpenAPI 3.1 for the HTTP API`,
])}

## Retrieve

${list([
  `Markdown for any page: append \`.md\` (home is \`${origin}/index.md\`) or send \`Accept: text/markdown\``,
  `\`GET ${origin}/api/search?q=<query>&limit=1-25&kind=skill|doc|decision|starter\`: ranked results with canonical URLs and excerpts`,
])}

## Understand

${list([
  `\`POST ${origin}/api/ask\` with \`{"question": "..."}\`: answer with numbered citations; \`?stream=1\` streams text`,
  `MCP Streamable HTTP at \`${origin}/api/mcp\` (alias \`${origin}/mcp\`), read-only tools: ${MCP_TOOLS.map((t) => `\`${t}\``).join(", ")}`,
])}

## Errors

API errors are JSON: \`{ "code", "error", "resolution", "type" }\` with a real HTTP status. Rate-limited requests return 429 with \`Retry-After\`.

## Verify

\`npx is-agentic ${origin.replace(/^https?:\/\//u, "")}\` — see https://is-agentic.com
`,
    "Made for people. Readable by agents.",
  );

/** Markdown for a site path, or null when the path is not a page. */
export const markdownForPath = (path: string, origin: string, searchParams?: URLSearchParams): string | null => {
  const clean = `/${path.replace(/^\/+|\/+$/gu, "")}`;
  if (clean === "/" || clean === "/index") return home(origin);
  if (clean === "/methodology") return methodology(origin);
  if (clean === "/skills") return skillsIndex(origin);
  if (clean === "/starters") return startersIndex(origin);
  if (clean === "/docs") return docsHub(origin);
  if (clean === "/docs/decisions") return decisionsIndex(origin);
  if (clean === "/search") return searchPage(origin, searchParams?.get("q"));
  if (clean === "/agents") return agentsPage(origin);
  const skill = clean.match(/^\/skills\/([^/]+)$/u)?.[1];
  if (skill) {
    const s = getSkill(skill);
    return s ? skillPage(s, origin) : null;
  }
  const starter = clean.match(/^\/starters\/([^/]+)$/u)?.[1];
  if (starter) {
    const s = starters.find((x) => x.slug === starter);
    return s ? starterPage(s, origin) : null;
  }
  const slug = clean.match(/^\/docs\/(.+)$/u)?.[1];
  if (slug) {
    const doc = getDoc(slug);
    return doc ? docPage(doc, origin) : null;
  }
  return null;
};

export const notFoundMarkdown = (path: string, origin: string) =>
  `# Not found

\`${path}\` is not a page on this site.

- Agent index: ${origin}/llms.txt
- Sitemap: ${origin}/sitemap.xml
- Search: ${origin}/api/search?q=<query>
- Home: ${origin}/
`;

/** Every HTML page path, for the sitemap. */
export const pagePaths = () => [
  "/",
  "/methodology",
  "/skills",
  ...skillsInCatalogOrder().map((s) => `/skills/${s.name}`),
  "/starters",
  ...starters.map((s) => `/starters/${s.slug}`),
  "/docs",
  ...guides.map(docPath),
  "/docs/decisions",
  ...decisions.map(docPath),
  "/search",
  "/agents",
];

/** Markdown URL for a page path. */
export const markdownUrl = (path: string, origin: string) => `${origin}${path === "/" ? "/index" : path}.md`;

/** llms.txt (llmstxt.org): H1, summary, sections of absolute links. */
export const buildLlmsTxt = (origin: string) => {
  const md = (path: string) => markdownUrl(path, origin);
  const skillLines = catalogGroups.flatMap((g) =>
    g.skills.flatMap((name) => {
      const s = getSkill(name);
      return s ? [`- [${s.name}](${md(`/skills/${s.name}`)}): ${s.summary} Say "${s.say ?? s.phrases[0] ?? s.name}". (${g.name})`] : [];
    }),
  );
  return `# Flow

> ${SITE_DESCRIPTION}

Flow is used by talking to your agent: install the skills once with \`${installCommand()}\`, then say what you want ("explore this", "spec it", "build it", "ship it"). No skill must be named. Every page on ${origin} is also Markdown: append \`.md\` (home is ${origin}/index.md) or send \`Accept: text/markdown\`.

Source: ${repo.url} · version ${content.version}${content.commit ? ` · commit ${content.commit.slice(0, 12)}` : ""}

## Start here

- [Get started](${md("/docs/get-started")}): install Flow and use your existing agent
- [Methodology](${md("/methodology")}): the practice, not a pipeline
- [Skills catalog](${md("/skills")}): every skill grouped, with phrases and install commands
- [Full content](${origin}/llms-full.txt): every guide and skill as one Markdown file

## Skills

${skillLines.join("\n")}

## Guides

${guides.map((d) => `- [${d.title}](${md(docPath(d))}): ${d.description}`).join("\n")}

## Starters

${starters.map((s) => `- [${s.title}](${md(`/starters/${s.slug}`)}): ${s.tagline} Repository: ${s.repository}`).join("\n")}

## Agent interfaces

- [Search API](${origin}/api/search?q=ship): \`GET /api/search?q=&limit=1-25&kind=skill|doc|decision|starter\`, ranked results with canonical URLs
- Ask API: \`POST ${origin}/api/ask\` with \`{"question": "..."}\`, source-grounded answer with citations
- MCP (Streamable HTTP, read-only, no auth): ${origin}/api/mcp; tools: ${MCP_TOOLS.join(", ")}
- [MCP discovery](${origin}/.well-known/mcp.json), [server card](${origin}/.well-known/mcp/server-card.json), [AI catalog](${origin}/.well-known/ai-catalog.json)
- [OpenAPI 3.1](${origin}/openapi.json)
- [Sitemap](${origin}/sitemap.xml)
- [For agents](${md("/agents")}): contracts, examples, and error format

## Optional

- [Decisions index](${md("/docs/decisions")}): ${decisions.length} numbered decision records with rationale
${decisions.map((d) => `- [${d.title}](${md(docPath(d))})`).join("\n")}
`;
};

const shiftHeadings = (markdown: string) => markdown.replace(/^(#{1,5}) /gmu, "#$1 ");

/** llms-full.txt: every guide and skill as Markdown with sources and the content commit. */
export const buildLlmsFullTxt = (origin: string) => {
  const sections = [
    `# Flow — full content\n\n> ${SITE_DESCRIPTION}\n\nSource: ${repo.url} · version ${content.version} · commit ${content.commit ?? "unknown"} · generated ${content.generatedAt}\n\nIndex: ${origin}/llms.txt`,
    "# Guides",
    ...guides.map(
      (d) => `## ${d.title}\n\nURL: ${origin}${docPath(d)}\nSource: ${sourceUrl(d.source)} (\`${d.source}\`)\n\n${shiftHeadings(d.markdown.replace(/^\s*# [^\n]*\n+/u, ""))}`,
    ),
    "# Skills",
    ...skillsInCatalogOrder().map(
      (s) =>
        `## ${s.name}\n\nURL: ${origin}/skills/${s.name}\nSource path: \`${s.source}\`\n\n> ${s.summary}\n\n${skillHeader(s)}\n\n${shiftHeadings(s.markdown.replace(/^\s*# [^\n]*\n+/u, ""))}`,
    ),
  ];
  return `${absolutizeMarkdown(sections.join("\n\n---\n\n"), origin).trim()}\n`;
};
