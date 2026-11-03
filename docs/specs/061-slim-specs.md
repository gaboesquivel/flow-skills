# 061 — Slim specs

Status: implemented (2026-11-03). Appetite: one session.

## Problem

Specs are getting longer while less of each one gets read. Specs 001–029 average about 1,250 words, specs 040–059 about 1,700, and 056, 057 and 059 run 3,300, 3,800 and 2,800. The template asks for nine sections, and each task carries its own "done when" checklist on top of the spec's acceptance scenario. On 2026-11-03, spec 059 was marked implemented with 27 of those boxes unticked. Specs 041, 046 and 050 shipped but still said `accepted`, because their merges skipped `ship`'s status step. `to-spec` and `to-tasks` together spend about 1,700 words describing this format.

## Solution

A spec has five sections and one checklist: Problem, Solution, Decisions, Acceptance, Out of Scope, then Tasks. The acceptance scenario is the only list of checks, and each task is one line. A spec stays at about 1,000 words or fewer; a larger bet is split. The status line holds the status, its date and an optional appetite, never history: Git holds how a spec got there. `pnpm validate` catches the two failures seen above in this repository.

## Decisions

- **Template (`to-spec`).**
  - **Problem:** who is affected, what fails today, and the evidence.
  - **Solution:** the change, from the user's side.
  - **Decisions:** only choices that shape execution, contract-first. **Exposure** stays here and stays required for deployable behaviour. A direction change confirmed without a decision record is one bullet here, replacing the Direction changes section.
  - **Acceptance:** the required acceptance scenario, then the invariants and the focused check (seam and command) that proves each. This replaces Testing Decisions.
  - **Out of Scope** is unchanged.
  - **Dropped:** User Stories (they repeat the scenario), Further Notes, and Appetite as a section. Appetite becomes an optional clause on the status line, so `build`'s scope guard and the reviewer still find it.
- **Tasks (`to-tasks`).** One line each: `- [ ] NN: Title. Area: a, b. Blocked by: NN.` Add one indented sentence only when the title cannot say what to build. Drop the per-task template and its checkboxes. The issue template stays, for tasks opened as issues on request.
- **Length.** `to-spec` says to stay at about 1,000 words, to link instead of restating records, glossary or code, and to split a bet that does not fit.
- **Checks (this repository, `scripts/validate.mjs`):**
  - A spec numbered 061 or later over 1,000 words fails, so the rule holds without rewriting earlier specs.
  - An `accepted` spec whose Tasks section has at least one checkbox, all ticked, fails with "set `Status: implemented`".
  - Both are deterministic checks, the prevention ladder's rung above prose.
- **Glossary.** Exposure, Delivery appetite and Acceptance scenario point at the new homes: Decisions, the status line, and Acceptance.
- No decision record: the template is `to-spec`'s to change, the acceptance scenario and Exposure rules stay, and no Accepted decision is reversed.

## Acceptance

Scenario: the maintainer on flow-skills, after this spec ships.

1. They say "spec it" for a small change. The new spec has the five sections and a status line, comes in under 1,000 words, and `pnpm validate` passes.
2. They say "break it down". Tasks are one line each, with Area and blockers, and no per-task checkboxes.
3. They pad a spec numbered 061 or later past 1,000 words. `pnpm validate` fails and names the file and its word count.
4. They tick every task of an `accepted` spec without changing its status. `pnpm validate` fails and names the spec. Setting `Status: implemented` clears it.
5. "Build it" on a spec in the new format still finds slices from `Area:`, and review still gives each Acceptance step a verdict and reads Out of Scope and Appetite.
6. `to-spec` and `to-tasks` together come to at most 1,100 words, down from about 1,700. `pnpm validate` and `pnpm test` pass.

Invariants: the acceptance scenario stays required before acceptance, and Exposure stays required for deployable behaviour. Checks: unit tests in `tests/validate.test.mjs` for steps 3 and 4 (fixture specs), and the catalog word count for step 6.

## Out of Scope

- Rewriting existing specs into the new format.
- Trimming `build` (1,337 words), the next candidate after this spec.
- Changing acceptance, status values, or `ship`'s status gate.
- Moving spec or decision locations, or numbering.

## Tasks

- [x] 01: Slim the `to-spec` template and `to-tasks` task format, and update the glossary. Area: skills/to-spec, skills/to-tasks, GLOSSARY.md.
- [x] 02: Spec length and stale-status checks in `pnpm validate`, with tests. Area: scripts, tests.
