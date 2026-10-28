# 014: Wave checkpoints

Status: implemented (2026-10-28). Decision: [0025](../decisions/0025-wave-checkpoints.md). Builds on [spec 009](009-flow-mode.md).

## Problem Statement

A developer who says "ship it" on a spec's task set sees nothing reviewable until every task has landed and the pull request opens. Problems in the experience surface at the end, when they are most expensive to redirect. The run also reviews every task on all five axes, has each worker rediscover the same code, and lets parallel worktrees conflict on files every session appends to, such as a prompt log.

## Solution

`ship` runs a task set in **waves** and stops at a **checkpoint** after each one.

1. After the first task integrates, `ship` opens a draft pull request (pull-request mode).
2. A wave is the ready set when it starts. When its tasks have all integrated, failed, or been blocked, `ship` pushes the spec branch, waits for the preview of that commit from the project's deploy target, and posts a checkpoint: what integrated or failed, checks, the preview URL, and screenshots of changed screens.
3. The user looks at the preview and replies. By default the next wave starts on the user's go; the run confirmation can say "don't wait".
4. After the last wave, a final review runs, the draft becomes ready for review, and the run finishes by delivery mode.

The project's Flow block records the deploy target on a `Deploy:` line, so a Vercel-first project says so once and the skills stay generic.

## User Stories

1. As a developer, I open the draft pull request after the first wave and see a working preview of what changed.
2. As a developer, I read a checkpoint with the preview link and screenshots and say "go" or redirect the next wave.
3. As a developer in a hurry, I say "ship it, don't wait" and get checkpoints without pauses.
4. As a developer in local mode, I get the same checkpoint in the conversation, with a preview when the deploy target can build one without a pull request.
5. As a developer whose project logs every prompt, I get one clean log after a parallel run, with no merge conflicts.
6. As a developer on any stack, I get checkpoints without a preview when `Deploy:` is `none`.

## Implementation Decisions

**Flow block.** The block gains `Deploy: <target>` after `Delivery:`. Values are a lowercase platform name (`vercel`, `netlify`, `fly`, …), `none`, or `unset`. `lib/flow-block.mjs` builds, reads, and preserves it the way it does `Delivery:`; the CLI accepts `--deploy <target>`. Re-running keeps a recorded value unless a new one is given.

**Deploy inference.** When `Deploy:` is unset, `ship` infers from repository configuration (for example `vercel.json` or a `.vercel` directory means `vercel`), states its pick with the delivery mode, and records it once confirmed. Without a recognizable configuration it proposes `none`.

**Waves.** Workers still run at most three at a time within a wave, with the same isolation and serialization rules. A task blocked by a failed task waits for the user. The next wave is the ready set after the checkpoint.

**Checkpoint.** Contents: wave number, tasks integrated, failed, or blocked with one-line reasons, checks run, the commit SHA, the preview URL for that SHA, and screenshots. `ship` gets the preview through the platform's own skill, CLI, or integration, never a previous deployment. A pending or failed preview is reported as such. Screenshots come from a browser tool the host provides; without one, the checkpoint says so. Pull-request mode posts a comment; local mode reports in the conversation.

**Confirmation.** The run's one yes now also states the deploy target and whether to wait at checkpoints. Pushes of the spec branch at checkpoints are covered by that yes.

**Review.** Per task, a separate worker checks correctness and security against the task. Per wave and on the final pull request, `review` runs on all five axes over the combined change. Blocking findings go back as fix rounds (at most 2 per task).

**Shared notes.** Before the first wave, when the set has more than one task, a worker writes notes on the spec, tasks, and relevant code to `<git common dir>/flow/notes/<spec>.md` (found with `git rev-parse --path-format=absolute --git-common-dir`). Task workers get a pointer, not a copy. Notes are never committed.

**Shared files.** Files the project's instructions tell every session to append to are written only by the orchestrator, on the spec branch. Workers leave them untouched.

**Tests first.** When the spec or task names test seams, `implement` writes a failing test at the seam before the change, then makes it pass. Without named seams, current behavior is unchanged.

## Testing Decisions

- `tests/flow-block.test.mjs`: the `Deploy:` line is built, read, kept on re-run, overridden on request, and defaults to `unset`; the CLI accepts `--deploy`.
- Smoke contracts for `ship`, `review`, `implement`, and `flow` assert the new rules (waves, draft pull request, checkpoint contents, deploy inference, per-wave review, notes path, orchestrator-only shared files, tests first).
- `pnpm validate` and `pnpm test` pass.

## Out of Scope

- Platform-specific deploy steps inside Flow skills; they stay with the platform's skill or CLI.
- A pull request per wave or per task.
- A dedicated merger worker.
- Visual diffing or automated screenshot comparison.
- Board integration; a board can read waves later.

## Tasks

Recorded as GitHub issues (pull-request mode):

- [x] [#50](https://github.com/gaboesquivel/flow-skills/issues/50) `flow`: `Deploy:` line in the Flow block.
- [x] [#51](https://github.com/gaboesquivel/flow-skills/issues/51) `ship`: waves, draft pull request, and preview checkpoints.
- [x] [#52](https://github.com/gaboesquivel/flow-skills/issues/52) `implement`: tests first at named seams.
- [x] [#53](https://github.com/gaboesquivel/flow-skills/issues/53) `ship`: per-wave review, shared notes, orchestrator-only shared files (blocked by #51).
- [x] [#54](https://github.com/gaboesquivel/flow-skills/issues/54) Docs alignment (blocked by #50–#53).
