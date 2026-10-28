---
name: to-tasks
description: Break a plan, spec, or conversation into verifiable vertical-slice tasks with explicit blockers; record them as GitHub issues or in the spec's Tasks section by delivery mode. Use when the user says "break it down", "make tasks", or "split this into tasks".
disable-model-invocation: false
---

# To Tasks

Break a plan, spec, or conversation into **tasks**: independently verifiable vertical slices, each naming the tasks that **block** it.

Discover how the project already tracks work. A tracker, label vocabulary, or setup skill is not required. Keep a straightforward change as one task; split only when that helps execution or continuity.

## Process

### 1. Gather context

Work from the conversation. If the user passes a spec path, issue number, or URL, read the full body and comments.

### 2. Explore the codebase (optional)

When you have not already explored the codebase, do so to see the current state. Task titles and descriptions should use the project glossary and respect decision records in the area you touch.

Look for prefactors that make the implementation easier: make the change easy, then make the easy change.

### 3. Draft vertical slices

Break the work into vertical-slice tasks.

<vertical-slice-rules>

- Each slice delivers narrow, verifiable behavior across the layers the product needs. Include schema, API, UI, or tests only where the task requires them.
- A completed slice is demoable or verifiable on its own.
- Each slice fits a single fresh context window.
- Do prefactoring first when it is part of the plan.

</vertical-slice-rules>

Give each task its **blocking edges**: other tasks that must finish before it can start. A task with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **affected scope** spans the codebase, so one edit breaks many call sites and no vertical slice can land green. Sequence it as **expand–contract**. Expand: add the new form beside the old so nothing breaks. Migrate call sites in batches sized by impact (per package or directory), each batch its own task blocked by the expand, keeping CI green because the old form still exists. Contract: remove the old form once no caller remains, in a task blocked by every migrate batch. When batches cannot stay green alone, they may share an integration branch and a final integrate-and-verify task; green is promised only there.

### 4. Check the breakdown

Show the proposed tasks, what each delivers, and real dependencies. Resolve only consequential scope or sequencing uncertainty. Reuse existing approval of the work; do not require a second approval for routine decomposition.

### 5. Record

Record tasks in exactly one place, chosen by the delivery mode: the `Delivery:` line in the project's Flow block, or when unset, the mode `ship` would infer (say which).

- **Pull-request mode:** publish GitHub issues using the issue template below, with blocking links. Use another tracker only when the project already uses one. Use native dependency links when available, or plain references otherwise.
- **Local mode:** write the tasks into the spec's Tasks section using the local task template; no issues. Without a spec, write one with `to-spec` first, or return the tasks as a local draft and say so.

Never record the same tasks in both places. Without GitHub access in pull-request mode, return a local draft and say so. Do not introduce a `.scratch/` task system or new labels.

Tasks are not pull requests; `ship` owns how tasks group into pull requests.

Tasks that are **ready** have their blockers complete. In a purely linear chain, that means top to bottom.

Do not close or modify any parent issue.

### 6. Hand off

End by naming where the tasks live and the ready set, then wait for "ship it". Do not start implementation.

<local-task-template>

### <NN>: <Task title>

**What to build:** the end-to-end behaviour this task makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blocked by:** the numbers or titles of tasks that gate this one, or "None (can start immediately)".

**Status:** planned (`ship` sets `done` as the task integrates)

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-task-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (if the source was an existing issue; otherwise omit this section).

## What to build

The end-to-end behaviour this task makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking task, or "None (can start immediately)". Omit this section when blockers were set as native edges.

</issue-template>

Avoid specific file paths or code snippets in task text; they go stale quickly. Exception: a prototype snippet that encodes a decision more precisely than prose (state machine, reducer, schema, type shape). Inline it, note that it came from a prototype, and keep only the decision-rich parts.
