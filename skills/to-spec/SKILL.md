---
name: to-spec
description: Turn the conversation into a numbered draft spec using project conventions, and accept it when approved. Use when the user says "spec it", "write a spec", "share the draft", or "accept the spec".
disable-model-invocation: false
---

# To Spec

Turn the conversation into a proportionate spec, labelling assumptions instead of inventing decisions.

Use the project's spec location, else `docs/specs/NNN-short-name.md`, numbered by `node <skill-dir>/scripts/next-number.mjs` (fetch first). Commit on the work's branch (else a new `spec/<number>-<slug>`), never the default branch.

**What, not how.** Name outcomes, constraints, and consequential decisions. Components, file layout, and implementation are `build`'s unless an established constraint fixes them.

**How many specs.** Decide this yourself and report why, never asking. For a new product, name the first useful release in the Solution, proposing one as an assumption when the brief has none; the vision (`PRODUCT.md`) may stay broad. Default to one spec; several vertical tasks in one spec is valid, and a large update to an existing product is sized the same way. "Spec it" covers the outcome under discussion. When a first slice is independently useful, or what it teaches could change later investment, write that slice in full and keep a later one as a **candidate** stub (the problem and what it waits on) only when the later problem and its dependency are worth remembering. When several pieces form one useful release, can be accepted together, and the user means to deliver them together, one MVP spec holds them. Never split for length or task count. Each spec states its acceptance boundary and Out of Scope; name a dependency only when real. Report which scope "build it" will build.

A choice gets a decision record (`docs/decisions/NNNN-short-name.md`) only when it chose among real alternatives **and** reaches beyond this spec or is costly to reverse; otherwise it is a Decisions bullet. Records never hold scope or tasks. Changing an Accepted decision always gets one, with `Supersedes [NNNN]` or `Amends [NNNN]` (and scope) on its Status line; a conflict only with a spec or owner document gets one only by the test above. Write a needed record as **Proposed** and link it.

**Length.** As short as complete, with no word limit: link records, glossary, and code instead of restating them.

Open no issues unless asked; the pull request closes an issue the user named (`Closes #N`).

## Status and acceptance

The status line is `Status: <candidate|draft|accepted|implemented|dropped> (YYYY-MM-DD).`, with an optional `Appetite: <time target>.`, never history beyond back-pointers. `build` sets `implemented` once every task integrates; `ship` sets it if missing, or drops a spec.

Writing a draft is not acceptance. **Acceptance** happens in one commit on "accept the spec", or as the first commit of "build it" or "ship it" on a draft:

- Set the identified spec to `accepted` and each record it links from **Proposed** to **Accepted**, dated. Acceptance covers only that work and the linked changes whose consequences the user has seen; another Proposed record on the branch stays Proposed.
- Back-pointers, never earlier: for each linked record that supersedes or amends an older one, append `Superseded by`, `Superseded in part by`, or `Amended by [NNNN]` with a short scope to the older record's Status line (or `superseded_by`), index row, and each changed spec; update each contradicted owner statement (`PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `GLOSSARY.md`) and leave unrelated documents alone. A direction-change Decisions bullet gets the same, linking the spec.

A draft without an acceptance scenario, or without **Exposure** when it adds deployable behaviour, stays `draft`: name what is missing and stop. A `candidate` must become a full draft first. Changing an accepted spec's scope or a linked decision returns it to `draft`.

**Share the draft:** push the branch and open a draft pull request linking the spec (`build` reuses it), noting a public repository; locally, report the file.

## Process

1. Explore only what the conversation lacks (specs, decisions, tests, terms per `domain-modeling` Shared language), and sketch test seams for consequential behavior, preferring existing high-level ones. A draft that reverses or narrows an Accepted decision, accepted or implemented spec, or an owner-document fact is a **direction change**, the gate's one home: name the exact current statement (file and quote), the proposed replacement, and the observable consequence, kept apart from accepted direction. Resolve it with an explicit yes before the spec is accepted or built; a user who already chose the new direction with that consequence understood has given it once. Discussion and experiments in `explore` do not trigger it. A prototype or implementation discrepancy alone never establishes a product promise.
2. Commit the spec as `draft` and any record as **Proposed**, publishing nothing and asking nothing; report the files, how many specs and why, open assumptions, and next step: "build it", "accept the spec", or "share the draft".

<spec-template>

## Problem

Who is affected, what fails today, and the evidence.

## Solution

The change, from the user's side.

**Outcome** (initiatives only, never a typo or cleanup): "We want <outcome> to change for <users>; we'll look at <evidence>, and it informs <decision>", linking any existing metric definition. Instrumentation is in scope only when the decision depends on it.

## Decisions

Only consequential choices and established constraints that shape execution, with the alternatives and trade-offs a person needs to decide and which are hard to reverse. A sketch or model only when it resolves a material uncertainty or states a binding constraint. For capabilities agents or other systems use, the contract, with errors and permissions they can act on.

**Exposure** (required for deployable behaviour): where it runs, who can reach it, and how writes behave without authentication; with authentication out of scope, writes fail closed.

**Appetite** (substantial work): the first verifiable slice, what gives way first, and any material cost limit.

A direction change without a record: the current statement, the replacement, the consequence, marked a proposal until confirmed.

## Acceptance

**Acceptance scenario** (required; `review` gives each step a verdict), a realistic user journey: the actor, the starting state with realistic data, and numbered steps with observable results; for agent users, also through the MCP tool. With an Outcome, a step proves its evidence can be obtained (a metric counts correctly, a sample can be drawn); manual measurement is enough. The outcome itself is `align`'s after shipping.

Then consequential invariants, each with the evidence proving it, per `build` Tests.

## Out of Scope

What this increment does not include.

## Tasks

Written by `to-tasks`.

</spec-template>
