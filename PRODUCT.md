# Flow Skills

Status: fourteen-skill portable catalog on `main` ([0004](docs/decisions/0004-portable-skill-catalog.md), [0005](docs/decisions/0005-misc-tldr-skill.md), [0006](docs/decisions/0006-flow-lite-and-flat-docs.md)); live verification in multiple agent hosts remains ongoing.

## Purpose and audience

Flow Skills is a lean, **agent-agnostic** skill collection for solo founders and small teams. It helps turn intent into useful, verified work while keeping product understanding in documents humans and agents share—without mandatory process or changes to adopter instruction files.

Flow is not a single IDE, CLI, or model product. Cursor, Claude Code, Codex, OpenCode, and other environments consume the same `skills/<name>/SKILL.md` packages.

## Problem

AI makes it easy to ship faster than teams establish what matters. Disparate skills and heavy methodology leave founders reconciling workflows, terminology, and documentation alone.

Flow offers a small catalog: **Flow Lite** for root context alignment, plus optional skills invoked only when you ask. No initialization, no pipeline router, no requirement to modify adopter `AGENTS.md`, `CLAUDE.md`, or equivalent files.

## Shipped catalog

**Install:** `npx skills add gaboesquivel/flow-skills` via the [Agent Skills ecosystem](https://github.com/vercel-labs/skills).

| Layer | Skills |
| --- | --- |
| Flow Lite | [`flow`](skills/flow/SKILL.md) — align `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md` (discoverable where hosts support it) |
| Delivery | `explore`, `grill`, `to-spec`, `to-tickets`, `implement`, `review`, `retro` |
| Product discovery | `interview`, `jtbd`, `competitors` |
| Writing | `write-agents`, `write-humans` |
| Misc | `tldr` |

Grouped descriptions and links: **[docs/skills.md](docs/skills.md)**. Every skill except `flow` requires explicit invocation. No skill enforces a sequence (`/implement` does not require `/to-spec`).

**Default durable docs in adopter projects:** `docs/specs/NNN-short-name.md` and `docs/decisions/NNN-short-name.md`, plus root context files when useful.

**Not shipped as skills:** validation-board UI, OMTM automation, commercial discovery pipelines, repository bootstrap, or workflow orchestration. Optional judgment for measurement and validation lives in [methodology](docs/methodology.md) as practice, not product enforcement.

## Approach and open choices

Strategic themes (measurable learning, API-first agentic products) may inform this repository's research. No OMTM is selected for Flow itself; broader demand remains unvalidated.

See [principles](docs/principles.md), [methodology](docs/methodology.md), and the [documentation guide](docs/README.md).
