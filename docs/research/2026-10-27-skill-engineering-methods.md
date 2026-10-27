# Skill engineering methods comparison

Inspected 2026-10-27 on live `main` branches unless noted. Revisions were not pinned for every file. This note informs [spec 006](../specs/006-skill-reliability.md); it does not adopt upstream workflows wholesale.

## Summary table

| Source | Key files inspected | Problem addressed | Flow equivalent today | Proposed improvement | Adoption | Testing |
| --- | --- | --- | --- | --- | --- | --- |
| Matt Pocock | `writing-for-agents`, `SKILL-MECHANICS`, `grill-me`, `grill-with-docs`, `implement`, `prototype`, `handoff` | Agents waste context; vague completion; re-asking settled facts | Leading words ([0008](../decisions/0008-leading-words-and-visual-summaries.md)), short skill entrypoints, `grill`/`explore` context recovery | Sharpen `write-agents`, `explore`, `grill`, `to-spec` with no-op pruning and behavioral reasons for new lines | adapt | Smoke contracts; eval E05, E09 |
| Lauren Tan (pstack) | `correct`, `blast-radius`, `architect`, `how`, `why`, `interrogate`, `create-verification-skill`, `eval.md` | Repeated agent mistakes; unverified consequential changes | `retro` improvement candidates; `review` caller tracing | Prevention hierarchy in `retro`; blast-radius in `review` | adapt | Eval E07, E08; retro fixture |
| Addy Osmani | verification, simplification, review, spec-related skills | Shipping without exit criteria; bloated instructions | `implement`/`review` exit reporting; `to-spec` proportionality | Keep focused verification language; reject large checklists | adapt | Eval E01, E03 |
| Jesse Vincent (Superpowers) | skill testing / debugging docs | Skills change without baseline or regression | Dogfood section in methodology; smoke notes | Baseline-before-edit eval discipline; realistic failure scenarios | adapt | Eval blinded comparison docs |
| Anthropic | Skill Creator evaluation patterns | Unknown skill effectiveness | `pnpm validate`, smoke contracts | Triggering tests, negative cases, honest variance reporting | adapt | `eval:check`, E01–E15 |
| Vercel agent-skills | packaging and rule skills | Noisy universal rules | Portable packages, `agents/openai.yaml` | High-value rules with good/bad examples in `write-agents` only when needed | adapt | Distribution tests |
| pstack central mode / 23 playbooks | README, mode wiring | Full engineering OS in one plugin | Explicit invocation catalog | Do not reproduce orchestration | reject | — |
| Superpowers auto-chaining | workflow skills | Mandatory skill pipelines | No mandatory sequence ([0004](../decisions/0004-portable-skill-catalog.md)) | Keep explicit invocation | reject | Eval E10 |

## Matt Pocock

**Method:** Context pointers with front-loaded leading words; information hierarchy (steps vs disclosed reference); completion criteria that are checkable; prune no-ops and duplication; recover context before questioning (`grill-me`, `grill-with-docs`).

**Flow:** Already uses leading words and short `SKILL.md` files. `explore` and `grill` recover facts before asking.

**Improvement:** `write-agents` should require a behavioral reason before adding an instruction and prefer mechanical prevention when possible.

**Limits:** Model-default assumptions in upstream text are hypotheses; Flow does not copy router or setup skills.

## Lauren Tan (pstack)

**Method:** `correct` — fix mistake classes at architecture, types/lint, tests, then docs; prove checks fail on real past mistakes. `blast-radius` — hidden dependents and safety-critical assumptions need executable evidence. `eval.md` — blinded tasks, rubric outside candidate context.

**Flow:** `retro` mentions checks and no-ops; `review` traces callers.

**Improvement:** Encode prevention order in `retro`; proportional assumption proof in `review` and PR contract.

**Limits:** pstack mode, swarm, and fixed playbook sequences are rejected. No vendor model roster.

## Addy Osmani

**Method:** Production exit criteria, clear requirements, maintainability, small useful diffs, spec discipline without ceremony.

**Flow:** `implement`, `review`, `to-spec`, PR contract.

**Improvement:** Align eval scenarios with exit criteria; avoid importing mandatory review stages.

**Limits:** Historical archive research may be stale; spot-check skills only.

## Jesse Vincent (Superpowers)

**Method:** Baseline behavior before skill edits; demonstrate an instruction fixes an observed failure; regression tests for agent behavior.

**Flow:** Smoke scenario status distinguishes contract vs live.

**Improvement:** Record baselines in eval records; single-agent adversarial pass labeled honestly.

**Limits:** Full Superpowers workflow and automatic chaining rejected.

## Anthropic Agent Skills

**Method:** Activation and triggering tests, representative and negative prompts, baseline comparison, report variance.

**Flow:** Validator and smoke contracts.

**Improvement:** `tests/evals/` with evidence types; checker forbids overstated success.

**Limits:** No claim that structural tests equal live runs.

## Vercel Agent Skills

**Method:** Focused bundles, prioritized engineering rules, examples, minimal entrypoint context.

**Flow:** npm package ships `skills/` only; adapter metadata for invocation.

**Improvement:** Keep framework-specific guidance out of universal delivery skills.

**Limits:** Vercel-only deployment rules belong in template repos, not flow-skills catalog.

## Portability

All adopted changes stay in Flow-owned `skills/` and docs. No runtime dependency on upstream repos. Subagent guidance describes outcomes and fallbacks without requiring Cursor-specific APIs or fixed model IDs.

## Open questions

- Second agent host live runs for E10–E14 remain unverified until recorded.
- Token and cost proxies are optional; do not publish efficiency claims without data.
- Whether eval records should gate releases beyond `pnpm test` — deferred; maintainer judgment.

## Distinction from Flow decisions

Accepted decisions [0004](../decisions/0004-portable-skill-catalog.md)–[0010](../decisions/0010-optional-start-skill.md) govern catalog size, invocation, `start`, and product context. This research proposes skill-text and verification improvements only; it does not supersede those records.
