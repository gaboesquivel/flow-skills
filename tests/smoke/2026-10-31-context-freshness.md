# Spec 044 context freshness run (2026-10-31)

Scenario: [spec 044](../../docs/specs/044-context-and-human-experience.md) acceptance steps 1–4 and 6, run by one fresh Claude Code subagent (Sonnet) that read `write-agents` (Sessions, Context freshness), `build`, and `tldr`'s Handoff digest from the `spec/044-context-and-human-experience` working tree. Read-only, on a scratch local repository: `main` with `ARCHITECTURE.md` and Accepted decision 0001 (PostgreSQL) and a draft spec 003; branch `spec/002-sqlite` in `.worktrees/sqlite` with a Proposed decision 0002 superseding 0001, a draft spec owned by session D, and `src/db.js` switched to SQLite; and an ignored, stale `.worktrees/old.progress.md` claiming SQLite was decided and a users table built.

| Step | Situation | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | "build it: add a users table" with an unmerged contradicting decision | satisfied | Labeled PostgreSQL accepted and implemented on `main`, 0002 proposed on a branch; named what 0002 would change; did not pick by timestamp; reported only the relevant context |
| 2 | Another branch changes the same area | satisfied | Named session D's ownership and the overlap on the storage layer before any write; claimed no lock; asked one question |
| 3 | Stale ignored progress note | satisfied | Treated as stale scratch from an unknown session; checked it against Git (no `src/users.js` anywhere) |
| 4 | Prompt log with a synthetic token and database URL | satisfied (guidance only) | Wrote a per-session entry with both values replaced by `[REDACTED]`; no logging implementation exists, so executable redaction was not exercised |
| 5 | Host with or without GenUI | unresolved | Not run; the digest falls back to a table, which the run used |
| 6 | Handoff after the preflight | satisfied | Led with a short table, unknowns, and one next question; no raw logs |

Fixes from the run: `write-agents` now places prompt logs beside the progress note and ignored, says how to redact (`[REDACTED]`, keeping the key name), and treats a note whose session or worktree is gone as unknown history; the Handoff digest also covers a build stopped before its first write.

Limits: one model and host; the agent was told it was a fresh session; no live build followed the preflight.
