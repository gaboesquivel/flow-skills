---
name: flow
description: Align the current project's PRODUCT.md, DESIGN.md, GLOSSARY.md, and ARCHITECTURE.md after meaningful changes, and write the project Flow block on request. Use when the user says "update the docs", "sync the context", "keep the docs aligned", or "set up Flow here".
disable-model-invocation: false
---

# Flow

**Preserve intent** for the project you are in. Align its root context when work changes what that product is, how it behaves, how it is built, or how the team names important concepts.

This skill runs no other skill and authorizes no implementation (decision 0024). It is **not** project initialization.

## Whose product

- **Adopter project:** `PRODUCT.md` is that project's product identity. Update only the sections the change affected.
- **This flow-skills repository:** `PRODUCT.md` is Flow's methodology identity. Edit it when that identity changes. Do not copy it into another repository.

Do not replace a project's product identity with Flow's tagline, mission, principles, or strategic chain.

`flow start` and "start project" are not this skill. The optional `start` skill (decision 0010) is this setup plus a template bootstrap from flow-next or flow-mono (decision 0026), and confirms template, name, and destination before writing. If someone asks to scaffold a repository without `start`, stop and do not create starter trees, instruction-file snippets, or a Flow-branded `PRODUCT.md`.

## Invocation

Hosts may match this skill when the user asks to update or sync the docs. That is not an always-on hook, and it is not evidenced on every host. Confirmed portable behavior is narrower: the user asks for it or invokes `/flow`, or `build` and `review` apply the same alignment rules when those skills are in use. Do not claim alignment ran only because metadata allows a host to suggest this skill.

## Process

1. Read `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when present, with parallel tool calls rather than spawned workers (fan-out rule: `write-agents` Workers). Read relevant `docs/specs/` and `docs/decisions/` records only when they clarify the area you are aligning.
2. Update only sections affected by the change, with one writer per root file. Keep one home per fact; link to specs, decisions, or code instead of duplicating detail that is cheap to rediscover.
3. Create a root file only when it would hold meaningful content about the current project. Do not scaffold empty trees, Flow methodology boilerplate, or parallel trackers (no PRD/PDR/ADR folders).

## Flow block

"Set up Flow here" opts the project into Flow mode (decision 0020). This section is the one definition of the block; `start` writes the same block after a bootstrap. Deleting the block opts out.

**Ask.** Read any existing block first. For each of `Process:` and `Delivery:` that is missing or `unset` and that the request does not name, ask once before writing, both questions in one round, each with a suggested answer:

- **Discovery depth** (decision 0026; the `Process:` line) controls how much discovery runs and how many decision records get written: **Lite** (brief, spec 001 in full with its tasks, decisions inside specs) or **Full** (deeper discovery and a decision record for each choice among alternatives). Suggest Lite unless the request points to Full. `explore` reads it as its default depth; `to-spec` owns the spec–decision boundary.
- **Delivery** (decision 0030; the `Delivery:` line) controls where the work lands: **pull requests** or **local**, with a suggestion as `build`'s Delivery mode section describes; that section owns the rule and what each mode does. If `build` is unavailable, ask without a suggestion.

The two are independent: any combination is valid, such as Lite with pull requests or Full with local. Do not derive one answer from the other.

Recorded values stay unless the user names a new one, so a re-run with both lines set asks nothing.

**Write** with this skill's `lib/flow-block.mjs`: `node <skill-dir>/lib/flow-block.mjs <absolute-project-path> [local|pull-request] [--process <lite|full>]`. The helper owns the block's rules: target file, markers, phrase table (`PHRASES`), in-place replacement that keeps recorded values, and refusal of malformed markers. Never touch text outside the markers.

**Fallback without Node:** in `AGENTS.md`, or `CLAUDE.md` when that is the only instruction file, write one block between `<!-- BEGIN FLOW -->` and `<!-- END FLOW -->` holding a `Delivery:` line, a `Process:` line, the helper's phrase table, and a pointer to this skill. Replace an existing block in place, dropping any other line (such as a retired `Deploy:`). Stop and report when markers are unmatched or repeated.

**Goals.** Setup defines the same goals as `start`. After writing the block, when `PRODUCT.md` is missing or has no brief (problem, who, riskiest assumption, main metric and kill criterion, core journeys), name `explore` at the recorded depth as the next step and wait.

Report the file the helper names (`Wrote` or `Unchanged`), show the block, and relay any warning. When writing by hand and both `AGENTS.md` and `CLAUDE.md` exist without an `@AGENTS.md` import in `CLAUDE.md`, say the block may be invisible to Claude Code and suggest adding that line.

## Boundaries

- Do not edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar instruction files outside the Flow block, and write the block only when the user asks or `start` finishes a confirmed bootstrap (decision 0020).
- Do not require installation, initialization, or a prior skill invocation.
- Do not treat alignment edits as permission to implement unrelated code. For authorized implementation and tests, invoke the `build` skill when installed.
- Do not create `docs/specs/` or `docs/decisions/` records here; use `to-spec` or explicit decision work when durable bounded artifacts are justified.
- Name another skill (`to-spec`, `domain-modeling`, `review`, …) only when the user asks or setup finds no goals (see Flow block), then wait.

## Completion

State which root files changed and whose product they now reflect. Note unresolved assumptions and whether the user may want a spec or decision record via another skill.
