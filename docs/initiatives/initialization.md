# Initialization experiment

Status: experimental prompt development; first intended external trial is gaboesquivel.com. No context-initialization skill or successful external trial is established. The bundled `flow-skills-init` command installs skills and bootstrap only; it does not perform this product-context experiment.

## Purpose

Test whether initialization gives agents enough product intent and architectural orientation to work correctly with less unnecessary reading and documentation maintenance. This initiative owns the trial; the [methodology](../methodology.md#write-context-for-agents-and-humans) owns ongoing documentation practices.

## Accepted constraints

Recovered from the October 20 “Create Init Prompt” and “Architecture Template Review” discussions:

- The reusable prompt must work on any software repository. Discover its technologies, conventions, structure, and existing decisions; do not bake in gaboesquivel.com or a particular framework.
- Inspect existing code and documentation before asking questions. Distinguish observed behavior, documented intent, inference, and unknowns.
- Ask targeted questions about consequential gaps, present options and tradeoffs, recommend a direction, and wait for input before applying new decisions. Do not repeat questions already answered by available context.
- Apply progressive disclosure and aggressive pruning. Keep canonical documents concise and connected; document what agents need to preserve or would otherwise struggle to recover.
- Keep product intent, documentation, and implementation aligned. Initialization must preserve existing work and surface contradictions rather than overwrite it with a generic template.

Root Markdown and `docs/` remain Flow's current layout. Moving to `.flow/` was discussed, not adopted; the [competitive report](../research/2026-10-20-competitive-landscape.md) contains unverified research and recommendations about that choice.

## Trial status and evidence

On October 20 the user reported running the prompt with Flow Skills in Cursor's context instead of the intended gaboesquivel.com project. This is evidence of target-context confusion, not a successful initialization evaluation. No Git history, exact execution transcript, or reliable before/after diff was available in this workspace to establish precisely what the command changed. The old archive predates this incident.

The exact final prompt was not recovered during reconciliation; these constraints are recovered direction, not a claim to reproduce it verbatim. No rerun was performed.

## Next evaluation

Before the next trial, establish the target repository from its actual path and contents. If they conflict with the requested target, resolve that mismatch before writing. This safeguard is proposed from the incident, not a new universal confirmation gate.

Run the experiment in gaboesquivel.com when resumed. Assess whether a fresh agent finds relevant context, preserves intended behavior, detects contradictions, and avoids unnecessary reads and duplicate documentation. Record actual results and limitations here. Comparing baseline, conventional documentation, and Flow initialization is a candidate evaluation design; no measurements or effectiveness claims exist yet.
