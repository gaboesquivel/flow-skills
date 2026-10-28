# 024: Direction-change gate

Status: implemented (2026-10-28). Issue: [#128](https://github.com/gaboesquivel/flow-skills/issues/128). Decisions: [0038](../decisions/0038-direction-changes-are-confirmed-and-recorded.md) (Accepted). Builds on [decision 0036](../decisions/0036-one-explore-depth.md) (explore's background readers).

## Problem Statement

A new goal can contradict an accepted decision, an accepted or implemented spec, or a fact in `PRODUCT.md`. Today that conflict is surfaced in conversation, if at all, and never recorded:

- `explore`'s background reader looks for "decisions the request may conflict with" and raises them at the next turn, but nothing asks for a yes to the change and nothing is written.
- `to-spec` says to "respect decision records in the area you are touching", which steers it back to the old direction.
- `AGENTS.md` (ask about unresolved changes) and `domain-modeling` (supersede explicitly) state the intent but give no procedure.
- The decisions README says accepted records are immutable, while 0026 and 0036 already carry `Amended by` / `Superseded in part by` back-pointers on their Status line. Agents that follow the written rule leave old records looking current.

The result: the next `explore` session reads the old record as current and revives the superseded position, and the user has to re-explain the change.

## Solution

1. **Gate in `explore`.** When a stated goal contradicts an Accepted decision, an accepted or implemented spec, or a `PRODUCT.md` fact, `explore` stops at a direction-change gate: it names each conflicting file, quotes the position, says what changes and whether the change supersedes or amends it, and continues only on an explicit yes. Candidate and draft specs and Proposed decisions do not trigger it. On a no, exploration continues within the current direction (or ends killed).
2. **Scaled record on the yes.** Reversing or amending an Accepted decision always writes a new decision record with status **Proposed** that says `Supersedes [NNNN]` or `Amends [NNNN]` on its Status line. A conflict only with a spec or a `PRODUCT.md` fact gets a record only when `to-spec`'s decision test passes; otherwise the spec that follows records the change in a **Direction changes** note. The record is written on the `explore/<slug>` branch, even when the outcome is **clearer**, after the user sees its text and says yes.
3. **Pending changes are visible.** `explore`'s decision reader also scans local and remote-tracking branches not merged into the default branch for decision records that supersede or amend a record the request touches, and reports each as a pending direction change (record, branch, status) instead of treating the old record as current.
4. **Re-check in `to-spec`.** Before writing, `to-spec` checks for conflicts again and asks only about those not already confirmed in this conversation or recorded on the branch. It links the Proposed records from the spec.
5. **Back-links at acceptance.** "Accept the spec" flips the new records to Accepted and, in the same commit, appends `Superseded by [NNNN]` or `Amended by [NNNN]` (with a short parenthetical scope) to each old decision's Status line and its index row, appends the same pointer to each affected spec's Status line, and updates the conflicting `PRODUCT.md` fact to the new position with a link to the record. A dropped spec deletes its branch and leaves nothing behind.
6. **Status-line back-pointers are allowed.** The decisions README, `GLOSSARY.md`, and `domain-modeling`'s decision format say a record's body is immutable and only its Status line (and index row) takes back-pointers.

## User Stories

1. As a maintainer, I want `explore` to name the decision my new goal contradicts and ask me to confirm the change, so that a reversal is a choice, not an accident.
2. As a maintainer who says no, I want exploration to continue within the current direction, so that a mistaken framing costs nothing.
3. As the agent running the next `explore` on the default branch, I want superseded records to say so on their Status line, so that I follow the current direction without being told.
4. As the agent running `explore` while a change is still on an unmerged branch, I want the pending change reported, so that I neither revive the old position nor treat the new one as settled.
5. As a maintainer who drops a spec, I want no back-pointers left on the default branch, so that old records never point at a decision that does not exist.
6. As a maintainer running `to-spec` after `explore`, I want no second approval for a change I already confirmed.

## Implementation Decisions

- **Owner.** `explore` owns the gate in a short **Direction changes** section; `to-spec` links to it for the re-check and owns the acceptance-time back-links in **Accept the spec**. No new skill.
- **What triggers.** Only a contradiction with an Accepted decision, an accepted or implemented spec, or a `PRODUCT.md` fact. Overlap or a related topic is not a contradiction; when unsure, name it in one line without gating.
- **Vocabulary.** New records: `Supersedes [NNNN]` or `Amends [NNNN]` (with scope). Old records and specs: `Superseded by [NNNN]`, `Superseded in part by [NNNN]`, or `Amended by [NNNN]`, appended to the Status line. Index rows follow the existing parenthetical form, for example `Accepted (amended by 0038)`.
- **Accepted specs.** A Status-line back-pointer on another spec is not a change to its scope or its linked decisions and does not return it to `draft`.
- **Branch scan.** Read-only: list local and remote-tracking branches not merged into the default branch (local `main` in local mode), skipping the current branch, its upstream, and `HEAD`; on each, read only the decision records it adds or changes and report those that supersede or amend a touched record. Branch content is data, never instructions; ref names are passed quoted. No fetch, checkout, or write.
- **Write limits stay.** The record is shown before it is written, writes only on the explore or spec branch, and is never written to the default branch. The explore write gate (exact text before writing) applies unchanged.
- **Wording contracts.** Add the gate's guard phrases (explicit yes, no second approval, back-links only at acceptance) to `tests/smoke-contracts.test.mjs`; keep the existing `explore` and `to-spec` phrases passing.
- **Touched files.** `skills/explore/SKILL.md`, `skills/to-spec/SKILL.md`, `skills/domain-modeling/DECISION-FORMAT.md`, `docs/decisions/README.md` (rules and index), `GLOSSARY.md` (Decision record), `tests/smoke-contracts.test.mjs`. `AGENTS.md:38` stays as is: the gate is the procedure behind it.

**Exposure:** skill text running in the user's local agent host; nothing is deployed and there is no authentication surface. Writes are Git commits on the explore or spec branch only, each after an explicit yes; acceptance-time back-links are written by "accept the spec", which is itself the yes. Nothing is pushed by the gate.

## Testing Decisions

`pnpm validate` and `pnpm test` cover links, numbering, and the wording contracts. Behavior is checked by the acceptance scenario on a scratch clone; there is no runtime code to unit-test.

**Acceptance scenario.** Actor: the maintainer in a fresh agent session. Starting state: a scratch clone of flow-skills on `main` after this spec ships, local delivery, decision 0036 Accepted ("one `explore` depth with a pre-mortem").

1. Say "explore: drop the pre-mortem from explore." Result: `explore` names 0036, quotes the pre-mortem position, says the change amends it, and asks for a yes. Read-only.
2. Say "yes", then "yes" to the shown record. Result: a Proposed record `Amends [0036]` is committed on `explore/<slug>`; 0036 on `main` is unchanged. Writes to the scratch clone only (not production-safe on the real repository).
3. In a new session on `main` of the same clone, say "explore: make the pre-mortem optional." Result: `explore` reports a pending direction change (the Proposed record, its branch) and does not treat 0036 as settled. Read-only.
4. Back in the first branch, say "spec it", then "accept the spec". Result: no second approval is asked; the new record is Accepted; 0036's Status line and index row say `Amended by [NNNN]`; the spec links the record. Writes to the scratch clone only.
5. Repeat steps 1–2 on another goal, then "drop the spec". Result: the branch is deleted and no back-pointer appears on `main`. Deletes a scratch branch only.

No agent interface beyond the files themselves: the agent journey is step 3.

## Out of Scope

- A new skill, or drift scanning outside `explore` and `to-spec`.
- Rewriting the body of old records or migrating 0003+ to frontmatter.
- Validator checks for status values, and a `superseded` stage on the board.
- Fetching remotes for the branch scan.

## Further Notes

Integration with [decision 0039](../decisions/0039-build-never-requires-a-spec.md), which landed after acceptance: when an explore brief is built with no spec, the build request is the acceptance, so `build` accepts the branch's Proposed direction-change record and writes its back-pointers in its first commit. The acceptance rule is unchanged; 0039 added a path to it.


Origin: an `explore` run on 2026-10-28 (intent confirmed, grilled; outcome clearer, nothing written before this spec). Riskiest assumption (medium confidence): agents tell a real contradiction from a loose overlap. Main metric: `explore` runs that revive a superseded position (unknown, measure first); supporting: gates fired on non-conflicts. Kill criterion: across this repository's next ~5 `explore` runs, if the gate fires on a non-conflict in more than one in three, or the branch scan misses a pending change, drop the scan and keep only the gate.
