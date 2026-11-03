# 0064 — Cursor plugin

Status: **Proposed** (2026-11-03). Spec: [063](../specs/063-cursor-plugin.md). Amends [0062](0062-claude-code-first.md) items 1 and 4, and the enforcement row in `PRODUCT.md`, when the spec is accepted.

## Context

[0062](0062-claude-code-first.md) ships Flow as a Claude Code plugin and leaves other hosts with the skills and without the guard or the work-in-flight report. Cursor now loads those skills and the reviewer, and its plugin format can run the same hooks under different event names and a different JSON protocol. The open Agent Plugin manifest cannot carry hooks or agents.

## Decision

1. **Ship a Cursor plugin beside the Claude Code plugin.** `.cursor-plugin/plugin.json` discovers the existing `skills/`, `agents/`, and a Cursor hooks file. One `skills/` tree. `npx skills add` stays skills only.
2. **Same rules, host protocol at the edge.** `guard.mjs` and `wip.mjs` accept Claude's hook JSON and Cursor's. The deny list does not change. Cursor cloud agents get the shell guard. They do not get `sessionStart`, because that host does not run it.
3. **Claude Code stays first.** Skills still delegate to Claude's built-ins. On Cursor, `flow-reviewer` uses Bugbot and security-review only as the fallback when `/code-review` is absent. Other hosts stay skills only.

## Rationale

The must-hold rules are already a hook. Cursor can run that hook. A second copy of the skills, or a second copy of the deny list, would split the catalog 0062 just collapsed.

## Alternatives

- **Skills only on Cursor.** Rejected: the guard would stay prose, which 0062 moved into a hook because prose does not hold.
- **An Agent Plugin manifest and no hooks.** Rejected: that format has no hooks and no agents, so the reviewer and the guard would not install.
- **A forked guard script for Cursor.** Rejected: two homes for the deny list.

## Consequences

- Accepting spec 063 updates `PRODUCT.md`: Cursor with this plugin gets the guard and, in the IDE, the work-in-flight report. Back-pointers land on 0062 at acceptance, not before.
- `pnpm validate` checks the Cursor manifest the way it checks the Claude one.
- Marketplace listing is a later, separate submission.
