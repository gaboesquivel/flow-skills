# Scenario status (2026-10-27)

| Scenario | Status | Evidence |
| --- | --- | --- |
| Ordinary small coding request | Pass (contract) | `implement` skill text |
| Spec numbering default | Pass (contract) | `to-spec` references `docs/specs/NNN-short-name.md` |
| Review untracked work | Pass (contract) | `review` skill text |
| Portable catalog (fixed skill list) | Pass (contract) | `validate.mjs` + `smoke-contracts.test.mjs` |
| Agent Skills CLI discoverability | Pass (automated) | `distribution.test.mjs` — `skills add <repo> -l` lists all catalog skills |
| GitHub remote install listing | Pass (manual) | `npx skills add gaboesquivel/flow-skills -l` after push to `main` at `2b93683` |
| Adopter product context vs Flow identity | Recorded (one agent, this repo) | [Dogfood record](2026-10-27-dogfood-context-alignment.md) — skill text changed in Cursor on 2026-10-27. No adopter repository was edited |
| Checkout pricing review with untracked fix | Pass (live read + executed functions) | Same record. Tracked total 190 cents; untracked fix 189 cents. Structural twin: `tests/code-review-smoke-fixture.test.mjs` |
| Second agent host live run | Open | Manual slash-command or skill-picker run outside Cursor not yet recorded |

Historical notes for the retired bootstrap installer: [archive](../../docs/archive/2026-10-27-reviews/README.md).
