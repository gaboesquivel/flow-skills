# Flow Skills — Architecture

Status: documentation exists; executable architecture is proposed.

## Current structure

The workspace has a short AGENTS.md, three living documents, and supporting documentation under docs/. Product decision history belongs in docs/pdr/; technical decision history belongs in docs/adr/. Temporary work belongs in work/ and user-facing exports in outputs/.

There are no implemented Flow skills, runtime dependencies, configured repository integrations, hooks, or CI checks here yet.

## Proposed capability boundaries

The accepted refinement boundary is one public entry with product, design, and architecture focuses. Focus-specific guidance should load only when needed. Exact packaging, invocation syntax, and internal reference layout remain undecided.

Architecture refinement owns technical constraints, system boundaries, integrations, technology selection, and their tradeoffs. It derives mechanisms from product requirements and design needs, while feeding feasibility findings back into those concerns.

The remaining workflow activities are described in [the workflow](docs/workflow.md). Shared decision handling determines whether and why an established approach should change. Shared alignment checking determines whether product, design, architecture, and implementation agree; neither currently requires a separate public skill.

Each focus updates its owning document when durable choices settle. Changes affecting another concern must reconcile the relevant document too. Feature specifications reference project conventions instead of duplicating them. Significant decisions link their rationale records; routine clarification does not require a record.

A future skill contract should define:

- Trigger and required context, loaded only when needed.
- Inputs and preconditions.
- Artifacts it owns or may update.
- Completion and verification criteria.
- Handoff to another capability, including unresolved assumptions.
- Behavior when a dependency, tool, or source is unavailable.

The implementation format, directory layout for skills, and invocation mechanism are undecided. Names in the workflow describe intended capabilities rather than installed commands.

## Proposed integrations

GitHub Issues would own feature specifications, task status, parent/child relationships, and blocking dependencies. A parent organizes a feature; a blocking relationship controls execution readiness. A parent with implementation children should be treated as coordination work rather than another implementation slice.

Parallel implementation should isolate each worker's branch and worktree, start from the intended integration base, verify before integration, and preserve unresolved work for inspection. Sequential work should add isolation only when useful.

## Alignment mechanisms

The initial mechanism is human and agent review supported by documents. Future layers could include shared alignment logic and mechanical checks for decision metadata and references. Such checks cannot alone establish that an implementation satisfies product intent.

No ADR is accepted yet. Packaging, compatibility, integration behavior, and enforcement remain to be designed and tested.
