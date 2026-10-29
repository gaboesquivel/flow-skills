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
- **Live triple comparison:** `live_skill_execution: partial` — one cell complete (optimized Flow × E26). See [2026-10-28-spec-028-live-partial.md](2026-10-28-spec-028-live-partial.md) and [2026-10-28-spec-028-live-procedure.md](2026-10-28-spec-028-live-procedure.md). Conditions A (no skills) and B (pre-028) and prompts E34/E37 not executed yet.
- **Kill criterion:** no proof regression in the completed cell; pre-028 and no-skill baselines still open.

## Limitation

This record satisfies task 03’s artifact slot honestly. The full blinded 3×3 comparison is in progress; schedule remaining cells before claiming agent-performance improvement.
