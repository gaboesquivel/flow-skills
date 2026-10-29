# Spec 028 live comparison — procedure

Parent record: [2026-10-28-spec-028-comparison.md](2026-10-28-spec-028-comparison.md). Partial runs: [2026-10-28-spec-028-live-partial.md](2026-10-28-spec-028-live-partial.md).

## Goal

Three conditions × three prompts (E37, E26, E34), same model, isolated workspaces. Score against rubrics in `tests/evals/rubrics/` without loading rubrics into the candidate session.

**Model:** Claude Opus 5.5 at medium effort when the host offers it; record the exact model id that ran.

**Kill criterion:** optimized skills miss a proof that pre-028 skills meet on the same prompt → revert skill text.

## Conditions

| Id | Skills | Source |
| --- | --- | --- |
| A — no Flow | None | Worktree with no `skills/` install and no Flow block (or empty block) |
| B — pre-028 | `build`, `review`, `ship` | Parent of spec 028 merge: `492a90f` paths `skills/{build,review,ship}/SKILL.md` |
| C — optimized | Current `main` | This repository's `skills/` tree |

Install for B in a worktree:

```bash
git worktree add ../flow-skills-028-b 492a90f
# symlink or copy only build/review/ship from that tree into the host's skill path
```

Never run competing write agents in the user's active workspace ([eval README](../README.md)).

## Prompts

| Prompt | Task file | Fixture |
| --- | --- | --- |
| E26 | [E26-task.md](../tasks/E26-task.md) | [e26-ship-draft-gate](../../fixtures/e26-ship-draft-gate/) |
| E34 | [E34-task.md](../tasks/E34-task.md) | [e34-ship-verify](../../fixtures/e34-ship-verify/) (+ [MOCK-GITHUB.md](../../fixtures/e34-ship-verify/MOCK-GITHUB.md)) |
| E37 | [E37-task.md](../tasks/E37-task.md) | [e37-build-outcomes](../../fixtures/e37-build-outcomes/) |

## Per run

1. Fresh clone or worktree; load only the condition's skills.
2. User message = task file body (or acceptance scenario step).
3. Capture trace, git state before/after, and agent report.
4. Score afterward from the rubric; note honest limitations.

## Status

| Condition | E26 | E34 | E37 |
| --- | --- | --- | --- |
| A — no skills | passed (Cursor, 2026-10-28) | not_executed | not_executed |
| B — pre-028 | passed (skill text `492a90f`, 2026-10-28) | not_executed | not_executed |
| C — optimized | passed (Cursor, 2026-10-28) | not_executed | not_executed |
