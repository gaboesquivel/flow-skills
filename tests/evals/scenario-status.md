# Evaluation scenario status (2026-10-28)

| ID | Skill | Structural | Fixture | Live (Cursor) | Second host |
| --- | --- | --- | --- | --- | --- |
| E01 | build | passed | not_executed | not_executed | not_executed |
| E02 | flow | passed | not_executed | not_executed | not_executed |
| E03 | review | passed | passed | passed | not_executed |
| E04 | to-spec | passed | not_executed | not_executed | not_executed |
| E05 | grill | passed | not_executed | not_executed | not_executed |
| E06 | to-tasks | passed | not_executed | not_executed | not_executed |
| E07 | retro | passed | passed | passed | not_executed |
| E08 | review | passed | passed | passed | not_executed |
| E09 | write-agents | passed | not_executed | not_executed | not_executed |
| E10 | all | passed | not_executed | not_executed | not_executed |
| E11 | review | passed | not_executed | not_executed | not_executed |
| E12 | start | passed | passed | not_executed | not_executed |
| E13 | all | passed | not_executed | not_executed | not_executed |
| E14 | all | passed | not_executed | not_executed | not_executed |
| E15 | tldr | passed | not_executed | not_executed | not_executed |
| E16 | explore | passed | not_executed | not_executed | not_executed |
| E17 | explore | passed | not_executed | not_executed | not_executed |
| E18 | explore | passed | not_executed | not_executed | not_executed |
| E19 | explore | passed | not_executed | not_executed | not_executed |
| E20 | build, to-tasks | passed | not_executed | not_executed | not_executed |
| E21 | build, ship, to-tasks | passed | not_executed | not_executed | not_executed |
| E22 | flow | passed | passed | not_executed | not_executed |
| E23 | start, explore | passed | not_executed | not_executed | not_executed |
| E24 | start, explore | passed | not_executed | not_executed | not_executed |
| E25 | explore, to-spec | passed | not_executed | not_executed | not_executed |
| E26 | ship | passed | not_executed | passed | not_executed |
| E27 | ship | passed | not_executed | not_executed | not_executed |
| E28 | ship | passed | not_executed | not_executed | not_executed |
| E29 | to-spec | not_executed | not_executed | not_executed | not_executed |
| E30 | explore, flow | not_executed | not_executed | not_executed | not_executed |
| E31 | ship | not_executed | not_executed | not_executed | not_executed |
| E32 | explore | not_executed | not_executed | not_executed | not_executed |
| E33 | ship, review | not_executed | not_executed | not_executed | not_executed |
| E34 | ship | not_executed | not_executed | not_executed | not_executed |
| E35 | build | not_executed | not_executed | not_executed | not_executed |
| E36 | explore | not_executed | not_executed | not_executed | not_executed |
| E37 | build | passed | not_executed | not_executed | not_executed |
| E38 | build | not_executed | not_executed | not_executed | not_executed |
| E39 | start | not_executed | not_executed | not_executed | not_executed |

Live column: [2026-10-27-cursor-live.md](records/2026-10-27-cursor-live.md) (E03, E07, E08) and [2026-10-28-spec-028-live-partial.md](records/2026-10-28-spec-028-live-partial.md) (E26). Structural and fixture columns reflect `pnpm test` and `pnpm eval:check`. Second host still open.

Structural results recorded before [spec 031](../../docs/specs/031-fast-delivery.md) came from skill-wording pins that spec 031 removed; `tests/smoke-contracts.test.mjs` now checks safety rules by keyword. E29, E33, E36, and E38 describe behavior superseded by spec 031 ([decision 0044](../../docs/decisions/0044-fast-delivery.md)): the spec issue sync, a review before every merge, a pre-mortem at every depth, and a local suite run before integrating tasks.
