# Scenario status (2026-10-27)

| Scenario | Status | Evidence |
| --- | --- | --- |
| Ordinary small coding request | Pass (contract) | `implement` skill text |
| Spec numbering default | Pass (contract) | `to-spec` references `docs/specs/NNN-short-name.md` |
| Review untracked work | Pass (contract) | `review` skill text |
| Portable catalog (fixed skill list) | Pass (contract) | `validate.mjs` + `smoke-contracts.test.mjs` |
| Agent Skills CLI discoverability | Pass (automated) | `distribution.test.mjs` at the time, now `tests/release/skills-cli.test.mjs` (run by `pnpm test:release` on release tags) — `skills add <repo> -l` lists all catalog skills |
| GitHub remote install listing | Pass (manual) | `npx skills add gaboesquivel/flow-skills -l` lists 15 skills on `main` at `54cdcc0` (2026-10-27) |
| Ecosystem cleanup before product dogfood | Pass (structural + live deploy) | [Readiness record](2026-10-27-ecosystem-dogfood-readiness.md); starter workflow skills removed on `e63fb72` / `5055c2d` |
| Adopter product context vs Flow identity | Recorded (one agent, this repo) | [Dogfood record](2026-10-27-dogfood-context-alignment.md) — skill text changed in Cursor on 2026-10-27. No adopter repository was edited |
| Checkout pricing review with untracked fix | Pass (live read + executed functions) | Same record. Tracked total 190 cents; untracked fix 189 cents. Structural twin: `tests/code-review-smoke-fixture.test.mjs`. Eval: [E03 live replay](../evals/records/2026-10-27-cursor-live.md) |
| Behavioral eval catalog E01–E15 | Pass (structural + eval:check) | [tests/evals/scenario-status.md](../evals/scenario-status.md); three Cursor live replays on 2026-10-27 |
| Second agent host live run | Pass (headless, read-only) | [Claude Code 2.1.308 in meta-cto](2026-10-27-claude-code-live.md): discovery, `/tldr`, `/flow`, and `/simplify` resolving to the installed Flow skill. Write paths and implicit `flow` surfacing not yet observed |

Historical notes for the retired bootstrap installer: [archive](../../docs/archive/2026-10-27-reviews/README.md).
