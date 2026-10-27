# 0013 — Restore selected engineering skills

Status: **Accepted** (2026-10-27). Partially supersedes the retirement list in [0004](0004-portable-skill-catalog.md). Does not supersede [0006](0006-flow-lite-and-flat-docs.md). [0014](0014-handoff-skill.md) later ships `handoff`.

## Context

[0004](0004-portable-skill-catalog.md) cut the catalog to a portable, manually invoked set and retired quality skills and delivery helpers. The maintainer asked to bring seven of those skills back: `council`, `ship`, `prototype`, `simplify`, `security`, `performance`, and `debug`.

## Decision

- Restore those seven skills from the pre-0004 tree under `skills/`.
- Keep them explicitly invoked. `flow` stays Flow Lite. There is still no workflow router and no bootstrap installer.
- Leave the other retired names out: `doctor`, `extract`, `grill-with-docs`, `domain-modeling`, `requirements`, `research`, `tdd`, `verify`, `handoff`, and `setup-matt-pocock-skills`.

## Consequences

- The live catalog is twenty-two skills. Validator, README, product identity, and [skill catalog](../skills.md) match that list.
- `ship` verifies, commits, pushes, and checks the deployment the repository configures. Invoking it does not run the other skills.
- Source notices and licenses that shipped with those skills stay in each skill directory.
