# 009: Flow mode

Status: draft (2026-10-28). Decision: [0020](../decisions/0020-flow-mode.md) (proposed). Builds on [0019](../decisions/0019-voice-first-invocation.md) and [0021](../decisions/0021-autonomous-explore-and-ship.md).

## Problem

Since [0019](../decisions/0019-voice-first-invocation.md), plain language and voice reach Flow's skills, but projects carry no signal that Flow is in use. After `to-tasks`, the user drives each task through `implement`, `review`, and `ship` by hand. The target experience is close to Superpowers: talk through the work, say "ship it", and let the session land every task.

## Experience

1. In a project, the user says "set up Flow here", or `start` bootstraps a template. The project's `AGENTS.md` gains one Flow block.
2. The user talks through the work. Saying "interview me", "spec it", or "break it down" loads the matching skill (0019).
3. `to-tasks` publishes the tasks as GitHub issues with blocking links, reports the ready set, then waits.
4. The user says "ship it" and confirms the run once: the spec branch, the task issues, and the merge plan. The main session becomes the orchestrator on that one branch:
   - Starts one worker per ready task in an isolated worktree, up to a concurrency limit.
   - Each worker implements and runs checks; a separate reviewer checks the task's change; the worker fixes until the gates pass or the round limit is reached.
   - A passing task integrates into the spec branch, which unblocks the tasks waiting on it.
   - A failed or stuck task stops its dependents. The orchestrator reports it with evidence and keeps the rest of the set moving.
5. When every task has integrated, the orchestrator opens one pull request with a `Closes #N` line per task issue, merges when checks pass and the user has authorized merging, and syncs local `main`.
6. The run ends with a summary: the pull request and merge SHA, tasks blocked and why, and checks run.

Slash commands keep working unchanged. `/ship` without a task set ships the current task as it does today.

## Behavior requirements

- **Block content.** Delimited start and end markers; plain-language phrase → skill map; link to the installed `flow` skill; under about 25 lines. Re-running updates the block in place. Content outside the markers is never touched.
- **Confirmation.** One yes covers the run: the spec branch, task issues, and merge plan are stated first ([0021](../decisions/0021-autonomous-explore-and-ship.md)). A task that drifts from its stated scope stops for a new yes.
- **Task-set input.** GitHub issues from `to-tasks` with blocking edges; a local draft only without GitHub access. A cycle or a missing blocker stops the run before any work starts.
- **Isolation.** One branch and one pull request per spec. Workers use isolated worktrees when the host supports them and never edit the same files at the same time; the orchestrator serializes tasks that touch overlapping areas.
- **Review.** A separate worker reviews each task's change with `review`, and the final pull request once. Blocking findings go back to the implementing worker. Reviews are labeled single-agent when no separate worker ran.
- **Gates.** CI green, no blocking review findings, branch protection respected. Never force-push, bypass protection, or skip failing checks.
- **Bounds.** Fix rounds per task and the concurrency limit are fixed and reported.
- **Fallback.** Without workers, run ready tasks sequentially in the same order and say so.
- **Sync.** After the pull request merges, fast-forward local `main` from the remote. Update the spec branch from `main` only when the pull request is behind or conflicts.

## Tasks

### 01: Dogfood link
**Status:** done in spec 010's pull request (#23): `.claude/skills` links to `skills/`, and `pnpm validate` guards it.
- [ ] `docs/agent-compatibility.md` notes the link.

### 02: Flow block in projects
**What to build:** "set up Flow here" writes or updates the Flow block; `start` writes it after a successful bootstrap.
**Blocked by:** None (can start immediately).
- [ ] Idempotent write with markers, covered by a test.
- [ ] `flow` and `start` boundaries updated; 0009/0010 references point to 0020.

### 03: to-tasks hands off to ship
**What to build:** after a breakdown, `to-tasks` reports the ready set and waits for "ship it".
**Blocked by:** None (speakable skills landed in 0019).
- [ ] Completion section names the ready set and the phrase.

### 04: ship task-set orchestration
**What to build:** "ship it" on a task set runs the orchestration in Experience step 4.
**Blocked by:** None (speakable skills landed in 0019).
- [ ] Ready-set computation, cycle check, concurrency limit, bounded fix rounds, sequential fallback.
- [ ] Gates, merge authority, and push confirmation as decided in 0021.
- [ ] Dogfood run on a three-task set with one blocking edge in this repository.

### 05: Review rubric
**What to build:** `review` applies the adopted Osmani-inspired axes as the independent PR review.
**Blocked by:** None; the axes are recorded in [research](../research/2026-10-28-explore-discovery-entry-points.md).
- [ ] Rubric axes in `review`, without a large checklist.

### 06: Align product context
**What to build:** PRODUCT.md, catalog, README, and compatibility docs describe Flow mode.
**Blocked by:** 02, 04.
- [ ] PRODUCT.md "not shipped" list and Flow Factory row updated; 0020 accepted.
- [ ] `pnpm validate` and `pnpm test` pass.

## Out of scope

- A Claude Code plugin or session-start hook (possible later adapter).
- Hosted or issue-triggered execution; that is Flow Factory.
- Production deploys beyond what `ship` already verifies per task.
