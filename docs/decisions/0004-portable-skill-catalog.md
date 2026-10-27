# 0004. Portable skill catalog and distribution

Status: accepted (2026-10-27)

## Context

The repository previously shipped twenty-five skills, a `flow` workflow router, and an optional `flow-skills-init` bootstrap that merged `AGENTS.md` markers. Product direction called for agent-agnostic, manually invoked skills without mandatory setup or adopter instruction changes.

## Decision

- Ship **twelve** skills: `explore`, `grill`, `to-spec`, `to-tickets`, `implement`, `review`, `retro`, `interview`, `jtbd`, `competitors`, `write-agents`, `write-humans`.
- Retire the `flow` router, quality-only skills, delivery helpers (`ship`, `doctor`, …), and the npm init/bootstrap installer from the distribution.
- Primary installation: `npx skills add gaboesquivel/flow-skills` via the Agent Skills ecosystem. Do not hardcode a default agent flag.
- Default spec path for projects without a convention: `docs/specs/NNN-short-name.md`.
- Rename writing skills from `write-for-agents` / `write-for-humans` to `write-agents` / `write-humans`.

## Consequences

- Validator and tests target the fixed twelve-skill list, not a growing count invariant.
- Historical decision 0003's twenty-five-skill catalog and bootstrap install path are superseded for current distribution.
- Decision 0002's offline tarball copy remains possible for maintainers but is not the primary user install story.

## Supersedes

Partially supersedes [0003](0003-skill-naming.md) catalog shape and install guidance. Local ownership principles in [0002](0002-local-skill-ownership.md) still apply to editing `skills/` in this repository.
