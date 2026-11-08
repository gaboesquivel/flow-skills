# 0002 — Log suggestion outcomes

Status: **Proposed** (2026-11-01). Spec: [004](../specs/004-match-suggestions-one-board.md).

## Decision

Log each shown, accepted, and declined suggestion with the request id, kept 30 days, so the outcome can be judged.

## Consequences

A new table with 30-day retention; no personal data beyond the request id.
