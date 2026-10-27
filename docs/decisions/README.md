# Decision records

Significant product, design, architecture, infrastructure, or process choices live here as numbered **decision records**. Routine implementation choices do not need a record.

| Record | Status | Topic |
| --- | --- | --- |
| [0001-curated-distribution.md](0001-curated-distribution.md) | Superseded (maintenance/install details) | Initial curated distribution shape |
| [0002-local-skill-ownership.md](0002-local-skill-ownership.md) | Accepted (install path superseded by 0004) | Local source and composition policy |
| [0003-skill-naming.md](0003-skill-naming.md) | Superseded by 0004 | Twenty-five-skill catalog (historical) |
| [0004-portable-skill-catalog.md](0004-portable-skill-catalog.md) | Accepted | Twelve-skill portable catalog and Agent Skills install |

## Rules

- **Accepted** records are immutable historical evidence.
- Superseding a decision creates a new record linked to the previous one (`supersedes` / `superseded_by`).
- `PRODUCT.md`, `DESIGN.md`, and `ARCHITECTURE.md` reflect the **current** accepted position.
- Legacy `docs/adr/` or `docs/pdr/` folders, if present, are historical unless the project migrates them explicitly.

## Filename

`NNNN-short-slug.md` — four-digit sequence, kebab-case slug.

## Template

```markdown
---
status: proposed | accepted | superseded | rejected
category: product | design | architecture | infrastructure | process
date: YYYY-MM-DD
supersedes:
superseded_by:
---

# Title

## Context

## Decision

## Rationale

## Alternatives

## Consequences
```
