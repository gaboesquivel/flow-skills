# Spec 043 scope guard walk (2026-10-31)

Scenario: [spec 043](../../docs/specs/043-defensive-delivery.md) acceptance steps 1–7, walked by one fresh Claude Code subagent (Sonnet) that read `build` (Scope guard, Size guard), `explore` (Proportion), `review`, `to-spec` (Appetite), and `write-agents` Workers from the `spec/043-defensive-delivery` working tree and wrote the response each rule produces. A reading walk, not a live build: nothing was executed.

| Step | Situation | Verdict | Response the rules produced |
| --- | --- | --- | --- |
| 1 | Three-hour habit-tracker MVP | satisfied | Appetite taken from the request, not re-asked; only missing consequential items asked, each with a default; nothing written before the brief is confirmed |
| 2 | Dashboard requested two hours in | satisfied | Not started; defer recommended, with replace or expand as options and the changed acceptance step named; waits for the user |
| 3 | Worker adds a broad storage refactor | satisfied | Refactor hunk rejected or deferred; only the task's part kept |
| 4 | Security check fails near the deadline | satisfied | Fixed within the fix rounds or reported not ready; no weakened check, no shipped claim |
| 5 | One-word typo fix | satisfied | No spec, interview, tasks, decision, or issue; small self-check |
| 6 | Two one-line edits and one large API slice | satisfied | One-line edits inline; the large slice may get a worker when it pays; one integrator, one pull request |
| 7 | Review with an unrequested dependency and page, and an unmet step | satisfied | Unmet step blocks; both additions named as scope findings |

Fixes from the walk: `explore` now says the delivery items add at most one or two questions; `build`'s Task set runs trivial tasks inline; the Scope guard says unaffected accepted work continues while a decision waits, a scope change returns an accepted spec to `draft`, and worker briefs carry the Out of Scope list; `review` makes an unrequested dependency, surface, or infrastructure blocking until the user accepts it.

Limits: one model, a reading walk rather than live builds; elapsed time and cost not measured. Step 1 also showed that a new-product run still carries explore's existing grill and pre-mortem, which this spec did not change.
