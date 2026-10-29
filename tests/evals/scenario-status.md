# Evaluation scenario status (2026-10-29)

| ID | Skill | State | Structural | Fixture | Live | Second host |
| --- | --- | --- | --- | --- | --- | --- |
| E01 | build | current | passed | not_executed | not_executed | not_executed |
| E02 | flow | current | passed | not_executed | not_executed | not_executed |
| E03 | review | current | passed | passed | passed | not_executed |
| E04 | spec | current | passed | not_executed | not_executed | not_executed |
| E05 | grill | current | passed | not_executed | not_executed | not_executed |
| E06 | tasks | current | passed | not_executed | not_executed | not_executed |
| E07 | retro | current | passed | passed | passed | not_executed |
| E08 | review | current | passed | passed | passed | not_executed |
| E09 | write-agents | current | passed | not_executed | not_executed | not_executed |
| E10 | all | current | passed | not_executed | not_executed | not_executed |
| E11 | review | current | passed | not_executed | not_executed | not_executed |
| E12 | start | current | passed | passed | not_executed | not_executed |
| E13 | all | current | passed | not_executed | not_executed | not_executed |
| E14 | all | current | passed | not_executed | not_executed | not_executed |
| E15 | tldr | current | passed | not_executed | not_executed | not_executed |
| E16 | explore | rewritten | not_executed | not_executed | not_executed | not_executed |
| E17 | explore | rewritten | not_executed | not_executed | not_executed | not_executed |
| E18 | explore | current | passed | not_executed | not_executed | not_executed |
| E19 | explore | current | passed | not_executed | not_executed | not_executed |
| E20 | build, tasks | rewritten | not_executed | not_executed | not_executed | not_executed |
| E21 | build, ship, tasks | rewritten | not_executed | not_executed | not_executed | not_executed |
| E22 | flow | rewritten | not_executed | passed | not_executed | not_executed |
| E23 | start, explore | rewritten | not_executed | not_executed | not_executed | not_executed |
| E24 | start, explore | rewritten | not_executed | not_executed | not_executed | not_executed |
| E25 | explore, spec | rewritten | not_executed | not_executed | not_executed | not_executed |
| E26 | ship | retired | passed | not_executed | passed | not_executed |
| E27 | ship | rewritten | not_executed | not_executed | not_executed | not_executed |
| E28 | ship, spec | rewritten | not_executed | not_executed | not_executed | not_executed |
| E29 | spec | retired | not_executed | not_executed | not_executed | not_executed |
| E30 | explore, build | rewritten | not_executed | not_executed | not_executed | not_executed |
| E31 | ship, build | rewritten | not_executed | not_executed | not_executed | not_executed |
| E32 | explore | current | not_executed | not_executed | not_executed | not_executed |
| E33 | ship, review | rewritten | not_executed | not_executed | not_executed | not_executed |
| E34 | ship | rewritten | not_executed | not_executed | not_executed | not_executed |
| E35 | build | retired | not_executed | not_executed | not_executed | not_executed |
| E36 | explore | rewritten | not_executed | not_executed | not_executed | not_executed |
| E37 | build | rewritten | not_executed | not_executed | not_executed | not_executed |
| E38 | build | retired | not_executed | not_executed | not_executed | not_executed |
| E39 | start, flow | rewritten | not_executed | not_executed | not_executed | not_executed |
| E40 | build, ship, write-agents | new | not_executed | not_executed | not_executed | not_executed |

**State.** `current`: unchanged and still valid. `rewritten`: task, rubric, and behavior updated on 2026-10-29 to the outcome the current skills promise after [spec 031](../../docs/specs/031-fast-delivery.md); its structural result reset to `not_executed` because the old one graded removed wording. `new`: added for spec 031. `retired`: superseded by [decision 0044](../../docs/decisions/0044-fast-delivery.md); its files and recorded evidence are history and it is not graded (see [README](README.md#retired-scenarios)).

Live column: [2026-10-27-cursor-live.md](records/2026-10-27-cursor-live.md) (E03, E07, E08, Cursor) and [2026-10-28-spec-028-live-partial.md](records/2026-10-28-spec-028-live-partial.md) (E26, Cursor, recorded before retirement). Structural and fixture columns reflect `pnpm test` and `pnpm eval:check`. Second host still open.

Structural results still marked passed were recorded before spec 031 from skill-wording pins it removed; `tests/smoke-contracts.test.mjs` now checks safety rules by keyword only. Spec 031 retired four scenarios: E26 (ship refusing a draft; drafts are now accepted on "ship it"), E29 (spec issue sync; there is no spec issue), E35 (build landing on local `main`; `ship` lands in both modes), and E38 (a baseline suite before integrating tasks; checks run once, in `ship`). Seventeen were rewritten to current behavior, including E27 (ship stops on a linked decision still Proposed after acceptance), keeping their safety coverage (no force-push, no self-approval, authorization boundaries, zero lost work). E40 covers the parallel-first task set and build's Work in flight; [2026-10-29-parallel-workflow-live.md](records/2026-10-29-parallel-workflow-live.md) records a real run that covered its worktree, shared-checkout, and containment items but not its dependent or unfinished task, so its live result stays `not_executed`.
