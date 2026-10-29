# 014: Faster PR CI

Status: implemented (2026-10-28); required checks amended by [decision 0047](../decisions/0047-trusted-review-and-local-record-checks.md). Related: [spec 004](004-pr-alignment-review.md).

## Problem Statement

A maintainer who opens or updates a pull request waits up to ten minutes for CI, although the tests take about half a second locally and 10–25 seconds per job. In the two slowest recent runs (631 s and 618 s), every job finished within about 45 seconds except `validate (macos-latest, 24)`, which sat queued for a macOS runner for ten minutes before starting. `context-review` ran after the whole run, so it also started late.

## Solution

1. **Pull requests run one validate job:** `ubuntu-latest` with Node 22, the minimum in `engines`.
2. **Pushes to `main` keep the full matrix:** ubuntu and macOS, Node 22 and 24. Platform or runtime breakage surfaces after merge instead of blocking every PR.
3. **Drop the standalone `npx --yes skills@latest --version` step.** [skills-cli.test.mjs](../../tests/release/skills-cli.test.mjs) (since spec 031, a release-only test) already runs `skills@latest add`.
4. **Bound every job with `timeout-minutes`**, so a stuck runner or LLM call fails instead of hanging.
5. **The `main` ruleset requires** `alignment`, `context-review`, and `validate (ubuntu-latest, 22)`. The other three matrix contexts are no longer required.

## Implementation Decisions

- The matrix is selected by event with `fromJSON`, keeping the job name `validate (<os>, <node>)` so the required check context stays stable.
- `alignment` and `context-review` are unchanged apart from timeouts.

## Testing Decisions

- `pnpm validate` and `pnpm test` stay green locally.
- This PR's own run shows a single validate job; the merge to `main` shows four.

## Out of Scope

- Changes to tests, scripts, or the context-review prompt.
- Caching `npx` downloads or speeding up the LLM review.

## Further Notes

The trade-off is that a macOS-only or Node 24-only regression is caught on `main` rather than on its PR. The scripts are plain Node with `git`, `tar`, and `npm pack`, so that risk is low; if it materializes, restore macOS on PRs with an opt-in label rather than for every run.
