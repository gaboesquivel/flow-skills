---
name: to-spec
description: Turn the current conversation into a numbered draft specification using project conventions, and accept it when approved. Use when the user says "spec it", "write a spec", "turn this into a spec", "share the draft", or "accept the spec".
disable-model-invocation: false
---

# To Spec

Turn conversation context and repository understanding into a proportionate specification. Do not run a separate interview; synthesize what is already known and label unresolved assumptions rather than inventing decisions.

Use the project's existing spec location, numbering, labels, and trackers; with no convention, write `docs/specs/NNN-short-name.md` (three-digit sequence, kebab-case slug). Outside a Git repository, offer `git init` and stop on a no. Write the spec on a feature branch named for it, never the default branch; it merges with the work. On an `explore/` branch with no spec yet, rename it to the spec's branch (`git branch -m`) before writing, so the exploration's commits ship with the spec. In local mode a `candidate` stub written during a spec's run is committed on that spec's branch; one written alone, with no spec branch open, is committed on the default branch.

**Spec, tasks, decision.** A spec is one bet: it tests one assumption and ships as one unit. Its tasks are the slices inside it, so a spec may be large. Work that only makes sense after seeing how another bet did gets its own spec. A choice gets a decision record in `docs/decisions/NNNN-short-name.md` (four-digit sequence) only when it chose among real alternatives **and** reaches beyond this spec or is costly to reverse; otherwise it belongs in the spec's Implementation Decisions. Never put feature scope or tasks in a decision record. When a spec makes a choice that passes the test, write the record beside the spec with status **Proposed** and link it from the spec. Also link any **Proposed** records written during exploration that the spec depends on.

Specs may cover product, research, marketing, engineering, operations, or cross-functional work. Use the sections below only when they fit; omit irrelevant headings. Keep small, understood changes brief.

**Candidate specs.** A later bet that should not be specified yet gets a stub: the problem and the assumption it tests. In local mode it is a file with status `candidate`. In GitHub mode it is an issue labelled `candidate`, with no file, opened only when the user asks for one; otherwise name it in the report. Flesh it out into a full spec only when its turn comes; until then it has no tasks.

## Status and acceptance

A spec's `Status:` line follows `candidate → draft → accepted → implemented`. `to-spec` writes `candidate` and `draft`, and owns acceptance; `build` sets `implemented` once an accepted spec's last task integrates, and `ship` sets it if still missing.

**Acceptance** happens when the user says "accept the spec", or says "build it" or "ship it" on a draft; `build` and `ship` apply the steps below in their first commit. Writing a draft or a request to write a spec is not acceptance. In one commit:

- Set the spec's status to `accepted` with the date, and each decision record it links from **Proposed** to **Accepted** with the date, in the project's decision format.
- Write the back-pointers. For each linked record that supersedes or amends an older one, append `Superseded by [NNNN]`, `Superseded in part by [NNNN]`, or `Amended by [NNNN]`, with a short scope, to the older record's Status line (in a frontmatter format, set `superseded_by` instead, and `status: superseded` only for a full supersession) and index row, and to the Status line of each spec it changes; update each contradicted `PRODUCT.md` fact to the new position, linking the record. Entries in the spec's Direction changes section get the same spec and `PRODUCT.md` updates, linking the spec.
- Never write back-pointers before acceptance. A back-pointer is not a scope change and does not return another spec to `draft`.

A spec without an acceptance scenario, or without an **Exposure** line when it adds deployable behaviour, is not accepted: name what is missing and leave it in `draft`. A `candidate` must become a full draft first. Changing an accepted spec's scope or a decision it links returns it to `draft`. An `accepted` label a maintainer added is acceptance: when the label is ahead of the file, write the file status (and linked decisions, with their back-pointers) to match. Report the files changed.

## Spec issue

GitHub mode only; local mode keeps files only. When the mode is unset, settle it as [`build`'s Delivery mode](../build/SKILL.md#delivery-mode) says.

- **"Spec it" publishes nothing.** It commits the draft on the spec branch; no push, no issue.
- **At acceptance,** push the branch and open the spec issue, or reuse the `candidate`, shared-draft, or feature-request issue the spec fleshes out. Title it `NNN: Title`; the body is one line linking the file on its branch and on the default branch, for example `Spec: [docs/specs/NNN-x.md](https://github.com/<owner>/<repo>/blob/<branch>/docs/specs/NNN-x.md) (on [<default>](https://github.com/<owner>/<repo>/blob/<default>/docs/specs/NNN-x.md) once merged).` Never copy the spec into the body or update it afterwards. Write `Issue: #N`, linked, beside `Status:`, then commit and push. On a public repository, say that the branch and the issue become public.
- **"Share the draft"** opens the issue early, the same way, labelled `draft`.
- **Labels** carry the status: `candidate`, `draft`, or `accepted`, exactly one, created on first use. Relabel when the status changes; that is the only issue update.
- Without GitHub access, say the issue was not opened.

## Process

1. Explore the repository only for what the conversation does not already hold (fan-out rule: `write-agents` Workers): existing specs and decisions, code seams and tests, and the glossary. Use the project's domain vocabulary. Before writing, check for contradictions with accepted decisions, specs, and `PRODUCT.md` through `explore`'s [Direction changes](../explore/SKILL.md#direction-changes) gate, asking only about conflicts not already confirmed in this conversation or in a Proposed record on the current branch.

2. Sketch test seams at the highest practical level. Prefer existing seams.

3. Write the spec with status `draft` and the date, and any decision record it needs as **Proposed**, and commit them on the spec branch. Do not show the text inline or ask before writing; report links to the files, open assumptions, and the next step: "build it" or "accept the spec" (or "share the draft" for comments first in GitHub mode).

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

**Exposure** (required when the spec adds deployable behaviour): where the slice runs, who can reach it, and how writes behave when deployed without authentication. When authentication is out of scope, write paths fail closed on deployment.

Write interfaces contract-first, before any UI: the typed API shape the UI uses; MCP tool definitions when the product names agent users; and errors and permissions an agent can act on. Specify an MCP App only when a journey needs the product's UI inside an agent host; otherwise plain MCP tools suffice.

When a prototype encodes a decision more precisely than prose (state machine, schema, type shape), inline the decision-rich excerpt and note that it came from a prototype.

## Testing Decisions

What good tests mean here, which behavior is in scope, and prior art in the codebase.

**Acceptance scenario** (required; `review` gives each step a verdict): one representative end-to-end journey. Name the actor, the starting state with realistic data, and numbered steps with the observable result of each. When the spec names agent users, give the same journey through the agent interface (MCP tool).

## Direction changes

Confirmed changes to accepted specs or `PRODUCT.md` facts that got no decision record: the file, the old position, and the new one.

## Out of Scope

What this increment explicitly does not include.

## Further Notes

Additional context that helps execution or review.

</spec-template>
