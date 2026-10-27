# 0014 — Handoff skill

Status: **Accepted** (2026-10-27). Partially supersedes the leave-out list in [0013](0013-restore-engineering-skills.md) for `handoff` only. Related: [0003](0003-skill-naming.md).

## Context

[0003](0003-skill-naming.md) retired `handoff` because it sat outside the intended catalog. [0013](0013-restore-engineering-skills.md) restored seven other skills and left `handoff` out. The maintainer asked to add it.

## Decision

- Ship `skills/handoff/` as an explicit skill.
- Compact the current conversation into a handoff document in the operating system's temporary directory so a fresh agent can continue.
- Name useful skills in that document. Do not invoke them, and do not treat `handoff` as a workflow router.

## Consequences

- The live catalog is twenty-three skills.
- `setup-matt-pocock-skills` stays retired.
