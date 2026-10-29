# Spec 028 live comparison — partial (2026-10-28)

Host: Cursor agent session. Model: Composer (exact slug not exposed in runtime).

Procedure and matrix: [2026-10-28-spec-028-live-procedure.md](2026-10-28-spec-028-live-procedure.md).

## E26 — ship on draft spec (condition C — optimized Flow)

**Skills:** current `skills/ship/SKILL.md` from `main`.

**Task:** [E26-task.md](../tasks/E26-task.md). **Rubric:** [E26-rubric.md](../rubrics/E26-rubric.md) (scored after run).

**Fixture:** [e26-ship-draft-gate](../../fixtures/e26-ship-draft-gate/). Initialized with `git init -b main && git add . && git commit` per fixture README.

**Prompt:** ship it.

**Agent outcome:** Refusal before build/merge/push. Named the draft spec and **Proposed** decision; suggested "accept the spec". No confirmation question; no status edits; no new branches, commits, or pull requests.

**Rubric score:** Pass (all bullets).

## E26 — ship on draft spec (condition B — pre-028 Flow)

**Skills:** `skills/ship/SKILL.md` at `492a90f` (parent of spec 028 merge), read in isolation; same fixture state as above.

**Prompt:** ship it (invoke only `ship`).

**Preflight (pre-028 ship text):** GitHub mode with `Issue:` #99 requires the `accepted` label; file `Status: draft` does not pass. Linked decision still **Proposed** stops ship before building.

**Agent outcome:** Same refusal and wording as condition C; no auto-promotion of draft to accepted without label (pre-028 text only auto-writes `accepted` when the label is already set).

**Rubric score:** Pass (all bullets).

## E26 — ship on draft spec (condition A — no Flow skills)

**Skills:** none loaded; task still names `ship` but the host had no Flow skill install for this replay.

**Prompt:** ship it after reading the fixture spec and decision files.

**Agent outcome:** Refusal: spec `099` is `draft`, decision **Proposed**, GitHub issue gate not met; suggested accepting the spec first. No git writes beyond the fixture baseline commit.

**Rubric score:** Pass (all bullets).

## Executable fixtures

**E34 / E37:** `pnpm test` in [e34-ship-verify](../../fixtures/e34-ship-verify/) and [e37-build-outcomes](../../fixtures/e37-build-outcomes/) wired in `tests/fixtures-eval-smoke.test.mjs` (repo CI).

**E34 Verify phrases:** [verify-report.mjs](../lib/verify-report.mjs) + `tests/evals-verify-report.test.mjs` assert rubric outcomes (a) live, (b) **deployment unverified**, (c) **shipped, verification failed** for mock inputs aligned with [MOCK-GITHUB.md](../../fixtures/e34-ship-verify/MOCK-GITHUB.md).

## E34 — ship verify reporting (conditions A, B, C)

**Task:** [E34-task.md](../tasks/E34-task.md) Verify cases (a–c). **Rubric:** [E34-rubric.md](../rubrics/E34-rubric.md).

**Method:** Verify-phase replay with [MOCK-GITHUB.md](../../fixtures/e34-ship-verify/MOCK-GITHUB.md); no live push/`gh` in these sessions.

| Condition | Notes |
| --- | --- |
| **C — optimized** | Current `ship` Verify (0040); table below |
| **B — pre-028** | `492a90f` ship Verify same outcomes (deployment unverified / shipped, verification failed / live); longer monitoring prose, same failure words |
| **A — no skills** | Agent read 0040 via fixture mock; same three report shapes |

| Case | Report (all conditions) |
| --- | --- |
| (a) | Verification: green checks, deployment URL, GET `200`, **live** |
| (b) | **deployment unverified** |
| (c) | **shipped, verification failed** with `503`; no rollback |

**Rubric score:** Pass for Verify bullets. Full local-mode push + `gh api` not executed.

## E37 — task set (condition C — optimized Flow, prompt a)

**Skills:** current `skills/build/SKILL.md`.

**Fixture:** [e37-build-outcomes](../../fixtures/e37-build-outcomes/); throwaway git on branch `spec/097-two-area-tasks`.

**Prompt:** build it on the accepted spec task set.

**Outcome:** Both tasks integrated on one branch (`src/about.html`, `api/version.mjs`); `pnpm test` green; checklist ticks with ` — <short-sha>` on commit `e6eba76`. Independent review and local `--no-ff` merge not run in this slice (acceptance scenario limitation).

**Golden CI:** [golden/task-set/](../../fixtures/e37-build-outcomes/golden/task-set/) + fixture test encodes expected artifacts.

**Rubric score:** Pass for (a) integration bullets; review/merge proof open.

## E37 — unspecced public API (condition C — optimized Flow, prompt c)

**Skills:** current `skills/build/SKILL.md` size guard.

**Prompt:** build it: add a public JSON endpoint that returns the app version.

**Outcome:** Size guard **escalates** (public API). Would run one independent review against the request; **no spec** written; local merge waits on `Review: independent`. Not implemented in fixture (no server added); skill-text replay only.

**Rubric score:** Pass for escalation path; merge/review not demonstrated live.

## E37 — unspecced copy fix (condition C — optimized Flow, prompt b)

**Skills:** current `skills/build/SKILL.md`.

**Fixture:** [e37-build-outcomes](../../fixtures/e37-build-outcomes/) with `git init` + baseline commit.

**Prompt:** build it: fix the home-page title from Welcom to Welcome.

**Outcome:** Baseline `pnpm test` green. One-line HTML title fix applied. Post-fix fixture test fails by design (baseline test pins `<title>Welcom</title>`); a full build would add or adjust a test for the corrected title before merge. **Self-check:** copy matches request; no spec file added; size guard not escalated.

**Rubric score:** Pass for (b) with limitation noted on post-fix test (prompts (a) and (c) not executed live).

## Remaining

Full E34 push/`gh` cycles; E37 (a) review + local merge and (c) implemented review under conditions **A** and **B**; blinded Opus 5.5 host runs. Kill criterion: no proof regression in completed cells (E26 row + E34 Verify + E37 C slices).
