# Behavioral evaluation scenarios

Scenarios E01–E39 describe realistic skill behavior to verify over time. **Structural contract** and **executable fixture** results come from `pnpm test`. They do not prove an LLM executed a skill in a host.

## Evidence model

| Status field | Meaning |
| --- | --- |
| `structural_contract` | Phrases and metadata enforced in `tests/smoke-contracts.test.mjs` or related contract tests. |
| `executable_fixture` | Deterministic fixture or script in `tests/fixtures/`. |
| `live_skill_execution` | A person or agent ran the skill in a host; requires `liveObservation` (host, date, observation). |
| `independently_reviewed` | Separate execution reviewed the outcome; requires `independentReview` metadata when passed. |
| `verified_second_host` | Distinct agent product; requires `secondHostObservation` when passed. |

`pnpm eval:check` validates scenario files only. It does **not** run agents.

## Blinded comparisons

When comparing skill versions:

1. Define the rubric in `rubrics/` (not shown to the candidate condition).
2. Use the natural task in `tasks/`.
3. Run baseline and modified conditions in isolated workspaces when feasible.
4. Inspect artifacts and traces; score authorization, evidence, and unnecessary work.
5. Record limitations; repeat uncertain comparisons when practical.

Never run competing writing agents against the user's active workspace.

## Records

Live and manual runs: [records/](records/). Latest live slice: [2026-10-28 spec 028 partial](records/2026-10-28-spec-028-live-partial.md). Structural index: [scenario-status.md](scenario-status.md).
