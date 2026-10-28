# Decision records

Significant product, design, architecture, infrastructure, or process choices live here as numbered **decision records**. Routine implementation choices do not need a record.

| Record | Status | Topic |
| --- | --- | --- |
| [0001-curated-distribution.md](0001-curated-distribution.md) | Superseded (maintenance/install details) | Initial curated distribution shape |
| [0002-local-skill-ownership.md](0002-local-skill-ownership.md) | Accepted (install path superseded by 0004) | Local source and composition policy |
| [0003-skill-naming.md](0003-skill-naming.md) | Superseded by 0004 | Twenty-five-skill catalog (historical) |
| [0004-portable-skill-catalog.md](0004-portable-skill-catalog.md) | Accepted (parts superseded by 0006, 0013, and 0019) | Portable catalog and Agent Skills install |
| [0005-misc-tldr-skill.md](0005-misc-tldr-skill.md) | Accepted | Misc group and `tldr` visual recap skill |
| [0006-flow-lite-and-flat-docs.md](0006-flow-lite-and-flat-docs.md) | Accepted (invocation split superseded by 0019) | Flow Lite `flow` skill and flat specs/decisions docs |
| [0007-flow-product-identity.md](0007-flow-product-identity.md) | Accepted | Official Flow identity in PRODUCT.md |
| [0008-leading-words-and-visual-summaries.md](0008-leading-words-and-visual-summaries.md) | Accepted (leading words redefined by 0019) | Leading words in the catalog; visual summaries stay in `tldr` |
| [0009-adopter-product-context.md](0009-adopter-product-context.md) | Accepted | Adopter `PRODUCT.md` is that product; no `flow start` |
| [0010-optional-start-skill.md](0010-optional-start-skill.md) | Accepted | Optional `start` skill authorized (shipped on catalog PR); does not supersede 0009 |
| [0011-homepage-and-genui-playground.md](0011-homepage-and-genui-playground.md) | Accepted | `/` replaceable homepage; `/genui` public GenUI playground (dogfood baseline) |
| [0012-start-bootstrap-lib.md](0012-start-bootstrap-lib.md) | Accepted | `start` bootstrap helpers under `skills/start/lib/` with executable tests |
| [0013-restore-engineering-skills.md](0013-restore-engineering-skills.md) | Accepted (`handoff` added by 0014; `simplify`, `security`, `performance` retired by 0019) | Restore `council`, `ship`, `prototype`, `simplify`, `security`, `performance`, and `debug` |
| [0014-handoff-skill.md](0014-handoff-skill.md) | Accepted | Explicit `handoff` skill for a fresh agent |
| [0015-tasks-and-domain-modeling.md](0015-tasks-and-domain-modeling.md) | Accepted | `to-tasks` rename; restore `domain-modeling` for glossary practice |
| [0016-start-in-place.md](0016-start-in-place.md) | Accepted | `start` bootstraps at a root holding only agent setup and infers the template |
| [0017-claude-code-skill-coexistence.md](0017-claude-code-skill-coexistence.md) | Accepted (`simplify` retired by 0019) | Coexist with Claude Code built-ins; keep `simplify` name and document overlaps |
| [0018-interview-extracts-intent.md](0018-interview-extracts-intent.md) | Accepted | `interview` extracts the user's intent (adapted from `interview-me`), not customer discovery |
| [0019-voice-first-invocation.md](0019-voice-first-invocation.md) | Accepted | Talking is the interface: model-invocable skills, spoken leading words, host coexistence |
| [0020-flow-mode.md](0020-flow-mode.md) | Accepted | Flow mode: project instruction block, `to-tasks` hand-off, `ship` task-set orchestration, local and pull-request delivery modes |
| [0021-autonomous-explore-and-ship.md](0021-autonomous-explore-and-ship.md) | Accepted | Explore and ship create docs files and GitHub issues, group pull requests, and suggest the host's autonomous mode |
| [0022-start-runs-explore.md](0022-start-runs-explore.md) | Accepted | Speakable `start` runs `explore` beside the bootstrap; spec 001 full, later slices as candidates |
| [0023-agent-first.md](0023-agent-first.md) | Accepted | Agent-first, API-first becomes an official principle; explore and to-spec apply it |
| [0024-gated-hand-offs.md](0024-gated-hand-offs.md) | Accepted | Named hand-offs; explicit yes before spec writes, task publishing, and merging or pushing `main`; `start` explores at Lite (depth amended by 0026) |
| [0025-wave-checkpoints.md](0025-wave-checkpoints.md) | Accepted | `ship` runs task sets in waves with a draft pull request, preview checkpoints, and a `Deploy:` target |
| [0026-process-depth.md](0026-process-depth.md) | Accepted | Lite or Full process recorded in the Flow block; `start` is Flow setup plus bootstrap; spec–decision boundary; "Flow Lite" label retired |
| [0027-progress-board-skill.md](0027-progress-board-skill.md) | Accepted | Read-only `board` skill derived from git, with a `ship` run overlay |
| [0028-build-and-ship.md](0028-build-and-ship.md) | Proposed | `build` opens a pull request with green checks; `ship` lands accepted specs and hotfixes with no confirmation; spec acceptance; `Deploy:` retired |

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
