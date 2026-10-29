# 018: Spec issues and fast parallel builds

Status: implemented (2026-10-28). Issue: [#79](https://github.com/gaboesquivel/flow-skills/issues/79). Decision: [0029](../decisions/0029-spec-issues.md). Builds on [spec 017](017-build-and-ship.md), which lands first. Frontier scheduling and who runs the suite amended by [decision 0042](../decisions/0042-outcome-build-and-ship.md) ([spec 028](028-outcome-build-and-ship.md)). Spec-issue requirements superseded by [0044](../decisions/0044-fast-delivery.md) (no spec issue; the file is the record and the pull request links it).

## Problem Statement

**Process.** In pull-request mode a spec reaches `main` through its own pull request before any work starts (spec 017 shipped as #71). Nothing on GitHub shows the spec itself until it merges, and its task issues (#72–#77) float without a parent. Open-source contributors expect planned work as an issue they can read, discuss, and see closed by the pull request that delivers it.

**Speed.** Issues, sub-issues, and waves exist to run work in parallel and land it automatically, but the gates around them serialize it. A task set today runs at most 3 workers, waits for a whole wave before the next starts, reviews every task with a separate worker, reviews every wave on five axes, waits for CI at every checkpoint, reviews the final change, and reviews it again in `ship`. In the 017 run every task produced a "review fixes" commit. The test suite takes about 19 seconds of wall time, almost all of it fixed sleeps in `board.test.mjs`, and smoke contracts pin skill wording, so most edits also edit a test.

## Solution

1. **One pull request per spec.** The spec file is written on the feature branch and merges with the work. A spec never lands alone.
2. **One issue per spec, tasks as its sub-issues.** In pull-request mode, `to-spec` pushes the feature branch and opens a spec issue that copies the whole spec. `to-tasks` opens each task as a sub-issue with native blocking links, so the open, unblocked sub-issues are the work that can start now.
3. **The file is the source of truth** for the spec's text. Skills copy it into the issue, one way. The Tasks section is a checklist of the sub-issues.
4. **Labels carry state:** `candidate`, `draft`, `accepted`. In pull-request mode the `accepted` label is the gate.
5. **Build runs the frontier, not waves.** Every unblocked task starts at once, each in its own worktree, up to the host's limit. A task starts the moment its blockers integrate.
6. **Test once, at the right level.** Workers run only the tests for what they changed. The orchestrator runs the full local suite after each integration. CI runs on every push but is waited on only for the final pull request.
7. **One independent review per spec.** It runs in `ship`, on the final pull request, and gates the automatic merge. Workers self-check against their task; there are no per-task or per-wave review workers.
8. **Ship merges on its own** when the spec is accepted, checks are green, and the review has no blocking findings.
9. **A fast suite:** `pnpm test` under 8 seconds, and smoke contracts only for safety rules.
10. **Local mode** keeps files only: no issues, tasks as checkboxes in the spec.

## User Stories

1. As a developer, I say "spec it" and get a draft spec file on a pushed feature branch and one issue labelled `draft` that shows the whole spec.
2. As a teammate, I read and comment on the spec issue without opening the repository.
3. As a maintainer, I add the `accepted` label (or say "accept the spec"), and the spec can be built and shipped.
4. As a developer, I say "break it down" and get one sub-issue per task under the spec issue, with blocking links, and a checklist of them in the spec.
5. As a developer, I say "build it" on a six-task spec whose tasks have two blockers, and four workers start at once; the other two start as soon as their blockers integrate, not when a wave ends.
6. As a developer, I am not waiting on CI while tasks integrate; a red check shows up on the final pull request, with fix rounds there.
7. As a developer, I say "ship it" and one independent review runs on the pull request, then it merges with no question, closing the spec issue and its sub-issues.
8. As a developer, I write a later bet as a `candidate` issue with no file; when its turn comes, `to-spec` turns that same issue into the draft. A contributor's feature-request issue can be reused the same way.
9. As a developer, someone edited the issue body by hand; the next sync shows me the difference and asks before overwriting.
10. As a developer, I open the board and see a drafted spec in Specced, not Building, even though its branch is pushed; it moves to Building when code lands on that branch.
11. As a maintainer, I see candidate issues on the board next to spec files, and a marker when a spec's label and its file disagree.
12. As a developer, I drop a spec; its issue and sub-issues are closed as not planned and its branch deleted, and the issue keeps the text.
13. As a contributor, `pnpm test` finishes in a few seconds and fails only when behavior or a safety rule breaks, not when wording changes.

## Implementation Decisions

### Spec issue

- **Spec header.** The file gains an `Issue:` link beside `Status:`. A spec without one has no issue (local mode, or older specs).
- **Issue body.** A first line `Copied from docs/specs/NNN-….md; edit the file, this body is overwritten.` with a link to the file on the feature branch (on the default branch after merge), then the file's content with relative links rewritten to the same ref, then a hidden marker holding a hash of the body above it. A body whose hash does not match was edited by hand: show the difference and ask before overwriting.
- **Sync points.** `to-spec` (draft, accept, scope change), `to-tasks` (the Tasks checklist), `build` (ticked tasks, spec fixes), and `ship` (`implemented`, and the file link pointing at the default branch after merge, since the branch is deleted).
- **Labels.** `candidate`, `draft`, and `accepted`, created on first use. Accepting sets the file status and swaps the label in one step; a label added by a maintainer counts as acceptance, and the next skill that touches the spec writes the file status to match. Changing an accepted spec's scope returns both to draft.
- **Candidates** are issues only, labelled `candidate`. Fleshing one out writes the file and relabels the same issue.
- **Pull request.** `build` opens one pull request per spec with `Closes #N` for the spec issue and each sub-issue, and a link to the spec file. Exploration documents for the bet (brief, research, root-context changes) ride on it.
- **Abandoned specs.** Close the issue and its sub-issues as not planned and delete the branch; nothing reaches the default branch.
- **Publishing.** Opening the spec issue at draft and sub-issues at "break it down" is part of those requests in pull-request mode and needs no separate yes; on a public repository, the report says the issues are public.

### Tasks and parallel build

- **Sub-issues.** In pull-request mode `to-tasks` opens each task as a sub-issue of the spec issue (what to build, acceptance criteria) with native `blocked by` links, and writes the spec's Tasks section as a checklist: `- [ ] 01: Title (#N)`. Without sub-issue support, plain `Part of #N` and `Blocked by` lines. Local mode keeps tasks only in the file.
- **Frontier scheduling.** `build` starts every task whose blockers have integrated, each in its own worktree from the spec branch, up to the host's concurrency limit instead of a fixed 3. Tasks that touch the same files run one after the other. When a task integrates, any task it unblocks starts at once. No wave barrier.
- **Context pointers.** Workers get pointers to the spec, their sub-issue, and the relevant files, not a notes document written first; the notes step is dropped.
- **Integration.** The orchestrator merges each finished task into the spec branch, runs the full local suite, ticks the checklist, and pushes. The draft pull request opens after the first integration.
- **Checkpoints** become a pull request comment per integration batch: what integrated, what is running, what is blocked. They never wait for CI or for the user unless asked.

### Testing and review

- **Workers** run the tests for the files and behavior they changed, and self-check the diff against their task. A failing test is a fix round for that worker (at most 2).
- **The orchestrator** runs the full local suite after each integration; a failure goes back to the task that caused it.
- **CI** runs on every push. `build` waits for it only on the final pull request, with fix rounds there. Intermediate pushes never wait.
- **Review.** One independent, adversarial five-axis review per spec, in `ship`, on the final pull request; blocking findings get up to 2 fix rounds. The per-task review workers, the per-wave review, and `build`'s final review are dropped. Without a separate worker the review is labelled single-agent and still gates.
- **Automatic merge.** `ship` merges with no confirmation when the spec is accepted, checks are green, the review has no blocking findings, and branch protection is satisfied (spec 017's rules otherwise).
- **Suite speed.** Waits in `board.test.mjs` (the memo window, the slow-`gh` stub, lock timeouts) become options the tests set to a few milliseconds, so no test sleeps for real. Target: `pnpm test` under 8 seconds on a laptop.
- **Smoke contracts** keep only safety rules: never push or merge the default branch outside `ship`, no force-push, no self-approval or protection bypass, the acceptance gate, never weaken a check. Contracts that pin other wording are removed; behavior is tested through scripts and evals.

### Board

The board keeps its five columns and stays read-only. GitHub data is read only in pull-request mode, as today; local mode is unchanged.

- **A branch alone is not Building.** Today any open branch matching a spec's slug puts the card in Building, so every draft would show as Building. An open branch counts as Building only when it changes something outside `docs/`, a task is ticked, or a build run is live. Otherwise the card's stage comes from its status and tasks: draft → Specced, accepted with tasks → Ready.
- **The `Issue:` line links the card** to its spec issue, with the issue's state. The spec issue's number joins the task issue numbers when matching pull requests, so a pull request that says `Closes #N` links to the card even when its branch name lacks the slug. Task checklist items with `(#N)` link their sub-issues, as task headings do today.
- **Candidate issues become cards.** An open issue labelled `candidate` with no spec file referring to it shows in Candidate, numbered by the issue (`#N`), with no branch or tasks. Once a spec file names that issue on its `Issue:` line, the file's card replaces it.
- **Labels count as status in pull-request mode.** An `accepted` label on the spec issue reads as `accepted`. When the label and the file's status disagree, the card shows a marker, for example `label accepted, file draft`. This is the board's view of the kill criterion.
- **Frontier overlay.** The live run shows each task as running, integrated, blocked, or waiting, without wave numbers.
- **Dropped specs leave the board.** A spec whose issue was closed as not planned is hidden; `--json` keeps it with `dropped: true`.
- **Shipped** is unchanged: the spec file merges with the code, so the merged branch or pull request already carries implementation work.
- **GitHub read.** `gh issue list` also returns labels and the reason an issue was closed, within the existing issue limit.
- **Not checked by the board:** whether an issue body still matches its file; that stays with the skills' sync check.

## Testing Decisions

- Smoke contracts, safety rules only: no push or merge of the default branch outside `ship`; no force-push; no self-approval or protection bypass; `ship` refuses a spec that is not accepted (label in pull-request mode); never weaken a check.
- `board.test.mjs`, with no real sleeps: a draft spec on an open docs-only branch is Specced, and Building once the branch changes code; the `Issue:` line and a closing pull request link the card; a `candidate` issue is a Candidate card until a file names it; a disagreeing label adds a marker; an issue closed as not planned hides the card; checklist tasks with `(#N)` link sub-issues; the overlay shows frontier states.
- `pnpm test` wall time is measured before and after; the target is under 8 seconds.
- Evals: E20 (build) covers frontier scheduling and no CI wait before the final pull request; a new eval covers a hand-edited issue body stopping the sync.
- Dogfood: this spec ships through its own issue, sub-issues, and one pull request, built on the frontier, with the run's wall time reported.

## Further Notes

Dogfood findings from opening this spec's issue (#79) by hand:

- The issue number is needed in the file and the file in the issue, so opening takes two passes: create the issue, add the `Issue:` line, commit and push, then sync the body.
- Relative links (`../decisions/…`, `#board`) break in an issue body; the copy rewrites them to the file's ref.
- The marker must hash the body as written, not the file; a hash of the file cannot tell a hand edit from a stale copy.
- Labels do not exist in a new repository; `draft` was created on first use.
- Tasks written as a numbered list show no checkboxes in the issue; the Tasks section is a checklist.

Measured on 2026-10-28: `pnpm test` about 19 s wall time, of which `board.test.mjs` about 19 s (three tests about 12 s, all waiting on real timers); CI 30–60 s per push.

## Out of Scope

- Spec number collisions between branches; naming specs after issue numbers.
- Migrating existing specs or their task issues.
- Trackers other than GitHub Issues.
- A GitHub Action that syncs issues; skills sync for now.
- Changing the CI alignment check or CI itself.

## Tasks

Sub-issues of #79. Tasks 01–04 each own one skill and share only this spec, so they have no blockers; 05 waits for 06 because both edit the board's files.

- [x] 01: `to-spec`: push the branch and open or reuse the spec issue at draft, the `Issue:` line, labels, acceptance by label, candidates as issues, and the sync with its hand-edit check (#80).
- [x] 02: `to-tasks`: sub-issues with blocking links under the spec issue, the Tasks checklist, local fallback (#81).
- [x] 03: `build`: frontier scheduling up to the host limit, context pointers instead of notes, integration with the full local suite, checkpoints that never wait, CI waited on only for the final pull request, per-task and per-wave reviews removed, `Closes` lines for the spec and sub-issues (#82).
- [x] 04: `ship` and `review`: the label gate, one independent review per spec, automatic merge, sync at merge with the default-branch link, abandoned specs (#83).
- [x] 05: `board`: an open branch alone is not Building; spec issue and checklist links; candidate issue cards; labels as status with a mismatch marker; frontier overlay; dropped specs hidden; labels and close reason in the GitHub read (#85, blocked by 06).
- [x] 06: Test speed: injectable waits in `board.test.mjs`, `pnpm test` under 8 s (#84).
- [x] 07: Docs and contracts: glossary (Spec, Candidate spec, Delivery mode, wave), `PRODUCT.md` default durable docs, methodology, `docs/skills.md`, the indexes, status lines of the decisions 0029 amends, smoke contracts reduced to safety rules (#86, blocked by 01–06).
