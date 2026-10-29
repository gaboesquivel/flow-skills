# 0050 — GitHub governance preset

Status: **Accepted** (2026-10-29). Builds on [0028](0028-build-and-ship.md) (no self-approval, no bypass) and [0049](0049-agent-does-the-work.md) (protection changes need the user's explicit request).

## Context

Flow's repositories and the projects `start` creates had no consistent GitHub settings. Before this record, none of `gaboesquivel.com`, `flow-next`, `flow-mono`, or `meta-cto` protected `main`. `flow-next`, `flow-mono`, and `meta-cto` allowed merge commits, all five allowed rebase merges, none deleted merged branches, and `gaboesquivel.com` gave `GITHUB_TOKEN` write access and let it approve pull requests.

## Decision

1. **One preset, one home.** [`skills/start/lib/github-governance.mjs`](../../skills/start/lib/github-governance.mjs) defines it and applies it through `gh api`. It is idempotent (the `Flow main` ruleset is updated by name) and verifies the effective rules on the default branch. It reports `unsupported` and `missingPermissions` instead of weakening anything. It is not shared infrastructure: each repository holds only its own CI and a copy of `.github/workflows/pr-title.yml`.
2. **The preset.** Default branch: no deletion, no force push, linear history, pull requests only, squash only, required checks not strict (up to date not required), zero approvals, no bypass actors. Squash commits take the PR title and body. Merged branches are deleted. `GITHUB_TOKEN` is read-only and cannot approve pull requests. Dependabot alerts, secret scanning with push protection, and private vulnerability reporting on public repositories.
3. **Required checks are repository-specific.** A check becomes required only after it has passed on that repository. Every repository requires `pr-title`, a Conventional Commit title check that takes about 3 seconds. Templates and their copies add `verify`.
4. **`start` applies it** after the initial push. The yes that created or named the repository is the explicit request 0049 requires.

## Exceptions

- **`gaboesquivel.com`** requires `Vercel` instead of a CI job: its only workflow is path-filtered, so its jobs do not report on every pull request, and a required check that never reports blocks merging.
- **`flow-skills`** requires `validate (ubuntu-latest, 22)` and `context-review`.
- **Private repositories on GitHub Free** cannot hold rulesets or secret scanning. The merge policy, Actions permissions, and Dependabot alerts still apply, and the report names the rest as unsupported.
- **Not enforced:** SHA-pinned actions (`flow-skills` and `gaboesquivel.com` use version tags), restricting which actions may run, and Dependabot security-update pull requests (their `Bump …` titles would fail `pr-title`).

## Alternatives

- **Settings files in each template, or the Probot settings app.** Rejected: duplicated configuration, or a third-party app with admin rights.
- **A third-party semantic-PR action.** Rejected: an inline shell check needs no checkout, token, or dependency.
- **Strict status checks.** Rejected for solo, parallel delivery: every merge forces each other open pull request to update and rerun CI. CI on `main` still runs after each merge.
