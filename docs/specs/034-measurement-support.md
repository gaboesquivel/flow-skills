# 034 — Measurement from intent to evidence

Status: draft (2026-10-29)

## Problem Statement

Flow helps name a main metric and core journeys but does not make them measurable or help judge results after shipping. Missing instrumentation, missing access, and too little evidence look alike, and a working feature is mistaken for an improved outcome.

## Solution

Measurement rides on the existing flow with no new stage: `explore` defines it, `to-spec` makes collection part of the acceptance scenario, and a new read-only `measure` skill evaluates evidence and names the gap. Proportional throughout: no analytics platform, questionnaire, or measurement section for unrelated work.

**Explore: define observable success.** Tie the OMTM (and supporting metrics, if any) to core journey outcomes, human and agent. Pin down what counts, population, calculation, window, likely source, baseline (or "unknown"), and target; a target without evidence is a hypothesis. Separate existing collection from proposed collection and name the smallest next step when the source is unknown. Durable definitions live in the adopter's `PRODUCT.md`, journey steps in `DESIGN.md`. Keep existing definitions; never require three metrics.

**To-spec: make collection actionable.** For work touching a metric or journey, reference the definition and state the observable outcome, source, calculation, and the acceptance step that proves collection works, covering failures, retries, duplicates, and human/agent attribution when they change the count. An emitted event is not a successful outcome. Reuse existing collection and label unknowns instead of assuming infrastructure. `build` and `review` then implement and verify it with no extra process.

**Measure: evaluate evidence, expose gaps.** Triggered by "measure our progress", "how are our metrics doing?", "are users completing this journey?". Reads intent and whatever evidence the host can reach: tools, local data, or user exports; no Git, vendor, or connector required. Reports baseline, current, target, source, period, sample, and limitations, with traceable calculations and labelled incompatible comparisons. Classifies each gap as **not collected**, **instrumentation missing or wrong**, **no access or tool**, or **insufficient for a conclusion**. Unknown is never zero; before/after alone is not causality. Recommends the smallest next step (existing infrastructure or a manual export before a new service; name a product only after checking its current capabilities), then states what the evidence supports, what stays uncertain, and the next measurement or decision. Read-only: installs, connects, schedules, and changes nothing.

`align` uses available results and points to `measure` when evidence is missing, without running it. `retro` stays about the session. Measurement never gates `ship`.

## Implementation Decisions

- Catalog addition and product boundary: [decision 0046](../decisions/0046-measurement-assistance.md) (Proposed).
- **Lean, outcome-first skills.** `measure` states outcomes and judgment rules, not steps or templates; target the size of `align`. Edits to `explore`, `to-spec`, and `align` are a few lines each, folded into existing sections, not new procedures. Apply `write-agents`.
- One home for the gap taxonomy and reporting rules: `skills/measure/SKILL.md`. Other skills link to it by name; the methodology links rather than restates. Installed skills stay self-contained; nothing fetches this repository at run time.
- Update together: catalog (`docs/skills.md`), packaging and validation expectations, `PRODUCT.md` boundary, glossary only if a term needs resolving, methodology pointer. Preserve source notices and in-flight website work.
- Instructions and context only; no hosted behavior or analytics code.
- **Exposure:** none deployed. Skills run inside the user's agent session and are read-only; nothing writes outside the repository.

## Testing Decisions

Existing packaging checks plus focused live skill exercises; checks run at the PR boundary. Record observations separately from structural checks; no tests that mirror wording.

**Acceptance scenario.** A maintainer's product turns a submitted request into a usable result through a web UI or an agent tool. OMTM: share of eligible requests with a usable result within 24 hours ("usable" defined by the product). No baseline.

1. `explore`: the brief links journey and metric, defines population and window, marks the baseline unknown, and names a plausible source without assuming tracking exists.
2. `to-spec`: the spec references that definition and adds an acceptance check where a failed request does not count and a retried completion counts once.
3. `measure` with no collection: reports missing instrumentation, proposes the smallest collection path, invents no number.
4. `measure` with a fixture export of 100 eligible requests, 60 unique qualifying completions, and one duplicate row: reports 60% with source, window, and sample, and does not treat the fixture as production evidence or proof of improvement.
5. No-access and too-small-sample variants: each gets the right diagnosis and a next step, neither becomes zero; tooling is suggested only for a concrete capability gap and nothing is installed.
6. `align` on progress: uses the result with its limitations and separates shipped capability from demonstrated value, without rerunning `measure`.

Dogfood `measure` on Flow's own idea → prod, time to start, and time to close PR (`PRODUCT.md`). First check whether that collection exists and is reachable; report missing sources honestly. Building the maintainer collector is not part of this spec.

## Direction changes

- `PRODUCT.md` "Not shipped as skills": OMTM automation stays excluded, but measurement is no longer only methodology practice; Flow ships read-only measurement assistance (decision 0046).

## Out of Scope

Analytics backends, vendor adapters, dashboards, automated monitoring, mandatory metric templates, ship gates, tool installation, and redesigning `build`, `review`, `ship`, or `retro`.
