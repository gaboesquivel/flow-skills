# 0020 — Flow mode: conversational delivery and in-session task orchestration

Status: **Proposed** (2026-10-28). Builds on [0019](0019-voice-first-invocation.md), which made delivery skills speakable, and [0021](0021-autonomous-explore-and-ship.md), which set GitHub issues, grouped pull requests, and run confirmation. Would amend [0009](0009-adopter-product-context.md) and [0010](0010-optional-start-skill.md) (no adopter instruction-file edits), and the PRODUCT.md line that workflow orchestration is not shipped as skills. Related: [0015](0015-tasks-and-domain-modeling.md), [0017](0017-claude-code-skill-coexistence.md). Spec: [009](../specs/009-flow-mode.md).

## Context

[0019](0019-voice-first-invocation.md) made every skill except `start` reachable by plain or dictated language. Two gaps remain: hosts only see Flow's phrases when the skill descriptions load, with nothing in the project telling the agent Flow is in use, and nothing connects `to-tasks` to delivery: after a breakdown the user drives each task through `implement`, `review`, and `ship` by hand, one at a time.

[Superpowers](https://github.com/obra/superpowers) shows the experience the maintainer wants: a session-start bootstrap tells the agent which skills apply, and a written plan runs through subagents with review between tasks. Its bootstrap depends on a Claude Code plugin hook. Flow needs the same experience through portable means.

[Flow Factory](https://github.com/gaboesquivel/flow-factory) is a hosted, issue-driven factory on Eve. It does not cover the in-session case: one conversation that plans, then fans out and lands the work.

## Decision

Adopt **Flow mode**: an opt-in project setup plus a delivery path that runs from conversation.

1. **Project instruction block.** On an explicit request ("set up Flow here", or `start` bootstrapping a template), write one delimited Flow block into the project's `AGENTS.md` (or `CLAUDE.md` when that is the only instruction file). The block states the delivery phrases and which skill each loads, and points at the installed `flow` skill. Writing it is idempotent; deleting the block opts out. No other instruction-file edits.
2. **`to-tasks` hands off.** After a breakdown it names the ready set and waits for "ship it".
3. **`ship` task-set mode.** Given a spec's task issues, the main session orchestrates on one branch and one pull request ([0021](0021-autonomous-explore-and-ship.md)). It computes the ready set from blocking edges and runs one worker per ready task in an isolated worktree. Each task's change gets an independent review and bounded fix rounds, then integrates into the spec branch, which unblocks dependent tasks. When every task has integrated, the pull request closes all task issues, merges when checks pass and the user has authorized merging, and local `main` syncs. A failed task stops its dependents and escalates to the user. Without a task set, `ship` keeps its single-task behavior.

Dogfooding (`.claude/skills` linked to `skills/`) landed separately in spec 010's pull request.

Flow Factory remains the hosted, issue-driven factory. Flow mode is the in-session counterpart and does not depend on it.

## Rationale

The block is the portable equivalent of a session-start hook: every host that reads `AGENTS.md` sees it, and it is plain text the user can read and remove. Unlike the user-level phrase table in [0019](0019-voice-first-invocation.md), which Flow never writes, the block lives in the project and is written only on explicit request. Orchestrating from `ship` reuses the existing authorization model ("ship" already authorizes commit and push) instead of adding a router skill.

## Alternatives

- **Claude Code plugin with a session-start hook** (the Superpowers route). Rejected as the primary path: host-specific. May be added later as an optional adapter.
- **A new `factory` skill.** Rejected: duplicates `ship`'s authorization and grows the catalog.
- **Build it in Flow Factory.** Rejected: that repository is a hosted Eve service, not an in-session experience.

## Open questions

Resolved by [0021](0021-autonomous-explore-and-ship.md): one pull request per spec, merging only with the user's authorization, and one push confirmation per run that states the pull request and merge plan. A task that drifts from its stated scope still stops for a new yes.

- **Review rubric.** Whether `review` adopts the five axes in Addy Osmani's `code-review-and-quality` (correctness, readability and simplicity, architecture, security, performance), now recorded in [research](../research/2026-10-28-explore-discovery-entry-points.md).
- **Integration conflicts.** How the orchestrator handles two task changes that conflict on the spec branch: serialize by affected area up front, or integrate in ready order and send conflicts back to the later task's worker.

## Consequences

- PRODUCT.md, `docs/skills.md`, `docs/agent-compatibility.md`, and the `flow`, `start`, `to-tasks`, `implement`, `review`, and `ship` boundaries change together.
- Hosts without independent workers run the task set sequentially on the spec branch and say so.
