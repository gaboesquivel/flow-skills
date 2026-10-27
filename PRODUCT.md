# Flow Skills

Status: portable skill catalog implemented (2026-10-27); live verification across multiple agent hosts remains ongoing before broad compatibility claims.

## Purpose and audience

Flow Skills is an open collection of **manually invoked**, **agent-agnostic** skills for solo founders and small teams. Skills help turn intent into useful, verified work while preserving decision context in the repository humans and agents share.

Flow is not a single IDE, CLI, or model product. Cursor, Claude Code, Codex, OpenCode, and other environments consume the same `skills/<name>/SKILL.md` packages.

## Problem

AI makes it easy to ship faster than teams establish what matters. Bundling disparate skills leaves founders reconciling workflows, terminology, and documentation alone.

Flow offers a small, composable catalog with explicit invocation, no mandatory pipeline, and no requirement to modify adopter `AGENTS.md`, `CLAUDE.md`, or equivalent files.

## Implemented scope

**Shipped today:** twelve installable skills (seven delivery, three optional product discovery, two writing). Installation through the [Agent Skills ecosystem](https://github.com/vercel-labs/skills) (`npx skills add`). Core instructions avoid host-specific tool names and proprietary APIs.

**Broader methodology direction** (learning loops, validation board UI, commercial discovery automation, repository initialization products) remains documented in [methodology](docs/methodology.md) and [initiatives](docs/initiatives/README.md) but is **not** enforced by a router skill or setup command.

Capabilities users get from skills:

- Exploration and challenge before commitment (`explore`, `grill`).
- Numbered specifications and optional task breakdown (`to-spec`, `to-tickets`).
- Implementation and review on real repositories (`implement`, `review`).
- Session retrospective for agent environment improvements (`retro`).
- Optional customer and market framing (`interview`, `jtbd`, `competitors`).
- Clear writing for humans and agents (`write-humans`, `write-agents`).

Skills are editable, composable when explicitly invoked, and independent. `/implement` does not require `/to-spec`; `/to-spec` does not require `/grill`.

## Approach and open choices

Strategic product direction (OMTM, validation board, API-first agentic products, initialization experiments) stays in this document and linked research. No OMTM is selected for Flow itself; demand for Flow remains unvalidated.

See [principles](docs/principles.md), [methodology](docs/methodology.md), and [decision 0004](docs/decisions/0004-portable-skill-catalog.md) for the current catalog and distribution choices.
