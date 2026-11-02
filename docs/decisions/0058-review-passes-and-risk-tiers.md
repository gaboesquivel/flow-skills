# 0058 — Fresh-context review, effort by risk

Status: **Accepted** (2026-11-02). Amends [0034](0034-no-ceremony-without-a-spec.md) (small work no longer gets a single-agent self-check), [0043](0043-workers-when-they-pay.md) (review rounds), and [0048](0048-delivery-phrases-are-approvals.md) ("ship it" on human-tier work needs a yes given after build's report).

## Context

`build` gave small changes a self-check by the authoring agent and escalated risky ones to an independent review, with two fix rounds. Findings were labeled confirmed, plausible risk, or preference. Nothing capped nits, dropped unconfirmed findings, required an answer to every finding, or kept a person in the loop for CI, auth, billing, or release changes.

The Claude Code team's account of its review practice (claude.dev blog, 2026-10-15; summarized in the maintainer's brief) argues that:

- a second agent in a fresh context catches what the author's context hides;
- effort should match risk;
- a separate verify pass cuts false positives;
- style findings belong to CI;
- every finding should be answered;
- review should stop after three rounds and fix recurring findings at their source;
- some paths always need a person.

## Decision

1. **Fresh context.** Every `build` is reviewed by a second agent in a fresh context. A host without separate execution labels the review single-agent, as before.
2. **Risk tiers set effort.** `build`'s Size guard judges the change, not the author:
   - Low: Quick, one pass.
   - Standard: finding passes, then a verify pass.
   - High: Deep, parallel per-axis passes, then a verify pass.
   - Human tier: CI and workflow files, Git hooks, auth, billing, and release paths. `ship` lands this work only on the user's yes given after build reported those paths.
3. **Findings.**
   - Each finding is labeled Important (blocks), Nit (at most three), or Pre-existing (never blocks), with `file:line` evidence.
   - The report opens with a count.
   - Style, formatting, and lint- or type-only findings are dropped.
   - A finding names its bug class, so the fix covers every instance.
4. **Every finding is answered:** fixed, or resolved with a reason. No merge with an open Important finding.
5. **Convergence.**
   - At most three rounds.
   - After the first round, review only the new diff, and never repeat a finding.
   - After round three, step back and reconsider the approach.
   - A recurring finding is fixed at its source: a lint rule, a skill, or `AGENTS.md`.
6. **The Flow block** carries one line stating these gates.

## Rationale

A self-check reads the change through the context that produced it. One subagent costs little next to a missed defect. The verify pass and the nit cap keep the review from turning into noise, which keeps agents and people reading it. A person still decides on paths where a mistake hurts most. Solo repositories cannot approve their own pull requests on GitHub, so that person's yes is the user's own ship request, given after they have seen the report.

## Alternatives

- **Per-repository `REVIEW.md`.** Not adopted yet. `AGENTS.md` and `review` cover the same ground until a project needs repository-specific failure modes.
- **Voting verifier panels and a separate security review on every pull request.** Rejected for now: too costly at Flow's scale. Deep review runs per-axis passes, security among them.
- **Required human approval on GitHub for the human tier.** Rejected: solo maintainers cannot approve their own pull requests.

## Consequences

Small changes now spawn a reviewer, so build spends a little more on low-risk work. Changes to `.github/workflows/` and other human-tier paths no longer land on a bare "ship it". `docs/pr-review-contract.md` maps Important to `blocking` and the other labels to `advisory`. Rounds-to-pass and false-positive rates are not measured yet.
