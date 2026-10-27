# Skill behavior evaluation

Run these scenarios with the installed release in an isolated project. Record the host/version, available capabilities, prompt, observed result, and limitations. Repeat core scenarios in at least two intended host environments before claiming cross-host compatibility. A single model or a simulated tool absence is narrower evidence.

| Scenario | Expected behavior |
| --- | --- |
| Ordinary small coding request | Bootstrap context only; no unrelated workflow or approval ceremony |
| Explicit refinement request | Focused questions; settled decisions reused; docs created only when meaningful |
| Repository review with untracked source | Actual untracked files inspected; no mandatory baseline or tracker |
| Review without subagents | Direct review labeled single-agent; no invented independent panel |
| Research without a skill tool or workers | Available source tools used directly; limitations reported |
| Spec/ticket draft without tracker | Useful draft; no setup dependency or unauthorized publication |
| Prototype of a CLI/API question | Appropriate small experiment; no compulsory web UI or production promotion |
| Implementation with established test interface | Meaningful tests; no redundant seam approval or implicit commit |
| Ship a library with no deployment | Authorized delivery and checks; deployment marked not applicable |
| Failed required verification | Honest blocked/partial result; no fabricated completion |
| Write for humans | Concise audience-appropriate text, preserving facts and uncertainty |
| Write for agents | Clear context pointers, authority, completion criteria, and capability fallbacks |
| Doctor after bootstrap-only setup | Correctly distinguishes bootstrap from installed skills; read-only |
| Handoff to another agent | Temporary redacted summary with links, accepted decisions, unfinished work, verification, and one next step; no workspace copy and no host-specific invocation |

Deterministic tests cover reference integrity, metadata, bootstrap conflicts, customized skills, rollback, offline installs, upgrades, packed release content, and [smoke behavior contracts](../smoke-contracts.test.mjs). Live prompts in a second agent product still add confidence beyond contracts.

See dated result notes in this directory. Earlier evidence describes the version and limits observed at that time.

**Current status:** [2026-10-27 scenario status](./2026-10-27-scenario-status.md) · [remediation verification](./2026-10-27-remediation.md) · [code-review fixture](../fixtures/code-review-smoke/README.md)
