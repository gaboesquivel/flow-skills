---
title: Scope and cost control
description: How Flow uses an appetite and a scope guard to keep agent work inside what an increment is worth, and why that is a trade-off practice rather than a spending limit.
status: published
published: 2026-11-02
updated: 2026-11-02
group: Delivery & Execution
---

# Scope and cost control

## The problem

Agents make additions cheap to start. A dashboard here, a refactor there, a new dependency because it was nearby: each looks small, and together they turn a three-hour change into a full day. The same applies to spend. A live model evaluation or a paid external run can be the right call, or it can be habit. Without an explicit boundary, nobody decides; the work just grows.

## What Flow contributes

Flow makes the boundary explicit and asks for a decision when it moves:

- **Appetite.** For substantial work, `explore` recovers and `to-spec` records how much time the increment is worth, plus a model, evaluation, or infrastructure cost limit when that spend is material. It also records the first verifiable slice and the non-goals. Small, understood changes skip this.
- **Scope guard.** During `build`, any new scope, whether the user or the agent proposed it, gets a recommendation before it starts: defer, replace (naming what it displaces), reject, or expand the appetite. A consequential change waits for your decision while unaffected work continues.
- **Blockers are not scope.** Correctness, security, and required-check failures are fixed or reported as the reason the work cannot ship on time. They are never cut to meet the target.
- **Review checks both directions.** `review` flags additions nobody asked for and accepted behavior that went missing.
- **Spend.** Prefer cheap fixtures and offline checks. A paid operation runs only when its result changes a decision, with its expected cost named and your yes for new consequential spend.
- **Honest reporting.** Elapsed time and cost are reported when observed and marked "not measured" otherwise.

## How to start

Say "explore this" or "spec it" for substantial work, and the agent will ask for an appetite only if it cannot recover one, with a suggested default. During "build it", answer its scope recommendations when they come. If an increment is no longer worth it, "drop the spec" abandons it cleanly.

## Example

Spec 057, which introduced this page, sets a proposed appetite of two focused implementation days for its first phase. It names what gives way first (later capability pages, older drafts, and video), what may not be cut to fit (claim checks, trust boundaries, accessibility), and states that start, end, and cost are not measured. It also authorizes no paid model or evaluation budget. See its [Appetite section](../specs/057-content-architecture.md#appetite-risks-and-open-assumptions).

## Evidence and owners

- Appetite capture: [`explore`](../../skills/explore/SKILL.md) (Proportion) and [`to-spec`](../../skills/to-spec/SKILL.md) (Appetite).
- Scope trade-offs and spend: [`build` Scope guard](../../skills/build/SKILL.md#scope-guard).
- Scope findings in review: [`review`](../../skills/review/SKILL.md).
- How parallel work is sliced: [`build` Slices](../../skills/build/SKILL.md#slices); the host sizes the fan-out ([decision 0062](../decisions/0062-claude-code-first.md)).
- Rationale: [decision 0053](../decisions/0053-delivery-appetite-and-scope.md); practice in [methodology](../methodology.md#defend-the-delivery-boundary).
- Terms: [delivery appetite](../../GLOSSARY.md#delivery-appetite), [scope trade-off](../../GLOSSARY.md#scope-trade-off).

## Limitations and trade-offs

- **An appetite is a target, not a guarantee.** Work can still overrun; the practice makes the overrun a visible decision instead of a surprise.
- **Not a spending cap.** Flow does not meter tokens, stop a running model, or enforce a budget. Hard limits belong to your host, provider, or billing settings.
- **Unknown cost stays unknown.** Hosts often do not expose token or dollar figures. Flow reports "not measured" rather than estimating.
- **Judgment is still needed.** The agent recommends; deciding what is worth more time or money is yours. The decision record that introduced this practice cites a retrospective in which scope changes were candidate contributors to overruns, not measured causes.
- **Some friction.** Asking about consequential additions adds a turn. Small fixes and minor implementation choices inside the scope skip it.
