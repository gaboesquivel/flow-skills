# 006: Skill reliability and behavioral verification

Status: in progress (2026-10-27). Research: [2026-10-27-skill-engineering-methods.md](../research/2026-10-27-skill-engineering-methods.md). Public attribution: [README](../../README.md#influences-and-engineering-philosophy).

## Problem statement

Flow's structural validation already checks packaging, metadata, links, and some text contracts. Structural passes are not proof that agents behave correctly when executing real tasks. The catalog needs to evaluate actual skill behavior, remove instructions that do not improve outcomes, and report cross-host verification honestly.

## Solution

1. **Public influences** — README documents six engineering influences and how Flow differs; detailed comparison lives in research and references.
2. **Authoring discipline** — `write-agents` requires a behavioral reason before new instructions and prefers mechanical prevention over prose.
3. **Correction discipline** — `retro` proposes architecture, types or checks, tests, then agent guidance for recurring mistakes, without auto-editing files.
4. **Review discipline** — `review` and [pr-review-contract.md](../pr-review-contract.md) add proportional blast-radius verification for consequential changes.
5. **Implementation proportion** — `implement` names domain shapes and callers only when the change is consequential; small fixes stay direct.
6. **Evaluation records** — `tests/evals/` scenarios E01–E15 with an evidence model; `pnpm eval:check` validates records without implying live agent runs.

## Acceptance criteria

- README intro, fifteen-skill catalog, optional `start` row, and influences section match approved copy.
- [docs/references.md](../references.md) indexes the six primary sources and spec 006.
- `write-agents`, `retro`, and `review` skill text reflects the disciplines above without mandatory workflow or new skills.
- E01–E15 exist with honest evidence statuses; checker rejects duplicate IDs, broken references, and false live-run claims.
- `pnpm validate` and `pnpm test` (including eval check) pass on `main`.
- Invocation policy unchanged: `flow` discoverable where supported; all other skills explicit; no orchestrator; no adopter instruction-file requirement.
- Live and second-host claims in docs match executions actually performed.

## Implementation decisions

- Stacked pull requests: documentation and spec first, then authoring/retro, then review/implement, then eval tooling.
- Smoke contract tests extend substring checks; they remain structural evidence, not live skill verification.
- PR alignment script stays deterministic; it does not become a general agent evaluator.
- Historical decisions and specs 003–005 are not rewritten for catalog count; current count is fifteen including `start` ([0010](../decisions/0010-optional-start-skill.md)).

## Testing decisions

- Existing `tests/smoke-contracts.test.mjs` updated when shipped `SKILL.md` text changes.
- `tests/eval-check.test.mjs` (or equivalent) covers malformed eval records, missing references, duplicate scenario IDs, and overstated evidence.
- Reuse [code-review-smoke](../../tests/fixtures/code-review-smoke/) for executable pricing review evidence where applicable.
- Blinded comparisons and baseline-vs-modified skill runs documented in eval README; rubric kept separate from candidate-visible prompts when used.

## Out of scope

- New catalog skills, skill routers, mandatory multi-agent review, or vendor-specific model assignments.
- Upstream synchronization, vendoring, or runtime dependencies on influence repositories.
- Claiming spec 005 template interoperability is complete because `start` exists.
- Publishing a release without separate authorization.
