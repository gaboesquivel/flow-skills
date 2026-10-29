# 040: Website editorial and UX refinement

**Status:** accepted (2026-10-29). Builds on [032](032-prism-website.md) and [038](038-throughline-identity.md).

## Problem Statement

The Flow website works, but it reads and behaves like several passes layered on each other. Copy repeats itself and drifts into generic phrasing ("Find answers. Keep moving.", "the same public knowledge humans read"). Search lives in three places: the `⌘K` palette, a `/search` page with its own Search/Ask modes, and an embedded Search + Ask panel on Home and Docs, plus a header "Ask" link and an "Ask Flow" callout on every doc that each send people to the `/search` landing. A visitor cannot tell whether Flow is a rigid process or a loose toolkit, because the site never says that the methodology adapts to the work while the starters make firm choices on purpose. Some catalog and starter facts lag the shipped skills and template repositories.

## Solution

One focused refinement pass over the existing Prism site. The homepage structure, Throughline identity, hero orbit, and *Build what matters.* section stay as approved in [DESIGN.md](../../DESIGN.md); nothing is redesigned.

- **Deslopped copy.** Every public string (page heroes, ledes, section copy, metadata descriptions, empty and error states, `llms.txt` prose) is edited with [`write-humans`](../../skills/write-humans/SKILL.md): direct, specific, no filler, no repeated claims across sections, jargon only where a reader needs the term. Copy rendered from repository Markdown is fixed at its source, never in `site/`.
- **One `⌘K` command palette for search and Ask.** The palette becomes the only human search surface. Typing shows ranked documents; an Ask row (or `⌘↵`) answers the query inside the palette with numbered citations that link to their sources, using the existing `/api/ask` and its extractive fallback. The separate Ask landing, the embedded Search + Ask panels, the header "Ask" link, and the per-doc callout's link to `/search?mode=ask` are removed; any remaining entry point opens the palette, prefilled where it had a query.
- **Flexible practice, opinionated starters.** Home, Methodology, and Starters say it plainly, once each: adopt Flow skill by skill and shape the workflow to the work; flow-next and flow-mono are deliberately opinionated presets that make stack and setup choices so a project ships on day one, and teams that want different choices keep the methodology and skip or fork the starter.
- **Consistency with what ships.** The skill catalog, skill counts, phrases, and groupings match `skills/` and [`docs/skills.md`](../skills.md) (including `design`); starter facts in `site/lib/starters.ts` are re-verified against the current flow-next and flow-mono READMEs and manifests; no page claims a capability that is not shipped.
- **Readability and navigation.** Tighten type scale, measure, and vertical rhythm on Docs and skill detail pages; make the header and mobile menu list the same destinations; make skill discovery (filter, groups, phrases) scannable on a phone. Use existing Prism tokens only.

## User Stories

1. As someone evaluating Flow, I read Home and Methodology and can say in one sentence what Flow is, and that I can adopt it gradually while the starters are deliberately opinionated.
2. As a developer anywhere on the site, I press `⌘K` (or tap the search control on mobile), type "ship", and open the `ship` skill from the results.
3. As a developer, I type a question in the same palette, ask it, and get a short answer whose citations open the source pages; with no model configured, I get cited excerpts instead.
4. As a reader of a guide or decision, I ask about that page from the palette, prefilled with a question about it.
5. As an agent, every machine endpoint (`llms.txt`, `.md` pages, `/api/search`, `/api/ask`, MCP, OpenAPI, `.well-known`) behaves as before, with corrected prose where it was out of date.
6. As a keyboard or screen-reader user, I open, navigate, ask, and close the palette without a mouse, and focus returns where it was.

## Implementation Decisions

- **Palette is the one surface.** Extend `site/components/command-palette.tsx` with an inline answer state that reuses the streaming and citation rendering now in `site/components/search/` (`answer-markdown.tsx`, `highlight.tsx`, `kinds.ts`). Delete what becomes unused: `search-ask-panel.tsx`, `search-experience.tsx`, `docs/ask-callout.tsx` as a link to `/search` (keep at most a button that opens the palette prefilled), and the header "Ask" link. The `OPEN_SEARCH_EVENT` event gains an optional `mode: "ask"` so callers can open straight into an answer.
- **Palette interaction contract.** Results debounce as today; arrow keys move through results and the Ask row; `↵` opens the active result or runs Ask on the Ask row; `⌘↵`/`Ctrl↵` asks from anywhere; `Esc` returns from an answer to results, then closes. The answer region is `aria-live="polite"`, citations are real links, and loading, empty, rate-limited, and error states each have specific copy.
- **`/search` stays as a fallback, not a landing.** `/search?q=` keeps a plain server-rendered results list for shareable links and no-JS visitors, without the hero, mode switch, or Ask. `?mode=ask` opens the palette in Ask with the query. It is removed from navigation. *(Assumption; the alternative is a redirect to Home that opens the palette.)*
- **Home's "Find the skill / Ask the question" section** keeps its place in the approved order; its embedded panel becomes a palette trigger with example queries rather than a second search box.
- **Philosophy copy lives in one owner.** The flexible-adoption / opinionated-starters position is added to `PRODUCT.md` (Ecosystem) and the site restates it in each page's own words; the methodology docs are not rewritten.
- **Agent interfaces unchanged in contract.** No route, schema, or MCP tool changes; only prose such as the For agents "Ask" CTA (now pointing at `/api/ask` docs or the palette) and `llms.txt` descriptions.
- **No decision record.** The palette merge narrows spec 032's surfaces and is recorded below as a direction change; the starter position clarifies existing intent rather than choosing among new alternatives.
- **Exposure:** public, read-only presentation on the existing Vercel deployment. No new endpoints, no writes, no authentication; `/api/ask` keeps its per-client rate limit.

## Testing Decisions

Rendered checks over snapshots. Existing Vitest suites in `site/` (search ranking, Ask fallback, MCP, `llms.txt`, Markdown pages) must pass unchanged; add a small test only where behaviour changes, such as `/search?mode=ask` handling. `pnpm --dir site qa` and `next build` prove every page renders from current sources. Copy is reviewed by reading each page against `write-humans`, not by tests.

**Acceptance scenario.** A developer new to Flow on the branch preview, at 375 px and 1440 px, then an agent:

1. Opens `/`: hero, orbit, and *Build what matters.* match production; within the first two sections the page states that Flow adapts to the work and that the starters are deliberately opinionated. No sentence repeats a claim from another section.
2. Presses `⌘K` (desktop) or taps the header search control (mobile); the palette opens with focus in the input. Types "ship"; `ship` is the first skill result; `↵` opens `/skills/ship`.
3. Opens the palette again, types "How does Flow keep PRODUCT.md aligned?", presses `⌘↵`; an answer streams inside the palette with numbered citations, and the first citation opens the `flow` or `align` skill page. `Esc` returns to results, `Esc` again closes and focus returns to the trigger.
4. With `ASK_MODEL` unset (local), the same question returns cited excerpts, not an error.
5. Searches the site for a separate Ask landing: the header has no "Ask" link, Home and Docs have no embedded search box, and `/search?mode=ask&q=ship` opens the palette in Ask.
6. Opens `/skills`: every directory in `skills/` appears once, grouped as in `docs/skills.md`, with no stale count. Opens `/starters/flow-next`: every listed capability and command exists in the current flow-next README or `package.json`.
7. Tabs through header, palette, skill filter, and a doc page: focus is visible, the palette is a labelled dialog with a combobox and listbox, and axe reports no serious violations.
8. An agent fetches `/llms.txt`, `/skills/ship.md`, `/api/search?q=ship`, posts to `/api/ask`, and lists MCP tools at `/api/mcp`: shapes match production.

## Direction changes

- [Spec 032](032-prism-website.md): "Search + Ask" as its own template with Search and Ask modes → one `⌘K` palette for search and Ask; `/search` remains only as a fallback results page.
- [DESIGN.md](../../DESIGN.md) (Product and interface design): "Search + Ask optimize question-to-evidence" and "Preserve the current live Prism information architecture" → the palette owns question-to-evidence; the separate Ask landing and embedded panels are removed.
- [PRODUCT.md](../../PRODUCT.md) (Ecosystem): adds that Flow's adoption and workflow are flexible while flow-next and flow-mono are deliberately opinionated starters.

## Out of Scope

- Any redesign of layout, tokens, identity, hero, or homepage order.
- New features: semantic or vector search, conversation history, follow-up questions, analytics, accounts.
- Changes to agent endpoint contracts, the skills package, or the starter repositories themselves.
- Rewriting methodology docs beyond fixing facts the site renders.

## Further Notes

- Open assumption: `/search` fallback versus redirect (see Implementation Decisions).
- Open assumption: the mobile header shows a search icon that opens the palette; today `SearchTrigger` is hidden below `md`.
- Verify starter facts against the live template repositories at build time, not from memory; `site/lib/starters.ts` already asks for re-verification when templates change.
