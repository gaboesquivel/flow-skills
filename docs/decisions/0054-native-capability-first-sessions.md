# 0054 — Native capabilities before Flow machinery

Status: **Accepted** (2026-10-31). Spec: [045](../specs/045-native-observable-sessions.md). Extends [0017](0017-claude-code-skill-coexistence.md), [0052](0052-git-first-coordination.md) and [0053](0053-delivery-appetite-and-scope.md); preserves portable distribution and existing authorization boundaries.

## Context

Independent sessions already have isolation and ownership rules. Their execution surface still matters: substantial delegated work needs to be inspectable and resumable without introducing Flow Factory into Flow Skills.

## Decision

Prefer native observable sessions for substantial parallel work when their benefit exceeds coordination cost. Keep subagents for short focused tasks and independent review, and direct/sequential execution as the portable fallback. Flow owns intent and integration conventions; the host owns session execution, presentation and history.

Prioritize Claude Code for validation and examples, with minimal Cursor compatibility and a portable floor for other hosts. This priority does not select an installation default, require Claude, or put vendor APIs in portable skill bodies. Use the strongest capabilities actually exposed by the current surface; a native fork does not establish worktree isolation or a visible session tree.

## Alternatives and rationale

- Always use subagents: convenient but does not address supervision and recovery of substantial work.
- Require identical features on every host: delays useful native behavior and encourages a universal abstraction.
- Build a Flow session controller or dashboard: exceeds Skills' scope and duplicates host responsibilities.
- Require a new session for all work: adds cost and ceremony without benefit for short tasks.

## Consequences

Host-specific behavior needs dated evidence and honest fallbacks. Native history and session relationships assist recovery but never replace Git and accepted documents. No runtime dependency or tracked session registry is introduced. A session's unit is a vertical slice, and sessions the user starts by hand stay sibling work under [`write-agents` Sessions](../../skills/write-agents/SKILL.md#sessions). A host's own guidance on when an agent may start sessions wins over this preference.
