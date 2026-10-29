# 039 — Design skill

Status: implemented (2026-10-29). Decision: [0051](../decisions/0051-design-skill.md).

## Problem Statement

Apps built with Flow make their visual decisions outside it: meta-cto (Signal) still wears the template's look. Nothing in the catalog leads an agent to render alternatives, let the human pick, and keep the approved direction in `DESIGN.md` before building. New products from `start` get a template `DESIGN.md` with no identity and no pointer to how to choose one.

## Solution

Add an optional `design` skill for Flow-based apps (adopter projects, typically from flow-next or flow-mono) and adjust neighbors by a line each so responsibilities stay single:

- **`design`** (new): brief from `PRODUCT.md` and existing design evidence, two to four rendered directions in context, a recommendation, the user's choice, then `DESIGN.md`, canonical assets, and the app's theme token values on the work's branch.
- **`prototype`**: description drops "design" in favor of interaction; points visual-direction work to `design`, which may use its UI guidance.
- **`explore`**: suggests `design` in one line when the brief creates a surface whose look `DESIGN.md` does not settle.
- **`review`**: the UI axis checks consistency with `DESIGN.md` (tokens, canonical assets, no retired marks).
- **`flow`**: aligns `DESIGN.md` but does not choose a direction.
- **`start`**: baseline `DESIGN.md` states that no identity is chosen and how to choose one; completion names `design` as optional after the first deployment. Bootstrap steps and checks are unchanged.
- Catalog surfaces: `validate.mjs`, `docs/skills.md`, README, `PRODUCT.md`, methodology pointer.

## User Stories

1. As a founder whose new app just deployed, I say "design this" and see three rendered directions for the product's identity, pick one, and find it in `DESIGN.md`.
2. As a maintainer adding a surface, I get alternatives rendered with real content at phone and desktop width, not isolated mockups.
3. As an agent building UI later, I read `DESIGN.md` and know the tokens, assets, and rules to follow.
4. As someone making a small change that fits `DESIGN.md`, no skill asks me to design first.
5. As the owner of an app with an approved identity, new work extends it; only I can reopen it.

## Implementation Decisions

- **Optional, phrase-reachable.** Not in the Flow block phrase table; reached by description like `prototype` and `jtbd`. No skill requires it.
- **Agent never selects.** Recommendation is allowed; approval is the user's explicit yes to the shown direction.
- **Exploration location is the user's.** The skill suggests a folder the project already uses for design work, else `docs/design/`, and asks with the brief; explorations are evidence, never a second authority.
- **One home per fact.** Product goals in `PRODUCT.md`, visual direction in `DESIGN.md`, which is the record: no separate decision record for a chosen direction unless the user asks.
- **Render tools are the host's.** Images, HTML/SVG, a design tool through MCP, or in-app variants; the skill names capabilities, not vendors.
- **Exposure.** Skill text and docs only; `start`'s generated `DESIGN.md` gains a short Visual identity section. No new scripts, CI jobs, checks, or deployable behaviour.

## Testing Decisions

`pnpm validate` and `pnpm test` cover catalog shape, links, adapters, and baseline docs. Behavior is validated by real design tasks, not snapshots.

**Acceptance scenario.**

1. New identity in a real Flow-based app: in a clone of meta-cto (Signal), whose `DESIGN.md` holds experience notes and whose tokens are still the template's, "design this" renders two to four distinct directions around the product's core journey at phone and desktop width, recommends one, and waits for the choice. On approval it extends `DESIGN.md` with the chosen direction only, keeps the existing sections, and sets the token values in `styles/globals.css`, and commits on a non-default branch; restyling pages is left to `build`.
2. New product with no `DESIGN.md`: the same flow writes one with no product goals in it.
3. A change that fits the existing `DESIGN.md` (an empty state on an existing page) is built without `design` being proposed.
4. `start`'s baseline `DESIGN.md` names `design`, and `start` adds no question or step before the first deployment.
5. `pnpm validate` and `pnpm test` pass.

## Out of Scope

- Changes to flow-next, flow-mono, flow-factory, meta-cto, or gaboesquivel.com (recommendations are reported separately).
- Design tokens, components, or assets in any template.
- Trademark clearance, recognition testing, or a design-system generator.
- A phrase in the Flow block.

## Further Notes

- Reference output only: Flow's root [`DESIGN.md`](../../DESIGN.md) and `site/public/brand/` show the shape of a recorded direction and its canonical assets. They are not part of this work.
