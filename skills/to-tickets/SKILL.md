---
name: to-tickets
description: Break a plan, spec, or the current conversation into verifiable vertical-slice tasks with explicit blockers, using existing project conventions and publishing only when requested.
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: independently verifiable vertical slices, each declaring the tickets that **block** it.

Discover the project's existing task tracking conventions. A tracker, label vocabulary, or setup skill is not a prerequisite. Keep a straightforward change as one direct task; create separate tasks only when they improve execution or continuity.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect decision records in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into vertical-slice tickets.

<vertical-slice-rules>

- Each slice delivers a narrow, verifiable behavior across the relevant layers. Include schema, API, UI, or tests only where the product and task require them.
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **affected scope** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Do not force it into a single slice; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate call sites in batches sized by impact (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches cannot stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

### 4. Check the breakdown

Show the proposed tasks, what each delivers, and real dependencies. Resolve only consequential scope or sequencing uncertainty. Reuse existing approval of the work; do not require a second approval for routine decomposition.

### 5. Save or publish within authorization

Use the requested output or the project's canonical tracker. Publish issues only when requested or already authorized. Otherwise return a draft or update an existing local plan. Do not introduce a `.scratch/` task system or new labels. Use native dependency links where available, or plain references otherwise.

Work tickets that are **ready**: blockers complete. For a purely linear chain that means top to bottom.

Do NOT close or modify any parent issue.

<local-ticket-template>

# <NN>: <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None (can start immediately)".

**Status:** planned

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (if the source was an existing issue, otherwise omit this section).

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None (can start immediately)". Omit this section when blockers were set as native edges.

</issue-template>

In either form, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
