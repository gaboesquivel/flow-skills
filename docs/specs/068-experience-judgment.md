# 068 — Experience and judgment

Status: draft (2026-11-04). Appetite: one session. Decision: [0068](../decisions/0068-experience-skill.md). Evidence: [research note](../research/2026-11-04-judgment-and-experience.md).

## Problem

Flow verifies correctness and liveness well, but three judgment gaps remain, checked against the current skills:

| Idea | Already covered | Gap | Action |
| --- | --- | --- | --- |
| Critical discovery (Lessa) | `explore` hypothesis-with-guess questions, pre-mortem, status quo as an alternative, at most two feature questions; selective critical thinking ([0067](../decisions/0067-flow-boundaries.md)) | Nothing says to work back from the user outcome before the solution, or that a small investigation can settle a blocking uncertainty | Refine one `explore` bullet |
| Architectural judgment (Hohpe) | `council` (alternatives, trade-offs); `to-spec` is "what and why, not how" | No stated stance that the agent amplifies the human's decision (alternatives, trade-offs, reasoning) or that a model/sketch exists to answer one question; no reversible-vs-hard-to-reverse cue | Refine `explore`, `to-spec` |
| Product experience (Rauch) | `design` (render, look at, in context); `review` checks `DESIGN.md` and "UI basics" | `design` omits loading, empty, error states and realistic content; no skill walks a running product as a user | Refine `design`; add `experience` |
| Observable quality | `build`: "verify UI in the running app" | Nobody records what was actually observed | `experience` |
| Delivery versus impact | `ship` owns liveness; `product` says shipped is not demonstrated value; [principles](../principles.md#understandable-change) say verified is not value | `product` has no cue to check what happened after landing, and no phrase for it | Refine `product`; leading word |
| Skill creation standards | `write-agents`; [0062](../decisions/0062-claude-code-first.md) catalog rules | The six-question test for a new skill is unwritten | Record in 0068 |

Everything else in the brief (proportional verification, intent-sized specs, scope defense, evidence tied to the head, retrospectives fixed at the source) is covered by [0065](../decisions/0065-proportional-verification.md)–[0067](../decisions/0067-flow-boundaries.md) and `review`'s repair rules, and is preserved unchanged.

## Solution

Sharpen five existing skills by a few sentences each, and add one optional skill, `experience` ("walk the experience"): a read-only pass through a running product as its user, ending in evidence-backed findings. No new stage, artifact, dependency, or gate. Principles gain wording inside existing themes; the eight official principles do not change.

## Decisions

- [0068](../decisions/0068-experience-skill.md) adds `experience` (catalog growth needs a record, [PRODUCT.md](../PRODUCT.md)) and sets the new-skill test.
- **Edits, each naming the behavior it changes:**
  - `explore`: start from the outcome the user wants and treat doing nothing as an option (stops solution-first interviews); when one uncertainty blocks the choice, offer the smallest investigation (inspect a contract, trace a request, compare two approaches) and report what it showed.
  - `to-spec`: the acceptance scenario follows a realistic user journey; a model or sketch only when it resolves a material uncertainty or states a binding constraint; consequential choices show alternatives and trade-offs, flagging which are hard to reverse.
  - `design`: check loading, empty, and failure states with realistic content in the rendered result.
  - `review`: for UI diffs, report material experiential defects seen in the rendered result, and be able to explain consequential implementation choices; point to `experience` for a full journey walk instead of duplicating it.
  - `product`: relate journeys to observed friction and adoption; a deployed feature is not an achieved outcome; unknown stays unknown. Leading word "did it land".
  - `build` and `ship`: unchanged.
- **Leading words.** Added: "walk the experience" (`experience`), "did it land" (`product`), "work backwards" (`explore`). Rejected: "map the problem" (folded into `explore` as behavior, no phrase), "show me why" (collides with "show me"; `build`'s report already explains what a person must understand).
- Principles: wording only, in Understandable change, Observability, and Critical thinking; `docs/methodology.md` gets one clarifying paragraph.
- No dependency, recording tool, or CI change. `experience` uses whatever browser or screenshot capability the host has, and says so when it has none.

## Acceptance

Scenario: a maintainer with the plugin and a running notes app (preview URL, seeded with a user and twelve notes).

1. They say "walk the experience" for creating and finding a note. The agent names the user and journey, starts from the seeded state, and follows it in the host browser, writing nothing and mutating nothing.
2. The report lists findings, each with reproduction steps, observed result, impact, confidence, and the smallest improvement; observations, hypotheses, and limits are labeled apart. An empty search shows no empty state, and appears as a finding.
3. With no browser available, it says visual inspection was unavailable and reports only what code and docs support.
4. "Review it" on a UI diff reports a missing loading state seen when rendered, and does not walk the whole journey.
5. "Did it land?" on a landed feature reports delivery as liveness only, and the outcome as unknown with the missing evidence named.
6. "Explore this" on a feature request opens from the outcome and the status quo, with no extra mandatory question.

Invariants: the new skill is read-only and optional; the catalog list, README, `docs/skills.md`, PRODUCT.md, and adapter metadata agree; no other skill's leading words change meaning. Checks: CI's `pnpm validate` and `pnpm test` (not run locally by request).

## Out of Scope

New skills beyond `experience`; recording or browser dependencies; metrics analysis, code review, or fixes inside `experience`; diagrams as required artifacts; changes to `build`, `ship`, hooks, or CI; quotations or attribution of Flow's wording to the three sources.

## Tasks

Written by `to-tasks`.
