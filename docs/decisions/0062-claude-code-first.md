# 0062 — Claude Code first

Status: **Accepted** (2026-11-03). Spec: [059](../specs/059-claude-code-first.md). Amends [PRODUCT.md](../../PRODUCT.md) principle 6 and Definition, [0060](0060-slice-by-area.md) item 2, [0017](0017-claude-code-skill-coexistence.md), [0058](0058-review-passes-and-risk-tiers.md) (review mechanics), and [0004](0004-portable-skill-catalog.md) (distribution). Amended 2026-11-03: `board.mjs`, kept as a maintainer script, is removed. It misread spec status lines, and spec files, pull requests, and the SessionStart work-in-flight report already show where work stands. Amended by [0066](0066-specs-sized-by-delivery.md) (item 3: `build` slices only work with several outcomes) and [0064](0064-cursor-plugin.md) (the Cursor plugin runs the same guard and work-in-flight report). Amended by [0070](0070-research-and-clearer-names.md) (catalog: `product` renamed `align`, `flow` renamed `sync-docs`, `research` added).

## Context

Flow is written to be portable to any agent host, so its skills restate what the host should do. About 7,700 of the catalog's 21,500 SKILL.md words describe work Claude Code now does natively or that a deterministic mechanism enforces better:

- worktrees and parallel sessions (`claude -w`, subagent `isolation: worktree`, `.worktreeinclude`, side sessions, `/fork`, agent view)
- fan-out to subagents, which Opus 5.x already does on its own
- the pull request lifecycle (PR monitoring with auto-fix, merge when ready, `/autofix-pr`)
- review passes (`/code-review` low…ultra, `/security-review`, `/simplify`)
- looping until done (`/goal`)
- handoffs, recaps and prompt logs (transcripts and OpenTelemetry)

Every "never" rule (force-push, pushing to the default branch, `--no-verify`, `--admin`, touching another session's worktree) is prose, and Flow ships no hooks. Worker policy has gone back and forth four times (0031, 0043, 0053, 0060).

## Decision

1. **Claude Code first, portable where it's free.** Flow targets Claude Code and its desktop app. It uses their built-ins instead of restating them. Skills stay plain Markdown, so other hosts still get the judgment but not the enforcement.
2. **Delegate to built-ins instead of coexisting with them.** A Flow skill keeps only what a built-in lacks: spec verdicts, scope, the glossary and DESIGN.md checks on top of `/code-review`, and the delivery gotchas. It points to the built-in for the rest.
3. **The host sizes the fan-out.** `build` still slices by disjoint area (0060 item 1). Whether a slice runs as a subagent, a `/batch` unit or inline is the host's call, with a concurrency cap. Item 2 of 0060 and its rule that an inline slice must name a reason are retired.
4. **Rules that must hold are hooks.** Flow ships as a Claude Code plugin: skills, a guard hook (PreToolUse Bash), a SessionStart work-in-flight report, a reviewer agent and helper scripts. `npx skills add` stays available for skills only.

## Alternatives

- **Keep a portable core and add an optional Claude Code layer.** Rejected: two homes for every delivery rule, and the core would still restate the host.
- **Keep the current shape and only trim words.** Rejected: rules that must hold would stay unenforced prose.
- **Depend on agent teams or dynamic workflows.** Rejected: both are experimental or need opt-in. Flow may suggest them but never requires them.

## Consequences

- The catalog shrinks to about 12 skills and about 9k words (an estimate, to be measured).
- Adopters on other hosts lose enforcement and some procedure, and keep the methodology.
- Desktop-only features (PR auto-fix, merge when ready, side sessions) need a CLI or cloud fallback wherever `ship` relies on them.
- Accepting this record updates PRODUCT.md principle 6 and Definition, and adds back-pointers to 0004, 0017, 0058 and 0060.
