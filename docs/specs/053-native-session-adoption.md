# 053 — Native-session adoption across the starters

Status: accepted (2026-10-31)
Execution: delivery branch `spec/053-native-session-adoption`; integration owner for `flow-skills`: the coordination session. Each starter's pull request is owned by that repository's child session.

## Problem Statement

[Spec 052](052-native-session-integration.md) ([PR #216](https://github.com/gaboesquivel/flow-skills/pull/216), merged to `main` as `47ae57c` on 2026-10-31) tightens how Flow runs native sessions in Claude Code Desktop. The three starters a new project is copied from, `flow-next`, `flow-mono`, and `flow-signal`, bundle Flow skills under `.agents/skills/` pinned in `skills-lock.json`, and each bundled `write-agents` already differs from Flow `main`. A project started today inherits guidance that is behind Flow, and the 052 changes will not reach any project until the starters are refreshed.

Doing that refresh is itself a native-session job across three repositories, and running it exposes two gaps that specs [045](045-native-observable-sessions.md) and 052 leave open:

1. **Cross-repository ownership.** `write-agents` [Native sessions](../../skills/write-agents/SKILL.md#sessions) says "the parent stays integration owner". That holds for slices of one delivery. A child working in another repository delivers its own pull request there; no parent can integrate it, and the rule as written tells the parent to try.
2. **Worktrees outlive their delivery.** On 2026-10-31 each starter kept a worktree for a branch whose pull request had already merged (`flow-next` #18 and `flow-mono` #15 on `spec/048-delivery-lifecycle`, `flow-signal` #33 on `chore/flow-alignment`), each under `.claude/worktrees/`. [`ship`](../../skills/ship/SKILL.md) deletes the local branch after a squash merge with `git branch -D`, which Git refuses while the branch is checked out in a worktree, and nothing removes that worktree. The Sessions rule forbids other sessions from removing it, so it stays until the user cleans up by hand.

## Solution

- **One session per starter, gated on published Flow.** The coordination session starts one native session per starter. Each owns its repository's checkout, branch, and pull request. Each begins with a read-only drift audit. Once 052 has merged to Flow `main`, each refreshes its Flow skills from published `main` (never from a feature branch), keeps its repository-specific configuration, runs focused local checks, and delivers one pull request when the refresh changes anything.
- **Ownership follows the repository.** The parent stays integration owner of its own delivery. A child that delivers in another repository owns that repository's pull request; the parent coordinates and reports but never integrates or ships it.
- **`ship` closes its own worktree.** After merging, `ship` removes the worktree that holds the delivery branch, when this work created it and it is clean, before deleting the local branch. A worktree the host made for a session (Claude Code's `.claude/worktrees/`, which the app cleans up with the session) stays for the host; `ship` reports its path and the branch it keeps. Other sessions' worktrees stay untouched.

The other areas the request named (native cross-session messaging, context handoffs, interruption and recovery) showed no failure that 045 and 052 leave unaddressed. They stay as they are; see Further Notes.

## User Stories

1. As a maintainer, I ask for the starters to be refreshed and get one pull request per starter, each linked from a session I can open, without the parent touching any starter checkout.
2. As a maintainer, a starter pull request contains only Flow skill files and their lock entries; non-Flow skills, the project Flow block, and `flow-signal` product code are unchanged.
3. As a child session, I learn that 052 has landed by reading Flow `main`, not from the parent's word or the 052 branch.
4. As a maintainer who says "ship it" on a branch built in a worktree, I end with no leftover worktree or local branch for that delivery.
5. Failure: 052 has not merged when a child finishes its audit. The child reports its drift findings with no branch pushed and stops; the parent reports the refresh as blocked on #216.
6. Failure: a starter's worktree for this delivery has uncommitted changes when `ship` merges. `ship` leaves it, names the path, and says the branch could not be deleted.

## Implementation Decisions

- **Sessions.** Three fresh native sessions, one per starter, each in its own repository with that repository's ignored worktree location. Each brief names its goal, acceptance boundary, non-goals (no `flow-signal` product change, no edits to other sessions' worktrees), links to this spec and 052, the parent's session reference, its own branch `chore/flow-skills-052` and worktree, and itself as integration owner of its repository's pull request. Its final report leads with branch, head SHA, and unresolved work (052's report first lines). Leftover worktrees from merged deliveries are reported, not removed.
- **Gate.** A child refreshes only after `gh pr view 216 -R gaboesquivel/flow-skills --json state` reports `MERGED`; it then reads Flow `main`'s head SHA and records it in the pull request description.
- **Refresh.** Use the skills CLI's update path for the Flow entries in `skills-lock.json` (`npx skills` from published `gaboesquivel/flow-skills`), never copying files from a local `flow-skills` checkout. Keep non-Flow lock entries and every file outside the Flow skill directories. When the refresh produces no diff, there is no pull request.
- **Starter pull requests.** Drafts run nothing ([0057](../decisions/0057-draft-workspace-ready-checks.md)). Mark ready after focused local checks; the repository's required checks then run once. Merge only with shipping authorization from the user.
- **`skills/write-agents/SKILL.md`**: in Native sessions, scope "the parent stays integration owner" to its own delivery and add that a child delivering in another repository owns that repository's pull request.
- **`skills/ship/SKILL.md`** Landing, GitHub and local mode: before deleting the local branch, remove the worktree that holds it when this work created it and it is clean (`git worktree remove`, never `--force`); a host-made session worktree stays for the host, reported with the branch it keeps. This orders the existing Work in flight cleanup; it adds no removal authority.
- **`docs/specs/README.md`**: index this spec.
- No decision record: both skill changes apply [0052](../decisions/0052-git-first-coordination.md) and [0054](../decisions/0054-native-capability-first-sessions.md) as written. No direction change: one integration owner per delivery stands; spec 045's "the parent normally retains integration ownership" already allows the cross-repository case.

**Exposure:** Markdown guidance in the Flow skill distribution and bundled skill files in three starter repositories. No deployed service, route, write path, or authentication change; `flow-signal` product behaviour is out of scope.

## Testing Decisions

Structural checks only: `pnpm validate` and `pnpm test` in `flow-skills` when its pull request is ready; in each starter, its own lint and typecheck when it is ready, plus a check that every changed path is under `.agents/skills/` or is `skills-lock.json`. No paid evaluation, no model call in CI, no preview deployment.

**Acceptance scenario:** the maintainer in Claude Code Desktop, `flow-skills` at `4e9a44f` with #216 open (it merged as `47ae57c` during this build, so step 2's wait was not exercised), and the three starters on clean `main` with no open pull requests.

1. The coordination session starts three linked sessions, one per starter. Verify: three linked sessions exist, each starter has one new worktree on `chore/flow-skills-052`, and nothing was written in any starter's main checkout.
2. Each child reports its drift audit (which bundled Flow skills differ from Flow `main`, and which repository files are local configuration) with no branch pushed. Verify: `git ls-remote --heads origin chore/flow-skills-052` is empty in each starter.
3. #216 merges. Each child confirms `MERGED`, refreshes from published `main`, and opens one draft pull request. Verify: the pull request names the Flow `main` SHA, every changed path is under `.agents/skills/` or is `skills-lock.json`, and no CI job ran on the draft.
4. Each child runs its focused checks, marks its pull request ready, and reports branch, head SHA, and unresolved work first. Verify: required checks pass on that head; the parent's summary matches each pull request head.
5. The `flow-skills` session lands the `write-agents` and `ship` edits on this spec's branch and opens its pull request. Verify: `pnpm validate` and `pnpm test` pass on the ready head.
6. On "ship it" for one starter in a test repository where the delivery branch is checked out in a clean worktree, `ship` merges, removes that worktree, and deletes the local branch. Verify: `git worktree list` and `git branch --list` no longer show either; a second worktree with uncommitted changes, and a host-made session worktree, are each reported with their path and left.

## Out of Scope

Removing the existing leftover worktrees in the starters (they belong to other sessions; reported only). New skills, commands, session registries, orchestration infrastructure, or messaging conventions. Changing merge authority. Live or paid evaluation runs (E41 stays `not_executed`). Any `flow-signal` product behaviour. Updating the starters from the 052 feature branch.

## Further Notes

**Gap audit, 2026-10-31.** Read against 045, 052, and decisions 0052, 0054, 0057:

- *Cross-session messaging.* The host lets a parent message a child and a child message its parent when blocked. 052's report first lines cover completion; no observed failure shows a need for a messaging convention. Not implemented.
- *Context handoffs.* `handoff` plus 052's compatibility note on native hand-off cover it. Not implemented.
- *Interruption and recovery.* Covered by Sessions "Resume safely" and optional recovery notes. 045's step 4 interrupt/resume trial has never been run, so this is unverified, not passing.
- *Integration ownership.* Gap 1 above, observed while planning this work.
- *Worktree close-out.* Gap 2 above, observed in all three starters.

**Open assumptions.** The skills CLI's update path refreshes only changed Flow entries and leaves others alone (unverified until a child runs it). The starters' leftover worktrees are inactive; their pull requests merged, but whether a session is still open there is unknown. `flow-signal`'s main checkout has an uncommitted `prompts.txt`; children never write in main checkouts, so it stays as it is.
