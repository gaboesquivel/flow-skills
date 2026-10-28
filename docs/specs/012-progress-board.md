# 012: Progress board

Status: draft (2026-10-28). Needs a decision record for catalog growth (task 05). Related: [0020](../decisions/0020-flow-mode.md) (delivery modes, task-set orchestration), [0022](../decisions/0022-start-runs-explore.md) (candidate specs), [spec 009](009-flow-mode.md).

## Problem Statement

A developer running a Flow project with an agent cannot see where the work stands without asking. Specs, tasks, branches, and merges are spread across `docs/specs/`, git, and sometimes GitHub. While `ship` runs a task set through workers, their progress shows only in chat. GitHub Projects covers part of this, but only in pull-request mode, needs manual upkeep, and knows nothing about specs or workers.

## Solution

A `board` skill. Saying "show the board" opens a local, read-only kanban page for the current project that refreshes itself.

- **Cards** are specs (assumption, see Further Notes). A card shows its title, number, task progress (`3/5`), branch, and, in pull-request mode, linked issues and the pull request.
- **Columns** are the same in every project, delivery mode, and explore depth: **Candidate → Specced → Ready → Building → Shipped**.
- **Git is primary.** The stage comes from files on `main`, spec status lines, task checkboxes, branches, worktrees, and merges. GitHub only adds links.
- **Live runs.** While `ship` runs a task set, the main session writes a small overlay with each task's transient state (queued, working, reviewing, fixing, failed, blocked). The Building card expands to show every task and its state, so you can watch workers progress.
- **Read-only.** No dragging or editing. Agents move work through the existing skills; the board reflects it.

## User Stories

1. As a developer, I say "show the board" and get a local page with every spec in its stage, without GitHub access.
2. As a developer in pull-request mode, I see the same board, with issue and pull-request links on each card.
3. As a developer who said "ship it" on a task set, I watch each task move from queued to integrated, and I see which one failed and why, without reading the chat.
4. As a developer, I leave the page open and it updates within a few seconds of a commit, merge, or overlay change.
5. As a developer, I trust the board after a run ends or crashes: stale overlay entries never override what git shows.

## Implementation Decisions

**Shape.** `skills/board/` holds `SKILL.md` and one zero-dependency Node script (Node ≥ 22, same as this repository). The script:
- serves one HTML page and a JSON state endpoint on `127.0.0.1`. The page polls the endpoint every ~2 s, so there is no build step and no framework.
- with `--once`, writes a static HTML snapshot instead and exits. Hosts that cannot keep a process running use this.
- The skill starts the server in the background, prints the URL, and stops it on request.

**Stage derivation** (first match wins, per spec file in `docs/specs/` on the default branch):

| Stage | Rule |
| --- | --- |
| Shipped | `Status: implemented`, or the spec branch is merged (including squash) into the default branch with changes outside `docs/`, the spec has no tasks or all tasks are done, and it is not a candidate |
| Building | An overlay run names this spec, a spec branch exists, or at least one task is done |
| Ready | The spec has tasks (Tasks section or linked issues), none started |
| Specced | `Status: draft` without tasks |
| Candidate | `Status: candidate` ([0022](../decisions/0022-start-runs-explore.md)) |

Unknown or missing status lines put the card in Specced and show a marker; they never hide the card.

Specs that exist only on unmerged branches are shown too, marked with their branch and capped at Building.

**Spec ↔ branch.** The overlay names the branch during a run. Otherwise, a local or remote branch whose last segment contains the spec slug matches (`feat/flow-mode` ↔ `009-flow-mode`). *Assumption: slug matching is reliable enough. If it is not, `ship` records the branch on the spec's status line.*

**Run overlay contract.** Path: `<git common dir>/flow/board.json`, found with `git rev-parse --git-common-dir`. Inside `.git`, it needs no `.gitignore` edit in adopter projects and is shared by every worktree. Only the main session writes it, atomically (write temp file, then rename).

```json
{
  "version": 1,
  "run": { "spec": "012", "branch": "feat/progress-board", "mode": "local", "startedAt": "…", "endedAt": null },
  "tasks": {
    "01": { "state": "working", "round": 1, "note": "", "updatedAt": "…" }
  }
}
```

`state` ∈ `queued | working | reviewing | fixing | integrated | failed | blocked`. Git wins on conflict: a task whose change has merged into the spec branch shows as integrated whatever the overlay says. An overlay with `endedAt` set, or one not updated for 30 minutes, is shown as stale and ignored for staging.

**Ship integration.** `ship` task-set mode ([spec 009](009-flow-mode.md), implemented) writes the overlay at run start, at every task state change, and at run end. Writing the overlay is best-effort: a failure to write never stops a run. `ship` does not need the board to be running.

**GitHub enrichment.** In pull-request mode, when `gh` is available and authenticated, the script adds issue and pull-request numbers, state, and links to cards. Without it, the board renders from git alone and says so in the header.

## Testing Decisions

- Node tests under `tests/` follow `start-bootstrap.test.mjs`: build temporary git repos with fixture specs, branches, and merges, and set a local `user.name` / `user.email`.
- Stage derivation is a pure function from a repo snapshot (spec files, branches, merges, overlay) to cards. Most tests target it: each stage rule, git-over-overlay precedence, stale overlays, missing status lines.
- One smoke test runs `--once` against a fixture repo and checks the HTML contains the expected columns and cards.
- No browser tests. The page is a thin renderer of the JSON state.
- `pnpm validate` and `pnpm test` pass with `board` in the expected skill list and its evals.

## Out of Scope

- Dragging, editing, or creating cards; any write path from the board.
- Hosted, shared, or multi-user boards, and authentication.
- Replacing GitHub issues or GitHub Projects in pull-request mode.
- Burndown, cycle time, or other metrics.
- Hypothesis or validation boards ([glossary](../../GLOSSARY.md#validation-board)).
- Flow Factory integration.

## Further Notes

- **Card unit is an assumption.** One card per spec was proposed and not explicitly confirmed. Tasks show inside cards, not as cards. If task-level cards are wanted, only the renderer and the derivation output change; the overlay contract already tracks tasks.
- **Riskiest assumption** (confidence: medium): the main session keeps the overlay accurate enough during a run that watching the board beats reading the chat. Hosts may skip writes or lose track of workers.
- **Kill criterion:** during the first dogfood `ship` run on a three-task set, if the board's task states lag or contradict the chat for more than one state change, drop the overlay and ship the git-only board.
- **Main metric:** unknown, measure first. Candidate: how often you ask the agent "where are we?" during a run, before and after.
- PRODUCT.md currently lists "validation-board UI" and workflow orchestration as not shipped. A progress board is neither, but the line and the catalog table change with task 05.

## Tasks

### 01: Board from git (#45)
**What to build:** "show the board" with `--once` renders every spec in this repository into the five columns from git alone.
**Blocked by:** None (can start immediately).
**Status:** done
- [x] `skills/board/SKILL.md` and script; stage derivation as a pure, tested function.
- [x] Fixture-repo tests for each stage rule and missing status lines.
- [x] Snapshot of this repository shows specs 001–012 in the expected columns.

### 02: Live page (#46)
**What to build:** the board runs as a local page that updates within a few seconds of a commit or merge.
**Blocked by:** 01.
**Status:** done
- [x] Localhost server, JSON endpoint, polling page; the skill starts, reports, and stops it.
- [x] Works in light and dark color schemes and at phone width.

### 03: Run overlay (#49)
**What to build:** during a `ship` task-set run, the Building card shows each task's live state.
**Blocked by:** 02. (Spec 009's `ship` task-set orchestration landed in #44.)
**Status:** planned
- [ ] Overlay contract written by `ship` at run start, task state changes, and run end; best-effort.
- [ ] Board merges the overlay with git precedence and stale handling, covered by tests.
- [ ] Dogfood run on a three-task set, checked against the kill criterion.

### 04: GitHub enrichment (#47)
**What to build:** in pull-request mode, cards link their issues and pull request when `gh` is available.
**Blocked by:** 01.
**Status:** planned
- [ ] Issue and pull-request links and states on cards; header notes when GitHub is unavailable.

### 05: Catalog and context (#48)
**What to build:** `board` is a documented catalog skill.
**Blocked by:** 01.
**Status:** planned
- [ ] Decision record for adding `board` to the catalog.
- [ ] `scripts/validate.mjs` expected names, evals, `docs/skills.md`, PRODUCT.md catalog and "not shipped" line, specs README.
- [ ] `pnpm validate` and `pnpm test` pass.
