# 0040 — Ship verifies liveness, not the journey

Status: **Accepted** (2026-10-28). Amends [0032](0032-local-build-lands-ship-verifies.md) (`ship` runs the acceptance scenario on the deployment, before and after the merge). Amended by [0044](0044-fast-delivery.md) (without a deployment, the remote default branch matching the shipped commit is the proof).

## Context

Decision 0032 had `ship` run the spec's acceptance scenario in a browser twice in GitHub mode: on the preview before the merge, as a gate, and on production after it, with screenshots, a local dev server when no deployment appears, and scratch worktrees to clean up. In use this makes every "ship it" slow and heavy for what it adds. The review already gives each scenario step a requirement verdict, and CI runs the project's tests. What ship alone can tell the user is whether the shipped commit is green and actually deployed.

## Decision

1. **Verify is checks plus liveness.** After the merge or push, `ship` confirms the shipped commit's checks are green on GitHub, its deployment reached `success`, and the trusted environment URL answers one unauthenticated `GET` with a 2xx.
2. **One run, after shipping.** No preview run before the merge, no browser, no scenario, no screenshots, no local dev server, no scratch worktrees.
3. **Still a report.** A failure is **shipped, verification failed**; no deployment is **deployment unverified**; nothing is rolled back unless asked.

## Alternatives

- **Keep the scenario run after the merge only.** Rejected: still a browser journey on every ship, which is the cost being removed.
- **Keep a preview liveness gate.** Rejected: green checks already gate the merge; a second deployment wait before every merge adds time for little signal.

## Consequences

- Specs still need an acceptance scenario; `review` gives its steps verdicts, and steps it cannot exercise stay `unresolved`. Nothing runs the journey on the deployment unless the user asks.
- Write steps no longer need production-safe marking.
- Verify no longer creates worktrees or branches, so ship's scratch-branch carve-out is gone.
