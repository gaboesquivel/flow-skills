# 0039 — Build never requires a spec

Status: **Accepted** (2026-10-28). Amends [0034](0034-no-ceremony-without-a-spec.md) (the size guard stops unspecced work), [0022](0022-start-runs-explore.md) (`explore` writes spec 001), and [0030](0030-asked-delivery-and-local-mode.md) (a default branch that requires pull requests forces GitHub mode). Spec: [025](../specs/025-build-without-a-spec.md). Amended by [0042](0042-outcome-build-and-ship.md) (the independent review need not be one worker per axis).

## Context

Decision 0034 let small unspecced work land with the suite and one self-check, and made a size guard stop everything else and send it to `to-spec`. In practice most explored features trip the guard because they add product behavior, so "explore this" followed by "build it" always ends in a spec. A spec becomes a toll on any change bigger than a fix, in both delivery modes, and the user cannot talk to the agent and land a feature without one. Separately, `explore` writes spec 001 for a new product without being asked, and a GitHub-mode repository with a protected default branch has no way to build without opening a pull request.

The size guard's categories (product behavior, data shapes and public APIs, migrations, authentication, secrets, dependencies, CI, execution paths) still mark changes that deserve more scrutiny. What they should not decide is whether a spec exists.

## Decision

1. **The guard escalates review; it never stops.** Unspecced work that trips the size guard gets the one independent review (per-axis `review` workers plus a verifier) against the request, instead of stopping for `to-spec`. Small unspecced work keeps the self-check. `build` may suggest "spec it" in one line and continues. When the size is uncertain, the change gets the independent review.
2. **A spec exists only when the user asks for one.** No delivery-chain skill writes a spec, a candidate stub, or tasks unless the user says "spec it" or "break it down" (or their variants). `explore` on a new product ends with the brief and names "spec it" as the next step.
3. **"Build it" after `explore` builds from the brief.** The confirmed brief is the request, and it lands with the code.
4. **"Build it local" can stop at a commit.** When the default branch requires pull requests, a per-run local request commits the work on a branch and stops: no merge into `main`, no push, no pull request. "Ship it" later delivers it as GitHub mode does.

## Alternatives

- **Keep 0034's stop.** Rejected: it forces a spec on most features and contradicts "Minimal" and "Human-led".
- **Drop the size guard.** Rejected: the guarded categories carry real risk; they keep their extra review.
- **Ask per run whether to spec.** Rejected for the reason 0034 gives: a question for the common case. The user already says "spec it" when they want one.
- **Let "build it local" merge into `main` in a protected repository.** Rejected: "ship it" could not push that `main`, leaving local history that diverges from what the remote accepts.

## Consequences

- Specs become opt-in in both delivery modes; delivery mode decides only how work lands.
- Larger unspecced work costs one independent review, the same as spec work, without requirement verdicts (there is no spec to check against).
- The smoke contracts that pin the stop change; the guard's category list stays pinned. `ship` re-applies the guard itself rather than trusting a posted self-check, and local merges record which review ran.
- New products may ship without spec 001 when the user never asks for one; the brief still records the riskiest assumption and the main metric.
