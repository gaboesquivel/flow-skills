# Spec 028 comparison record (2026-10-28)

## Scope

Spec [028](../../docs/specs/028-outcome-build-and-ship.md): outcome-first `build`, `ship`, and `review`.

## Conditions

| Condition | What ran |
| --- | --- |
| Structural baseline | `pnpm validate` and `pnpm test` on branch `028-outcome-build-and-ship` after task 01–02 |
| Optimized Flow | Same branch; skills rewritten per decision 0042 |
| No skills | Not executed as a live agent run in this session |
| Current Flow (pre-028) | Not re-run live; prior skill text preserved on `main` for comparison |

## Prompts (from spec Testing Decisions)

E37 task set, copy fix, and API escalation; E26 draft stop; E34 verify reporting — reserved for a follow-up live run with Claude Opus 5.5 medium effort when the host offers it.

## Results

- **Structural:** smoke contracts and eval checker pass on the optimized skills.
- **Live triple comparison:** `live_skill_execution: not_executed` — no isolated workspaces with three skill installs were run in this delivery session.
- **Kill criterion:** no proof regression observed in structural pins; a live run may still fail the bet and should restore prior skill text if it does.

## Limitation

This record satisfies task 03’s artifact slot honestly. It is not the full blinded comparison the spec describes. Schedule that run before claiming agent-performance improvement.
