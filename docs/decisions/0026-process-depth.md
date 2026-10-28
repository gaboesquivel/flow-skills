# 0026 — Process depth, one setup path, and the spec–decision boundary

Status: **Accepted** (2026-10-28). Amends [0022](0022-start-runs-explore.md) (explore depth from `start`) and [0024](0024-gated-hand-offs.md) (`start` explores at Lite). Renames the label "Flow Lite" from [0006](0006-flow-lite-and-flat-docs.md) in current documents; the `flow` skill and its behavior are unchanged. Spec: [016](../specs/016-process-depth.md). Amended by [0029](0029-spec-issues.md) (candidate specs are issues in pull-request mode). Amended by [0030](0030-asked-delivery-and-local-mode.md) (depth asked with delivery wherever Flow first needs it; unset means Flow asks and suggests Lite).

## Context

`start` and "set up Flow here" define different things. `start` writes the Flow block and hands the conversation to `explore`, which captures the project's goals: intent, riskiest assumption, kill criterion, main metric, journeys, and alternatives. Setting up Flow in an existing project writes the block and stops, so the goals are never captured. Every document also says `start` "is not Flow Lite", which frames setup and bootstrap as unrelated.

How much process a project wants is chosen again on every `explore` run, and nothing records it. "Lite" names both the `flow` skill (Flow Lite) and an `explore` depth, so "choose Lite or Full" is ambiguous. Full depth adds discovery but says nothing about which choices deserve a decision record, and the boundary between a spec, its slices, and a decision is implicit.

## Decision

- **Process depth.** A project's Flow block records `Process: lite`, `full`, or `unset`. It is the default `explore` depth for new work in that project; `unset` means Lite. Fixes and clear small changes still skip exploration.
- **One setup path.** `start` is "set up Flow here" plus a template bootstrap. Both ask once whether the project uses Lite or Full process and record the answer. Both define the same goals through `explore`: `start` hands off automatically ([0024](0024-gated-hand-offs.md)); `flow` names `explore` and waits when `PRODUCT.md` has no brief.
- **Spec, tasks, decision.** A spec is one bet: it tests one assumption and ships as one unit. Its tasks are the slices inside it, so a spec may be large. A bet that depends on how another one does gets its own spec and stays a `candidate` stub until its turn, at any depth. A choice gets a decision record only when it chose among real alternatives and reaches beyond one spec or is costly to reverse; otherwise it lives in the spec's Implementation Decisions. `to-spec` owns this rule.
- **Lite and Full.** Lite: brief, spec 001 in full with its tasks, later bets as candidates; choices stay inside specs unless they pass the decision test. Full: Lite plus deeper discovery (pre-mortem, `jtbd`, `competitors`, 2–3 approaches, saved research), and every choice among alternatives made during exploration, starting with the chosen approach, becomes a proposed decision record. Full records more of the why; it never specifies later bets up front.
- **Naming.** Current documents call the `flow` skill **context alignment** instead of Flow Lite. Lite and Full refer only to process depth. Historical records keep their wording.

## Rationale

The goals are what make later work evaluable, so every Flow project should have them regardless of how it started. Recording depth once in the block follows `Delivery:` and `Deploy:`: the choice is made once, is visible, and the user can edit it. Specifying later bets goes stale because of uncertainty, not process preference ([0022](0022-start-runs-explore.md)), so Full spends its extra effort on rationale, which does not go stale the same way.

## Alternatives

- **Full means a full spec for every bet.** Rejected for the reason 0022 gives: later bets change after spec 001 ships.
- **Keep choosing depth per run.** Rejected: users repeat the same answer and projects drift between depths.
- **Rename the `explore` tiers instead of Flow Lite.** Rejected: users already say "lite or full" for depth; the skill label is the less-used name.

## Consequences

- `flow`'s block helper, `flow`, `start`, `explore`, and `to-spec` change; tests cover the `Process:` line.
- README, `PRODUCT.md`, the glossary, the catalog, and the methodology drop "Flow Lite" as the skill's label and describe process depth.
