# Smoke behavior scenarios

Structural contracts live in [smoke-contracts.test.mjs](../smoke-contracts.test.mjs). Behavioral scenarios E01–E25 live in [evals/](../evals/README.md). Live prompts in a second agent product still add confidence beyond substring checks.

| Scenario | Intent |
| --- | --- |
| Ordinary small coding request | `/implement` on a clear task without prior `/to-spec` |
| Spec from conversation | `/to-spec` produces `docs/specs/NNN-*.md` when saved |
| Review working tree | `/review` reads untracked files |
| Voice-first activation | Every skill except `start` is model-invocable, and descriptions name spoken trigger phrases |
| Install without adopter edits | `npx skills add` does not require changing `AGENTS.md` |
| Adopter product context | Align root docs without copying Flow's identity; do not treat `flow start` as initialization |
| Review untracked pricing fix | `review` on the checkout fixture, including untracked work |

Record host, version, date, and outcome when running manual scenarios. A contract match is a structural check. A host session is live agent verification. Latest recorded runs: [2026-10-27 ecosystem readiness](2026-10-27-ecosystem-dogfood-readiness.md); [2026-10-27 context alignment](2026-10-27-dogfood-context-alignment.md); [2026-10-27 Claude Code live](2026-10-27-claude-code-live.md).
