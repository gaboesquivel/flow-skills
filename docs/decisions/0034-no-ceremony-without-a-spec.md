# 0034 — No ceremony without a spec

Status: **Proposed** (2026-10-28). Amends [0032](0032-local-build-lands-ship-verifies.md) (ad-hoc local work lands after the independent review) and [0029](0029-spec-issues.md) (one independent review per change). Spec: [021](../specs/021-demo-findings.md).

## Context

Spec 020 made local `build` land every change through the spec gate and the full per-axis review before merging into `main`, including work with no spec or task. A hotfix or a one-line change then costs as much process as a feature. Flow's principle is proportionate process: ceremony should follow consequence.

## Decision

Work that resolves to no spec or task is unspecced. "Build it" gives it the full local suite and one self-check against the request, with no spec gate and no review workers, and lands it as the delivery mode does: a merge into local `main`, or a ready pull request. A size guard, owned by `build`, stops unspecced work that adds product behavior, changes a data shape or public API, or needs a migration, and suggests `to-spec`. `ship` keeps Verify for unspecced work but runs no further review.

## Alternatives

- **Keep one review path for everything.** Rejected: small fixes pay for reviews built for features.
- **Skip the suite as well.** Rejected: the suite is cheap and is the only check left.
- **Let the user decide per run.** Rejected: one more question for the common case; the size guard decides instead.

## Consequences

- Small fixes land in one step, with evidence from the suite.
- The size guard becomes the boundary between "just do it" and "spec it", so its wording is safety-relevant and pinned in the smoke contracts.
