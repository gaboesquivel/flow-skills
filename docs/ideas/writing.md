# Writing for humans and agents

Status: two skills adopted on 2026-10-19; local implementations added on 2026-10-27; behavior evaluation continues. Current commitment: [PRODUCT.md](../../PRODUCT.md).

The names identify the intended reader: `write-for-humans` and `write-for-agents`. The user requested both capabilities and identified Factory's human-writing and Matt Pocock's writing-for-agents as references. See the [source assessment](../research/2026-10-19-writing.md).

## Boundaries

- `write-for-humans`: draft and edit product copy, documentation, and communications for their audience and purpose. Preserve meaning and the author's voice; favor concrete, readable language.
- `write-for-agents`: draft and edit skill instructions, agent guidance, and supporting context so agents can find relevant information, act on it, and recognize completion.

Shared project documents can serve both audiences. Apply both perspectives to the same authoritative content when useful; avoid maintaining duplicate versions solely for different readers.

On October 20, progressive disclosure and concise task-specific documentation were adopted as [current practice](../methodology.md#write-context-for-agents-and-humans). The later local implementation preserves this direction without adopting every source rule.

## Evaluation examples (2026-10-27)

| Skill | Prompt shape | Pass properties |
| --- | --- | --- |
| `write-for-humans` | Shorten a status update for a non-technical reader; keep launch date uncertain | Shorter lead, preserved uncertainty, no invented facts |
| `write-for-agents` | Add completion criteria to a skill that runs tests | Observable checks, scope boundary, no implicit invocation promise |

Recorded runs: [remediation verification](../../tests/smoke/2026-10-27-remediation.md). Contract checks: [smoke-contracts.test.mjs](../../tests/smoke-contracts.test.mjs).

## Open choices

These capabilities span product and engineering. The local implementations and explicit-activation policy follow [decision 0002](../decisions/0002-local-skill-ownership.md). The references inform design; their full rules are not automatically adopted. Further refinement depends on [behavior evaluation](../../tests/smoke/README.md).

## Descriptive technical naming plan

Direction adopted by the user on 2026-10-27: prefer concise, technically accurate, descriptive names. **Implemented** catalog names and migration are recorded in [decision 0003](../decisions/0003-skill-naming.md). The table below is historical proposal material retained for rationale; it does not describe the current skill directories.

### Naming rules

- Name the actual activity or capability. A reader should predict the skill's purpose without learning Flow-specific vocabulary.
- Prefer established product and engineering terminology; use short kebab-case names without sacrificing meaning. Add a qualifier only when it resolves a real ambiguity.
- Keep accurate familiar terms such as code review, domain modeling, test-driven development, prototype, and systematic debugging. Technical precision does not require replacing every term with a longer phrase.
- Avoid theatrical labels and metaphors as the primary instruction. Prefer concrete operational wording inside skills as well as in their names.
- Keep Flow as the product name. Keep the already requested `write-for-humans` and `write-for-agents` names. Do not force every skill into an identical grammatical pattern or add a new prefix.

### Proposed skill names

| Current | Proposed | Reason |
|---|---|---|
| grilling | requirements-clarification | Describes resolving goals, constraints, and consequential uncertainty through questions. |
| grill-with-docs | requirements-refinement | Describes clarification plus updates to terminology and decision context. Confirm that this distinction warrants two skills; if not, merge into this capability. |
| council | expert-review | Describes advisory review from relevant expert perspectives without promising multiple agents when unavailable. |
| doctor | installation-diagnostics | Identifies what is being diagnosed and does not imply repair. |
| to-spec | specification-writing | Names the output and activity directly. |
| to-tickets | task-planning | Fits Flow's task terminology and does not require a particular issue tracker. |
| extract | code-extraction | Identifies the reusable engineering material being extracted, including related configuration and tests. |
| ship | software-delivery | Covers verification, commit, push, and applicable release/deployment work; `deployment` alone would be too narrow. |
| retro | retrospective | Uses the complete established practice name. |

Retain other names unless inspection exposes a concrete ambiguity. In particular, keep `implement`, `research`, `prototype`, `tdd`, `code-review`, `domain-modeling`, `code-simplification`, `security-and-hardening`, `performance-optimization`, `systematic-debugging`, and `verification-before-completion`.

### Instruction terminology

| Current wording | Preferred wording |
|---|---|
| tracer-bullet tickets | independently verifiable end-to-end tasks |
| frontier | tasks with no unresolved dependencies, or questions ready to answer, according to context |
| blast radius | affected components or scope of impact |
| iron law | requirement or verification rule |
| seam | public test boundary when that is the intended meaning; retain and explain the established testing term where a dependency substitution point is actually meant |

Keep established terms such as vertical slice and expand–contract when they describe the actual technique. Avoid global replacement: context determines the technically correct wording. Preserve historical quotations and source names in attribution and research.

### Implementation sequence and acceptance

1. Inventory names and terminology across entrypoints, support files, adapter metadata, bootstrap, installer, tests, and current docs. Map each term to the actual behavior before selecting its replacement.
2. Resolve overlapping skill boundaries, especially the two clarification/refinement skills. Do not disguise duplicate behavior with different names. Finalize the rename map in this section.
3. Apply directory, frontmatter, title, example invocation, cross-reference, adapter, and documentation changes together. Add the naming rule to the writing skills and relevant review guidance without duplicating the full policy across every file.
4. Handle installed versions explicitly: detect legacy managed names, migrate unchanged managed copies, preserve customized copies, and report conflicts. Do not silently leave both old and new skills installed or delete unowned directories. Prefer a documented migration map to permanent alias skills unless a verified compatibility need warrants aliases.
5. Validate the packaged distribution and a fresh install, then test upgrades containing both unchanged and customized old-name skills. Check that active references resolve, names match directories, and descriptions accurately predict behavior. Historical evidence and migration maps may retain old names.
6. Evaluate representative prompts: clarify requirements, plan tasks, review a decision, diagnose installation, and deliver a verified change. Confirm users and agents can select the intended skill without an explanation of a metaphor. Record outcomes and limitations; a text search alone does not prove discoverability.

This pass changes naming and clarity. It must preserve existing authorization boundaries, behavior, attribution, and the distinction between planned and implemented capabilities. Broader workflow changes remain separately scoped.
