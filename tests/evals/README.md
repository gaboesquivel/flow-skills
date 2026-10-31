# Behavioral evaluation scenarios

Scenarios from E01 onward describe realistic skill behavior to verify over time. Current skill text under `skills/` defines the behavior a scenario grades. **Structural contract** and **executable fixture** results come from `pnpm test`. They do not prove an LLM executed a skill in a host.

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

### Against no skills

When a skill's value is uncertain or a meaningful change to it is proposed, the baseline condition is **no Flow skills** instead of the previous version ([spec 041](../../docs/specs/041-skill-evaluation.md)). Run on demand only, never in PR CI.

- Run both conditions with the same model, the same host, the same starting prompt, and two clones or worktrees made from the same commit. The baseline has no `.claude/skills` link and no globally installed Flow skills.
- Drive each run to a merge on a throwaway branch, or to a ready pull request when a merge is not possible.
- Record in `records/YYYY-MM-DD-<skill>-vs-no-skills.md` the model, host, starting commit, and isolation method. Report the fields `pnpm metrics` reports (elapsed time, user turns, CI failures, rework, cost), plus retries and unauthorized actions. Write `unknown` where a value is not observable, never zero.
- Conclude only what the runs support: the skill lowered idea → prod with no more failures or unauthorized actions, it did not, or the evidence is insufficient. One run per condition is a start; repeat when the difference is small.

### Local smoke (no paid inference)

A pipeline check on a local Ollama model, not evidence about skill value ([spec 049](../../docs/specs/049-local-evaluation.md)). It runs E43 request 3 ("Fix the typo in README; build it.") once per condition. Never run it in CI.

1. Start a loopback server for the session only: `OLLAMA_HOST=127.0.0.1:11434 OLLAMA_NO_CLOUD=1 ollama serve`. Its log must say `Ollama cloud disabled: true`. For a Claude Code run, add `OLLAMA_CONTEXT_LENGTH=65536`; the default is 4K and Ollama recommends 64K+ for the host.
2. Copy the [E43 fixture](../fixtures/e43-shared-language/README.md) outside any repository, change `copies` to `copeis` in its README, and commit once. Copy that repository once per condition.
3. Flow condition: system text is the fixture's `AGENTS.md` plus `skills/build/SKILL.md`. No-Flow: `AGENTS.md` without the Flow block. The user prompt in both is the README followed by the request.
4. Run each condition in turn under a macOS sandbox that allows outbound network to localhost only (`(deny network-outbound)`, then `(allow network-outbound (remote ip "localhost:*"))`):
   `node scripts/local-probe.mjs --model qwen2.5-coder:0.5b --prompt-file prompt.txt --system-file system-<condition>.txt --num-ctx 32768 --out probe-<condition>.json`
5. Stop the server, keep traces in `.cache/local-eval/`, and write a record. A reply that does not name the `copeis` → `copies` fix is a failure.

## Records

Live and manual runs: [records/](records/). Latest live run: [2026-10-31 E43 on Opus 5.5](records/2026-10-31-e43-opus.md). Structural index: [scenario-status.md](scenario-status.md).
