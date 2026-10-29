# 0047 — Delivery phrases are approvals

Status: **Proposed** (2026-10-29). Amends [0044](0044-fast-delivery.md) (amendment item 1: `build` never waits on CI and the review runs in `ship`; amendment item 2: fall back to local when `gh` is unauthenticated), [0040](0040-ship-verifies-liveness.md) (liveness only after shipping), and [0019](0019-voice-first-invocation.md) (two or three trigger variants per skill; Flow avoids generic host verbs). Spec: [035](../specs/035-delivery-phrases.md).

## Context

Questions and acceptance belong to planning. After that, the user wants one phrase per delivery depth, each one a full approval, with no overlap that dictation could blur. Build currently ends before anything is verified, so "build it, then check the branch" has nothing to check.

## Decision

1. **Three phrases, each an approval.** "Push it" / "deploy it": push the current or named branch. "Build it": a ready, reviewed, green, live branch. "Ship it": build if needed, merge, live on the default branch. One trigger set per skill; no shared variants.
2. **Build verifies; ship lands.** Review (depth set by the size guard), fixes, and checks run once in build, on the final head. Ship reruns them only when the head changed.
3. **Light liveness at every depth.** Commit on the remote plus the host's deployment status for that commit and one `GET`. It reports and never gates. Behavioral verification (acceptance verdicts, UI checks) stays in `review`.
4. **`unmet` blocks; `unresolved` is listed.** Build lists unresolved steps before the user says "ship it", and the phrase approves them.
5. **No silent fallback.** A GitHub `origin` without an authenticated `gh` stops with how to authenticate.

## Alternatives

- **Keep build light and ship heavy (0044).** Rejected: the user checks the branch after "build it", so the branch must already be verified.
- **Handle "push it" without a skill.** Rejected for now: build and ship forbid pushing outside their own flow, so a narrow home for the push is clearer than an exception in both.
- **Make `unresolved` block landing.** Rejected: it adds a confirmation after the approval phrase. The evidence gap is shown before the phrase instead.

## Consequences

One user turn per delivery when planning is done. CI waits move from ship to build. "Push it" can push the default branch when named; the safety rules (no force-push, no protection bypass) still hold. Watch CI failure rate and post-merge fixes over the follow-up batch, and restore a gate if either rises.
