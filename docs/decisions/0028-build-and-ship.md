# 0028 — Build opens the pull request; ship lands accepted work

Status: **Accepted** (2026-10-28). Amends [0019](0019-voice-first-invocation.md) (ship confirms before pushing), [0021](0021-autonomous-explore-and-ship.md) (one push confirmation per run; merging needs authorization), [0024](0024-gated-hand-offs.md) (ship's plan confirmation and main gate; a yes to the shown text before writing a spec), and [0025](0025-wave-checkpoints.md) (waves move from `ship` to `build`; the deploy target is retired). Spec: [017](../specs/017-build-and-ship.md). Amended by [0029](0029-spec-issues.md) (the `accepted` label is the gate in pull-request mode; one independent review per spec, in `ship`).

## Context

"Ship it" stops twice, for a plan confirmation and a main gate, although users say it once they have decided. "Build it" ends in local changes, while what users want to check is a pull request: CI runs on it and attaches whatever environment the project's pipeline builds. Skills that know about specific deploy platforms add configuration without adding behavior. Nothing marks a spec as reviewed, so nothing separates work that is ready to land from a draft.

## Decision

1. **"Build it" ends in a pull request with green checks.** `implement` is renamed `build`. It implements from a spec's tasks or from the request, opens a pull request, and waits for its checks, running fix rounds on failures. It reports the pull request, the check results, and the links CI attached. On a task set it runs the waves and checkpoints from 0025; checkpoints report the pull request's checks and links and do not wait unless asked. In local mode, build runs the local check suite on a branch instead. No confirmation; build never pushes `main`.
2. **Spec acceptance.** Specs gain the status `accepted` (`candidate → draft → accepted → implemented`). `to-spec` writes the spec file as `draft`, and any decision proposed beside it as **Proposed**, without showing the text inline or asking first; it reports links to the files. When the user approves a spec for delivery, `to-spec` sets the spec to `accepted` and its linked decisions to **Accepted**.
3. **"Ship it" lands work with no confirmation.** For spec work, ship first requires an `accepted` spec and **Accepted** linked decisions; otherwise it names what is missing and stops without building. It then builds if no pull request exists, runs an adversarial five-axis `review` with a separate worker, posts the review on the pull request, runs up to two fix rounds, waits for green checks, sets the spec to `implemented`, merges, deletes the head branch, and fast-forwards local `main`. In local mode it merges with `--no-ff` and pushes `main`.
4. **Hotfixes.** Work with no spec and no task ships through the same cycle. The review also judges whether the change is hotfix-sized: new product behavior, a data-shape or public API change, or a migration is a blocking finding, and ship stops and suggests `to-spec`.
5. **The review is the gate.** Ship merges only when checks are green, no findings are blocking, and branch protection is satisfied. The agent never approves its own pull request and never bypasses protection (for example `gh pr merge --admin`). When protection requires a human approval, ship stops and reports. Without a separate worker, the review is labelled single-agent on the pull request and still gates.
6. **No deploy target.** The Flow block drops `Deploy:`. Environments are the pipeline's job; skills read what the pull request shows.
7. **Chained skills.** `ship` runs `build` and `review` as part of landing, beside the automatic hand-offs 0024 lists.
8. **Unchanged.** No destructive Git, no force-push, no production promotion unless asked; publishing task records still needs a yes to the shown list (0024).

## Rationale

The human review moves to where it carries information: the spec and its decisions, before any code. A draft file is cheap to write and easier to read than inline text, so the yes belongs to acceptance, not to saving. Once those are accepted, "ship it" is the authorization, and an independent review with green checks is a stronger gate than a yes to a summary. Misheard dictation is bounded: build never pushes `main`, ship refuses unaccepted specs, and a stray ad-hoc change must pass the hotfix test. Reading the pull request instead of a platform keeps skills working on any CI/CD.

## Alternatives

- **Keep only the main gate.** Rejected: "ship it" should finish.
- **Treat a saved spec as reviewed.** Rejected: drafts are saved to be read, not to be landed.
- **Keep the yes before saving a spec.** Rejected: it duplicates acceptance and makes the user review long text inline.
- **Approve through a bot identity.** Deferred: it needs setup in every project, and the posted review carries the same evidence.
- **Keep `Deploy:` for checkpoint previews.** Rejected: the pull request already shows the pipeline's links.
- **Keep the name `implement`.** Rejected: the spoken verb and the skill name would differ.

## Consequences

- Local mode pushes `main` with no human yes; it relies on spec acceptance, checks, and review.
- Existing `Deploy:` lines are dropped the next time the block is rewritten.
- Adopters keep a stale `implement` skill until they reinstall; the release notes say so.
- The board treats `accepted` as a known status, and its live run overlay is recorded by `build`.
