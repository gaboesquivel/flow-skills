---
name: implement
description: Implement an authorized change from a request, specification, or task.
disable-model-invocation: true
---

# Implement

Read the relevant request, repository instructions, current context, and code. If the user supplies a task reference, retrieve it with available tools and resolve consequential ambiguity. A tracker, setup skill, or formal spec is not a prerequisite for a clear small change.

State the intended observable result and implement the smallest useful increment using existing patterns. Preserve unrelated working-tree changes. Do not add scope just because it is nearby.

For meaningful behavior changes, use [TDD](../tdd/SKILL.md) as supporting guidance where suitable. Select tests from the established public interfaces and risks; ask only when a consequential contract is unresolved. Run focused checks while working and applicable final checks once the change stabilizes.

Review the actual changed files, including untracked files, against the request and project constraints. Use [Review](../review/SKILL.md) as supporting guidance without requiring a nested skill tool or extra agents.

Update owning documentation when behavior or accepted context changes. Report the result, files, checks, limitations, and remaining work. Commit, publish, push, or deploy only when that delivery action is already authorized; implementation alone does not require it.
