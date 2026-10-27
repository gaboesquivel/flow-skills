# 0003. Skill naming and catalog shape

Status: accepted (2026-10-27)

## Context

Flow consolidated upstream skills into a self-contained `skills/` directory. Legacy names were verbose, metaphor-heavy, or duplicated behavior. The distribution also carried a `handoff` skill outside the intended catalog and referenced retired setup workflows.

## Decision

Adopt twenty-five short, technically accurate skill names grouped as core, discovery, delivery, quality, and writing. Rename managed skills on upgrade when the prior copy matches the installation manifest and has not been customized. Retire `handoff` and `setup-matt-pocock-skills` from the catalog; preserve customized copies on disk until reconciled.

Primary public installation:

```bash
npx skills@latest add gaboesquivel/flow-skills
```

The optional `flow-skills-init` bootstrap remains available for AGENTS.md markers and manifest-based upgrades.

## Consequences

- Directory names, frontmatter `name` fields, adapters, tests, and user-facing docs use the new vocabulary.
- `explore` and `requirements` are distinct from `grill` and `to-spec`.
- Historical research and archive material may retain old names as evidence.

## Supersedes

None. This decision narrows the descriptive naming proposals recorded in [writing.md](../ideas/writing.md#descriptive-technical-naming-plan) without adopting that document's longer alternative names.
