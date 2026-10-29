# 032: Prism website

**Status:** implemented (2026-10-29). Landed in [#165](https://github.com/gaboesquivel/flow-skills/pull/165).

## Problem Statement

Flow's methodology, skills, and starters are documented only as Markdown on GitHub. People evaluating Flow have no product-first place to understand the practice, find the right skill, or pick a starter, and agents have no stable interface to discover Flow's capabilities beyond cloning the repository. [PRODUCT.md](../../PRODUCT.md#principles) commits Flow to being agent-first and API-first; its own public presence should demonstrate that.

## Solution

A public website for the Flow ecosystem with an independent identity, Prism (near-black, lavender, violet, restrained pink), living in [`site/`](../../site/README.md) as a self-contained Next.js application built on flow-next's conventions and deployed on Vercel.

- **Ten templates:** Home, Methodology, Skill catalog, Skill detail, Starters, Starter detail, Docs hub, Documentation article, Search + Ask, and For agents.
- **One source.** Every skill, guide, and decision page renders this repository's own Markdown at build time (`site/scripts/build-content.mjs`), so the site cannot drift from `skills/*/SKILL.md`, `docs/`, `PRODUCT.md`, `README.md`, and `GLOSSARY.md`. Starter pages pair curated summaries with each template's README fetched at build time.
- **Search + Ask.** Lexical search over every published section works without a model. Ask answers only from retrieved sections with numbered citations through Vercel AI Gateway, and falls back to cited source excerpts when no model is configured or the call fails.
- **Agent interfaces:** `llms.txt`, `llms-full.txt`, Markdown for every page (`.md` suffix or `Accept: text/markdown`), `GET /api/search`, `POST /api/ask`, a read-only MCP server at `/api/mcp`, OpenAPI, `.well-known` MCP discovery, sitemap, robots, real 404s, and structured JSON errors.
- The skills package is unchanged: `site/` is not a workspace member, is not in the published `files`, and the repository's CI does not install it.

## User Stories

1. As someone evaluating Flow, I understand what it is and how the practice works in a few minutes, on desktop or phone.
2. As a developer, I find the skill for my situation by name, phrase, or outcome, and copy its install command.
3. As a developer, I ask a question and get a short answer that links to the sources it used.
4. As a founder, I compare flow-next and flow-mono and start from either.
5. As an agent, I discover Flow through `llms.txt` or MCP, search it, and read any skill or guide as Markdown without a login.

## Implementation Decisions

- **Location.** `site/` with its own `package.json` and lockfile; Vercel project root directory `site`. Vercel's checkout includes the parent directory, which the content build reads.
- **Content.** Generated JSON under `site/content/generated/` (gitignored), regenerated before every dev start and build. Repository-relative links become site routes when a page exists, otherwise GitHub links.
- **Ask model.** Gateway model from `ASK_MODEL`, with a current Anthropic default; on Vercel, OIDC authenticates with no stored key. No database, vector store, or queue: the corpus is small enough for an in-memory index.
- **Exposure:** public and read-only on deployment. No authentication, no writes; `/api/ask` and MCP are rate-limited per client in memory.

## Acceptance scenario

Actor: a developer new to Flow, on the deployed site with the content of `main`.

1. Opens `/`, sees "Make ideas flow.", and follows "Browse skills" to `/skills`, which lists every skill in `skills/` grouped as in `docs/skills.md`.
2. Filters by "ship" and opens `ship`; the page shows "ship it", the install command `npx skills add gaboesquivel/flow-skills -s ship`, and the body of `skills/ship/SKILL.md`.
3. Asks "How does Flow keep PRODUCT.md aligned?" in Search + Ask and receives an answer whose citations link to the `flow` or `align` skill pages.
4. An agent sends `tools/call` for `search_flow` with "ship it" to `/api/mcp`, then fetches `/skills/ship.md`, and receives the same skill content as Markdown.
5. Requests `/does-not-exist` and receives HTTP 404.

## Testing Decisions

Vitest in `site/` covers search ranking, the extractive Ask fallback, MCP tool listing, `llms.txt` coverage, and Markdown page resolution. `pnpm build` in `site/` proves every static page renders from current sources. After deployment, `npx is-agentic <host>` reports agent readiness as measured evidence.

## Out of Scope

Accounts, analytics, comments, a CMS, versioned docs, translated content, and editing content from the site. Research notes, specs, and the archive are not published as pages.

## Further Notes

The approved visual references are local-only and are not committed. Agent endpoints shown as proposals in those references are implemented here.
