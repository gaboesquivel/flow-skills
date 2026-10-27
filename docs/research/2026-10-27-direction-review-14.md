# Direction review, fourteen-skill catalog

Date: 2026-10-27. Tree: `main` at `0d4a783`. Status: advisory evidence. This note does not adopt a decision or authorize edits.

The [archived second pass](../archive/2026-10-27-reviews/direction-review.md) reviewed the twenty-five-skill tree and said to narrow the Lean Startup claim. This pass reviews the catalog after decisions 0004–0009.

## For the reviewing agent

Check each finding against the cited files. Reply confirmed, refuted, or uncertain. Do not implement from this note unless asked. Do not open a decision record from it.

This pass read the current product identity, catalog, Flow Lite, the three product-discovery skills, the validator’s expected names, the dogfood note, and the scenario status. It did not re-run `pnpm test` and did not invoke the skills in a second host. `git status` was clean.

## Verdict

Keep this catalog. Confidence is high that the written claim now matches the fourteen skills, and medium that those skills change a founder’s product decisions.

The earlier split is mostly closed. Flow is no longer described as a shipped Lean Startup system. `flow` is context alignment, not a router. Interview, jobs-to-be-done, and competitor framing exist as short optional skills. Validation boards, OMTM automation, bootstrap, and orchestration are named as not shipped. What remains ahead of evidence is the success sentence, the named ecosystem outside this repository, and one diagram that still teaches a pipeline.

## What the previous review asked for

| Earlier finding | Current tree |
| --- | --- |
| Do not call the engineering catalog a Lean Startup methodology | [PRODUCT.md](../../PRODUCT.md) defines Flow as a lightweight, human-led product engineering methodology. The flow-skills section says validation-board UI, OMTM automation, and commercial discovery pipelines are not shipped. |
| `flow` was spec-to-ship | [skills/flow/SKILL.md](../../skills/flow/SKILL.md) aligns root docs. It refuses to run a pipeline or to scaffold a repository. |
| Install path conflict between decisions 0002 and 0003 | [0004](../decisions/0004-portable-skill-catalog.md) is the install decision: `npx skills add gaboesquivel/flow-skills`. [0002](../decisions/0002-local-skill-ownership.md) marks its install path superseded. README matches 0004. |
| Catalog count and stale indexes | `skills/` has exactly the fourteen names in `EXPECTED_SKILL_NAMES` in [scripts/validate.mjs](../../scripts/validate.mjs). Ideas and initiatives are archived. |
| No product-discovery behavior in skills | `interview`, `jtbd`, and `competitors` are in the catalog. Each returns a frame or a guide and says it does not authorize implementation. |

## Findings

### F1. The success claim is still unmeasured

[PRODUCT.md](../../PRODUCT.md) says success is to reduce the time and effort between human intent and verified product value. The same file says no OMTM is selected for Flow and that broader demand remains unvalidated.

The recorded live work is [tests/smoke/2026-10-27-dogfood-context-alignment.md](../../tests/smoke/2026-10-27-dogfood-context-alignment.md): one Cursor agent, this repository, a doc-alignment edit, and a known pricing fixture (190 cents tracked, 189 cents in the untracked fix). The note says no adopter repository was modified and no second host was run. [tests/smoke/2026-10-27-scenario-status.md](../../tests/smoke/2026-10-27-scenario-status.md) marks most rows as contract passes. The second-host row is open.

That evidence supports “the skill text says the right thing.” It does not support a reduction in time to verified product value.

### F2. Verified value in the catalog is code and session alignment

The strategic chain is product thinking, engineering discipline, agent execution, verified value. The catalog-alignment table maps verified value to `review`, `retro`, and `tldr`, and says those do not claim a feature shipped.

[docs/methodology.md](../methodology.md) still tells a practitioner to define an OMTM when measurement can guide a decision. None of the fourteen skill entrypoints instruct that. Discovery skills separate evidence from inference and stop before implementation. They do not name a buyer, a price test, or a continue / change / stop rule.

That matches the decision to keep measurement as optional practice. It also means an agent that only follows installed skills can satisfy “verified value” with a code review and a recap.

### F3. The catalog page still draws a pipeline

[docs/skills.md](../skills.md) says every step is skippable and that no order is required. The diagram under that sentence is a single path: explore, grill, to-spec, to-tasks, implement, review, retro. [PRODUCT.md](../../PRODUCT.md) and [skills/flow/SKILL.md](../../skills/flow/SKILL.md) say there is no mandatory sequence. The diagram is the instruction a skimming agent will follow.

### F4. Flow Lite’s discoverable metadata is carefully worded and untested on an adopter

`flow` sets `disable-model-invocation: false`. Other skills set it to `true`. [docs/agent-compatibility.md](../agent-compatibility.md) says hosts may surface Flow Lite and that this is not evidenced on every host. [0009](../decisions/0009-adopter-product-context.md) says an adopter `PRODUCT.md` is that product, and the skill text repeats the refusal to copy Flow’s mission into it.

The dogfood run changed this repository only. The identity rule has not been observed in another repository.

### F5. The ecosystem table names products this repository does not contain

[PRODUCT.md](../../PRODUCT.md) lists flow-next, flow-mono, and Flow Factory, and names flow-next and flow-mono as the next dogfooding targets. This tree does not link to Flow-owned repositories for them. [docs/research/2026-10-20-competitive-landscape.md](2026-10-20-competitive-landscape.md) already records `gmickel/flow-next` as someone else’s project. If the names are internal reservations, the product doc does not say where those codebases live.

### F6. Discovery skills are real and thin

`skills/interview/SKILL.md`, `skills/jtbd/SKILL.md`, and `skills/competitors/SKILL.md` are short instructions: past behavior, a job frame, and switching dynamics. They tell the agent to read existing context, label inference, and not start implementation. They are product skills in a way the old requirements front end was not. They are not a discovery system, a research archive, or evidence that a customer conversation happened.

## Recommendation to challenge

Stop adding skills and decisions until one of these exists: a second host applying `/flow` or `/implement` on an adopter repository without copying Flow’s identity, or one recorded product decision outside this repo that used `interview`, `jtbd`, or `competitors`. Fix the pipeline diagram when touching docs. Leave OMTM and the validation board out of the catalog until that outside decision needs them.

A greener `pnpm validate` would not change this recommendation. The scenario status already treats structural checks as contracts.

## What would change the verdict

Move toward a stronger “continue” if an adopter repository shows Flow Lite editing that product’s docs, not Flow’s mission, or if a discovery skill is cited in a real continue / change / stop decision.

Reopen “narrow further” if a host auto-invokes `flow` and writes this repository’s tagline into another `PRODUCT.md`, or if agents treat the skills.md diagram as required stages.

Refute F5 if flow-next, flow-mono, and Flow Factory are linked to repositories this project actually owns.
