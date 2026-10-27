---
name: retro
description: "Conduct a retrospective on a coding session."
disable-model-invocation: true
---

The user asked for a **retrospective** on how the agent environment could improve future sessions. One agent can run this directly; separate implementation and review roles are optional context, not a prerequisite.

## Steps

1. Follow `write-agents` conventions when that skill is installed and you propose instruction or skill changes.

2. Read primary sources for the session the user names. If none is named, use the current session. Use available session or transcript tools when the host provides them.

3. Look for improvement candidates:

- **Navigation:** difficulty finding files or hidden dependencies; whether a short pointer document would help.
- **Automated checks:** lint, typecheck, tests, or CI the repo already defines but does not run; missing guardrails when mistakes were preventable.
- **Coding standards:** recurring violations that deserve a mechanical check versus judgment-only guidance in a standards document.
- **Instruction files:** oversized always-loaded project or user instruction files; rules that belong in checks, skills, or linked docs instead. _Only suggest edits; do not modify `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar files unless the user explicitly authorizes those edits._
- **Tool economy:** costly or redundant tool use; optional integrations that lack a simpler fallback.
- **No-ops:** instructions that do not change behavior.
- **Information access:** logs or readonly access that would have changed the outcome.

4. Present candidates by severity. Separate evidence from inference. Implementation of recommendations requires explicit user authorization.

## Reference

When work splits across roles, review-oriented standards often fit a review pass better than implementation. When one agent does both, apply the same ideas proportionally without inventing a second pass.

Prefer skills and linked docs for detailed guidance. Keep always-loaded instruction files short navigation pointers when the project already uses them.
