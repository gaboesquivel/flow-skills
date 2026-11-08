# 069 — Explore as a product peer

Status: implemented (2026-11-08). Appetite: one session. Decision: [0069](../decisions/0069-direction-changes-at-adoption.md).

## Problem

`explore` reads like an interview procedure, not a conversation with a product peer, and the surrounding rules add side effects nobody asked for:

- It opens with a confidence percentage and walks a fixed question ritual before reading what the project already says.
- A hypothetical ("what if we auto-merged duplicates?") that touches an accepted commitment stops at a hard gate, before anything is proposed. A brief is always shown twice and always committed on a branch; a feature with no `PRODUCT.md` is told to create one.
- Nothing says that talking is write-free or that a prototype request does not adopt the prototype.
- `to-spec` and `build` do not say how a draft proposes changing a commitment, or compare a change with the owner statement it touches. The reviewer flags any new domain noun missing from the glossary, which rewards glossary growth: `GLOSSARY.md` has 40 entries and about 2,460 words, much of it procedure, retired names, and generic vocabulary.
- Instructions imply a worktree per session ("start an isolated one with `claude -w`"). The SessionStart hook only reports work in flight and writes nothing, so the pressure is in prose.

## Solution

Sharpen existing owners; add no skill, hook, parser, or template.

- **`explore`** reads the relevant product context first, asks the question whose answer would most change the recommendation, and ends when the user has what they need (a clearer question, a stop, an experiment, an agreed brief, a first slice). "Explore this" is the phrase; interview, challenge, and walk-through are styles. Discussion alone writes nothing and creates no branch, worktree, issue, or pull request. A prototype request authorizes that experiment only. It owns the initial `PRODUCT.md` brief of a new product, written on an explicit request or after one confirmation; a feature touches `PRODUCT.md` only for a durable adopted change, and its absence is no setup task.
- **Handoff.** Exploring toward delivery names the first useful release, the first slice, and any decision that depends on its result, in a sentence. `start` stays optional scaffolding that consumes a brief; `to-spec` sizes by the existing rule and states what "build it" will build.
- **Disagreement** surfaces at exploration and gates at adoption ([0069](../decisions/0069-direction-changes-at-adoption.md)).
- **Root context** is read before inferred from code and kept honest in `build` and review: a change that touches an owner commitment is compared with it, and the owner text is updated when the user authorized a new commitment.
- **Glossary** gets the editorial test "what could a capable contributor reasonably get wrong without this?" in `domain-modeling` and the reviewer, and Flow's own glossary is cut to it.
- **Side effects.** Delivery phrases recognize a subject; only identified work is authorized. Worktrees are for genuinely concurrent writers, not one per session.

## Decisions

- Amends [0038](../decisions/0038-direction-changes-are-confirmed-and-recorded.md) (gate timing) and, in part, [0044](../decisions/0044-fast-delivery.md) item 6 (an explicit request to write an agreed brief needs no second confirmation). Builds on [0066](../decisions/0066-specs-sized-by-delivery.md) sizing, [0067](../decisions/0067-flow-boundaries.md) (`start` optional), [0048](../decisions/0048-delivery-phrases-are-approvals.md) (phrases are approvals), and [0063](../decisions/0063-decision-record-threshold.md).
- Leading words: `explore` keeps "explore this", "interview me", "grill this" (existing tests pin the last two); "what are we missing", "ask me questions", "poke holes in it", and "work backwards" leave the description, and the behaviors stay.
- Glossary anchors with inbound links are kept; retired entries shrink to one line each in a Retired section. Nothing outside `GLOSSARY.md` is rewritten for this.
- No new hook. `hooks/wip.mjs` already writes nothing.
- Evidence is local and free: the E43 fixture, `tests/flow-phrases.test.mjs`, structural validation, and an anchor check. Live comparisons are listed as pending, not run.

## Acceptance

Scenario: a maintainer in a repository whose `PRODUCT.md` says submitters choose whether to merge a duplicate suggestion.

1. "Let's just talk about a new product." The agent explores, asks one question, and writes nothing and creates no branch.
2. "We've agreed on the brief. Write it down." `PRODUCT.md` gains the problem, users, first useful release, main metric, and kill criterion on a branch, with no other file.
3. "Explore auto-merging similar requests. Let's prototype it on one board." The agent quotes the submitter-choice commitment, builds the experiment on that board only, and does not edit `PRODUCT.md`.
4. "Spec it" after a broad MVP whose later work depends on learning: the active spec is the first independently useful slice and later work is a candidate stub. When the pieces ship as one release, one spec holds several vertical tasks. Either way the report says what "build it" will build.
5. A repository with no `PRODUCT.md` gets a clear small feature built with no product-definition exercise.
6. A glossary says a hold lasts three days and the code uses seven: a request that depends on it gets one question before any edit. A typo fix or a new ordinary noun produces no glossary finding.
7. "Should we ship it?" gets advice. "Ship it" on identified work runs the delivery rules. "Fix this typo" edits in place with no worktree.
8. The user adopts a changed main metric: the draft spec names the current statement, the replacement, and the observable consequence; on acceptance `PRODUCT.md` and the dependent behavior change together and other documents do not.

Invariants: the guard and SessionStart hooks are unchanged; every `GLOSSARY.md#anchor` used elsewhere resolves; `pnpm validate` and `pnpm test` pass.

## Evidence

Local, free, and structural; nothing here proves native host invocation or model behavior. Run on the branch head: `pnpm validate` (14 skills, links, catalog phrases, 9,470 of 10,000 skill words) and `pnpm test` (204 pass), including `tests/flow-phrases.test.mjs` for "interview me" and "grill this". An anchor script found no dangling `GLOSSARY.md#` link; the only dropped anchors were `intent`, `research`, `specification` (no inbound links), and `verification` (kept as a retired line). The glossary went from 40 entries and 2,462 words to 31 sections and about 1,400.

| # | Case | Where the instruction now lives | Existing coverage | Status |
| --- | --- | --- | --- | --- |
| 1 | Just talk | `explore` Writes (no file, branch, worktree, issue, PR) | none | pending live |
| 2 | Agreed brief | `explore` Brief (explicit request authorizes the write) | none | pending live |
| 3 | Bounded prototype against a commitment | `explore` Disagreement; `to-spec` direction change | none | pending live |
| 4 | "Spec it" sizing, with counterexample | `to-spec` How many specs | [spec 065](065-intent-sized-specs.md) | pending live |
| 5 | No `PRODUCT.md`, small feature | `explore` Feature | none | pending live |
| 6 | Glossary and code disagree; typo and new noun | `domain-modeling` Shared language; `flow-reviewer` Names | [E43](../../tests/evals/tasks/E43-task.md) request 2 (hold period 3 against 7, one question), request 3 (typo) | rubric unchanged; live result `not_executed` |
| 7 | "Should we ship it?" against "Ship it"; typo fix | `ship` and `build` openings; `write-agents` Sessions | smoke "Voice-first activation" ([tests/smoke](../../tests/smoke/README.md)) is structural only | pending live |
| 8 | Adopted metric change | `to-spec` direction change and acceptance | none | pending live |

Live comparison is left unrun, for the user to decide (paid inference). Rerun cases 1 to 8 in a scratch repo with seeded `PRODUCT.md` and `GLOSSARY.md` under three conditions: current Flow (`07a2948`), this branch, and no skills. Judge the decision made, accidental writes or worktrees, redundant questions, and documents read; word count is secondary.

## Out of Scope

Starter templates, a new skill or hook, a phrase parser, rewriting `PRODUCT.md`, `DESIGN.md`, historical records, or adopter projects, paid or CI-triggering evaluation.

## Tasks

Written by `to-tasks` if wanted; this is one delivery.
