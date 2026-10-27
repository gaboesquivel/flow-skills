# 008: To-tasks rename and domain-modeling restoration

Status: implemented (2026-10-27).

## Problem

The delivery skill id `to-tickets` reflected upstream naming while the skill produces **tasks** and publishes tracker issues only when asked. Shared-language practice lives in [methodology](../methodology.md) and [GLOSSARY.md](../../GLOSSARY.md), but [0013](../decisions/0013-restore-engineering-skills.md) left `domain-modeling` out of the portable catalog.

## Solution

- Rename `skills/to-tickets/` to `skills/to-tasks/` and align catalog docs, evals, and validator expectations.
- Restore `skills/domain-modeling/` for active glossary and selective decision-record work (one root glossary, `docs/decisions/` when the project has no other convention).
- Apply a human-readability pass across live skill entrypoints; keep authorization boundaries and smoke contracts.

Decision: [0015](../decisions/0015-tasks-and-domain-modeling.md).

## Acceptance criteria

- Twenty-four skills in `scripts/validate.mjs`, [skills.md](../skills.md), README, and PRODUCT.md.
- `domain-modeling` and `to-tasks` remain explicitly invoked (`disable-model-invocation: true`).
- `pnpm validate` and `pnpm test` pass.
- PR alignment passes with decision record and smoke-contract updates.

## Out of scope

- `grill-with-docs`, `requirements`, `research`, `tdd`, `verify`, `doctor`, `extract`, and other names retired in [0004](../decisions/0004-portable-skill-catalog.md).
