# Spec 028 comparison record (2026-10-28)

## Scope

Spec [028](../../docs/specs/028-outcome-build-and-ship.md): outcome-first `build`, `ship`, and `review`.

## Conditions

| Condition | What ran |
| --- | --- |
| Structural baseline | `pnpm validate` and `pnpm test` on spec 028 delivery branch |
| Optimized Flow (C) | E26 row; E34 Verify replay (a–c); E37 (a)(b)(c) slices — [partial record](2026-10-28-spec-028-live-partial.md) |
| No skills (A) | E26 + E34 Verify replay documented in partial record |
| Pre-028 (B) | E26 + E34 Verify replay from `492a90f` ship text in partial record |

## Prompts (from spec Testing Decisions)

E37 task set, copy fix, and API escalation; E26 draft stop; E34 verify reporting — reserved for a follow-up live run with Claude Opus 5.5 medium effort when the host offers it.

## Results

- **Structural:** smoke contracts and eval checker pass on the optimized skills.
- **Live triple comparison:** `live_skill_execution: partial` — E26 row complete for conditions A, B, and C; E34/E37 live cells and executable fixture CI for E34/E37 added. See [2026-10-28-spec-028-live-partial.md](2026-10-28-spec-028-live-partial.md).
- **Kill criterion:** no proof regression in completed cells (E26 all conditions; E34 Verify; E37 optimized slices). Full push/review/merge paths still open.

## Limitation

This record satisfies task 03’s artifact slot honestly. The full blinded 3×3 comparison is in progress; schedule remaining cells before claiming agent-performance improvement.
