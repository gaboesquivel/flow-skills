---
name: to-tasks
description: Break a plan, spec, or conversation into verifiable vertical-slice tasks with blockers, listed in the spec's Tasks checklist. Use when the user says "break it down" or "split this into tasks".
disable-model-invocation: false
---

# To Tasks

Break a plan, spec, or conversation into **tasks**: independently verifiable vertical slices, each naming the tasks that **block** it.

Prefer the fewest tasks that each verify on their own. Keep a straightforward change as one task; split only when slices can proceed in parallel, need separate review, or would not fit one session. A task per layer, file, or step is too fine.

## Process

1. **Context.** Work from the conversation; read a named spec, issue, or URL in full, comments included. Read the areas the work touches when not yet explored. Use the project's terms (`domain-modeling` Shared language), respect decision records in the area, and look for prefactors: make the change easy, then make the easy change.
2. **Slices.** Each slice delivers narrow, verifiable behavior across the layers it needs, is demoable on its own, and fits one fresh context. Prefactoring comes first.
3. **Area.** Every package or directory a task changes, comma-separated, coarse, never file paths, including routes outside its main package, so disjoint areas mean disjoint changes. `build` slices by area.
4. **Blockers.** An edge needs a real data or file dependency, never topic order. Prefer a wide frontier; a task with no blockers can start immediately and is **ready** once its blockers are complete.

**Wide refactors** (one mechanical change, such as renaming a column, whose affected scope spans the codebase so no vertical slice lands green) use **expand–contract**. Expand: add the new form beside the old. Migrate call sites in batches by package or directory, each a task blocked by the expand, keeping CI green. Contract: remove the old form in a task blocked by every batch. When batches cannot stay green alone, they share an integration branch and a final integrate-and-verify task.

## Record and report

"Break it down" authorizes recording: resolve only consequential uncertainty, then write without showing the tasks for approval. Tasks are the spec's checklist: write its Tasks section, one line per task (`- [ ] NN: Title`), detail each with the task template below, and commit on the spec's branch. Without a spec, write one with `to-spec` first, or return the tasks as a local draft and say so.

**Task issues** open only when the user asks: one per task from the issue template, with blockers linked once every number exists (native links, else `Blocked by #a, #b`), and `(#N)` appended to each checklist line. On a public repository, say the issues are public. On a retry, open only the missing ones.

Tasks are not pull requests, issues, or worktrees; `build` groups them. Report where the tasks live, each task with what it delivers and its area, and the ready set, then wait for "build it".

<task-template>

### <NN>: <Task title>

**What to build:** the end-to-end behaviour this task makes work, from the user's perspective, not a layer-by-layer implementation list.

**Area:** every package or directory this task changes, comma-separated, never file paths.

**Blocked by:** the numbers or titles of tasks that gate this one, or "None (can start immediately)".

- [ ] Observable behavior 1, with its focused check when one exists
- [ ] Observable behavior 2

</task-template>

<issue-template>

## Spec

A link to the spec file this task belongs to (omit only when the task belongs to no spec).

## What to build

Area: every package or directory this task changes, comma-separated, never file paths.

The end-to-end behaviour this task makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

</issue-template>

Keep file paths and code out of task text, except a prototype excerpt that encodes a decision more precisely than prose.
