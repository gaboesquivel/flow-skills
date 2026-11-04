# 060 — Host delegation, round two

Status: implemented (2026-11-03).

Decision: [0063](../decisions/0063-decision-record-threshold.md). Narrowed on 2026-11-03: the unbuilt work moved to candidate [spec 067](067-host-delegation-remainder.md). The original draft is in [#230](https://github.com/gaboesquivel/flow-skills/pull/230)'s history.

## Problem

Spec 059 moved worktrees, sessions, review, and the pull request lifecycle to Claude Code. This draft listed what was left, and part of it has since landed. The repository also recorded a decision for choices that are cheap to reverse: about 60 records in 10 days.

## Solution

Close what is true today and set the record threshold:

- `build`'s Verify already states its done condition as a `/goal`.
- `.claude-plugin/marketplace.json` already publishes the plugin ([#239](https://github.com/gaboesquivel/flow-skills/pull/239)).
- A choice gets a decision record only under [0063](../decisions/0063-decision-record-threshold.md)'s test. `to-spec` already states it; `AGENTS.md` now points there.

## Decisions

- Everything else moves to [spec 067](067-host-delegation-remainder.md), because each part needs a person's yes, reaches other repositories, or depends on a comparison run. Splitting lets the finished part land.
- No deployable behaviour changes.

## Acceptance

Scenario: a maintainer on flow-skills, after this lands.

1. They weigh recording a cheap, reversible choice. `to-spec` and `AGENTS.md` both send it to the spec's Decisions, not a new record.
2. They weigh a costly choice among real alternatives that reaches beyond one spec. It gets a record.
3. Spec 067 lists every item removed from this draft, with what it waits on.

`pnpm validate` and `pnpm test` pass.

## Out of Scope

Everything in [spec 067](067-host-delegation-remainder.md).

## Tasks

- [x] 01: Accept the threshold and point `AGENTS.md` at it. Area: AGENTS.md, docs/decisions.
- [x] 02: Move the unbuilt work to a candidate. Area: docs/specs.
