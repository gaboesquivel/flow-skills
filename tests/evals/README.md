# Behavioral evaluation scenarios

Scenarios E01–E40 describe realistic skill behavior to verify over time. Current skill text under `skills/` defines the behavior a scenario grades. **Structural contract** and **executable fixture** results come from `pnpm test`. They do not prove an LLM executed a skill in a host.

## Evidence model

| Status field | Meaning |
| --- | --- |
| `structural_contract` | Safety keywords and metadata enforced in `tests/smoke-contracts.test.mjs` or related contract tests. Results recorded before spec 031 came from wording pins it removed; scenarios rewritten for spec 031 reset this to `not_executed`. |
| `executable_fixture` | Deterministic fixture or script in `tests/fixtures/`. |
| `live_skill_execution` | A person or agent ran the skill in a host; requires `liveObservation` (host, date, observation). |
| `independently_reviewed` | Separate execution reviewed the outcome; requires `independentReview` metadata when passed. |
| `verified_second_host` | Distinct agent product; requires `secondHostObservation` when passed. |

`pnpm eval:check` validates scenario files only. It does **not** run agents.

## Retired scenarios

When a decision or spec removes the behavior a scenario grades, retire the scenario instead of deleting it: ids, task and rubric files, and recorded evidence stay as history. In `scenarios.json`, add `"retired": { "by": "<decision or spec path>", "reason": "...", "date": "YYYY-MM-DD" }`, and start the task and rubric files with a `Retired` note that links the decision. `pnpm eval:check` requires `by`, `reason`, and `date`, requires the notes, and rejects observations dated after retirement. Retired scenarios are not graded or run.

When the behavior changed but the scenario's situation still matters (safety, authorization, untrusted input, zero lost work), rewrite the task, rubric, and `behavior` to the outcome the current skills promise instead.

## Blinded comparisons

Optional: use them for a consequential skill change when a live run alone would not show the difference. They are not required per spec; the delivery metrics in [PRODUCT.md](../../PRODUCT.md#success) and live runs of the current skills are the primary test.

When comparing skill versions:

1. Define the rubric in `rubrics/` (not shown to the candidate condition).
2. Use the natural task in `tasks/`.
3. Run baseline and modified conditions in isolated workspaces when feasible.
4. Inspect artifacts and traces; score authorization, evidence, and unnecessary work.
5. Record limitations; repeat uncertain comparisons when practical.

Never run competing writing agents against the user's active workspace.

## Records

Live and manual runs: [records/](records/). Latest live run: [2026-10-29 parallel workflow](records/2026-10-29-parallel-workflow-live.md). Structural index: [scenario-status.md](scenario-status.md).
