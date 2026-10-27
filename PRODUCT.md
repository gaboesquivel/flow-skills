# Flow Skills

Status: portable twelve-skill catalog on `main` ([decision 0004](docs/decisions/0004-portable-skill-catalog.md)); live verification in multiple agent hosts remains ongoing.

## Purpose and audience

Flow Skills is an open collection of **manually invoked**, **agent-agnostic** skills for solo founders and small teams. Skills help turn intent into useful, verified work while preserving decision context in the repository humans and agents share.

Flow is not a single IDE, CLI, or model product. Cursor, Claude Code, Codex, OpenCode, and other environments consume the same `skills/<name>/SKILL.md` packages.

## Problem

AI makes it easy to ship faster than teams establish what matters. Bundling disparate skills leaves founders reconciling workflows, terminology, and documentation alone.

Flow offers a small, composable catalog with explicit invocation, no mandatory pipeline, and no requirement to modify adopter `AGENTS.md`, `CLAUDE.md`, or equivalent files.

## Shipped catalog

**Install:** `npx skills add gaboesquivel/flow-skills` via the [Agent Skills ecosystem](https://github.com/vercel-labs/skills).

**Skills:** seven delivery, three optional product discovery, two writing — grouped and described in **[docs/skills.md](docs/skills.md)**.

Skills are editable, composable when explicitly invoked, and independent (`/implement` does not require `/to-spec`; `/to-spec` does not require `/grill`).

**Not enforced by skills:** validation board UI, OMTM automation, commercial discovery pipelines, or repository initialization products. Those directions live in [methodology](docs/methodology.md) and [initiatives](docs/initiatives/README.md).

## Approach and open choices

Strategic product direction (OMTM, validation board, API-first agentic products) stays in this document and linked research. No OMTM is selected for Flow itself; demand for Flow remains unvalidated.

See [principles](docs/principles.md), [methodology](docs/methodology.md), and [documentation guide](docs/README.md).
