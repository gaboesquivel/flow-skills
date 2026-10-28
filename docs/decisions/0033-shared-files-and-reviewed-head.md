# 0033 — Shared files do not move the reviewed head

Status: **Proposed** (2026-10-28). Amends [0032](0032-local-build-lands-ship-verifies.md) (merge only the reviewed head). Spec: [021](../specs/021-demo-findings.md).

## Context

`build` (local mode) and `ship` (pull-request mode) merge only the head the review covered. Some projects require every session to append to a shared file, such as a prompt log, after every prompt. The orchestrator owns those writes, so each append after the review moves the head: either the reviewed-head rule blocks the landing, or the log is committed directly on the default branch, which local mode forbids.

## Decision

The orchestrator commits shared-file appends on the spec branch. A landing merge may take a head beyond the reviewed SHA when every commit after the reviewed SHA changes only the project's declared shared files (the files its instructions tell every session to append to). The `Reviewed:` trailer, or the pull request's recorded review, keeps the reviewed SHA. Any other change after the review needs a new review. Nothing is committed directly on the default branch.

## Alternatives

- **Re-review after every append.** Rejected: one log line would cost a full review.
- **Leave shared files uncommitted until after landing.** Rejected: the log is lost between sessions and lands outside any reviewed unit.
- **Commit shared files directly on the default branch.** Rejected: it breaks local mode's single reviewed merge into `main`.

## Consequences

- Reviews never block on log lines, and the trailer stays truthful.
- A file wrongly declared as shared would bypass review, so only files the project's instructions name qualify.
