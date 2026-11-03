# 0067 — Flow boundaries: plugin, starters, scripts, host

Status: **Accepted** (2026-11-03). Spec: [066](../specs/066-flow-boundaries.md). Amends [0022](0022-start-runs-explore.md) (`explore` runs beside `start` only when the request describes a product) and [0051](0051-design-skill.md) (`design` is offered after the initial commit, not the first deployment). Builds on [0062](0062-claude-code-first.md).

## Context

`start` grew into the assumed front door: it waits for a green deployment and always opens discovery. Since 0062, most users meet Flow as a global plugin in a repository that never touched a starter.

## Decision

1. **Four owners.**
   - **Flow plugin:** intent, judgment, specs, delivery principles, and reusable skills. Its value never depends on a starter, `start`, Vercel, or the whole delivery sequence.
   - **Starters:** optional, opinionated technology foundations.
   - **Project scripts:** the authoritative verification commands.
   - **Native host:** sessions, worktrees, delegation, and built-in review.
2. **`start` ends at the initial commit,** pushed where authorized and with the governance report. A deployment is reported if the host already shows one, never awaited or connected here.
3. **`explore` beside `start` is conditional.** It runs when the request describes a product; otherwise `start` offers it once.
4. **`qa` stays in the commit gate.** Measured at under ten seconds on both starters, it is the one check that catches rename damage across the template.
5. **Critical thinking is selective.** It applies where a wrong answer is costly: direction changes, consequential uncertainty, and what a person must understand before it ships. It is not a phase.

## Alternatives

- **Drop `qa` for a lighter gate, as the audit proposed.** Rejected on evidence: it would save seconds and lose template-integrity coverage.
- **Remove main-branch CI work in the starters.** Rejected: runs take about a minute on any event, so the saving is negligible and the post-merge signal is lost.
- **Fold `start` into `flow`.** Rejected: 0009 keeps alignment and scaffolding apart.

## Consequences

- Time to start now ends at the initial commit, which measures initialization, not hosting.
- A new project can sit undeployed until "deploy it" or `ship`; that is delivery, and the report says so.
- Starters vendor pinned Flow skills ([0045](0045-templates-pin-flow-skills.md)), which load beside a global plugin. Worth revisiting; not settled here.
