---
name: flow
description: Run Flow's lean product development workflow from specification through shipping.
disable-model-invocation: true
---

# Flow

## Purpose

Turn a user request into a small, useful, verifiable software change, maintaining product understanding and traceability without unnecessary ceremony.

## Workflow

Explore → Requirements → Spec → Tasks → Build → Review → Ship → Retro

These are activities, not mandatory gates. Skip unnecessary activities when the work is already understood. Use specialized skills (`explore`, `requirements`, `grill`, `research`, `prototype`, and others) at any stage when they fit.

## Entry

1. Read AGENTS.md and the relevant product, design, and architecture contracts.
2. Inspect relevant code, existing decision records, and issue trackers the project uses.
3. Identify the actual user goal and observable success criteria.
4. Preserve accepted decisions.
5. Resolve only uncertainty that materially affects the work.
6. Choose the smallest useful scope.

Never ask questions already answered by the repository or conversation.

## Explore and requirements

When discovery is needed, use `explore` to understand users, context, and uncertainty. Use `requirements` to capture explicit scope and acceptance criteria before a bounded increment spec. Use `grill` or `grill-with-docs` when focused questioning or terminology work is still required.

## Spec

Establish:

- Problem and intended outcome.
- Target user and job to be done.
- Functional requirements.
- Important constraints and non-goals.
- UX behavior and relevant design references.
- Acceptance criteria.
- Material uncertainties and proposed decisions.

Use PRODUCT.md, DESIGN.md, and ARCHITECTURE.md as canonical product context when present.

For substantial multi-session work, create or update a numbered specification following repository conventions.

Do not create specifications for trivial, already-understood changes.

Do not rewrite an implemented historical specification to describe a new feature. Create a new specification or change record instead.

## Tasks

The task is the only execution unit.

Use the project's canonical tracker (for example GitHub Issues) for multi-session work when one exists.

Split substantial specs into small, independently verifiable tasks. Capture dependencies only where necessary.

Avoid redundant local task systems and unnecessary management hierarchy.

A straightforward change may be implemented directly without a tracker issue.

## Build

Implement the smallest useful increment.

Prefer existing patterns and installed technology skills. Load only the relevant ones.

Match the repository's layout and framework conventions.

Use tests proportionally. Apply the `tdd` skill when practical and meaningful.

Do not begin substantial implementation without clear authorization.

Do not expand scope silently.

## Review

Verify against acceptance criteria.

Use relevant automated checks, the `review` skill when useful, and runtime verification.

Report failures honestly. Never equate passing tests with proven product value.

## Ship

Complete delivery only when explicitly authorized.

Use `/ship` when the user wants the complete test, commit, push, deploy, and verification sequence.

Update relevant product documents only when their information materially changes.

## Decisions

Use numbered decision records under `docs/decisions/` for new consequential choices. See [references/decisions.md](references/decisions.md).

Do not create a decision record for every implementation detail.

Preserve legacy ADR/PDR folders as historical evidence. Do not bulk-migrate or delete them without explicit authorization.

## Collaboration

The user may skip or revisit any activity.

Suggest `/council` only when independent perspectives could materially improve a consequential decision.

Suggest `/retro` when session post-mortems would help; never invoke it automatically.

Explicit activation selects a workflow. Reading linked supporting guidance is permitted within that workflow; it does not authorize a separate workflow or additional mutations. Use available tools or direct file reads rather than requiring a tool named Skill.

## Output

Provide:

- Current activity and status.
- Outcome and material decisions.
- Relevant files and tracker references.
- Verification evidence.
- Remaining risks or blockers.
- One recommended next action.

Report skills actually loaded and actual model identifiers when available.

Never invent execution evidence.
