# 0012 — Start bootstrap library modules

Status: **Accepted** (2026-10-27). Supersedes: none. Related: [0010-optional-start-skill.md](0010-optional-start-skill.md).

## Context

The `start` skill needed executable helpers for template rename, git safety, baseline docs, and commit gates so agents do not improvise destructive git or leave Flow identity in adopter repos.

## Decision

Ship reusable modules under `skills/start/lib/` (identity, rename, git-safety, baseline-docs, commit-gate) with Node tests in `tests/start-bootstrap.test.mjs`. The skill instructs agents to use these helpers; CI must not depend on a configured global git identity (tests set local `user.name` / `user.email` in temp repos).

## Consequences

- Template initialization is testable without a live `npx skills add` run on every PR.
- Live disposable-template dogfood remains documented in smoke records, not required for every merge.
