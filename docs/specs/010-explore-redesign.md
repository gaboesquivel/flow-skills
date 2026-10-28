# 010: Explore redesign

Status: implemented (2026-10-28). Research: [explore discovery entry points](../research/2026-10-28-explore-discovery-entry-points.md). Number 009 is reserved by the Flow mode draft on another branch.

## Problem Statement

A founder or engineer who says "explore this" gets an open-ended conversation with no defined depth, no saved output, and no point at which exploration is done. Intent extraction (`interview`) and challenge (`grill`) exist as separate skills, but `explore` does not say when or in what order to use them. Product facts learned during exploration stay in chat, so `PRODUCT.md` drifts from what was discussed, and nothing tells the agent when the work is ready for `to-spec`.

Dogfooding this redesign on itself confirmed the gaps: the agent chose the interview and grill order itself, invented depth on the spot, saved research only by judgment, and could not say when the work was spec-ready.

## Solution

`explore` becomes the discovery lane of Flow, for new products and for features inside an existing product.

1. **Classify and propose depth.** Explore reads context first, classifies the work (new product, feature, fix), and proposes a tier with a one-line reason. The user confirms or overrides with one click.
   - **Skip:** fixes and clear small changes. No questions, no writes.
   - **Lite (default for new work):** intent, riskiest assumption, kill criterion and one main metric, 1–3 core journeys, three alternatives including the status quo.
   - **Full (opt-in):** Lite plus a pre-mortem, `jtbd`, a `competitors` report, 2–3 solution approaches including a minimal one, and saved research.
   Explore may propose stepping up a tier mid-session when evidence warrants. It prefers the lighter tier when unsure.
2. **Extract, then challenge.** Explore runs the `interview` pattern until it can predict the user's next three answers, restates intent, gets an explicit yes, and only then runs `grill` on the riskiest claims. `interview` and `grill` remain standalone skills; explore reads them rather than copying their instructions.
3. **Ask with forms.** Up to three independent multiple-choice questions per form, each option carrying the agent's guess and tradeoff. Open questions are asked one at a time in plain text. Hosts without a form UI get numbered options in text.
4. **End in a decision.** Outcomes are **brief**, **clearer** (intent sharpened, nothing to write), or **killed**. All three are valid.
5. **Write on confirmation.** For a new product, explore shows the full brief as the exact `PRODUCT.md` text. For a feature, it shows only durable changes to the product (a new user, journey, or metric) as a diff; feature detail flows into `to-spec`. An explicit yes to the shown text authorizes the write in the same turn. Unproven items carry a hypothesis label and confidence.
6. **Save research.** At Full depth, or whenever real web research happened, findings with sources and limits go to `docs/research/YYYY-MM-DD-topic.md`. Never transcripts.
7. **Say when spec-ready.** Explore reports spec-ready when intent is confirmed, the riskiest assumption and kill criterion are named, and the brief or diff is written or declined.

Brief shape in `PRODUCT.md`: problem, who, why now, riskiest assumptions with confidence, main metric and kill criterion, core journeys (one line each; steps belong in `DESIGN.md`), alternatives, out of scope.

## User Stories

1. As a founder starting a product, I want explore to propose Lite and walk me through forms, so that I end with a confirmed `PRODUCT.md` brief without writing it myself.
2. As an engineer adding a feature, I want explore to change only the product facts the feature touches, so that `PRODUCT.md` stays durable identity rather than a feature log.
3. As a user fixing a bug, I want explore to propose Skip, so that I am not interviewed about a one-line change.
4. As a user whose idea does not survive the grill, I want "killed" reported as a valid outcome, with nothing written.
5. As a user on a host without forms, I want numbered options in text, so that the same flow works everywhere.

## Implementation Decisions

- **Skills touched:** `explore` (tiers, order, outcomes, write gate, spec-ready test), `interview` (form rule replaces strict one question per message for closed questions), `grill` (runs on confirmed intent when called from explore; optional pre-mortem prompt), `flow` (suggests a tier for build requests; never starts explore unasked).
- **No new skills.** `jtbd` and `competitors` remain reachable directly and are read by explore at Full depth.
- **Guess bias guard.** Because forms make accepting the marked guess easy, explore occasionally presents a question without a marked guess and notes in its summary how many guesses were accepted unchanged.
- **Ownership.** `PRODUCT.md` holds durable product facts; journeys' steps live in `DESIGN.md`; research lives in `docs/research/`; feature scope lives in specs.
- Apply `write-agents` to every skill edit.

## Testing Decisions

- Extend `tests/evals/` scenarios for: tier proposal (fix → Skip, new product → Lite), extract-before-challenge ordering, killed outcome writes nothing, feature exploration shows a diff limited to durable facts, and a no-form host gets numbered options.
- Smoke-contract checks that `explore` names its tiers, outcomes, and spec-ready criteria, and that `interview` states the form rule.
- `pnpm validate` and `pnpm test` pass.
- Dogfood on the next three explorations (this repository, flow-next, flow-mono) and record results.

## Out of Scope

- Flow mode orchestration (`ship` task sets, project instruction block); tracked in the Flow mode draft.
- New discovery skills, personas, or a hard gate that forces a sequence.
- Writing drafts to disk before confirmation.

## Further Notes

**Unresolved assumptions** (the last interview question was not answered before this spec):

- **Main metric (assumption):** share of dogfood explorations that reach a confirmed brief without the user steering the process, measured over the next three.
- **Kill criterion (assumption):** if two of the next three explorations end with the user skipping to building, cut Lite back.

Dogfood observations from the session that produced this spec: twelve of twelve marked guesses were accepted, including one pitched against the expected answer; the first four-question form was skipped while later three-question forms were answered.

**Implementation notes.** Lite's main metric may be "unknown, measure first", following the [research](../research/2026-10-28-explore-discovery-entry-points.md) recommendation. The tier suggestion for build requests lives in `implement`, not `flow`: Flow Lite only aligns root docs and is not loaded by build requests. Shipping this spec as five pull requests for small, coupled edits was unnecessary; `to-tasks` and `ship` now default to one pull request per exploration and one per spec's tasks.
