---
name: review
description: Review work in a fresh context against intent, the spec, and root context, on top of /code-review, and repair confirmed defects; "review only" stays read-only. Use when the user says "review it", "check it against the spec", or "does this match the intent".
disable-model-invocation: false
---

# Review

## Outcome

"Review it" gets an independent read of the change and ends in repaired work: confirmed defects fixed and verified, or left `unresolved` with the reason. The author is never the reviewer. For a spec, the proof is a verdict on each acceptance scenario step: `satisfied`, `unmet`, or `unresolved`, each with evidence.

Generic bug-hunting belongs to Claude Code's `/code-review`, and trust boundaries to `/security-review`. This skill runs the `flow-reviewer` agent, which calls them and adds the checks only Flow has. On a host without that agent or `/code-review`, run the same steps in order and label the review **single-agent**.

## Effort

`build`'s Size guard picks the tier from the change, never from who wrote it. The tier sets the `/code-review` level: Quick → `low`, Standard → `medium`, Deep → `high`. Asked directly, "review it" runs Deep.

## Inspect

Scope defaults to the working tree; it may be a branch, pull request, or a whole spec. Run `flow-reviewer` with the head, the tier, and the spec or request. On top of `/code-review`, it checks:

- the scenario verdicts, where no evidence means `unresolved` and an `unmet` step is Important
- scope against the spec's acceptance scenario, Out of Scope, and the appetite on its status line (`build`'s Scope guard)
- names against `GLOSSARY.md` (`domain-modeling` Shared language)
- `DESIGN.md` and the UI basics, when the diff changes what users see

Findings are Important (blocks), Nit (at most three), or Pre-existing (never blocks), each with `file:line`.

## Repair

Fix each Important finding and `unmet` step on the branch, covering its whole bug class, with a check that fails without the fix. Answer every other finding: fixed, or resolved with a reason. "Review only" or "don't fix" stays read-only. Inside `build`, the main thread repairs.

## Convergence

At most three rounds. Each re-review covers only the new diff and never repeats a finding. If round three still has an Important finding, stop patching and reconsider the approach. Fix a recurring finding at its source: a lint rule, a skill, or `AGENTS.md`.

## Report

Start with a count ("2 Important, 1 Nit"), then the scenario verdicts, findings by severity, the repairs made, and what stays open. In GitHub mode, post the review as a comment, never an approval.
