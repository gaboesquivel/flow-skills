# 054 — Native hand-off in handoff

Status: accepted (2026-10-31)

## Problem Statement

When a user says "hand off" or "start fresh", [`handoff`](../../skills/handoff/SKILL.md) always writes a document to the temporary directory, and the user then pastes or points a new session at it. Claude Code Desktop can move the current task into a session of its own, carrying the conversation and the remaining plan, and shows it as a session the user can open ([compatibility note](../agent-compatibility.md#native-sessions), [spec 052](052-native-session-integration.md)). On that host the document costs a write, a manual step, and a lossy summary the native move does not need. [Decision 0054](../decisions/0054-native-capability-first-sessions.md) already prefers native capabilities; `handoff` predates it.

## Solution

`handoff` uses the host's native hand-off when the next agent runs on the same host and the host can move the task into its own session. The written document stays for every other case: the user asks for a document, the next agent runs on another host or tool, or the host has no native hand-off. No new skill, phrase, or file.

## User Stories

1. As a user in Claude Code Desktop who says "hand off, I want to work on something else here", the task moves into its own session with a short remaining plan, and I get its link; no file is written.
2. As a user who says "write a handoff for Codex", I get the document as today.
3. As a user in a worktree with uncommitted edits, the agent commits them on the work branch first, so the new session, which starts from the branch tip, has them.
4. On a host without native hand-off, the document is written and nothing claims a session was created.

## Implementation Decisions

- **`skills/handoff/SKILL.md`**: add a short "Native hand-off" section before the document rules. Use the host's native hand-off when the next agent runs on this host, the host exposes it, and the user did not ask for a document. Pass the remaining plan (steps, files, what done looks like), not a copy of the conversation. In a worktree, commit work in progress on the work branch first; never commit to the default branch. Report the new session's native reference. A native hand-off carries the task's existing authorization and adds none.
- Keep the document path otherwise unchanged; the completion rule covers both.
- **`docs/agent-compatibility.md`**: the built-in overlap row for `handoff` says a standalone document is for another host or a host without native hand-off.
- Portable body stays capability-based: no Claude Code tool names in the skill.
- No decision record: applies 0054 as written.

**Exposure:** Markdown guidance in the existing skill distribution; no deployed service, API, write path, or authentication change.

## Testing Decisions

Structural checks only (`pnpm validate`, `pnpm test`) at PR time. No eval scenario covers `handoff` today; this spec adds none, and no live run is part of it.

**Acceptance scenario:** a user in Claude Code Desktop, in a worktree on `spec/<n>-<slug>` with one uncommitted file and two remaining tasks.

1. The user says "hand off; I need this session for something else". The agent commits the file on the work branch. Verify: `git status` is clean, the commit is on the work branch, not the default branch.
2. The agent moves the task into its own session with the two remaining tasks and what done looks like. Verify: a new session appears with that plan; no file is written to the temporary directory.
3. The agent reports the new session's link and stops work on that task here. Verify: the reply carries the link; no further edits to the task's files in this session.
4. Variant: the user says "write a handoff for Cursor". The agent writes the document to the temporary directory and reports its path. Verify: the file exists; no session was created.

## Out of Scope

Changing `handoff`'s trigger phrases; automatic hand-off without the user's request; hosts other than recording that the document is their path; eval or live runs.
