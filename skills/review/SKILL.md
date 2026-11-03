---
name: review
description: Review work in a fresh context against intent, the spec, and root context, on top of /code-review, and repair confirmed defects; "review only" stays read-only. Use when the user says "review it", "check it against the spec", or "does this match the intent".
disable-model-invocation: false
---

# Review

## Outcome

"Review it" gets an independent read of the change and ends in repaired work: confirmed defects fixed and verified, or left `unresolved` with the reason. The author is never the reviewer. For a spec, the proof is a verdict on each acceptance scenario step (`satisfied`, `unmet`, or `unresolved`), each with evidence.

Generic bug-hunting belongs to Claude Code's `/code-review`, and trust boundaries to `/security-review`. The plugin's `flow-reviewer` agent runs them, adds Flow's checks, and owns tier levels, finding labels, and rounds. On a host without that agent or `/code-review`, run these steps yourself and label the review **single-agent**.

## Effort

`build`'s Size guard picks the tier from the change, never from its author. Asked directly, "review it" runs Deep.

## Inspect

Scope defaults to the working tree, or a branch, pull request, or spec. Run `flow-reviewer` with the head, tier, and spec or request. It adds:

- scenario verdicts: no evidence means `unresolved`, and `unmet` is Important
- scope against `build`'s Scope guard
- names against `GLOSSARY.md` (`domain-modeling` Shared language)
- `DESIGN.md` and UI basics when the diff changes what users see

## Repair

Fix each Important finding and `unmet` step on the branch, covering its whole bug class, with a check that fails without the fix. Answer every other finding: fixed, or resolved with a reason. "Review only" or "don't fix" stays read-only. Inside `build`, the main thread repairs. After three rounds with an Important finding still open, stop patching and reconsider the approach; fix a recurring finding at its source (a lint rule, a skill, or `AGENTS.md`).

## Report

Start with a count ("2 Important, 1 Nit"), then the scenario verdicts, findings by severity, repairs made, and what stays open. In GitHub mode, post it as a comment, never an approval.
