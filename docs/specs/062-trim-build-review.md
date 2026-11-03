# 062 — Trim build and review

Status: implemented (2026-11-03). Appetite: one session.

## Problem

`build` is the largest skill at 1,342 words, and every "build it" loads it. Parts of it restate what other homes already enforce. The guard hook blocks force-pushes, pushes to the default branch and `--no-verify`. The Done condition repeats Verify. Unspecced work has a section of its own for two sentences. `review` is 426 words, against spec 059's target of about 350, and it repeats mechanics the `flow-reviewer` agent owns: the tier-to-level table, finding labels, and the round rules. Spec 059 also left one live check open: a review of a branch with one unmet acceptance step has never been run.

## Solution

`build` keeps every rule it owns and states each once. It drops prose that a hook or another skill already enforces, and merges sections too small to stand alone. `review` keeps what the user gets (repaired work, scenario verdicts, the report) and points to `flow-reviewer` for how the review runs. The open spec 059 check runs live against a scratch branch, and its result is recorded in spec 059.

## Decisions

- **`build`, at most 1,050 words.**
  - Keep the headings other documents link to: Pull request, Size guard, Slices, Tests, Scope guard, Delivery mode, Issue trigger, Task set.
  - Keep every rule's substance: tiers, the human tier, slices by area, data changes, test policy, the scope trade-off, spend, delivery mode and the issue trigger.
  - Cut what the guard hook enforces down to one pointer, and fold Done into Verify.
  - Move Unspecced work into Deliver.
- **`review`, at most 350 words.** Outcome, Effort (the tier comes from `build`'s Size guard; "review it" runs Deep), Inspect, Repair, and Report keep their headings. `review` keeps one compact statement of tier levels, finding labels and re-review rules, so skill-only installs without the agent still have them, and links to `agents/flow-reviewer.md` for the full mechanics.
- **`flow-reviewer` is unchanged** except for any line it needs to stay the single home for those mechanics.
- **Live check.** A scratch clone holds a spec with two acceptance steps, and a branch implements only one of them. A fresh-context reviewer, briefed with `agents/flow-reviewer.md`, reviews that branch. Its report must mark the missing step `unmet`, with evidence, and include `/code-review`'s findings or say why there are none. The result goes into spec 059's open check and a record under `tests/evals/records/`.
- No decision record. No rule changes meaning.

## Acceptance

Scenario: the maintainer on flow-skills after this spec ships.

1. `wc -w skills/build/SKILL.md skills/review/SKILL.md` shows at most 1,050 and 350 words.
2. Every rule listed under Decisions still appears in `build`, the guard hook, or `flow-reviewer`, and a section-by-section comparison against `main` finds nothing dropped.
3. `pnpm validate` passes, so the links into `build` and `review` sections still resolve. The catalog total drops by at least 300 words.
4. The live check reports the unimplemented step as `unmet` with evidence, and spec 059 records the result.
5. A fresh-context review of this branch gives each step here a verdict and finds no Important issue.

Invariants: no authorization boundary loosens; "build it" never merges, and nothing skips or weakens a check. Checks: `pnpm validate`, `pnpm test`, and the word counts above.

## Out of Scope

- Changing what `build`, `review`, or `ship` do.
- Trimming other skills.
- Rewriting `flow-reviewer`.

## Tasks

- [x] 01: Trim `build` and `review`. Area: skills/build, skills/review.
- [x] 02: Live unmet-step review check, recorded in spec 059. Area: docs/specs.
