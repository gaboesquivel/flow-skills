# 0015 — Rename to-tasks and restore domain-modeling

Status: **Accepted** (2026-10-27). Partially supersedes the leave-out list in [0013](0013-restore-engineering-skills.md) for `domain-modeling` only. Related: [0003](0003-skill-naming.md), [0014](0014-handoff-skill.md).

## Context

The portable catalog kept `to-tickets` from upstream naming while the skill already produces tasks and publishes tracker issues only when asked. Flow maintains a project glossary and shared-language practice in [methodology](../methodology.md); [domain language research](../research/2026-10-20-domain-language.md) adopted that practice and left skill packaging open. [0013](0013-restore-engineering-skills.md) left `domain-modeling` retired.

## Decision

- Rename the delivery skill `to-tickets` to `to-tasks`. Use **task** for the slice of work; keep optional issue publication and existing tracker conventions.
- Restore `skills/domain-modeling/` as an explicit skill for actively refining terms and selective decision records. One project glossary (`GLOSSARY.md`) and `docs/decisions/` when the project has no other convention. No bounded-context packaging, no skill router, no revival of `grill-with-docs` or other retired names.

## Consequences

- The live catalog is twenty-four skills. Validator, README, product identity, and [skill catalog](../skills.md) match that list.
- `explore` and `grill` may name `domain-modeling` or `to-tasks` as optional next steps; no mandatory sequence.
