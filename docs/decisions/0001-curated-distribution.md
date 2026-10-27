---
status: superseded
category: process
date: 2026-10-27
superseded_by: 0002-local-skill-ownership.md
---

# Curated Flow Skills distribution

**Historical note:** Upstream sync, lockfile maintenance, Skills CLI coupling, and patch-layer consequences are superseded by [0002-local-skill-ownership.md](0002-local-skill-ownership.md). The body below is preserved as accepted evidence at the time of the initial distribution decision.

## Context

Flow Skills needs a standalone, versioned skill distribution that combines attributed upstream skills with Flow methodology, unified decision handling, explicit manual invocation, and controlled upstream updates—without depending on Flow Factory or a fixed technology stack.

## Decision

Ship a flat `skills/` namespace (23 curated skills), a minimal always-on bootstrap merged into consumer `AGENTS.md`, `docs/decisions/` as the single decision-record convention, `upstreams.lock.json` for provenance, and `flow-skills-init` atop the standard Skills CLI for one-command project setup.

## Rationale

One installation should provide a tested workflow; upstream behavior must not change silently; specialized skills must not run unless invoked. Flow originals (`flow`, `council`, `extract`, `ship`, `doctor`) generalize patterns proven in flow-starter without Factory-specific paths.

## Alternatives

- Fork entire upstream repositories — rejected (maintenance and license surface too large).
- Keep separate PDR/ADR systems — rejected (duplicate decision systems).
- Auto-invoke skills via bootstrap — rejected (context bloat and unintended workflows).

## Consequences

- Starter templates integrate only after acceptance criteria pass on a fresh isolated project.
- Imported skills receive Flow-specific patches recorded in the lockfile.
- Matt `retro` is included; Flow `f-retro` workflow self-improvement is not part of the curated set.
