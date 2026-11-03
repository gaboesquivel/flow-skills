# 0065 — Verification proportional to risk

Status: **Accepted** (2026-11-03). Spec: [064](../specs/064-proportional-verification.md). Amends [0056](0056-contract-first-tests.md) (item 1: which contracts are test-first; item 3: other behavior) and [0058](0058-review-passes-and-risk-tiers.md) (item 2: what High means; "review it" no longer forces Deep).

## Context

0056 made contracts test-first because agents shipped MCP tools whose errors and permissions were never exercised. 0058 tied review effort to risk. Both were sound, but the Size guard then listed "new product behavior" as High, and MVP work is almost entirely new product behavior. Routine features got the most expensive review, and every route and domain function got a test-first check before anyone knew whether the feature would survive.

## Decision

1. **Risk is consequence, not novelty.** The Size guard weighs trust boundaries, irreversible changes, blast radius, complexity, and consequential uncertainty. New behavior inside existing trust boundaries that a revert undoes is Standard.
2. **High keeps its security triggers.** Authentication, permissions, secrets, payments, shell or exec paths, dependencies and lockfiles, migrations that rewrite or remove stored data, and changes to an existing public API stay High. Additive routes and additive schema move to Standard. The Human tier is unchanged.
3. **Test-first is targeted.** It applies to security, permissions, payments, migrations, and contracts other systems or agents depend on, covering the behaviors whose failure would matter. "One check per behavior" is retired.
4. **Other behavior needs evidence, not necessarily a test.** Running it, an existing check, or a focused check where the logic is easy to get wrong or a regression would be costly. Agents own that judgment; project scripts own the commands.
5. **"Review it" earns its tier.** A standalone review uses the Size guard; "deep review" asks for Deep.

## Alternatives

- **Keep the rules and let `ARCHITECTURE.md` override them.** Rejected: the default is what most projects get, and a new project has no such policy yet.
- **Drop review for Low-risk work.** Rejected: 0058's case for a fresh context still holds, and one Quick pass is cheap next to a missed defect.
- **Leave dependencies out of High.** Rejected: supply-chain risk is a trust boundary, and lowering it would weaken a security control for little time saved.

## Consequences

- Fewer Deep reviews and fewer generated tests during MVP work.
- More rests on the agent's judgment. It can under-rate a change; "when unsure, pick higher" and Human-tier paths remain the backstop, and the [capability page](../capabilities/security-human-control.md) already names that limit.
