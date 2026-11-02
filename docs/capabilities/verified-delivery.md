---
title: Intent-to-verified delivery
description: How Flow carries a change from stated intent to a reviewed, checked, landed commit, and what each kind of evidence along the way does and does not prove.
status: published
published: 2026-11-02
updated: 2026-11-02
group: Delivery & Execution
---

# Intent-to-verified delivery

## The problem

A coding agent can produce a plausible change in minutes. Knowing whether that change does what you meant, passed the checks you rely on, and actually reached production is slower and easier to get wrong. "Done" can mean the code compiles, the tests passed on some earlier commit, a deployment exists, or users got value. Those are different claims, and agents tend to report the most optimistic one.

## What Flow contributes

Flow connects the steps of a delivery so that each one leaves evidence the next one can check:

- **Intent.** `explore` clarifies the problem and, for substantial work, the appetite. `to-spec` writes a numbered spec with an acceptance scenario: a concrete journey that review later judges step by step.
- **Implementation.** `build` works on one branch, with one draft pull request per spec in GitHub mode. Drafts run no CI and get no automatic preview in repositories that follow this lifecycle; focused checks run locally while the work moves.
- **Review.** A second agent in a fresh context reviews the final head. It gives each acceptance step a verdict of `satisfied`, `unmet`, or `unresolved`, and labels findings Important, Nit, or Pre-existing. An open Important finding blocks.
- **Checks.** `build` marks the pull request ready, which runs the repository's required checks once on that head. `ship` merges only when a script confirms every required check succeeded on the head it merges; a skipped, pending, or missing check never counts.
- **Liveness.** After pushing, building, or shipping, a light check reports whether the commit is on the remote and whether the host's deployment for it answers. It never gates and never claims the feature works.

The point is not more ceremony. It is that each claim in the final report names the head and the evidence behind it.

## How to start

Talk to your agent in ordinary language. "Explore this" when the problem is still fuzzy. "Spec it" to write the draft spec. "Build it" to implement, review, check, and hand back a verified branch. "Check it against the spec" for a standalone review. "Ship it" to land the work. "Build it" and "ship it" are approvals: the agent does not ask again before the steps they cover.

## Example

Spec 048 changed this repository's own delivery lifecycle. While its pull request ([#208](https://github.com/gaboesquivel/flow-skills/pull/208)) was a draft, four pushes reported CI and title checks as `skipped` with no runner and no branch deployment. A fresh-context review found two blocking issues, which were fixed before landing. A follow-up ([#211](https://github.com/gaboesquivel/flow-skills/pull/211)) fixed a case seen in another repository where a skipped draft run hid the real result on the same head. The article [What counts as verified delivery?](../blog/intent-to-verified-delivery.md) walks through it.

## Evidence and owners

- Lifecycle, review step, and checks: [`build`](../../skills/build/SKILL.md) (Pull request, Verify, Size guard).
- Review passes and verdicts: [`review`](../../skills/review/SKILL.md); [decision 0058](../decisions/0058-review-passes-and-risk-tiers.md).
- Merge gate and liveness: [`ship`](../../skills/ship/SKILL.md) and its [`required-checks.mjs`](../../skills/ship/scripts/required-checks.mjs).
- Draft workspace and checks on ready: [decision 0057](../decisions/0057-draft-workspace-ready-checks.md), [spec 048](../specs/048-delivery-lifecycle.md).
- Delivery phrases as approvals: [decision 0048](../decisions/0048-delivery-phrases-are-approvals.md).
- Terms: [liveness](../../GLOSSARY.md#liveness); spec and review flow in [`to-spec`](../../skills/to-spec/SKILL.md) and [`explore`](../../skills/explore/SKILL.md).

## Limitations and trade-offs

- **Liveness is not verified behavior, and verified behavior is not customer value.** A `live` report means a deployment answered; review verdicts mean the change matched its spec. Neither shows the change improved the outcome it aimed at.
- **Checks prove only what they test.** Green CI on the right head is necessary evidence, not proof of correctness.
- **Host-dependent.** A fresh-context reviewer needs a host that can run a separate agent; without one, the review is labelled single-agent. GitHub mode needs a working route to GitHub. Deployment status depends on the host reporting it.
- **Repository configuration matters.** Draft-skipping CI and disabled branch previews are this repository's configuration, described in spec 048. An adopting project has to configure its own workflows and hosting for the same behavior.
- **Cost.** Every build now runs a reviewer, which spends a little more on low-risk changes. Savings from skipping draft CI are not measured.
