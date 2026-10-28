# 0029 — Spec issues and fast parallel builds

Status: **Accepted** (2026-10-28). Amends [0025](0025-wave-checkpoints.md) (waves and per-wave reviews), [0026](0026-process-depth.md) (candidate specs as files), [0027](0027-progress-board-skill.md) (the board's stages and overlay), and [0028](0028-build-and-ship.md) (acceptance lives only in the spec file; reviews in both build and ship). Spec: [018](../specs/018-spec-issues.md).

## Context

In pull-request mode a spec lands through its own pull request before any work, and its task issues have no parent. On GitHub, planned work is expected to be an issue that people can read, discuss, and see closed by the pull request that delivers it. Flow also keeps context in the repository so agents can read it without a tracker, and local mode has no tracker at all.

Issues, sub-issues, and waves exist for speed: parallel work, automated review, automatic merge. The gates around them serialize it: 3 workers at most, wave barriers, a review worker per task, a review per wave, a CI wait per checkpoint, and reviews in both `build` and `ship`. Tests sleep on real timers and pin skill wording.

## Decision

1. **One pull request per spec.** The spec file is written on the feature branch and merges with the work.
2. **One issue per spec, tasks as its sub-issues** in pull-request mode, with native blocking links. The spec issue's body is a one-way copy of the file, written only by skills; a hand-edited body is detected and the user is asked before overwriting.
3. **The file is the source of truth** for the spec's text; its Tasks section is a checklist of the sub-issues.
4. **Labels carry state:** `candidate`, `draft`, `accepted`. In pull-request mode the `accepted` label is the gate; the file status follows it. Candidates are issues only until fleshed out.
5. **Build runs the frontier:** every unblocked task starts at once, up to the host's limit, with no wave barrier.
6. **Test once at each level:** workers test what they changed, the orchestrator runs the full local suite per integration, and CI is waited on only for the final pull request.
7. **One independent review per spec,** in `ship`, gating an automatic merge.
8. **Tests never wait on real time,** and smoke contracts cover safety rules only.
9. **Local mode** keeps files only.

## Rationale

The issue and its sub-issues give teams and contributors the GitHub-native view of planned work and give parallel workers a frontier to pull from; the file keeps the spec reviewable in the diff, readable by agents without a tracker, and working in local mode. Copying the whole spec rather than linking survives branch deletion. Labels suit acceptance because GitHub restricts who can set them.

Every gate exists to catch defects before merge, and the final review and CI on the whole change catch the same defects once. Repeating them per task and per wave multiplies cost without adding a different check, and waiting on CI between integrations turns parallel work back into a queue. The safety rules (default branch, force-push, approval, acceptance) stay pinned because a mistake there is costly to reverse; wording is not.

## Alternatives

- **Spec only as an issue** (Matt Pocock's skills). Rejected: agents need tracker access to read intent, issue edits have no diff review, and local mode loses specs.
- **Spec only as a file with free-standing task issues** (current). Rejected: spec-only pull requests, and the spec is invisible on GitHub until it merges.
- **Tasks only as a checklist in the spec issue.** Rejected: parallel workers need claimable units with blocking links; sub-issues give that natively.
- **Keep waves with a higher worker limit.** Rejected: a wave barrier still idles workers whose blockers are done.
- **Keep per-task review workers.** Rejected: the final review sees every task's change in context, and per-task reviews produced a fix commit per task without changing the outcome.

## Consequences

- The issue and the file can drift when someone edits the file outside the skills. Kill criterion: within three specs, an issue and its file disagree and someone acts on the wrong one.
- A defect a per-task review would have caught now surfaces later, in the final review or CI, with a larger fix round. Kill criterion for speed: the final review on two specs in a row needs both fix rounds and still blocks.
- Drafts and tasks are public on public repositories from the moment they are written.
- Spec numbers can collide between branches; deferred.
- The board reads issues as well as git in pull-request mode, and its overlay shows frontier states instead of waves.
- Existing specs and task issues stay as they are.
