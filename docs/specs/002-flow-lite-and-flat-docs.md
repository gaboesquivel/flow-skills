# 002: Flow Lite and flat documentation

Status: implemented (2026-10-27). Authoritative decision: [0006](../decisions/0006-flow-lite-and-flat-docs.md). Catalog remains fourteen skills; [0008](../decisions/0008-leading-words-and-visual-summaries.md) extends `tldr` only.

## Problem Statement

Teams need product understanding to stay current without mandatory workflows, init scripts, or sprawling documentation trees. The old `flow` router added ceremony; ideas and initiatives folders duplicated durable work.

## Solution

Ship a single **`flow`** skill (Flow Lite) for root context alignment, keep thirteen optional manual skills (fourteen total), flatten adopter durable docs to specs and decisions, and archive ideas/initiatives in this repository.

## Acceptance criteria

- `skills/flow/SKILL.md` exists with discoverable metadata and instructions that forbid workflow routing and adopter `AGENTS.md` edits.
- Validator enforces fourteen skills and dual invocation policy (`flow` vs others).
- Contract tests assert Flow Lite boundaries (four root docs named; not a workflow router; no init requirement).
- Active documentation guide excludes ideas/initiatives; archive preserves prior content.
- README includes a simple Mermaid workflow; PRODUCT and contributor docs match the lean direction.

## Implementation decisions

- Archive path: `docs/archive/2026-10-27-ideas-initiatives/`.
- `flow` may link to [implement](../../skills/build/SKILL.md) for implementation-time doc updates without duplicating implement scope.

## Testing decisions

- `pnpm validate` — skill list, invocation metadata, references.
- `pnpm test` — contracts, package tarball, skills CLI listing.

## Out of scope

- Workflow orchestration, self-improvement loops, cross-agent evaluation frameworks.
- `flow-skills-init`, validation-board UI, OMTM automation, mandatory skill sequences.
- Editing adopter `AGENTS.md`, `CLAUDE.md`, or equivalent files.
