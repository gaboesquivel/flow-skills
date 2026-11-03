# 063 — Cursor plugin parity

Status: draft (2026-11-03). Appetite: one session.

Decision: [0064](../decisions/0064-cursor-plugin.md) (Proposed). Amends [0062](../decisions/0062-claude-code-first.md) when accepted.

## Problem

A Cursor session already runs Flow's skills. In this repository it loads them from `.claude/skills`, from the Claude Code plugin cache, and from `~/.agents/skills`, and it loads `agents/flow-reviewer.md` as a subagent. It does not run the plugin half. [`hooks/hooks.json`](../../hooks/hooks.json) listens for Claude Code's `PreToolUse` and `SessionStart`. [`hooks/guard.mjs`](../../hooks/guard.mjs) reads `tool_input.command` and writes `permissionDecision`. [`hooks/wip.mjs`](../../hooks/wip.mjs) prints plain text. [Decision 0062](../decisions/0062-claude-code-first.md) leaves every host except Claude Code with the method and without those hooks.

Cursor's own plugin format (inspected 2026-11-03) can bundle skills, agents, and hooks. Its shell hook is `beforeShellExecution` with `{ command, cwd }` in and `{ permission, agent_message }` out. Its session hook is `sessionStart` with `{ additional_context }` out. The open Agent Plugin manifest carries skills and MCP servers only, so it cannot hold the guard, the report, or the reviewer. Cloud agents run `beforeShellExecution` and do not run `sessionStart`.

## Solution

Flow installs in Cursor as a Cursor plugin that reuses the same skills, the same guard rules, the same work-in-flight report, and the same reviewer. "Build it" and "ship it" in the IDE cannot force-push, push the default branch, skip hooks, admin-merge, or merge on red checks. A new IDE session sees work in flight. Review still runs in a fresh context. When Claude's `/code-review` is missing, the reviewer uses Cursor's Bugbot and, on a trust boundary, its security-review subagent. When those are missing too, it reads the diff and labels the review **no /code-review**, as it does today.

## Decisions

- **Cursor plugin, not a second catalog.** `.cursor-plugin/plugin.json` at the repo root, `name` `flow`, version equal to `package.json`. It discovers the existing `skills/`, `agents/`, and a Cursor hooks file. No root Agent Plugin manifest: that format cannot carry hooks or agents.
- **One script, two protocols.** `guard.mjs` accepts Cursor's `{ command, cwd }` and Claude's `tool_input.command`, and emits the matching deny. `wip.mjs` emits `{ additional_context }` for Cursor and the same text for Claude. The Cursor hooks file is separate from `hooks/hooks.json`, because the event names differ. Commands use `${CURSOR_PLUGIN_ROOT}`. The deny list does not change.
- **Reviewer fallback.** `flow-reviewer` calls Bugbot, and security-review on a trust boundary, only when `/code-review` is unavailable and that subagent exists. Otherwise the current label stands. The agent's checks (scenario verdicts, scope, glossary, `DESIGN.md`) stay.
- **One install.** Compatibility docs tell a Cursor user to install this plugin or `npx skills add`, not both and not also the Claude plugin cache. This repo's `.claude/skills` link stays, so working here still loads the tree.
- **Direction change, applied only on acceptance.** [0062](../decisions/0062-claude-code-first.md) items 1 and 4, and the enforcement row in `PRODUCT.md`, then say Cursor with this plugin gets the same hooks. Claude Code stays first. `npx skills add` stays skills only. Other hosts stay as they are. Record [0064](../decisions/0064-cursor-plugin.md). Nothing in those files changes in this draft.

**Exposure.** The plugin runs in the user's Cursor IDE. The shell hook also runs in Cursor cloud agents. There is no network service and no unauthenticated caller. The guard denies matching shell commands for the installed user. A merge it cannot check fails closed, as it does now.

**Appetite.** The first slice is the IDE plugin: manifest, both hook protocols, the reviewer fallback, compatibility docs, and hook tests. Marketplace submission gives way first. No spend limit beyond maintainer time.

## Acceptance

Scenario: the maintainer, in Cursor, with this plugin installed from the repo and the Claude hook not also installed.

1. Cursor lists the Flow skills and the `flow-reviewer` agent. `pnpm validate` accepts `.cursor-plugin/plugin.json` with `name` `flow` and the same version as `package.json`, and rejects a mismatch.
2. `git push --force`, a push to the default branch, `git commit --no-verify`, `gh pr merge --admin`, and `gh pr merge` while required checks fail are each denied with a reason. `git status` is allowed. A Claude-shaped stdin fixture still receives `permissionDecision: deny` for the same commands.
3. A new IDE session in a repository with a local branch that has commits not on the default branch receives that branch as work in flight. When nothing is in flight, the hook adds no context.
4. "Review it" where `/code-review` is absent runs Bugbot when that subagent exists, and labels the review **no /code-review** when it does not. Scenario verdicts are still in the report.
5. A fresh-context review of this branch gives each step a verdict and finds no Important issue.

Invariants: skills stay the one `skills/` tree, and `npx skills add` still installs skills without hooks. Checks: `tests/guard.test.mjs` for both stdin shapes and both deny outputs; `pnpm validate`; the existing release listing check for the skills-only install.

## Out of Scope

- Submitting the plugin to the Cursor Marketplace.
- `sessionStart` on Cursor cloud agents. The host does not run it. The Flow block in `AGENTS.md` stays the stand-in.
- Claude-only host behavior: Merge when ready, `claude -w`, `worktree.baseRef`, the subagent cap, and the `build-it` routine.
- Removing skills a user already copied into `~/.agents` or the Claude plugin cache.
- Changing which commands the guard denies.

## Tasks

Written by `to-tasks`.
