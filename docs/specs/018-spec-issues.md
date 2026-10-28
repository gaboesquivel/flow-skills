# 018: Spec issues and fast parallel builds

Status: accepted (2026-10-28). Issue: [#79](https://github.com/gaboesquivel/flow-skills/issues/79). Decision: [0029](../decisions/0029-spec-issues.md). Builds on [spec 017](017-build-and-ship.md), which lands first.

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

### Tasks

Sub-issues of #79. Tasks 01–04 each own one skill and share only this spec, so they have no blockers; 05 waits for 06 because both edit the board's files.

- [ ] 01: `to-spec`: push the branch and open or reuse the spec issue at draft, the `Issue:` line, labels, acceptance by label, candidates as issues, and the sync with its hand-edit check (#80).
- [ ] 02: `to-tasks`: sub-issues with blocking links under the spec issue, the Tasks checklist, local fallback (#81).
- [ ] 03: `build`: frontier scheduling up to the host limit, context pointers instead of notes, integration with the full local suite, checkpoints that never wait, CI waited on only for the final pull request, per-task and per-wave reviews removed, `Closes` lines for the spec and sub-issues (#82).
- [ ] 04: `ship` and `review`: the label gate, one independent review per spec, automatic merge, sync at merge with the default-branch link, abandoned specs (#83).
- [ ] 05: `board`: an open branch alone is not Building; spec issue and checklist links; candidate issue cards; labels as status with a mismatch marker; frontier overlay; dropped specs hidden; labels and close reason in the GitHub read (#85, blocked by 06).
- [ ] 06: Test speed: injectable waits in `board.test.mjs`, `pnpm test` under 8 s (#84).
- [ ] 07: Docs and contracts: glossary (Spec, Candidate spec, Delivery mode, wave), `PRODUCT.md` default durable docs, methodology, `docs/skills.md`, the indexes, status lines of the decisions 0029 amends, smoke contracts reduced to safety rules (#86, blocked by 01–06).
