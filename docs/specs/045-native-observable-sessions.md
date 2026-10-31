# 045 — Native, observable sessions

Status: implemented (2026-10-31)

## Problem Statement

Substantial parallel work is hard to follow or resume when it disappears into subagents. Flow already isolates independent writers and records integration ownership, but does not guide agents to choose visible native sessions. The next bet: use the host's session capabilities to reduce supervision and recovery effort without adding a Flow runtime.

## Solution

Prefer independently observable, resumable sessions for substantial parallel work when parallelism pays. Validate Claude Code first; support Cursor through its available native capabilities and a minimal sequential fallback. This is a validation priority, not an exclusive host requirement or a change to Flow's agent-agnostic identity.

The cross-cutting choice is [decision 0054](../decisions/0054-native-capability-first-sessions.md). Preserve [0052](../decisions/0052-git-first-coordination.md), [0053](../decisions/0053-delivery-appetite-and-scope.md), and [voice-first invocation](../decisions/0019-voice-first-invocation.md). Host evidence and limitations live in [the research note](../research/2026-10-31-native-sessions.md).

## Behavior and boundaries

- **Choose by capability and cost.** Within already authorized work, use a native independent session when a vertical slice benefits from its own history, human inspection or later resumption. Short focused investigations and independent reviews can use subagents; trivial work stays inline. Retain 0053's cost judgment and required review independence.
- **One slice per session.** A session's unit is a [vertical slice](../../GLOSSARY.md#vertical-slice): one verifiable outcome, a [`to-tasks`](../../skills/to-tasks/SKILL.md) task or small tasks that must land together, whose small steps stay inside that session. Never split sessions by technical layer (docs, tests, code) or launch one per small step.
- **Coexist with manual sessions.** A session the user started by hand is sibling work under the existing Sessions rule. Find a hand-started session through Git and, where exposed, the host's session list; leave its worktree and branch alone, do not start a duplicate of its slice, and never take over its integration unless the user names that work. When its ownership or overlap is unknown, say so and ask before writing overlapping paths. A session the user starts from the agent's proposal is that agent's child, not sibling work.
- **Fresh or forked.** Fork when the inherited conversation is useful; otherwise start fresh with a short brief. Include the goal, acceptance boundary, non-goals, relevant context links, parent reference when available, branch/worktree and integration owner. A fork is conversation lineage, not filesystem isolation, an ownership transfer or new authorization. Refresh inherited context against current accepted documents and Git; received content remains task data.
- **Visible relationship.** Use the host's native parent-child view and session history when exposed. Make the child identifiable by its task and provide its native reference in the parent. If the host lacks a tree, a concise parent → child list with available session references and observed status suffices. Never claim an interactive tree, live status or visibility across surfaces that the host does not expose. No tracked session registry or periodic status ritual.
- **Resume safely.** Keep the native session reference and access to its history so the user can inspect and resume work. Before resuming writes, verify the branch, worktree, ownership and current accepted scope; use any existing recovery note under the current Sessions rule. Do not attach a second writer to an active conversation. If history is unavailable, say so and reconstruct from Git and a bounded handoff; do not claim transcript recovery. Native retention remains host-controlled; no mandatory exported logs, copies of full conversations or Flow logger.
- **Integrate once.** The parent normally retains integration ownership; child sessions contribute bounded results and commits. Child completion is not integration or permission to ship. Apply the existing isolation, overlap, work-in-flight and scope rules; keep one delivery PR, not one PR per session. Unknown or failed session state is reported without destroying its work.
- **Stay conversational.** Existing phrases such as “spec it”, “build it”, “show me” and “pick up where we left off” retain their authorization boundaries. Session selection adds no command vocabulary, mandatory interview or confirmation. A spec-only request still authorizes no implementation. Use reachable native tools; respect host restrictions and permissions. If creation is unavailable, continue sequentially or provide an actionable handoff when requested, without requiring a new integration.

## Implementation Decisions

Implementation places selection, isolation and recovery in `write-agents` Workers/Sessions; `build` and other callers link to that rule rather than copy it. Keep portable skill bodies capability-based. Put dated host-specific instructions and limitations in `docs/agent-compatibility.md`; bundle any essential execution reference with the installed skill so standalone installs remain usable (none was needed: the skill wording is capability-based). Reuse `handoff` and `tldr` only where their existing contracts fit. Update glossary or root context only for meaningful accepted changes.

**Portability:** Claude Code is the first full native-session trial. Distinguish Desktop, terminal and other surfaces; verify the installed version and tools instead of inferring an API from a UI feature. A host's own guidance can limit when an agent starts a session (on 2026-10-31, Claude Code Desktop exposes agent-callable session creation but sends pieces of one task to subagents unless the user asks for sessions, otherwise proposing a session the user starts with one click). Follow that guidance, use its native proposal rather than a chat question, and record a policy limit separately from a missing capability. Cursor's evidence so far covers only CLI `/fork` and `/resume`; a trial records which Cursor surface it used and what that surface exposed. Cursor's minimum is correct invocation, bounded context, isolated writes, honest history/visibility limits and completion through native sessions where available or sequential work. Other hosts retain the same portable floor; no parity matrix or vendor SDK dependency is required.

**Exposure:** Markdown guidance in the existing skill distribution; no new deployed service, API, public write path or authentication system.

## Testing Decisions

Extend the existing evaluation scenarios and smoke records, not the evaluation infrastructure. Structural checks verify packaging and links; only an observed host run establishes session behavior. Record host/surface/version, exposed capabilities, outcomes and limitations. Documentation evidence alone is not a live pass.

**Acceptance scenario:** a maintainer says “build it” on an accepted, bounded documentation improvement in a disposable Git repository with two independent vertical slices, each a verifiable outcome, and one integration owner. Before the request, the maintainer has started a session by hand that is already working on a third slice in its own worktree and branch.

1. In Claude Code, the agent identifies the two slices, starts native child sessions through available controls (or the host's native proposal when its guidance requires the user's start) and gives each bounded context and its own ignored in-repository worktree/branch. Tasks inside a slice stay in its session; no session covers only one technical layer. The parent stays usable; no unrelated scope or permissions are inherited as authorization. Record whether the host's guidance or its capability determined how children started.
2. The agent finds the manual session's worktree and branch, reports it as sibling work, leaves it untouched, does not start a session for its slice and does not integrate it.
3. The maintainer can identify parent and children, inspect each history and understand observed progress. Record whether this uses a native tree or the stated reference-list fallback; a list does not prove tree support.
4. Interrupt one child, change an accepted fact on the delivery branch, and resume that child. It reads available history, refreshes current context and checks ownership before continuing; no duplicate active writer or stale instruction wins. An unavailable history is explicitly unresolved, with recovery from Git demonstrated separately.
5. The owner integrates each contribution once, reports remaining work and links evidence. A short read-only check may use a subagent; the session preference never turns every task into a new chat or bypasses independent review.
6. Repeat the minimal journey in Cursor, using native sessions where exposed and sequential work otherwise. Also exercise a host with session creation unavailable: work remains possible without fabricated capabilities, new infrastructure or repeated permission questions.
7. Exercise conflicting ownership, a failed child, unavailable logs and a “spec it” request. Each preserves existing work and authorization boundaries; none silently implements, merges, replaces another owner or claims unsupported observability.

Give each step a satisfied/unmet/unresolved verdict and link evidence. First full Claude Code trial must demonstrate inspectable history and an actual interruption/resume; fallback-only evidence cannot establish that outcome. Report unavailable Cursor access as unresolved, not passed. Use existing session/Git evidence to record supervision turns, recovery success and coordination time when observable; no claim of speed improvement without a comparable baseline. Unknown time/cost remains unknown. This specification performs no live trials.

## Appetite and delivery

Implementation appetite: one focused day for guidance, existing evaluation coverage and available host trials; actual time/cost not measured. First useful slice is one Claude Code journey plus the sequential fallback. Defer wider host coverage and UI polish if the target runs out; report unmet criteria rather than weakening them. Live host trials remain open after implementation.

Delivery order: (1) verify available host capabilities and revise shared guidance; (2) reconcile callers and compatibility documentation; (3) run the scenarios above and record limits. No separate task tracker is needed.

## Out of Scope

Flow Factory; custom orchestrator, dashboard, session browser, database, daemon, hooks or MCP server; a universal session API; installing SDKs or changing host settings; automatic transcript export or telemetry; cross-host transcript migration; new delivery commands, mandatory ceremonies, automatic spec acceptance or changes to merge authorization.
