# 017: Build and ship

Status: accepted (2026-10-28). Decision: [0028](../decisions/0028-build-and-ship.md). Builds on [spec 015](015-wave-checkpoints.md) and [spec 012](012-progress-board.md).

## Problem Statement

A developer who says "ship it" is asked to confirm twice after deciding. A developer who says "build it" gets local changes, not a pull request whose CI environment they can open and check. Nothing tells an agent whether a spec has been reviewed, so a draft could be landed as readily as an approved spec.

## Solution

1. **`build`** (renamed from `implement`): implement, then open a pull request and wait for green checks, with fix rounds. Report the pull request, checks, and the links CI attached. A task set runs in waves with checkpoints that do not wait unless asked; the draft pull request is marked ready at the end. Local mode: a branch and the local check suite. Never pushes `main`; no confirmation.
2. **Spec acceptance:** `to-spec` writes specs as `draft` files, and decisions beside them as **Proposed**, then links them instead of showing the text and asking first. The spec status `accepted`, with linked decisions moving from **Proposed** to **Accepted** in the same step, is set by `to-spec` when the user approves the spec ("accept the spec").
3. **`ship`:** refuse spec work unless it is accepted; otherwise build if needed, adversarial review posted on the pull request, fix rounds, green checks, `implemented` status, merge, delete the branch, sync local `main`. No confirmation. Stops on red checks, blocking findings after the fix rounds, unresolvable conflicts, or a protection rule it cannot meet.
4. **Hotfixes:** no spec and no task means build opens a pull request and ship lands it, unless the review finds the change is not hotfix-sized.
5. **Retire `Deploy:`** from the Flow block.

## User Stories

1. As a developer, I say "spec it" and get links to a draft spec and any proposed decision, not their full text in the conversation.
2. As a developer, I say "build it" on a small fix and get a pull request with green checks and the environment link my CI attached, without being asked anything.
3. As a developer, I say "build it" on a draft spec's task set and get checkpoints per wave and a ready pull request at the end.
4. As a developer, I say "ship it" on a draft spec, and ship tells me the spec (or a linked decision) is not accepted and does nothing else.
5. As a developer, I say "accept the spec", then "ship it", and the pull request is reviewed, fixed, merged, and my local `main` is current.
6. As a developer, I say "ship it" on a one-line production fix with no spec, and it lands through a pull request.
7. As a developer, I say "ship it" on an unspecced new feature, and ship stops after review and suggests `to-spec`.
8. As a developer whose `main` requires an approving review, ship stops after its review and tells me an approval is needed.

## Implementation Decisions

- `skills/implement/` moves to `skills/build/` with its ATTRIBUTION, LICENSE, and `agents/openai.yaml`; `EXPECTED_SKILL_NAMES` and `PHRASES` follow.
- `build` owns Delivery mode and Task set (waves, notes, worker limits, checkpoints, board recording); `ship` links to them and owns acceptance checks, the hotfix guard, review, merge, and sync. `ship` drops its Push confirmation, Main gate, and Deploy sections.
- `to-spec` owns spec statuses and acceptance. It writes specs as `draft` and decisions it proposes as **Proposed** without asking, and reports links rather than inline text; its description gains "accept the spec". The "save only after an explicit yes to the shown text" rule is removed.
- `review` accepts `ship`'s authorization to use an independent worker and post on the pull request.
- `flow-block.mjs` drops `Deploy:`, `--deploy`, `normalizeDeploy`, and `readDeploy`; rewriting a block drops an existing `Deploy:` line.
- The board accepts `accepted` as a known status (stage unchanged: Specced, or Ready with tasks) and labels the live overlay a build run.
- Historical specs and decisions keep `implement` and `Deploy:`.

## Testing Decisions

- Smoke contracts for `build`, `ship`, `review`, `to-spec`, `to-tasks`, `flow`, and `board`: `to-spec` writes drafts and links them; the pull request and green checks in build; no confirmation in ship; the acceptance precondition; the hotfix guard; no self-approval or protection bypass; stopping on a required approval.
- `flow-block.test.mjs`: no `Deploy:` line, and an existing one is dropped on rewrite.
- `board.test.mjs`: `accepted` raises no unknown-status marker.
- The catalog count and evals follow the rename; E16 and E20 (one confirmation) are rewritten, and an eval covers ship refusing a draft spec.

## Out of Scope

- Per-environment databases and pipeline setup (template work in flow-next).
- A bot identity for approvals.
- Production promotion.

## Tasks

Recorded as GitHub issues (pull-request mode):

- [ ] [#72](https://github.com/gaboesquivel/flow-skills/issues/72) Rename `implement` to `build`.
- [ ] [#74](https://github.com/gaboesquivel/flow-skills/issues/74) `build` delivers a pull request with green checks (blocked by #72).
- [ ] [#73](https://github.com/gaboesquivel/flow-skills/issues/73) Spec drafts and acceptance.
- [ ] [#75](https://github.com/gaboesquivel/flow-skills/issues/75) Retire the `Deploy:` line (blocked by #74).
- [ ] [#76](https://github.com/gaboesquivel/flow-skills/issues/76) `ship` runs the full cycle (blocked by #74, #73).
- [ ] [#77](https://github.com/gaboesquivel/flow-skills/issues/77) Hand-off and docs alignment (blocked by #73–#76).
