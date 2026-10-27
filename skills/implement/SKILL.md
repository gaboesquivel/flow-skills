---
name: implement
description: Implement an authorized change from a request, specification, or task.
disable-model-invocation: true
---

# Implement

Read the relevant request, repository instructions, current context, and code. If the user supplies a task reference, retrieve it with available tools and resolve consequential ambiguity. A tracker, setup step, or formal spec is not a prerequisite for a clear small change.

State the intended observable result and implement the smallest useful increment using existing patterns. Preserve unrelated working-tree changes. Do not add scope just because it is nearby.

For meaningful behavior changes, prefer tests at established public interfaces when the project already tests that way. Run focused checks while working and applicable final checks once the change stabilizes.

Review the actual changed files, including untracked files, against the request and project constraints. Optional [review](../review/SKILL.md) guidance can inform a self-check; a separate review pass is not required.

Update owning documentation when behavior or accepted context changes. Report the result, files, checks, limitations, and remaining work. Commit, publish, push, or deploy only when that delivery action is already authorized; implementation alone does not require it.
