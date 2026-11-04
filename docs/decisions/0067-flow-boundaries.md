# 0067 — Flow boundaries: plugin, starters, scripts, host

Status: **Accepted** (2026-11-03). Spec: [066](../specs/066-flow-boundaries.md). Amends [0022](0022-start-runs-explore.md) and [0024](0024-gated-hand-offs.md) (`explore` runs beside `start` only when the request describes a product), [0026](0026-process-depth.md) (`flow` no longer waits on a missing brief), and [0051](0051-design-skill.md) (`design` is offered after the initial commit, not the first deployment). Builds on [0062](0062-claude-code-first.md).

## Context

`start` grew into the assumed front door: it waits for a green deployment and always opens discovery. Since 0062, most users meet Flow as a global plugin in a repository that never touched a starter.

## Decision

1. **Four owners.**
   - **Flow plugin:** intent, judgment, specs, delivery principles, and reusable skills. Its value never depends on a starter, `start`, Vercel, or the whole delivery sequence.
   - **Starters:** optional, opinionated technology foundations.
   - **Project scripts:** the authoritative verification commands.
   - **Native host:** sessions, worktrees, delegation, and built-in review.
2. **`start` ends at the initial commit.** It pushes where authorized and reports governance, handing over the one push command when the guard blocks a default-branch push. A deployment is reported if the host shows one, or reported as not connected, never awaited here; "deploy it" connects a host.
3. **`explore` beside `start` is conditional.** It runs when the request describes a product; otherwise `start` offers it once.
4. **`qa` stays in the commit gate.** It measured under ten seconds on both starters (warm store, install scripts skipped, small suites; [limits](../research/2026-11-03-velocity-with-intent.md#limits)), and it is the check that runs the template's code after renaming, beyond `identity_scan`'s text scan.
5. **Mission and principles carry this.** The mission opens with velocity with intent; principles 4 and 5 state composable skills, what-not-how, and proportional evidence.
6. **Critical thinking is selective.** It applies where a wrong answer is costly: direction changes, consequential uncertainty, and what a person must understand before it ships. It is not a phase.

## Alternatives

- **Drop `qa` for a lighter gate, as the audit proposed.** Rejected on evidence: it would save seconds and lose template-integrity coverage.
- **Remove main-branch CI work in the starters.** Rejected: runs take about a minute on any event, so the saving is negligible and the post-merge signal is lost.
- **Fold `start` into `flow`.** Rejected: 0009 keeps alignment and scaffolding apart.

## Consequences

- Time to start now ends at the initial commit, which measures initialization, not hosting.
- On GitHub with the plugin, the guard stops `start`'s initial push to the default branch, as it always has; the person pushes once. A guard exception is a separate Human-tier change.
- A new project can sit undeployed until "deploy it" or `ship`; that is delivery, and the report says so.
- Starters vendor pinned Flow skills ([0045](0045-templates-pin-flow-skills.md)), which load beside a global plugin. Worth revisiting; not settled here.
