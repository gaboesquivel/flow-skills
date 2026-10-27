# Decision records

Significant product, design, architecture, infrastructure, or process choices live here as numbered **decision records**. Routine implementation choices do not need a record.

| Record | Status | Topic |
| --- | --- | --- |
| [0001-curated-distribution.md](0001-curated-distribution.md) | Superseded (maintenance/install details) | Initial curated distribution shape |
| [0002-local-skill-ownership.md](0002-local-skill-ownership.md) | Accepted (install path superseded by 0004) | Local source and composition policy |
| [0003-skill-naming.md](0003-skill-naming.md) | Superseded by 0004 | Twenty-five-skill catalog (historical) |
| [0004-portable-skill-catalog.md](0004-portable-skill-catalog.md) | Accepted (flow id superseded by 0006) | Portable catalog and Agent Skills install |
| [0005-misc-tldr-skill.md](0005-misc-tldr-skill.md) | Accepted | Misc group and `tldr` visual recap skill |
| [0006-flow-lite-and-flat-docs.md](0006-flow-lite-and-flat-docs.md) | Accepted | Flow Lite `flow` skill and flat specs/decisions docs |
| [0007-flow-product-identity.md](0007-flow-product-identity.md) | Accepted | Official Flow identity in PRODUCT.md |
| [0008-leading-words-and-visual-summaries.md](0008-leading-words-and-visual-summaries.md) | Accepted | Leading words in the catalog; visual summaries stay in `tldr` |
| [0009-adopter-product-context.md](0009-adopter-product-context.md) | Accepted | Adopter `PRODUCT.md` is that product; no `flow start` |
| [0010-optional-start-skill.md](0010-optional-start-skill.md) | Accepted | Optional `start` skill authorized; not shipped yet; does not supersede 0009 |

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
