---
name: flow
description: Keep PRODUCT.md, DESIGN.md, GLOSSARY.md, and ARCHITECTURE.md aligned with meaningful product, design, architecture, or terminology changes.
disable-model-invocation: false
---

# Flow Lite

Align root context documents with work that changed what the product is, how it behaves, how it is built, or how the team names important concepts. This skill is **not** a workflow router: it does not run explore → spec → build sequences or authorize implementation by itself.

## When to use

- After meaningful changes to product intent, experience, architecture, or shared vocabulary.
- When the user invokes `/flow` or asks to sync or update root documentation.
- When a host surfaces this skill after substantive context work (optional; not guaranteed on every host).

## Process

1. Read existing `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when present. Read relevant `docs/specs/` and `docs/decisions/` records for the area you are touching.
2. Update only sections affected by the change. Keep one authoritative home per fact; link to specs, decisions, or code instead of duplicating detail that is cheap to rediscover.
3. Create a root file only when it would hold meaningful content for this repository. Do not scaffold empty trees or parallel trackers (no PRD/PDR/ADR folders).
4. Record bounded work or significant rationale in `docs/specs/NNN-short-name.md` or `docs/decisions/NNN-short-name.md` when the project uses those paths; follow existing numbering when present.

## Boundaries

- Do not edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar instruction files.
- Do not require installation, initialization, or a prior skill invocation.
- Do not treat alignment edits as permission to implement unrelated code. For authorized implementation and tests, use [implement](../implement/SKILL.md).
- Suggest other skills (`to-spec`, `review`, …) only when the user asks; no mandatory chain.

## Completion

State which root files changed and what position they now reflect. Note unresolved assumptions and whether a spec or decision record would help if the user wants durable rationale saved.
