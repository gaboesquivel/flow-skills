# 0030 — Asked delivery mode and local mode without a remote

Status: **Proposed** (2026-10-28). Amends [0020](0020-flow-mode.md) (delivery inferred and recorded), [0028](0028-build-and-ship.md) (local `ship` pushes `main`), and [0029](0029-spec-issues.md) (the draft pull request's closing lines). Spec: [019](../specs/019-delivery-choice.md).

## Context

Flow has two delivery modes. Process depth is asked when a Flow block is written, but the delivery mode is never asked: `build` infers it at build time and records the pick without confirmation, defaulting to pull-request mode when it cannot see branch protection. Local mode merges a spec branch into `main` and pushes it, so it needs a remote, and a new project from `start` has none. Users expect to choose both at the start and to work fully locally when they say so.

## Decision

1. **Ask, do not infer.** Depth and delivery are asked together, once, wherever Flow first needs them, and recorded on the Flow block when there is one. Inference only suggests an answer. A default branch that requires pull requests forces pull-request mode without asking. With no remote, pull-request mode is never picked.
2. **Local mode keeps the spec branch.** Work runs on a spec branch with task worktrees and lands on the default branch through one `--no-ff` merge by `ship`.
3. **Local mode needs no remote.** `ship` fast-forwards from a remote only when one exists and pushes the default branch only when the request asks.
4. **Worktrees are removed on integration,** and `ship` confirms none remain for the spec.

## Alternatives

- **Commit tasks directly to local `main`.** Rejected: there is no single unit to review or drop, a failed task leaves `main` half-built, and the two modes would diverge in how `build` and `ship` work.
- **Keep inference, add an override.** Rejected: users are surprised by a mode they never chose, and a project with no remote dead-ends in pull-request mode.
- **Local mode always pushes when a remote exists.** Rejected: "local" should mean nothing leaves the machine unless asked.

## Consequences

- One more question in the first round of a new project or feature; none after the block records the answers.
- Local mode works in a repository with no remote, and `ship` no longer pushes `main` without being asked.
- `build` and `ship` own worktree cleanup; a failed task's worktree is kept and reported.
