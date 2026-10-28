---
name: to-spec
description: Turn the current conversation into a numbered draft specification using project conventions, and accept it when approved. Use when the user says "spec it", "write a spec", "turn this into a spec", or "accept the spec".
disable-model-invocation: false
---

# To Spec

Turn conversation context and repository understanding into a proportionate specification. Do not run a separate interview; synthesize what is already known and label unresolved assumptions rather than inventing decisions. Keep consequential assumptions visible.

Use the project's existing spec location when one exists. When the project has no convention, default new work to `docs/specs/NNN-short-name.md` (three-digit sequence, kebab-case slug) and follow the same pattern for updates. Preserve existing numbering, labels, and trackers when the repository already uses them.

**Spec, tasks, decision** (decision 0026). A spec is one bet: it tests one assumption and ships as one unit. Its tasks are the slices inside it, so a spec may be large. Work that only makes sense after seeing how another bet did gets its own spec. A choice gets a decision record in `docs/decisions/NNN-short-name.md` only when it chose among real alternatives **and** reaches beyond this spec or is costly to reverse; otherwise it belongs in the spec's Implementation Decisions. Never put feature scope or tasks in a decision record. When a spec makes a choice that passes the test, write the record beside the spec with status **Proposed** and link it from the spec.

Specs may cover product, research, marketing, engineering, operations, or cross-functional work. Use the sections below only when they fit the discipline; omit irrelevant headings. Keep small, understood changes brief.

**Candidate specs.** A later bet that should not be specified yet gets a stub: status `candidate`, the problem, and the assumption it tests. Flesh it out into a full spec only when its turn comes; until then it has no tasks.

## Status and acceptance

A spec's `Status:` line follows `candidate → draft → accepted → implemented` (decision 0028). `to-spec` writes `candidate` and `draft`, and owns acceptance; `ship` sets `implemented`.

**Accept the spec.** When the user approves a spec for delivery ("accept the spec"), set its status to `accepted` with the date, and set each decision record it links from **Proposed** to **Accepted** in the same step. Writing a draft, reaching spec-ready, or a request to write a spec is not acceptance. A `candidate` must become a full draft before it can be accepted. Report the files changed.

## Process

1. Explore the repository when needed. Use the project's domain vocabulary and respect decision records in the area you are touching.

2. Sketch test seams at the highest practical level. Prefer existing seams; propose new ones only when necessary and as high as possible.

3. Write a proportionate spec using the relevant sections below, saved with status `draft` and the date, and any decision record it needs as **Proposed**. Do not show the text inline or ask before writing; report links to the files written, open assumptions, and that "accept the spec" is the next step.

<spec-template>

## Problem Statement

The problem from the affected user's perspective.

## Solution

The intended solution from the user's perspective.

## User Stories

Essential scenarios and acceptance criteria when they improve clarity, for example:

1. As an <actor>, I want a <feature>, so that <benefit>

Cover consequential paths and failure cases without redundant stories.

## Implementation Decisions

Decisions that shape execution: modules, interfaces, contracts, schema, or interactions. Prefer stable interfaces and intent over exhaustive file lists.

Write interfaces contract-first, before any UI: the typed API shape the UI uses; MCP tool definitions when the product names agent users; and errors and permissions an agent can act on. Specify an MCP App only when a journey needs the product's UI inside an agent host; otherwise plain MCP tools suffice.

When a prototype encodes a decision more precisely than prose (state machine, schema, type shape), inline the decision-rich excerpt and note that it came from a prototype.

## Testing Decisions

What good tests mean here, which behavior is in scope, and prior art in the codebase.

## Out of Scope

What this increment explicitly does not include.

## Further Notes

Additional context that helps execution or review.

</spec-template>
