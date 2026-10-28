# 0029 — One issue and one pull request per spec

Status: **Proposed** (2026-10-28). Amends [0026](0026-process-depth.md) (candidate specs as files), [0027](0027-progress-board-skill.md) (the board reads task issue numbers from headings), and [0028](0028-build-and-ship.md) (acceptance lives only in the spec file). Spec: [018](../specs/018-spec-issues.md).

## Context

In pull-request mode a spec lands through its own pull request before any work, and `to-tasks` opens one issue per task. Spec 017 produced two pull requests and six issues for one bet. On GitHub, planned work is expected to be an issue that people can read, discuss, and see closed by the pull request that delivers it. Flow also keeps context in the repository so agents can read it without a tracker, and local mode has no tracker at all.

## Decision

1. **One pull request per spec.** The spec file is written on the feature branch and merges with the work. A spec never lands alone.
2. **One issue per spec in pull-request mode.** `to-spec` opens it at draft. Its body is a copy of the spec file, written only by skills, from the file to the issue. A hand-edited body is detected and the user is asked before it is overwritten.
3. **The file is the source of truth** for the spec's text and tasks. Tasks live in the spec's Tasks section; sub-issues only for tasks with their own owner.
4. **Labels carry state.** `candidate`, `draft`, `accepted`. In pull-request mode the `accepted` label is the gate; the file status follows it. This is the only state that flows from the issue to the file.
5. **Candidates are issues only** until fleshed out.
6. **Local mode is unchanged.**

## Rationale

The issue gives teams and contributors the GitHub-native view of planned work; the file keeps the spec reviewable in the diff, readable by agents without a tracker, and working in local mode. Copying the whole spec rather than linking survives branch deletion and lets people read without opening the repository. Labels suit acceptance because GitHub restricts who can set them. Matt Pocock's skills keep the spec only in the tracker; Flow keeps the file because intent should stay in the repository.

## Alternatives

- **Spec only as an issue** (Pocock). Rejected: agents need tracker access to read intent, issue edits have no diff review, and local mode loses specs.
- **Spec only as a file, one issue per task** (current). Rejected: spec-only pull requests and an issue per task are noise, and the spec is invisible on GitHub until it merges.
- **Issue links to the file without a copy.** Rejected: the link breaks when the branch is deleted, and readers must open the repository.
- **Two-way sync.** Rejected: two editable copies drift; only acceptance crosses back.

## Consequences

- The issue and the file can still drift when someone edits the file outside the skills. Kill criterion: within three specs, an issue and its file disagree and someone acts on the wrong one.
- Drafts are public on public repositories from the moment they are written.
- Spec numbers can collide between branches; deferred.
- Existing specs and task issues stay as they are.
- The board reads issues as well as git in pull-request mode: candidate issues become cards, labels count as status, and an open branch alone no longer means Building. Git still decides Building and Shipped.
