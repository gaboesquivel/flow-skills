# 004: Pull request alignment review

Status: implemented (2026-10-27); amended by [decision 0047](../decisions/0047-trusted-review-and-local-record-checks.md), which removed the deterministic checker and its escape hatches and runs the review from base-commit code. Authoritative contract: [pr-review-contract.md](../pr-review-contract.md).

## Problem statement

Flow treats every bounded change — product, design, engineering, marketing, or cross-functional — as work that should pass the same review bar as a pull request. Skills such as `review` and `flow` describe that bar, but relying on manual `/review` invocation leaves root context and specs easy to drift. Commit-time hooks are a poor fit; review belongs at **pull request** time, agent-agnostically.

## Solution

1. **Contract** — [docs/pr-review-contract.md](../pr-review-contract.md): one checklist any agent or CI can follow.
2. **Deterministic checker** — `scripts/check-pr-alignment.mjs` (removed by 0047): path and documentation rules on this repository's pull requests. CI compares `merge-base(base, head)` through `head`. The `main` branch ruleset requires that check, plus `validate (ubuntu-latest, 22)` ([spec 014](014-faster-pr-ci.md)) and `context-review` when secrets are set, and rejects direct pushes.
3. **Judgment layer** — GitHub Actions job calling an OpenAI-compatible API with the contract, PR title, body, labels, and diff. The job fails when the diff cannot be read or the response has no `pass` or `fail` verdict. It is a required check on `main` when `FLOW_REVIEW_API_KEY` is configured.
4. **Portable adoption** — Copy the contract and script into an adopter repository; wire their own CI and API secrets. Flow skills do not install workflows into consumer projects.

## Acceptance criteria

- `pull_request` CI runs `node scripts/check-pr-alignment.mjs` with base and head SHAs after full history checkout (removed by 0047).
- Contract documents scope, inspect, align, spec expectations, and JSON output schema for automated review.
- LLM job runs only for same-repository PRs when `FLOW_REVIEW_API_KEY` is set; posts or updates a PR comment with findings.
- `skills/review` documents PR merge-base scope and points to the contract.
- [agent-compatibility.md](../agent-compatibility.md) describes PR automation without implying adopter instruction-file edits.
- `pnpm test` covers alignment rule evaluation with fixture file lists.

## Implementation decisions

- Escape hatches (removed by 0047): label `alignment-exempt` skips deterministic alignment rules except filename shape and broken in-skill links. A standalone line `Alignment: docs-only` skips only the root-context spec-or-decision requirement, and only when every changed path is a root context path. The check reruns on `labeled`, `unlabeled`, and `edited`.
- New specs and decisions must be named in the index file contents. Renames are reviewed as a deletion plus an addition, so a renamed root context file still counts.
- npm package continues to ship `skills/` only; automation stays in the repository root.

## Testing decisions

- `pnpm validate` and existing contract tests unchanged unless skill text changes.
- `tests/pr-alignment.test.mjs` — unit tests for `evaluatePrAlignment` exported from the checker script.
- `tests/context-review.test.mjs` — verdict gate and prompt contents for the LLM job. No live API call.

## Out of scope

- Git commit or pre-push hooks.
- Editing adopter `AGENTS.md`, `CLAUDE.md`, or Cursor rules.
- A new catalog skill (optional `review-pr` leading word deferred).
- Mandatory multi-agent review independence.

## Adopter copy pattern

1. Copy [docs/pr-review-contract.md](../pr-review-contract.md).
2. Optionally copy [scripts/run-context-review.mjs](../../scripts/run-context-review.mjs) and the `context-review` job from [.github/workflows/ci.yml](../../.github/workflows/ci.yml); set `FLOW_REVIEW_API_KEY`, optional `FLOW_REVIEW_API_BASE`, and `FLOW_REVIEW_MODEL` as repository secrets.
3. Install Flow skills separately via `npx skills add gaboesquivel/flow-skills`; invoke `review` and `flow` using the same contract before opening a PR when CI is not yet wired.
