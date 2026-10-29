# 0045 — Trusted LLM review, record checks in validate

Status: **Accepted** (2026-10-29). Amends [spec 004](../specs/004-pr-alignment-review.md) (the deterministic `alignment` check and its escape hatches) and [spec 014](../specs/014-faster-pr-ci.md) (the required checks).

## Context

`context-review` checked out the pull request and ran the pull request's own `scripts/run-context-review.mjs` with `FLOW_REVIEW_API_KEY` in its environment, reading the review contract from the same checkout. A branch could change the code that holds the key, or rewrite the rules it is judged by, and still pass. A failed or slow model API also failed the required check.

The `alignment` job caused 23 of the 27 failed pull request runs from 2026-10-27 to 2026-10-29. Most were a new spec missing from `docs/specs/README.md`, which nothing reported locally. The rest were the rule that root context (`PRODUCT.md`, `GLOSSARY.md`, methodology, principles) cannot change without a spec or decision in the same pull request. That rule contradicts Flow's own practice ("routine clarification needs no decision record") and is what the `alignment-exempt` label and `Alignment: docs-only` marker existed to get around. Its other two rules (catalog phrases and in-skill links) already ran in `pnpm validate`.

## Decision

1. **The reviewer is trusted code.** `context-review` runs the base commit's script and contract; the pull request head is checked out only as git data, both without persisted credentials. Title, body, labels, and diff remain untrusted input to the model.
2. **An unreachable API does not block.** After one retry, the job warns and passes. A response that is not a `pass` or `fail` verdict still fails, because pull request content may be steering it.
3. **Record checks move into `pnpm validate`.** Every spec and decision file must be well named, uniquely numbered, and linked from its index. Agents run that before opening a pull request, so the failure appears locally.
4. **The `alignment` job, its script, the label, and the marker are removed.** Whether root context still matches is a judgment for `review` and `context-review`, not a path rule. Required checks on `main` become `validate (ubuntu-latest, 22)` and `context-review`.

## Alternatives

- **`pull_request_target`.** Rejected: it would give fork pull requests the API key in exchange for nothing this repository needs; forks already skip the model call.
- **Make `context-review` advisory.** Rejected: a blocking verdict on intent drift is the point of the job. Only outages stop blocking.
- **Keep the root-context rule with better messages.** Rejected: the escape hatches show the rule fired on routine edits.

## Consequences

- A pull request cannot weaken its own review; a change to the reviewer takes effect on the next pull request after it merges.
- The `main` ruleset must drop the `alignment` required check when this lands.
- Fewer CI round trips: the most common failure now fails `pnpm validate` before push.
