# 038 — Throughline identity

Status: implemented (2026-10-29). Builds on [032](032-prism-website.md).

## Problem Statement

The Flow website still carries the retired diamond mark: in the header and footer logo, the favicon, the generated Open Graph image, and the centre of the home hero diagram. The approved identity is **Throughline**, three open trajectories converging into one forward direction, but it lives only in an untracked design kit. The repository has no root `DESIGN.md`, so nothing tells agents or contributors which mark, colours, and usage rules are current, and the next visual change has no authority to check against.

## Solution

Replace the diamond with Throughline on every brand-bearing surface of the live Prism site, and make root `DESIGN.md` the single authority for Flow's visual identity. Nothing else about the site changes: Prism tokens, layouts, information architecture, Search + Ask, and the agent interfaces (`llms.txt`, Markdown, search, MCP, OpenAPI) stay as they are.

- **Logo.** `site/components/logo.tsx` renders the Throughline mark beside a lowercase **flow** wordmark without the trailing slash. Header and footer keep their current sizes and accessible names.
- **Favicon and app icons.** `site/app/icon.svg` becomes the Throughline mark on the near-black canvas, with the raster derivatives Next.js and browsers need (Apple touch icon, legacy `favicon.ico`).
- **Open Graph.** `site/app/opengraph-image.tsx` keeps its current composition and swaps the diamond for Throughline and the slash-less wordmark. The static `flow-social` export is the fallback only if the OG renderer cannot draw the mark faithfully.
- **Hero.** `site/components/home/prism-diagram.tsx` keeps its spokes, labels, and motion; its centre becomes Throughline (or a neutral core) so no diamond competes with the logo.
- **Brand assets.** The canonical SVG masters and the raster exports `DESIGN.md` names go under `site/public/brand/`.
- **`DESIGN.md`.** The approved draft lands at the root, aligned with `PRODUCT.md` (product intent there, visual identity here), and `docs/README.md` points to it.

## User Stories

1. As someone evaluating Flow, the header, favicon, and shared link preview show the same Throughline mark, so the brand reads as one product.
2. As a reader with a browser tab among many, the 16 px favicon is still recognisable on light and dark tab strips.
3. As a contributor or agent changing the site's look, I read root `DESIGN.md` and know which assets, tokens, and usage rules are canonical.
4. As an agent, every machine-readable endpoint returns what it did before this change.

## Implementation Decisions

- **Source of assets.** The kit's `repo-ready/` files are target-path suggestions. Review each against current `main` before applying; take geometry from the SVG masters, never redraw it per surface.
- **What gets committed.** Only files a surface uses or `DESIGN.md` names: the mark (colour, white, ink), the dark and light lockups, the favicon master and its raster derivatives, `flow-social`, `flow-portfolio-cover`, and `flow-brand-banner`. Unreferenced variants (app-icon light, ink and white lockups, standalone 192/512 PNGs without a manifest) stay in the kit. The kit's `reference-only/` files, design screenshots, and `__dev/` stay untracked (`.git/info/exclude`).
- **Small sizes.** At 16–24 px use the simplest high-contrast form; if the gradient muddies the silhouette, the footer and favicon fall back to the one-colour mark.
- **One mark, many renderers.** The logo component, favicon, and OG image share the same path data. Inline SVG in `logo.tsx` and the OG route is acceptable; keep the paths identical to `throughline-mark.svg`.
- **Tokens unchanged.** Use the existing Prism tokens and the canonical gradient from `DESIGN.md`; no new colours or fonts.
- **No decision record.** The identity was chosen before this work and `DESIGN.md` records it as current; a record would duplicate it.
- **Exposure.** Public, static, read-only presentation on the existing Vercel deployment. No new routes, no writes, no authentication changes.

## Testing Decisions

Good tests here are rendered checks, not snapshots: the existing `pnpm --dir site qa` and `next build`, plus visual inspection of real renders. Existing site tests cover the agent endpoints and must pass unchanged. No new automated tests unless a check reveals a regression worth guarding.

**Acceptance scenario.** A visitor on a phone and a laptop, and an agent, on the preview deployment of this branch:

1. Open `/` at 375 px and 1440 px: the header shows Throughline and lowercase **flow**; the hero diagram has no diamond; layout and spacing match production.
2. Visit Skills, a skill detail, Starters, Docs, Search + Ask, and For agents: each looks as it does in production apart from the mark; Ask still answers with citations.
3. Inspect the favicon at 16, 32, and 64 px against light and dark backgrounds: the three trajectories are distinguishable; the monochrome mark reads without the gradient.
4. Fetch `/opengraph-image` and paste the preview URL into a link-preview debugger: the card shows Throughline and *Make ideas flow.*
5. Tab through the header and footer: focus is visible, the logo link has an accessible name, decorative SVGs stay `aria-hidden`.
6. Fetch `/llms.txt`, `/skills/build.md`, `/api/search?q=ship`, and list MCP tools at `/api/mcp`: responses match production.
7. `grep` the site for the diamond path (`M16 5.5`) and `rotate(45` in the hero: no matches.
8. After merge, the production favicon and OG image match the merged commit; a local render alone does not count.

## Out of Scope

- Any redesign of layouts, typography, tokens, navigation, or content.
- Changes to the skills package, `PRODUCT.md` direction, or agent interfaces.
- Trademark clearance or formal recognition testing.
- Applying Throughline to flow-next or flow-mono starters.

## Further Notes

- The approved `DESIGN.md` draft and asset kit are in the untracked `__dev/designs/flow-throughline/flow-throughline-identity-kit/`; its `INTEGRATION.md` lists the surfaces above.
- The kit's handoff says no spec is needed; this one is kept deliberately short so the change stays one focused PR.
- Open assumption: whether `next/og` renders the gradient-filled paths faithfully. Check step 4 on the preview before falling back to the static export.
