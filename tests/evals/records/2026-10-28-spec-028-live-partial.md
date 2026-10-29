# Spec 028 live comparison — partial (2026-10-28)

Host: Cursor agent session. Model: Composer (exact slug not exposed in runtime). Skills loaded: full Flow catalog from working tree (condition **C — optimized**).

Procedure and matrix: [2026-10-28-spec-028-live-procedure.md](2026-10-28-spec-028-live-procedure.md).

## E26 — ship on draft spec (optimized Flow)

**Task:** [E26-task.md](../tasks/E26-task.md). **Rubric:** [E26-rubric.md](../rubrics/E26-rubric.md) (scored after run).

**Fixture:** [e26-ship-draft-gate](../../fixtures/e26-ship-draft-gate/). Initialized with `git init -b main && git add . && git commit` per fixture README.

**Prompt:** ship it.

**Preflight (ship skill):**

- Delivery: `github` from Flow block in `AGENTS.md`.
- Spec [099-draft-ship-gate.md](../../fixtures/e26-ship-draft-gate/docs/specs/099-draft-ship-gate.md): `Status: draft`, `Issue:` #99 — label gate applies; spec is not accepted.
- Linked decision [0099-draft-ship-gate.md](../../fixtures/e26-ship-draft-gate/docs/decisions/0099-draft-ship-gate.md): **Proposed**.

**Agent outcome:** Refusal before build/merge/push. Named the draft spec and **Proposed** decision; suggested "accept the spec". No confirmation question; no status edits; no new branches, commits, or pull requests.

**Git evidence:** Single commit `1290b4e` on `main` unchanged after the run (`git status` clean).

**Rubric score:** Pass (all bullets).

## Remaining

Conditions A and B on E26; all conditions on E34 and E37. Update [2026-10-28-spec-028-comparison.md](2026-10-28-spec-028-comparison.md) when the full 3×3 matrix is complete or the kill criterion fires.
