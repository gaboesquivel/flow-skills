# 0042 — Outcome-first build and ship

Status: **Accepted** (2026-10-28). Amends [0031](0031-fan-out-by-default.md) (parallel workers and one review worker per axis do not bind `build`, `ship`, or the review they run), [0029](0029-spec-issues.md) (frontier scheduling, and workers testing their own edits while the orchestrator runs the suite), [0028](0028-build-and-ship.md) (`ship` lands by running `build` and `review` as a named pipeline), [0025](0025-wave-checkpoints.md) (item 8, a failing test before the change), and [0039](0039-build-never-requires-a-spec.md) (the independent review need not be one worker per axis). Spec: [028](../specs/028-outcome-build-and-ship.md). Amended by [0044](0044-fast-delivery.md) (the independent review runs only when the size guard escalates or the user asks; checks once at pull request time). Amended by [0056](0056-contract-first-tests.md) (API routes and MCP tools are test-first; no UI tests by default).

## Context

`build` and `ship` are short files whose bodies mostly tell the agent how to run: start every unblocked task at once, one worktree each, prepare that worktree, post a checkpoint, write a failing test first, and review with one worker per axis plus a verifier. The outcomes those steps exist to protect are a landed change, a green suite, an independent review, and an honest verification report. Hosts now ship models that can choose a plan. Prescribing the plan spends the instruction on execution, and the test suite checks that the sentences are still present. It does not run an agent.

The catalog stays host-agnostic. A live comparison on Claude Opus 5.5 is how this bet is measured. It is not a requirement that only that model may run the skills.

## Decision

1. **Outcomes, reason, and proof.** `build` and `ship` state what finished work looks like, why the gate exists, and the evidence that proves it. They do not prescribe workers, scheduling, worktree setup, checkpoint cadence, or test order.
2. **Execution is a choice.** Parallel workers, frontier scheduling, one worktree per task, and one review worker per axis are allowed. None is required. Other skills keep [0031](0031-fan-out-by-default.md) until a later bet changes them.
3. **The proofs stay mandatory.** A green suite or an explicit report that no suite exists; no local merge when no suite exists; an independent review, with requirement verdicts, before spec work or escalated unspecced work lands; a self-check for small unspecced work; the reviewed head, with the shared-file exception in [0033](0033-shared-files-and-reviewed-head.md); a red spec head leaves the branch untouched; the acceptance gate, green checks, branch protection, and no self-approval; local `main` receives the reviewed merge and is pushed only on "ship it"; verification stays [0040](0040-ship-verifies-liveness.md).
4. **Landing still includes the work and the review.** `ship` brings the change up to those proofs when they are missing. It does not have to invoke `build` and `review` as a named pipeline when the proofs are already met. The implementing agent is not the independent review.
5. **Tests prove the behavior, in whatever order.** A seam named in a spec or task is covered by a check that fails if the behavior is missing. Writing that check before the change is allowed and not required.

## Alternatives

- **Shorten the prose and keep the mandates.** Rejected: the skills would still tell the agent how to execute, which is the instruction this bet removes.
- **Drop the gates with the procedure.** Rejected: a mistake on the default branch, a force-push, or a self-approval is costly to reverse, which is why [0029](0029-spec-issues.md) keeps those rules pinned.
- **Apply the same cut to every skill now.** Rejected: this is one bet. `explore`, install boundaries, and any further `start` trim wait.

## Consequences

- `PRODUCT.md`, `GLOSSARY.md` (frontier, checkpoint, area, baseline failure), and the catalog sentences for `build`, `review`, and `ship` change with this spec. Back-pointers on the amended records land when the spec is accepted.
- A model may implement a task set in one pass and still pass, as long as the proofs hold.
- Smoke pins that quote the old procedure are rewritten to the proofs. Pins for the safety rules stay.
- One live comparison of no skills, current Flow, and these skills is the measurement. It is not a CI gate, and one run is not an efficiency claim.
