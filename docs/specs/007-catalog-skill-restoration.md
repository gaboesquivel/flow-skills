# 007: Catalog skill restoration

Status: implemented (2026-10-27).

## Problem

The portable catalog ([0004](../decisions/0004-portable-skill-catalog.md)) retired engineering helpers the maintainer still wants as explicit skills. `handoff` was retired in [0003](../decisions/0003-skill-naming.md) and never shipped in this tree.

## Solution

Restore eight skills from the pre-0004 distribution plus a new local `handoff` package:

- **Delivery / advisory:** `council`, `ship`
- **Prototype:** `prototype`
- **Quality:** `simplify`, `security`, `performance`, `debug`
- **Misc:** `handoff`

Keep Flow Lite `flow` as context alignment only. No workflow router, no bootstrap installer, no mandatory sequence.

## Acceptance criteria

- [0013](../decisions/0013-restore-engineering-skills.md) and [0014](../decisions/0014-handoff-skill.md) accepted.
- Twenty-three skills in `scripts/validate.mjs`, [skills.md](../skills.md), README, and PRODUCT.md.
- `pnpm validate` and `pnpm test` pass.
- Restored skills remain explicitly invoked (`disable-model-invocation: true`).

## Out of scope

- `doctor`, `extract`, `grill-with-docs`, `domain-modeling`, `requirements`, `research`, `tdd`, `verify`, `setup-matt-pocock-skills`, and the retired `flow` router.
