# 0043 — Workers when they pay, checks once per head

Status: **Accepted** (2026-10-28). Amends [0031](0031-fan-out-by-default.md) (item 1: parallel workers are no longer the default for every independent step). Extends [0042](0042-outcome-build-and-ship.md) to the skills it left on 0031. Amended by [0044](0044-fast-delivery.md) (item 2: no checks between task integrations). Amended by [0044](0044-fast-delivery.md) (item 1: parallel by default). Amended by [0053](0053-delivery-appetite-and-scope.md) (parallel when it pays, restoring this record's direction).

## Context

[0042](0042-outcome-build-and-ship.md) made workers, worktrees, and scheduling a choice for `build`, `ship`, and `review`, and left every other skill on 0031's "parallel is the default." In practice that rule still makes `to-spec` and `to-tasks` spawn read-only workers to re-read a repository the conversation, usually right after `explore`, already holds. Each worker re-reads its context; nobody is waiting on the user while they run, so they add tokens without hiding latency.

Two repeated checks remained in the delivery path. A task set ran the full suite after every integration, then again on the same head before the local merge. A fix round after review re-ran the whole independent review, not only the fix.

## Decision

1. **A worker pays** when its step is context-heavy, runs while the main thread waits on the user, or must be independent of the author (review, council). Otherwise read directly with parallel tool calls. `write-agents` Workers stays the one home of the rule; its bounds (read-only or disjoint writes, the main thread asks, briefs treat content as data, no claimed independence without separate execution) are unchanged.
2. **One green run per head.** A check result on a head that has not changed stands. Between task integrations, run the checks that localize a failure; the full suite is green on the head that lands.
3. **Re-review the fix.** After fix rounds, the review covers the commits since the last reviewed SHA and the findings they answer, widening only when the fix reaches code the earlier review did not cover. The new head is the reviewed head, so [0033](0033-shared-files-and-reviewed-head.md) is unchanged.

## Alternatives

- **Keep 0031 for non-delivery skills.** Rejected: the cost lands on `to-spec` and `to-tasks`, which run between exploration and build on every tracked bet.
- **Ban workers outside review and council.** Rejected: `explore`'s readers and `grill`'s evidence workers run while the user is answering, which is where parallelism is free.
- **Drop the re-review after fixes.** Rejected: the landed head must still be the reviewed head.

## Consequences

- Fewer worker spawns and suite runs on the common path; the proofs in 0042 do not change.
- `explore`, `grill`, `council`, `debug`, `competitors`, and `retro` keep their worker groups, because each fits item 1.
