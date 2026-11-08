# 004 — Match suggestions on one board

Status: draft (2026-11-01).

## Problem

Submitters on the Roadmap board file duplicates because they never see similar requests.

## Solution

Show up to three similar requests as the submitter types, on the Roadmap board only.

**Outcome:** We want fewer duplicate submissions on the Roadmap board without suppressing genuinely new requests; we'll look at which suggestions were shown and accepted, plus a manual review of 50 posted requests and 50 declined suggestions after two weeks, and it informs whether to keep, tune, or expand matching to other boards.

## Decisions

- [0002](../decisions/0002-suggestion-logging.md) (Proposed): log each shown and accepted suggestion with the request id, kept 30 days.

## Acceptance

**Acceptance scenario:** a submitter on the Roadmap board types "dark mode for the editor" while "Editor dark theme" exists.

1. The suggestion appears within 200 ms and shows "Editor dark theme".
2. Upvoting it records an accepted suggestion; posting anyway records a declined one.
3. The log query `suggestions_by_outcome` returns shown, accepted, and declined counts for the board.

## Out of Scope

Automatic merging, other boards, a dashboard.
