# 0025 — Wave checkpoints and visual review

Status: **Accepted** (2026-10-28). Amends [0020](0020-flow-mode.md) (task-set orchestration, review per task, pull request at the end). Related: [0024](0024-gated-hand-offs.md) (plan confirmation and main gate), [0021](0021-autonomous-explore-and-ship.md), [0019](0019-voice-first-invocation.md) (deploy defers to the platform), [0023](0023-agent-first.md). Spec: [015](../specs/015-wave-checkpoints.md). Amended by [0028](0028-build-and-ship.md) (waves move to `build`; `Deploy:` retired). Amended by [0029](0029-spec-issues.md) (the frontier replaces waves; no per-wave reviews; CI waited on only for the final pull request).

## Context

`ship` on a task set runs every task to the end and opens the pull request last, so the user sees nothing reviewable until the run is over. For product work the most useful check is visual: a deployed preview of the changed screens. Matt Pocock's [`implement-spec`](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md) opens a draft pull request after the first merge, which lets a platform such as Vercel build a preview per push, but it has no deploy or visual step.

Running the same five-axis `review` on every task and again on the final pull request costs a lot for little extra signal. Workers also re-read the same code, and files that project instructions tell every session to append to (for example a prompt log) conflict when parallel worktrees merge.

## Decision

1. **Waves.** `ship` runs a task set in waves: a wave is the ready set when it starts, and it ends when each of its tasks has integrated, failed, or been blocked.
2. **Draft pull request early.** In pull-request mode, `ship` opens a draft pull request after the first task integrates and marks it ready at the end.
3. **Checkpoint per wave.** At the end of each wave, `ship` pushes the spec branch, gets the preview for that commit from the project's deploy target, and posts a checkpoint: tasks integrated or failed, checks, preview URL, and screenshots of changed screens when a browser tool is available. In pull-request mode it is a pull request comment; in local mode it is reported in the conversation. By default the next wave waits for the user's go; the run confirmation can say not to wait.
4. **Deploy target.** The project's Flow block gains a `Deploy:` line beside `Delivery:` (for example `vercel` or `none`). `ship` infers it from repository configuration when unset, confirms, and records it. Flow stays platform-neutral; the project states its platform once.
5. **Review per wave.** Each task gets a focused correctness and security check from a separate worker. The full five-axis `review` runs on each wave's combined change and on the final pull request.
6. **Shared notes.** Before the first wave, one worker reads the spec, tasks, and relevant code and writes notes under the Git common directory (`flow/notes/`), outside commits. Task workers start from those notes.
7. **Orchestrator-only shared files.** Workers do not write files that project instructions tell every session to append to; the orchestrator writes them on the spec branch.
8. **Tests first at named seams.** When a spec or task names test seams, `implement` writes the failing test at that seam before the change.

## Rationale

A wave is the natural review unit: its tasks were independent, and its combined change is what the preview shows. Opening the draft early costs nothing and turns platform previews into a progress view. Recording the deploy target in the project keeps the skills generic while letting a Vercel-first project say so once.

## Alternatives

- **A pull request per wave or per task.** Rejected: waves in one spec depend on each other, which means stacked pull requests and rebases. A spec splits only when its parts ship independently.
- **Keep the continuous frontier without checkpoints.** Rejected: faster, but leaves no point to review or redirect.
- **A dedicated merger worker** (as in `implement-spec`). Deferred: with at most three workers the orchestrator merges without becoming a bottleneck.
- **Strict test-driven development for every task.** Rejected: too heavy for documentation and configuration tasks; named seams target the behavior that matters.

## Consequences

- `ship`, `review`, `implement`, and the `flow` block definition change together; `docs/skills.md`, `docs/agent-compatibility.md`, and `GLOSSARY.md` describe waves and the deploy target.
- Runs are slower when they wait at checkpoints; the confirmation states whether they wait.
