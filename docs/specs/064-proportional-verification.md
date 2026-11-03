# 064 — Proportional verification

Status: implemented (2026-11-03). Appetite: one session. Decision: [0065](../decisions/0065-proportional-verification.md).

## Problem

Early product work pays the highest verification price by default. `build`'s Size guard rates all "new product behavior" High, so ordinary MVP features get Deep review. `build`'s Tests section wants every new route, MCP tool, and domain function test-first, "one check per behavior", and every other behavior a check that fails without the change. Novelty is not risk: a new settings page behind existing sign-in can be reverted in a minute, while a one-line permission change cannot be judged by its size. The rules also make the agent, not the project's scripts, the place where the cost is decided, and "review it" always runs Deep whatever the change.

## Solution

Risk is judged by what a change could break and how hard that is to undo. Ordinary feature work is Standard. Agents decide what needs evidence; project scripts run the checks. Targeted test-first protection stays for security, permissions, payments, migrations, and contracts others depend on. Nothing changes for the Human tier, required checks, or the rule that every build gets a fresh-context review.

## Decisions

- [0065](../decisions/0065-proportional-verification.md) amends [0056](../decisions/0056-contract-first-tests.md) and [0058](../decisions/0058-review-passes-and-risk-tiers.md).
- Security-relevant High triggers stay: authentication, permissions, secrets, payments, shell or exec paths, dependencies and lockfiles. Only novelty, additive routes, and additive schema move to Standard.

## Acceptance

Scenario: a developer building an MVP with the Flow plugin, in a repository with no `ARCHITECTURE.md` testing policy.

1. "Build it" for a new notes page with an additive table and route behind existing sign-in. `build` judges it Standard and runs Standard review. It adds no test per route; it shows evidence by running the journey and adds a focused check only where a regression would be costly.
2. "Build it" for a change to who can read another user's notes. `build` judges it High, writes the permission check first, sees it fail, and runs Deep review.
3. "Build it" for a migration that drops a column. High, and `build`'s Data changes rule still applies.
4. "Build it" on a CI workflow change. The Human tier still lists the path, and `ship` still waits for the user's yes.
5. "Review it" on a copy fix runs the tier the change earns; "deep review" runs Deep.

Invariants: every build still gets a fresh-context review; required checks still run once on the final head; a repaired defect that could return unnoticed gets a check. `pnpm validate` and `pnpm test` pass.

## Out of Scope

- Removing review for any tier, or changing `/code-review` levels.
- Changing `ship`'s merge gate or required checks.
- Starter test scripts and `start`'s bootstrap checks.

## Tasks

- [x] 01: Judge risk by consequence in `build` and `review`, and scale tests to risk. Area: skills/build, skills/review.
- [x] 02: Record the decision and align the glossary and catalog. Area: docs, GLOSSARY.md, README.md.
