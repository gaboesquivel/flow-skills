# 001: Portable skill catalog

Status: implemented (2026-10-27). Authoritative decision: [0004](../decisions/0004-portable-skill-catalog.md).

## Problem Statement

Founders and small teams need agent skills that work across IDEs and agents without Flow-specific setup, workflow routers, or edits to adopter instruction files.

## Solution

Ship twelve manually invoked skills installable via `npx skills add gaboesquivel/flow-skills`, with portable `SKILL.md` instructions and optional `agents/openai.yaml` adapters.

## Delivered skills

| Group | Skills |
| --- | --- |
| Delivery | `explore`, `grill`, `to-spec`, `to-tickets`, `implement`, `review`, `retro` |
| Product discovery | `interview`, `jtbd`, `competitors` |
| Writing | `write-agents`, `write-humans` |

## Implementation decisions

- Removed `flow` router, bootstrap installer, and non-core quality/delivery skills from the distribution.
- Default spec path for adopters without a convention: `docs/specs/NNN-short-name.md`.
- Validator enforces a fixed twelve-skill list; npm package ships `skills/` and `ATTRIBUTION.md` only.
- Tests include Agent Skills CLI listing (`tests/distribution.test.mjs`).

## Testing decisions

- `pnpm validate` — frontmatter, references, adapters, forbidden legacy strings.
- `pnpm test` — package tarball, contracts, CLI discoverability, fixture regressions.
- Live slash-command verification in a second agent host remains manual; see [smoke scenario status](../../tests/smoke/2026-10-27-scenario-status.md).

## Out of scope

- Validation board UI, OMTM automation, mandatory ticket systems, cross-agent evaluation framework.
- Reintroducing `flow-skills-init` or merging into consumer `AGENTS.md`.

## Further notes

Historical research and smoke notes for the superseded 25-skill tree remain in `docs/research/` and `tests/smoke/` with historical banners.
