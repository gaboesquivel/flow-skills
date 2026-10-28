---
name: to-spec
description: Turn the current conversation into a numbered draft specification using project conventions, and accept it when approved. Use when the user says "spec it", "write a spec", "turn this into a spec", or "accept the spec".
disable-model-invocation: false
---

# To Spec

Turn conversation context and repository understanding into a proportionate specification. Do not run a separate interview; synthesize what is already known and label unresolved assumptions rather than inventing decisions. Keep consequential assumptions visible.

Use the project's existing spec location when one exists. In both delivery modes, write the spec on a feature branch named for it, never the default branch; it merges with the work. In local mode a `candidate` stub has no work to merge with and is committed on the default branch. When the project has no convention, default new work to `docs/specs/NNN-short-name.md` (three-digit sequence, kebab-case slug) and follow the same pattern for updates. Preserve existing numbering, labels, and trackers when the repository already uses them.

**Spec, tasks, decision** (decision 0026). A spec is one bet: it tests one assumption and ships as one unit. Its tasks are the slices inside it, so a spec may be large. Work that only makes sense after seeing how another bet did gets its own spec. A choice gets a decision record in `docs/decisions/NNNN-short-name.md` (four-digit sequence) only when it chose among real alternatives **and** reaches beyond this spec or is costly to reverse; otherwise it belongs in the spec's Implementation Decisions. Never put feature scope or tasks in a decision record. When a spec makes a choice that passes the test, write the record beside the spec with status **Proposed** and link it from the spec. Also link any **Proposed** records written during exploration that the spec depends on.

Specs may cover product, research, marketing, engineering, operations, or cross-functional work. Use the sections below only when they fit the discipline; omit irrelevant headings. Keep small, understood changes brief.

**Candidate specs.** A later bet that should not be specified yet gets a stub: the problem and the assumption it tests. In pull-request mode it is an issue labelled `candidate`, with no file; in local mode, a file with status `candidate`. Flesh it out into a full spec only when its turn comes; until then it has no tasks.

## Status and acceptance

A spec's `Status:` line follows `candidate → draft → accepted → implemented` (decision 0028). `to-spec` writes `candidate` and `draft`, and owns acceptance; `ship` sets `implemented`. In pull-request mode the spec issue's label (`candidate`, `draft`, `accepted`) carries the same state (decision 0029).

**Accept the spec.** When the user approves a spec for delivery ("accept the spec"), set its status to `accepted` with the date, and set the status of each decision record it links from **Proposed** to **Accepted** with the date, in the project's decision format, in the same step; in pull-request mode, also swap the issue's `draft` label for `accepted` and sync the body. Writing a draft, reaching spec-ready, or a request to write a spec is not acceptance. An `accepted` label a maintainer added is acceptance: when `to-spec` touches a spec whose label is ahead of its file, write the file status (and linked decisions) to match. A `candidate` must become a full draft before it can be accepted. Changing an accepted spec's scope or a decision it links returns the spec to `draft`, and the label with it. Report the files changed.

## Spec issue

Pull-request mode only (the `Delivery:` line in the project's Flow block); local mode keeps files only. When the mode is unset or there is no block, ask before opening any issue, as `build`'s Delivery mode section describes; a request that names a mode answers it.

- **Open.** Push the branch, then open the spec issue labelled `draft`, or reuse the `candidate` or feature-request issue the spec fleshes out and relabel it. Write `Issue: #N`, linked to the issue, beside `Status:`, commit and push, then sync the body. This is part of "spec it" and needs no separate yes; on a public repository, say the issue is public.
- **Labels.** Create `candidate`, `draft`, and `accepted` on first use. A spec carries exactly one.
- **Body.** A one-way copy of the file: first line `Copied from <path>; edit the file, this body is overwritten.` with `<path>` linked to the file on the branch, then the file content with relative links rewritten to that ref, then `<!-- flow-spec sha256:<hex> -->`, the SHA-256 of everything above it. Normalize before every hash: LF line endings, trailing whitespace trimmed from each line, and trailing blank lines removed, so a web-editor round trip is not a hand edit.
- **Sync** after every change to the file. First hash the issue's current body above its marker; if that differs from the marker's hash (or a body this run did not just open has no marker), the body was edited by hand: stop, show the difference from the file's copy, and ask before overwriting. Carry wanted edits into the file instead.
- Without GitHub access, write the file, say the issue was not opened, and stop there.

## Process

1. Explore the repository when needed. Gather evidence with parallel read-only workers (fan-out rule: `write-agents` Workers): existing specs and decisions, code seams and tests, and the glossary. Use the project's domain vocabulary and respect decision records in the area you are touching.

2. Sketch test seams at the highest practical level. Prefer existing seams; propose new ones only when necessary and as high as possible.

3. Write a proportionate spec using the relevant sections below, saved with status `draft` and the date, and any decision record it needs as **Proposed**. One writer owns the spec; decision records may be written in parallel, one worker per file. In pull-request mode, open or reuse its spec issue (see Spec issue). Do not show the text inline or ask before writing; report links to the files written and the issue, open assumptions, and that "accept the spec" is the next step.

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
