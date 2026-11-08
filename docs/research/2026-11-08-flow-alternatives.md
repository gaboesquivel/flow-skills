# Flow's alternatives: native Claude Code, Matt Pocock's skills, Superpowers

Inspected 2026-11-08 against `main` at `90c309e`. Supports the alternatives section of [PRODUCT.md](../../PRODUCT.md#alternatives-and-differentiation) and [spec 070](../specs/070-product-engineering-partner.md). Updates the [2026-10-20 landscape](2026-10-20-competitive-landscape.md) for these three only; that note's other entries were not rechecked.

## Question

Which alternatives would a product engineer building with Claude Code realistically choose instead of Flow, and does any of them help decide what to build, reuse, defer, or stop, and later judge that choice from evidence? The answer informs Flow's positioning and whether `explore`'s alternatives step and `align` are where Flow differs.

## Method

Repository trees, READMEs, and `SKILL.md` files read through the GitHub API; Claude Code documentation read in a browser fetch. Most `SKILL.md` files were read only in their opening section; two claims below were rechecked in full by a second read. Labels: **observed** (read in the source), **claimed** (the author's description of their own product), **inferred** (this note's reasoning).

## Findings

| | Native Claude Code | Matt Pocock's skills | Superpowers |
| --- | --- | --- | --- |
| Version read | Docs at [code.claude.com](https://code.claude.com/docs/en/commands), 2026-11-08 | [`mattpocock/skills`](https://github.com/mattpocock/skills) at `4ae2317d` (2026-10-31) | [`obra/superpowers`](https://github.com/obra/superpowers) at `22f0b463` (v7.0.2, 2026-11-03) |
| Install | Built in | Official Claude plugin marketplace, or `skills.sh` (observed, README) | Official Claude plugin marketplace or its own (observed, README) |
| Decide whether to build, reuse, defer, or stop | Not found in the commands or common-workflows pages | Not found; `grilling` interrogates a plan already chosen (observed) | Partial: `brainstorming` does recon, including the web, and lays out approaches, but says it "is for how it gets built" (observed) |
| Product context across sessions | `CLAUDE.md` and auto memory, general-purpose (observed); no product-specific shape (inferred) | `GLOSSARY.md` and ADRs via `domain-modeling`, the issue tracker via `to-spec` (observed) | Dated design docs under `docs/superpowers/specs/` (observed) |
| Spec and delivery discipline | Plan mode, `/batch` across parallel subagents, worktrees (observed); no persisted spec found | `to-spec`, `to-tickets`, `implement-spec`, `tdd`, `pr` (observed) | `writing-plans`, `executing-plans`, `subagent-driven-development`, `test-driven-development` (observed) |
| Verification and review | `/code-review` at several depths, `/security-review`, `/simplify` (observed) | `code-review` with Standards and Spec axes (observed) | `verification-before-completion`, `requesting-code-review` (observed) |
| Research artifact | Not found | `research`: a background agent reads primary sources and writes a cited Markdown note where the repo keeps notes (observed in full) | Not found as a skill |
| Outcome evidence after shipping | Not found; `/insights` reports on agent usage, not the product (observed) | Not found; `retro` improves the agent's environment (observed) | Not found |

Other observations:

- Pocock's catalog overlaps Flow's by name and job: `to-spec`, `domain-modeling`, `code-review`, `prototype`, and `research` (observed). The 2026-10-20 note described it only as agent-writing patterns; that is now incomplete.
- Both READMEs install from `claude-plugins-official` (observed: [Pocock](https://github.com/mattpocock/skills#readme), [Superpowers](https://github.com/obra/superpowers#readme)), so a Claude Code user may meet them before Flow (inferred).
- The doing-nothing alternative is strong: [spec 059's comparison](../../tests/evals/records/2026-11-03-build-vs-no-skills.md) found small tasks never reached a Flow skill and delivered as well without one.

## Limits

- No alternative was run on a task; capabilities are as documented, not as performed.
- The Claude Code hooks, memory, subagent, and skills pages were not read in detail.
- "Not found" means not found in the pages listed, never absent.
- Other alternatives in the 2026-10-20 note (Spec Kit, OpenSpec, BMAD, Addy Osmani's skills) were not rechecked.

## Implications

- **Strongest alternative:** native Claude Code plus Superpowers or Pocock's skills covers planning, specs, TDD, and review well. Flow's delivery chain alone is not a reason to choose it (inferred).
- **Differentiation hypothesis:** Flow helps a product engineer decide what to build, reuse, defer, or stop, using the project's own goals and constraints, and later judge that choice against a stated outcome. None of the three was found to cover the decision before building or the evidence after shipping. This is unproven until a comparison shows `explore` changing a recommendation and `align` answering "did it land" from a spec's Outcome sentence ([spec 070 acceptance](../specs/070-product-engineering-partner.md#acceptance)).
- **Name overlap:** Flow's `research` and Pocock's share a name and most of a job. As a plugin both are namespaced; on an Agent Skills host that installs both, one shadows the other (inferred, not tested).
