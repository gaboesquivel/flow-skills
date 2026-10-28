# 018: Spec issues

Status: draft (2026-10-28). Issue: [#79](https://github.com/gaboesquivel/flow-skills/issues/79). Decision: [0029](../decisions/0029-spec-issues.md). Builds on [spec 017](017-build-and-ship.md), which lands first.

## Problem Statement

In pull-request mode, a spec reaches `main` through its own pull request before any work starts (spec 017 shipped as #71), then its tasks become one issue each (#72–#77). The team sees six issues and two pull requests for one bet, and nothing on GitHub shows the spec itself until it merges. Open-source contributors expect planned work as an issue they can read, discuss, and see closed by the pull request that delivers it.

## Solution

1. **One pull request per spec.** The spec file is written on the feature branch and merges with the work. A spec never lands alone.
2. **One issue per spec.** In pull-request mode, `to-spec` pushes the feature branch and opens an issue that copies the whole spec, with a link to the file at the top. Discussion happens on the issue.
3. **The file is the source of truth.** Skills copy the file into the issue whenever they change it; the issue body is never edited by hand. Tasks stay in the spec's Tasks section and appear in the issue as part of the copy.
4. **Labels carry state.** `candidate`, `draft`, and `accepted` on the spec issue. In pull-request mode the `accepted` label is the gate `ship` checks; the file's status follows it.
5. **Local mode is unchanged:** files only, no issues.

## User Stories

1. As a developer, I say "spec it" and get a draft spec file on a pushed feature branch and one issue labelled `draft` that shows the whole spec.
2. As a teammate, I read and comment on the spec issue without opening the repository.
3. As a maintainer, I add the `accepted` label (or say "accept the spec"), and the spec can be built and shipped.
4. As a developer, I say "break it down" and the tasks appear in the spec's Tasks section and in the issue, with no issue per task.
5. As a developer, I say "ship it", and one pull request lands the spec, its decisions, any exploration documents, and the code, closing the spec issue.
6. As a developer, I write a later bet as a `candidate` issue with no file; when its turn comes, `to-spec` turns that same issue into the draft.
7. As a contributor, I open a feature-request issue; `to-spec` from that issue reuses it as the spec issue.
8. As a developer, someone edited the issue body by hand; the next sync shows me the difference and asks before overwriting.
9. As a developer, I open the board and see a drafted spec in Specced, not Building, even though its branch is pushed; it moves to Building when code lands on that branch.
10. As a maintainer, I see candidate issues on the board next to spec files, and a marker when a spec's label and its file disagree.
11. As a developer, I drop a spec; its issue is closed as not planned and its branch deleted, and the issue keeps the text.

## Implementation Decisions

- **Spec header.** The file gains an `Issue:` link beside `Status:`. A spec without one has no issue (local mode, or older specs).
- **Issue body.** A first line `Copied from docs/specs/NNN-….md; edit the file, this body is overwritten.` with a link to the file on the feature branch (on the default branch after merge), then the file's content, then a hidden marker holding a hash of the copied text. A body whose hash does not match was edited by hand: show the difference and ask before overwriting.
- **Sync points.** `to-spec` (draft, accept, scope change), `to-tasks` (Tasks section), `build` (ticked tasks, spec fixes), and `ship` (`implemented`, and the file link pointing at the default branch after merge, since the branch is deleted).
- **Labels.** `candidate`, `draft`, and `accepted`, created on first use. Accepting sets the file status and swaps the label in one step; a label added by a maintainer counts as acceptance, and the next skill that touches the spec writes the file status to match. Changing an accepted spec's scope returns both to draft.
- **Candidates** are issues only, labelled `candidate`. Fleshing one out writes the file and relabels the same issue.
- **Tasks.** `to-tasks` always writes the spec's Tasks section. A sub-issue is created only for a task with its own owner. Task headings no longer carry per-task issue numbers.
- **Pull request.** `build` opens one pull request per spec with `Closes #N` and a link to the spec file. Exploration documents for the bet (brief, research, root-context changes) ride on it.
- **Board.** See [Board](#board) below.
- **Abandoned specs.** Close the issue as not planned and delete the branch; nothing reaches the default branch.
- **Publishing.** Opening the spec issue at draft is part of "spec it" in pull-request mode and needs no separate yes; on a public repository, the report says the issue is public.

### Board

The board keeps its five columns and stays read-only. Specs now sit on pushed feature branches from the moment they are drafted, candidates can exist only as issues, and acceptance can arrive as a label, so it changes as follows. GitHub data is read only in pull-request mode, as today; local mode is unchanged.

- **A branch alone is not Building.** Today any open branch matching a spec's slug puts the card in Building, so every draft would show as Building. An open branch counts as Building only when it changes something outside `docs/`, a task is ticked, or a build run is live. Otherwise the card's stage comes from its status and tasks, as for specs on the default branch: draft → Specced, accepted with tasks → Ready.
- **The `Issue:` line links the card** to its spec issue, with the issue's state. The spec issue's number joins the task issue numbers when matching pull requests, so a pull request that says `Closes #N` links to the card even when its branch name lacks the slug. Task-heading issue numbers keep working for older specs and sub-issues.
- **Candidate issues become cards.** An open issue labelled `candidate` with no spec file referring to it shows in Candidate, numbered by the issue (`#N`) instead of a spec number, with no branch or tasks. Once a spec file names that issue on its `Issue:` line, the file's card replaces it.
- **Labels count as status in pull-request mode.** An `accepted` label on the spec issue reads as `accepted`. When the label and the file's status disagree, the card shows a marker, for example `label accepted, file draft`. This marker is the board's view of the kill criterion.
- **Dropped specs leave the board.** A spec whose issue was closed as not planned is hidden, even if its branch still exists; `--json` keeps it with `dropped: true`.
- **Shipped** is unchanged: the spec file now merges with the code, so the merged branch or pull request already carries implementation work. A spec issue closed as completed by that pull request confirms it.
- **GitHub read.** `gh issue list` also returns labels and the reason an issue was closed. Candidate cards come only from issues within the existing issue limit, and the header note already says when that limit was reached.
- **Not checked by the board:** whether an issue body still matches its file. That needs each body and stays with the skills' sync check.

## Testing Decisions

- Smoke contracts: `to-spec` opens one issue and pushes the branch in pull-request mode, never in local mode; the issue copies the file with the marker; a hand edit stops the sync; `to-tasks` writes no per-task issues; `build`'s pull request carries `Closes #N`; `ship` gates on the `accepted` label in pull-request mode.
- `board.test.mjs`: a draft spec on an open docs-only branch is Specced, not Building, and becomes Building when the branch changes code; a spec with an `Issue:` line links the issue and a pull request that closes it; a `candidate` issue without a file is a Candidate card, replaced once a file names it; an `accepted` label reads as accepted, and a label that disagrees with the file adds a marker; an issue closed as not planned hides the card; task headings without numbers still count.
- Dogfood: this spec ships through its own issue and one pull request.

## Out of Scope

- Spec number collisions between branches; naming specs after issue numbers.
- Migrating existing specs or their task issues.
- Trackers other than GitHub Issues.
- A GitHub Action that syncs issues; skills sync for now.
- Changing the CI alignment check.

## Tasks

1. `to-spec`: push the branch and open or reuse the spec issue at draft, the `Issue:` line, labels, acceptance by label, candidates as issues, and the sync with its hand-edit check.
2. `to-tasks` and `build`: tasks only in the spec's Tasks section, sub-issues for owned tasks, sync on ticks, one pull request with `Closes #N` (blocked by 1).
3. `ship`: the `accepted` label gate, sync at merge with the default-branch link, abandoned specs (blocked by 1, 2).
4. `board`: an open branch alone is not Building; spec issue links and pull requests that close them; candidate issue cards; labels as status with a mismatch marker; dropped specs hidden; labels and close reason in the GitHub read; skill text and tests (blocked by 1).
5. Docs: glossary (Spec, Candidate spec, Delivery mode), `PRODUCT.md` default durable docs, methodology, `docs/skills.md`, the spec and decision indexes, status lines of the decisions 0029 amends (blocked by 1–4).
