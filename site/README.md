# Flow website (Prism)

The public website for Flow: methodology, portable skills, starters, docs, Search + Ask, and agent interfaces. Built on [flow-next](https://github.com/gaboesquivel/flow-next) conventions; scope and rationale in [spec 032](../docs/specs/032-prism-website.md).

## Develop

```bash
pnpm install
pnpm dev
```

`pnpm dev` and `pnpm build` first run `pnpm content`, which reads the repository's Markdown (`../skills`, `../docs`, `../PRODUCT.md`, `../README.md`, `../GLOSSARY.md`) and the starter READMEs into `content/generated/content.json`. That file is gitignored; edit the source Markdown, never the generated output. The build fails, naming the file to fix, when a skill has no row in `docs/skills.md` or a decision has no recognizable status.

| Script | Purpose |
| --- | --- |
| `pnpm content` | Regenerate the content index |
| `pnpm qa` | Lint, types, tests |
| `pnpm build` | Production build |
| `AGENTIC_CHECK_URL=<host> pnpm agentic:check` | Agent-readiness report for a deployed host |

## Layout

| Path | Owns |
| --- | --- |
| `scripts/build-content.mjs` | Which repository files become pages, link rewriting, search sections |
| `lib/content.ts` | Typed access to generated content |
| `lib/search.ts`, `lib/ask.ts` | In-memory search and source-grounded Ask |
| `lib/mcp/`, `lib/markdown-pages.ts`, `lib/openapi.ts` | Agent interfaces |
| `styles/globals.css` | Prism tokens and rendered-Markdown styles |
| `components/logo.tsx`, `app/icon.svg`, `public/brand/` | Throughline mark and brand assets; rules in [DESIGN.md](../DESIGN.md) |

## Agent interfaces

`/llms.txt`, `/llms-full.txt`, any page as Markdown (`<path>.md` or `Accept: text/markdown`), `GET /api/search?q=`, `POST /api/ask`, MCP at `/api/mcp`, `/openapi.json`, `/.well-known/mcp.json`, `/sitemap.xml`. The [For agents](https://github.com/gaboesquivel/flow-skills/tree/main/site/app/agents) page documents each.

## Deploy (Vercel)

Create a Vercel project from this repository with **Root Directory** `site` (keep "Include files outside the root directory" enabled; the content build reads the parent). Optional environment:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin; defaults to the Vercel production URL |
| `ASK_MODEL` | AI Gateway model id for Ask |
| `AI_GATEWAY_API_KEY` | Only outside Vercel; on Vercel, OIDC authenticates the Gateway |

Without Gateway access, Ask answers with cited source passages instead of a generated summary. Search never needs a model.
