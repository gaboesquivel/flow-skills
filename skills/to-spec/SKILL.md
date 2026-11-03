---
name: to-spec
description: Turn the conversation into a numbered draft spec using project conventions, and accept it when approved. Use when the user says "spec it", "write a spec", "share the draft", or "accept the spec".
disable-model-invocation: false
---

# To Spec

Turn conversation context and repository understanding into a proportionate specification. Synthesize what is already known and label unresolved assumptions rather than inventing decisions.

Use the project's spec location and numbering; with no convention, write `docs/specs/NNN-short-name.md`. Take the number `node <skill-dir>/scripts/next-number.mjs` prints (free on every local and remote branch; fetch first). Commit on the work's branch, never the default branch, candidate stubs included: the branch already open for this work, else a new `spec/<number>-<slug>`. The spec merges with the work.

**Spec, tasks, decision.** A spec is one bet: it tests one assumption and ships as one unit; its tasks are the slices inside it. Split into several specs only when each increment proves something alone, ships safely alone, exceeds one appetite, or depends on learning from an earlier one. A choice gets a decision record (`docs/decisions/NNNN-short-name.md`) only when it chose among real alternatives **and** reaches beyond this spec or is costly to reverse; otherwise it belongs in Implementation Decisions. Never put scope or tasks in a decision record. Write a needed record beside the spec as **Proposed** and link it, along with any Proposed records from exploration the spec depends on.

Use the template's sections only when they fit; keep small changes brief. A later bet not worth specifying yet gets a **candidate** stub: the problem and the assumption it tests, no tasks.

**Issues.** Open none unless the user asks, and never one per session or task. When the spec fleshes out an issue the user named, the pull request closes it (`Closes #N`).

## Status and acceptance

A spec's `Status:` line reads `candidate`, `draft`, `accepted`, `implemented`, or `dropped`, with the date. `to-spec` writes `candidate` and `draft` and owns acceptance; `build` sets `implemented` once every task integrates, and `ship` sets it if still missing or drops a spec.

**Acceptance** happens on "accept the spec", or "build it" or "ship it" on a draft (they apply these steps in their first commit). Writing a draft is not acceptance. In one commit:

- Set the spec to `accepted`, and each decision record it links from **Proposed** to **Accepted**, with the date.
- Write the back-pointers. For each linked record that supersedes or amends an older one, append `Superseded by [NNNN]`, `Superseded in part by [NNNN]`, or `Amended by [NNNN]`, with a short scope, to the older record's Status line (or `superseded_by` in front matter) and index row, and to each spec it changes; update each contradicted `PRODUCT.md` fact, linking the record. Direction changes entries get the same updates, linking the spec.
- Never write back-pointers before acceptance; a back-pointer is not a scope change.

A draft without an acceptance scenario, or without an **Exposure** line when it adds deployable behaviour, stays `draft`: name what is missing and stop. A `candidate` must become a full draft first. Changing an accepted spec's scope or a decision it links returns it to `draft`.

**Share the draft:** push the branch and open its draft pull request (which `build` reuses) linking the spec; in local mode, report the file. On a public repository, say the branch becomes public.

## Process

1. Explore the repository only for what the conversation does not hold: specs, decisions, code seams and tests, and the glossary. Use the project's terms (`domain-modeling` Shared language). A goal that would reverse or narrow an Accepted decision, an accepted spec, or a `PRODUCT.md` fact stops for an explicit yes (`explore`'s Direction changes), unless already confirmed in this conversation or a Proposed record on the branch.
2. Sketch test seams at the highest practical level; prefer existing ones.
3. Write the spec as `draft` with the date, and any decision record as **Proposed**, and commit them. "Spec it" publishes nothing. Do not show the text inline or ask first; report links to the files, open assumptions, and the next step: "build it", "accept the spec", or "share the draft".

<spec-template>

## Problem Statement

The problem from the affected user's perspective.

## Solution

The intended solution from the user's perspective.

## User Stories

Consequential paths and failure cases, for example: 1. As an <actor>, I want a <feature>, so that <benefit>.

## Implementation Decisions

Decisions that shape execution: modules, interfaces, contracts, schema, or interactions.

**Exposure** (required when the spec adds deployable behaviour): where the slice runs, who can reach it, and how writes behave when deployed without authentication. When authentication is out of scope, write paths fail closed on deployment.

Write interfaces contract-first, before any UI: the typed API shape; MCP tool definitions when the product names agent users; and errors and permissions an agent can act on. Inline a prototype excerpt only when it encodes a decision more precisely than prose.

## Testing Decisions

What good tests mean here, which behavior is in scope, and prior art in the codebase.

**Behavior and checks:** the observable behavior at the contract as concrete examples with realistic domain data, the invariants that must always hold, and the focused check that proves each (the seam, and the command that runs only it). State behavior, not implementation steps. Which checks to write, and whether UI gets any, follows `build` Tests.

**Acceptance scenario** (required; `review` gives each step a verdict): one representative end-to-end journey: the actor, the starting state with realistic data, and numbered steps with the observable result of each; for agent users, the same journey through the MCP tool. When the work should move a defined metric, reference its definition and source, and add a step proving an outcome is counted correctly (failures excluded, retries counted once). Label unknowns instead of assuming infrastructure.

## Appetite

For substantial work: the delivery target (time, and cost when material), the first verifiable slice, and what gives way when it runs out. Record start and end when observed; otherwise "not measured".

## Direction changes

Confirmed changes to accepted specs or `PRODUCT.md` facts that got no decision record: the file, the old position, and the new one.

## Out of Scope

What this increment explicitly does not include.

## Further Notes

Additional context that helps execution or review.

</spec-template>
