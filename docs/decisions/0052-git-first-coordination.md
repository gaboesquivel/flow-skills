# 0052 — Git-first, best-effort coordination

Status: **Accepted** (2026-10-31). Spec: [042](../specs/042-git-first-coordination.md). Amends [0044](0044-fast-delivery.md): amendment item 5 (independent-session ownership and worktree boundaries) and its amendment of [0038](0038-direction-changes-are-confirmed-and-recorded.md), which dropped the scan of unmerged branches (targeted sibling inspection returns at consequential writes). Preserves [0048](0048-delivery-phrases-are-approvals.md) and [0050](0050-github-governance-preset.md).

## Context

The maintainer's retrospective reports collisions and stranded work across independent sessions. Existing worker rules primarily describe a main thread and its delegated workers. Manually launched sessions need discoverable ownership and recovery without requiring Flow Factory. These are reported observations, not a new quantitative audit.

## Decision

Keep Flow Skills portable and Git/Markdown-first: no coordination database, daemon, required hooks or MCP service. Independent writers use separate branches/worktrees, defaulting to an ignored directory inside the repository. Do not silently create sibling folders when host isolation chooses another location; use explicit worktrees or sequential work.

Each delivery has one integration owner. Record the branch and owner role once, in the spec's execution note or existing PR description. Inspect relevant local worktrees, branch/spec references and available PRs before consequential overlapping writes and integration. Missing or conflicting ownership is unknown; serialize unresolved overlap. Do not perform exhaustive historical scans.

Git evidence and ownership notes are advisory, not atomic locks or a guaranteed roster. Preserve unfinished work; prove integration through containment or patch equivalence before cleanup. Maintain the existing issues-on-request policy and one coherent implementation PR per spec. Factory may supply stronger coordination separately.

## Rationale

This extends the existing delivery contract to independent sessions while keeping setup, context and runtime cost low. Explicit uncertainty is preferable to claiming that branch inspection prevents all races.

## Alternatives

- A shared database, service or lock manager: stronger enforcement, but outside portable Skills and better owned by Factory.
- A tracked live-session registry or shared progress log: another source of truth that itself races and becomes stale.
- Branches without isolated checkouts: branch switching and shared index writes remain hazardous.
- Always sequential work: safe fallback, but forfeits useful independent work.

## Consequences

Users can coordinate across hosts without a new service, but simultaneous discovery can still race and disconnected sessions may be invisible. Unresolved overlap must serialize. Dogfooding must update maintainer routing as well as portable skills; adopters must update installed versions explicitly.

On acceptance with 042, update affected historical status lines/index entries and current owner docs in the same change; never rewrite historical decision bodies.
