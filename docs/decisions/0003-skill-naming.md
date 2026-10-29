# 0003. Skill naming and catalog shape

Status: superseded for catalog shape by [0004](0004-portable-skill-catalog.md) (2026-10-27). Naming patterns below remain historical context. Amended by [0052](0052-skill-names-without-to-prefix.md) (`to-spec` renamed `spec`).

## Context

Flow consolidated upstream skills into a self-contained `skills/` directory. Legacy names were verbose, metaphor-heavy, or duplicated behavior. The distribution also carried a `handoff` skill outside the intended catalog and referenced retired setup workflows.

## Decision

Adopt twenty-five short, technically accurate skill names grouped as core, discovery, delivery, quality, and writing. Rename managed skills on upgrade when the prior copy matches the installation manifest and has not been customized. Retire `handoff` and `setup-matt-pocock-skills` from the catalog; preserve customized copies on disk until reconciled.

Installation and catalog size were superseded by [0004](0004-portable-skill-catalog.md).

## Consequences

- Directory names, frontmatter `name` fields, adapters, tests, and user-facing docs use the new vocabulary.
- `explore` and `requirements` are distinct from `grill` and `to-spec`.
- Historical research and archive material may retain old names as evidence.

## Supersedes

None. This decision narrows the descriptive naming proposals recorded in [writing.md](../archive/2026-10-27-ideas-initiatives/ideas/writing.md#descriptive-technical-naming-plan) without adopting that document's longer alternative names.
