# 042 — Git-first coordination and delivery ownership

Status: **draft** (2026-10-31)  
Repository: `gaboesquivel/flow-skills`  
Priority: **P0 — first**  
Dependencies: none; preserve accepted safety and governance requirements.

## Problem

The maintainer's Signal retrospective reported coordination failures between manually started and delegated coding sessions: ambiguous branch ownership, worktree collisions, unintegrated work, duplicated PR/CI cycles, confused GitHub issue state, and loss of relevant decisions. An agent that reads only its own session can unintentionally contradict sibling work. Flow must remain simple, Git/Markdown-first, portable, and usable without Flow Factory.

## Outcome

A developer can run independent Claude Code, Codex, and Cursor sessions on one Git repository with predictable work ownership and clear recovery. Agents automatically *inspect* available local Git state at consequential checkpoints, surface relevant sibling activity, and never claim strong concurrency guarantees that Git cannot provide. GitHub-connected projects use existing issue/PR and branch-protection mechanisms without mirroring the same spec into multiple records.

## Scope and constraints

- No database, daemon, always-on MCP service, required hooks, custom scheduler, new skill, or dependency on Factory in Flow Skills.
- Git is authoritative for code and delivered state. Tracked `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `GLOSSARY.md`, specs and accepted decisions convey durable intent. A short `AGENTS.md` routes relevant context; never duplicate facts.
- Local Git worktrees/branches and GitHub PRs are *evidence* of sibling work, not guaranteed live locks. A stopped or uncommitted session might be invisible. Report unknowns honestly.
- Each independent writer should use an isolated worktree/branch where supported; the manual seven-session case must not assume a central controller. Before writing shared files, check existing worktrees, branch heads, uncommitted changes accessible in the local checkout, applicable PRs and overlapping scopes. Avoid editing or deleting others' worktrees.
- Default worktree location is an ignored `.worktrees/` directory inside the project repository. Verify ignore coverage before creation. If host isolation cannot honor that boundary, use explicit Git worktrees or sequential execution; do not silently create sibling folders. Never switch branches in another session’s checkout.
- Discover ownership from worktree paths, branch/spec references and existing PR descriptions. Record the delivery branch and integration owner in the spec’s active execution note, or the existing PR description, not both. An owner is a session role, not private personal metadata. Missing or conflicting ownership is unknown; inspect before overlapping writes and serialize unresolved ownership. This is advisory and cannot atomically prevent simultaneous claims.
- One integration owner per delivery unit; workers contribute commits/patches, not competing merges. Prefer one coherent PR for a bounded delivery unit, not one PR per task/worker/wave. Integrate only owned changes; verify branch containment/patch equivalence and report any stranded work.
- GitHub governance is already implemented in `start` and decision 0050. **Audit and reuse it, do not recreate it.** Protected main, squash-only, required checks (correct names per repository), no bypass or self-approval, no forced push, no weakening of security gates, and no merge while required checks are pending or failing. A change to these rules requires explicit authorization.
- Issues and sub-issues open only on user request, preserving current policy. Reference an existing issue when relevant; the PR links the spec and closes a user-named issue. Never mirror the spec into an issue or create issues per session, worker or task.
- Local, Git-ignored `progress.md` per worktree/session is optional recovery scratch, never an authoritative project spec. If using prompt/event logs, write separate per-session files and redact secrets before any persistence. No concurrent appends to a shared tracked `prompts.txt`.
- Flow Factory may later provide *strong* coordination and enforcement; Flow Skills must not suggest it already guarantees conflict prevention.

## Required skill changes

- `write-agents`: canonical short rules for ownership, Git inspection, portable fallbacks, independent workers; distinguish parallel *possibility* from economic desirability.
- `build`: preflight ownership/conflicts; deliberate task-to-worktree assignment; single integrator, no orphaned branches; checks on the exact final head; clear status on partial work. Inspect before editing shared paths. Keep user-directed phrases (`push it`, `build it`, `ship it`) stable.
- `ship`: refuse conflicting, unintegrated, unverified or protected work; do not merge merely because work is nearly complete; report landing and actual liveness.
- `to-spec` / `to-tasks`: separate tracked outcomes from tasks, decisions and issues; avoid requirement for issue-per-task or PR-per-worker.
- `flow` / `start`: point to adopted conventions, keep Flow block short, verify existing governance preset and explain limitations; never write a new state registry.
- `board` (if useful): display known Git/PR progress and pending conflicts without adding a state store; explicitly show 'unknown' rather than invent a live agent roster.
- Human docs: `docs/methodology.md`, `docs/README.md`, `docs/skills.md`, and relevant decision back-pointers. No duplicate policy paragraphs across every skill.

## Acceptance scenario

1. In a repository with a main branch and two existing worktrees, a new Claude/Codex session identifies already-owned work and its overlapping paths *before* starting a conflicting write; unknown uncommitted work is explicitly qualified.
2. Two independent writers can work on separate areas; each gets a branch/worktree, integrates only its commits, and creates no redundant task PR.
3. A simulated worker stops with uncommitted files and an unmerged branch; the integration agent reports the exact unfinished work and does not clean it up or claim success.
4. No issue is created without a user request; an existing relevant issue can be referenced; no mirrored spec text, gratuitous sub-issues or forced issue creation for a simple fix.
5. CI fails or is pending on a required head: `ship` stops, no protection bypass, and output names what is required.
6. Without GitHub, the same behavior works with local Git and Markdown; without Factory, the workflow still functions with explicitly best-effort concurrency awareness.

## Not in this spec

Factory runtime coordinator, SQLite, MCP Agent Mail integration, automated host hooks, global issue/decision registry, dynamic lock service, broader template rollout, and reworking all CI systems. They belong to separate projects/bets.

## Implementation decisions / references

Existing accepted foundations: decisions 0029, 0037, 0042, 0044, 0048, 0050; `skills/build`, `ship`, `write-agents`, `to-spec`, `to-tasks`. Preserve the current branch-safety invariants and review their effective amendments rather than treating older historical statements as operative.

## Tasks

- [ ] 01: Establish ownership, discovery and recovery in portable delivery skills and this repository's maintainer entry points. **Area:** skills, repository root, docs. **Blocked by:** none. Proof: a fresh session identifies its base, worktree, delivery owner and possible overlap without claiming a lock.
- [ ] 02: Exercise integration and interruption recovery. **Area:** skills, tests, docs. **Blocked by:** 01. Proof: separate writers preserve each other's work; stopped work remains recoverable; pending CI never becomes passing.

## Decision and acceptance

Proposed decision: [0052](../decisions/0052-git-first-coordination.md). Publishing this draft does not accept that decision. Accept it with implementation, update only the affected historical status lines/index entries, and align current owning docs. Preserve 0048's build/ship semantics.

## Deliverables and proof

One implementation PR, including portable skills and the maintainer guidance needed to dogfood them. Use one bounded two-session coordination exercise covering overlap and interrupted work. Add deterministic fixtures only for executable behavior; prose assertions do not prove host behavior. Follow repository check policy, and record actual evidence and limitations. No mandatory no-skill comparison or cross-host matrix; spec 041 remains the home for optional evaluation.

Fresh sessions must read the updated working-tree source. Adopters must explicitly update their installed/pinned Flow version; this repository's merge does not update other projects. Validate one adopter installation when available, otherwise report that rollout as unverified. Broader starter rollout is separate.

## Evidence boundary

The reported failures come from the maintainer's [retrospective conversation](https://chatgpt.com/share/6ae5fe22-1cfc-83e8-ad9a-6854ccd06e76). This planning pass did not independently audit Signal logs or GitHub history. Do not present causal claims or time/cost savings as measured findings.
