# 0006. Flow Lite skill and flat documentation

Status: accepted (2026-10-27)

## Context

Decision [0004](0004-portable-skill-catalog.md) retired the `flow` workflow router and kept the catalog fully manual. Product direction now calls for the smallest useful system: one tiny context-alignment skill, optional manual skills, flat durable docs, and zero-friction adoption without adopter instruction-file changes.

## Decision

- Reintroduce **`flow` as Flow Lite only** — align `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` after meaningful changes. It is not a pipeline router, orchestrator, or bootstrap.
- **Invocation split** — `flow` uses `disable-model-invocation: false` and `agents/openai.yaml` with `allow_implicit_invocation: true` so hosts may surface it when supported. All other catalog skills remain explicit-only (`disable-model-invocation: true`, `allow_implicit_invocation: false`).
- **Flat durable docs for adopters** — default new work to `docs/specs/NNN-short-name.md` and significant rationale to `docs/decisions/NNN-short-name.md`. Do not introduce PRD, PDR, or ADR parallel trees or mandatory idea/initiative folders.
- **This repository** — move `docs/ideas/` and `docs/initiatives/` out of the active structure into `docs/archive/`. Keep `docs/research/` and [references.md](../references.md) as maintainer evidence, not adopter scaffolding.

## Consequences

- Validator and tests include `flow` (fourteen skills after [0005](0005-misc-tldr-skill.md)).
- Catalog documentation and product narrative describe Flow Lite separately from optional delivery and discovery skills.
- Contributors record bounded work in specs and decisions; root documents stay the current product, design, architecture, and shared-language position.

## Supersedes

Partially supersedes [0004](0004-portable-skill-catalog.md) regarding retirement of the `flow` skill id. The portable catalog, install path, and manual-invocation policy for non-`flow` skills remain in force.
