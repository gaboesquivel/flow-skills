# 0031 — Fan out by default

Status: **Accepted** (2026-10-28). Amends [0025](0025-wave-checkpoints.md) and [0029](0029-spec-issues.md) (one review worker per spec becomes one worker per axis plus a verifier). Spec: [019](../specs/019-delivery-choice.md). Amended by [0042](0042-outcome-build-and-ship.md) (parallel workers and one review worker per axis do not bind `build`, `ship`, or the review they run). Amended by [0043](0043-workers-when-they-pay.md) (item 1: workers only where they pay). Amended by [0044](0044-fast-delivery.md) (independent work runs in parallel by default again; the agent chooses how).

## Context

Flow's skills are mostly written as sequences. `write-agents` and `review` use separate workers only when a task "justifies" them, `ship` runs its review with one worker, and `explore` finishes all reading before its first question. Only `build` runs work in parallel. Hosts now offer cheap parallel workers, and the user wants maximum parallel execution for speed.

## Decision

1. **Parallel is the default.** A skill launches its independent steps as parallel workers in one batch, up to the host's limit. A step stays sequential only when it needs another step's output, asks the user, or writes a shared file.
2. **One home for the rule:** `write-agents` Workers. Skills name their parallel groups and link to the rule rather than restating it.
3. **Workers are bounded.** Each is read-only or writes files no other worker touches. The main thread verifies and synthesizes, and asks the user every question.
4. **The spec review splits by axis.** It runs one worker per review axis the change can affect, then one verifier. Together they are the one independent review per spec.
5. **Tasks declare an area** (package or directory), so `build` can schedule non-overlapping tasks together.
6. **Fallback.** Without workers, the same steps run in order, and the skill says so.

## Alternatives

- **Keep workers opt-in per skill.** Rejected: skills stay sequential by default, and speed depends on the agent noticing what can run in parallel.
- **A subagent per step everywhere.** Rejected: single-pass skills (`handoff`, `tldr`, `interview`) lose context and gain nothing.
- **Infer overlap from file paths in tasks.** Rejected: paths go stale; a coarse area is stable enough to schedule on.

## Consequences

- Faster discovery and review. Token use rises with the number of workers.
- Skills gain a short parallel-groups line, and their copies of the worker rule are removed.
- Reviews on hosts without workers are labelled single-agent, as before.
