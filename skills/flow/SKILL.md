---
name: flow
description: Align the current project's PRODUCT.md, DESIGN.md, GLOSSARY.md, and ARCHITECTURE.md after meaningful changes, and write the project Flow block on request. Use when the user says "update the docs", "sync the context", "keep the docs aligned", or "set up Flow here".
disable-model-invocation: false
---

# Flow Lite

**Preserve intent** for the project you are in. Align its root context when work changes what that product is, how it behaves, how it is built, or how the team names important concepts.

This skill runs no other skill and authorizes no implementation. Skills may name the next skill and wait; the only automatic hand-offs are `start` → `explore` and explore's `interview` and `grill` phases, each behind the user's yes (decision 0024). It is **not** project initialization.

## Whose product

- **Adopter project:** `PRODUCT.md` is that project's product identity. Update only the sections the change affected.
- **This flow-skills repository:** `PRODUCT.md` is Flow's methodology identity. Edit it when that identity changes. Do not copy it into another repository.

Do not replace a project's product identity with Flow's tagline, mission, principles, or strategic chain.

`flow start` and "start project" are not this skill. The optional `start` skill (decision 0010) initializes from flow-next or flow-mono when installed, and confirms template, name, and destination before writing. If someone asks to scaffold a repository without `start`, stop and do not create starter trees, instruction-file snippets, or a Flow-branded `PRODUCT.md`.

## Invocation

Hosts may match this skill when the user asks to update or sync the docs. That is not an always-on hook, and it is not evidenced on every host. Confirmed portable behavior is narrower: the user asks for it or invokes `/flow`, or `implement` and `review` apply the same alignment rules when those skills are in use. Do not claim alignment ran only because metadata allows a host to suggest this skill.

## Process

1. Read existing `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when present. Read relevant `docs/specs/` and `docs/decisions/` records only when they clarify the area you are aligning.
2. Update only sections affected by the change. Keep one home per fact; link to specs, decisions, or code instead of duplicating detail that is cheap to rediscover.
3. Create a root file only when it would hold meaningful content about the current project. Do not scaffold empty trees, Flow methodology boilerplate, or parallel trackers (no PRD/PDR/ADR folders).

## Flow block

"Set up Flow here" opts the project into Flow mode (decision 0020). This section is the one definition of the block; `start` writes the same block after a bootstrap. Run this skill's `lib/flow-block.mjs` with Node, passing the project's absolute path and optionally `local` or `pull-request`, or apply the same rules by hand:

- Target `AGENTS.md`, or `CLAUDE.md` when that is the only instruction file.
- One block between `<!-- BEGIN FLOW -->` and `<!-- END FLOW -->`: a `Delivery:` line (`pull-request`, `local`, or `unset`), a short phrase-to-skill table (`PHRASES` in the helper is its one source), and a pointer to this skill. Under about 25 lines.
- Re-running replaces the block in place and keeps the recorded `Delivery:` unless the user names a mode. Never touch text outside the markers; stop and report when markers are unmatched or repeated.
- Leave `Delivery:` unset unless the user names a mode; `ship` owns the delivery-mode rule and records the mode. Deleting the block opts out.

Report which file was written and show the block. When both `AGENTS.md` and `CLAUDE.md` exist and `CLAUDE.md` does not import `AGENTS.md`, say the block may be invisible to Claude Code and suggest adding an `@AGENTS.md` line to `CLAUDE.md`.

## Boundaries

- Do not edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar instruction files outside the Flow block, and write the block only when the user asks or `start` finishes a confirmed bootstrap (decision 0020).
- Do not require installation, initialization, or a prior skill invocation.
- Do not treat alignment edits as permission to implement unrelated code. For authorized implementation and tests, invoke the `implement` skill when installed.
- Do not create `docs/specs/` or `docs/decisions/` records here; use `to-spec` or explicit decision work when durable bounded artifacts are justified.
- Name another skill (`to-spec`, `domain-modeling`, `review`, …) only when the user asks, then wait.

## Completion

State which root files changed and whose product they now reflect. Note unresolved assumptions and whether the user may want a spec or decision record via another skill.
