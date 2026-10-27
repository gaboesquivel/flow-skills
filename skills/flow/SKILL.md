---
name: flow
description: Keep PRODUCT.md, DESIGN.md, GLOSSARY.md, and ARCHITECTURE.md aligned with meaningful product, design, architecture, or terminology changes.
disable-model-invocation: false
---

# Flow Lite

Flow is a lightweight, human-led product engineering methodology for building software with AI agents. In Flow-shaped projects, `PRODUCT.md` holds that identity at the project root. Flow Lite keeps **shared intent** current: product, design, architecture, decisions, and evidence stay understandable as the software evolves—the **preserve intent** principle from that file when present.

Align root context files when work changes what the product is, how it behaves, how it is built, or how the team names important concepts. This skill is **not** a workflow router: it does not run explore → spec → build sequences or authorize implementation by itself.

Hosts may surface this skill when task matching supports implicit invocation; that is optional and not an always-on hook. Portable enforcement of root-context alignment also lives in development skills such as `implement` and `review`. Full guarantee without those skills requires host integration beyond the Flow catalog.

## When to use

- After meaningful changes to product intent, experience, architecture, or shared vocabulary.
- When the user invokes `/flow` or asks to sync or update root documentation.
- When a host surfaces this skill after substantive context work (optional; not guaranteed on every host).

## Process

1. Read existing `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when present. Read relevant `docs/specs/` and `docs/decisions/` records only when they clarify the area you are aligning.
2. Update only sections affected by the change. When editing `PRODUCT.md`, preserve the project's existing structure; in Flow-shaped projects, identity (mission, definition, principles) stays authoritative at the top. Keep one home per fact; link to specs, decisions, or code instead of duplicating detail that is cheap to rediscover.
3. Create a root file only when it would hold meaningful content for this repository. Do not scaffold empty trees or parallel trackers (no PRD/PDR/ADR folders).

## Boundaries

- Do not edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar instruction files.
- Do not require installation, initialization, or a prior skill invocation.
- Do not treat alignment edits as permission to implement unrelated code. For authorized implementation and tests, invoke the `implement` skill when installed.
- Do not create `docs/specs/` or `docs/decisions/` records here; use `to-spec` or explicit decision work when durable bounded artifacts are justified.
- Suggest other skills (`to-spec`, `review`, …) only when the user asks; no mandatory chain.

## Completion

State which root files changed and what position they now reflect. Note unresolved assumptions and whether the user may want a spec or decision record via another skill.
