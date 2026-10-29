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

## Remaining

Live runs for E34 and E37 under conditions A, B, and C. Update [2026-10-28-spec-028-comparison.md](2026-10-28-spec-028-comparison.md) when the full 3×3 matrix is complete or the kill criterion fires.
