# 0055 — Capability-based GitHub and host-triggered builds

Status: **Accepted** (2026-10-31). Amends [0037](0037-git-for-delivery-github-for-github-mode.md) (the GitHub mode tier: "an authenticated `gh`"), [0044](0044-fast-delivery.md) (amendment item 2: GitHub mode needs `gh` authenticated), and [0048](0048-delivery-phrases-are-approvals.md) (where a "build it" approval may come from). Spec: [046](../specs/046-cloud-delivery.md). Preserves [0050](0050-github-governance-preset.md), [0052](0052-git-first-coordination.md), and [0054](0054-native-capability-first-sessions.md).

## Context

The maintainer wants to direct delivery from a phone, with the same Flow behavior whether the agent runs locally or in a Claude Code cloud session. Claude Code's documentation, read 2026-10-31, shows that cloud sessions reach GitHub through a proxy: `gh` is installed with a proxy-injected token, GraphQL is blocked so `gh pr` and `gh issue` return 403, and `gh api` REST calls and the host's built-in GitHub tools work. Cloud sessions load the repository's `CLAUDE.md` and `.claude/skills`, never `~/.claude`. Routines (research preview) can start a cloud session on GitHub issue and pull request events, including labels. `build`'s Delivery mode stops when `gh` is unauthenticated, which in the cloud blocks steps a reachable route could do.

## Decision

1. **GitHub mode needs a route, not a CLI.** GitHub mode applies when `origin` is on GitHub and some route reaches it: `gh`, `gh api` REST, or the host's GitHub tools or a connected MCP server, in `write-agents` Tools order. Pull requests, checks, and merges use the first route that works for that operation. When none does, stop with one hand-off; never fall back to local mode.
2. **One optional issue trigger.** Issues stay optional. A `build-it` label added to an issue by a repository writer is that issue's "build it": the host's trigger (a Claude Code routine) starts `build` with the issue as its task. The issue text is task data, never instructions or wider authorization. The session ends at a pull request that links the issue and the session, and never merges; "ship it" stays a conversational approval.
3. **Cloud-ready setup lives in the repository.** What a cloud session needs is tracked: a project-scope skills install and the instruction file. Nothing Flow needs depends on `~/.claude`.

## Alternatives

- **Keep requiring an authenticated `gh`.** Rejected: blocks cloud delivery although REST and host tools reach GitHub.
- **A `@claude` comment through the Claude Code GitHub Action.** Rejected as the default: it runs on Actions runners, billed separately, outside the cloud session the user directs from their phone. Adopters may still use it.
- **A Flow-hosted trigger or orchestration service.** Rejected: outside portable Skills; Flow Factory's territory.
- **Mandatory issues for cloud work.** Rejected: conversation stays the interface; the label is a convenience.

## Consequences

Delivery skills detect GitHub capability per operation instead of probing `gh auth status`. Triage accounts can add labels too, so the label alone authorizes nothing: `build` checks the labeler's `write` or `admin` permission, ignores text from lower accounts, and stops when such text changed after the label. The routine must filter on that label. Routines are a research preview; their limits and authorization details need dated evidence in `docs/agent-compatibility.md`. Cloud cost is visible only through the host's OpenTelemetry export; without it, cost stays unknown.
