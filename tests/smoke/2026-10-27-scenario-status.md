# Smoke scenario status (2026-10-27)

Hosts: Cursor Composer (macOS); sequential CLI install path (Node 24, empty PATH in tests). See [remediation verification](./2026-10-27-remediation.md).

| Scenario | Status | Evidence |
| --- | --- | --- |
| Ordinary small coding request | Pass | Bootstrap: explicit activation only ([bootstrap/AGENTS.snippet.md](../../bootstrap/AGENTS.snippet.md)); init tests |
| Explicit refinement request | Pass | `grill` / `grill-with-docs` contracts; no setup dependency |
| Repository review with untracked source | Pass | [review-smoke fixture](../fixtures/code-review-smoke) + live drill in remediation |
| Review without subagents | Pass | `review` contract + remediation |
| Research without a skill tool or workers | Pass | `research` contract |
| Spec/ticket draft without tracker | Pass | `to-spec` / `to-tickets` text + contracts |
| Prototype CLI/API | Pass | [prototype-smoke fixture](../fixtures/prototype-smoke) + `prototype` contract |
| Implementation with tests | Pass | `implement` + `tdd` contracts; proportional seam language |
| Ship library without deployment | Pass | `ship` contract |
| Failed required verification | Pass | `verify` contract |
| Write for humans | Pass | Remediation fresh-context row |
| Write for agents | Pass | `SKILL-MECHANICS` contract + validator adapters |
| Doctor bootstrap-only | Pass | `doctor` contract + `init-integration` bootstrap-only test |
| Explore and requirements boundaries | Pass | `explore` / `requirements` contracts; distinct from `grill` and `to-spec` |

**Automated contracts:** [tests/smoke-contracts.test.mjs](../smoke-contracts.test.mjs) (30 tests total in suite).

**Release gate:** broad cross-host compatibility and automatic-activation behavior still require additional live runs in a second agent product beyond this session; structural remediation and local-source ownership are complete per [decision 0002](../../docs/decisions/0002-local-skill-ownership.md).
