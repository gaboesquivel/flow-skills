# Scenario status (2026-10-27)

| Scenario | Status | Evidence |
| --- | --- | --- |
| Ordinary small coding request | Pass (contract) | `implement` skill text |
| Spec numbering default | Pass (contract) | `to-spec` references `docs/specs/NNN-short-name.md` |
| Review untracked work | Pass (contract) | `review` skill text |
| Portable catalog (12 skills) | Pass (contract) | `validate.mjs` + `smoke-contracts.test.mjs` |
| Agent Skills CLI discoverability | Pass (automated) | `distribution.test.mjs` — `skills add <repo> -l` lists 12 skills |
| GitHub remote install listing | Pass (manual) | `npx skills add gaboesquivel/flow-skills -l` after push to `main` at `2b93683` |
| Second agent host live run | Open | Manual slash-command or skill-picker run outside Cursor not yet recorded |

Historical notes for the retired bootstrap installer: [2026-10-27-remediation.md](./2026-10-27-remediation.md), [2026-10-27-example-project-init.md](./2026-10-27-example-project-init.md).
