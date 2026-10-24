# Exploring PRD structure

Explored 2026-10-20. The user likes the structure and is collecting possibilities for Flow. This is a candidate reference, not adoption of a PRD artifact, template, skill, or prescribed workflow.

## Source and scope

- [Dean Peters — prd-development](https://www.skills.sh/deanpeters/product-manager-skills/prd-development).
- Inspected upstream [SKILL.md](https://github.com/deanpeters/product-manager-skills/blob/main/skills/prd-development/SKILL.md) and [template.md](https://github.com/deanpeters/product-manager-skills/blob/main/skills/prd-development/template.md) on live main. Companion skills, sample PRDs, and runtime behavior were not evaluated; no revision was pinned and no skill was installed or executed.

The template connects a summary, problem and evidence, users, strategic context, solution, metrics, requirements, exclusions, dependencies and risks, and open questions. Its most interesting mechanisms are inline assumption/unknown labels, consistency checks between sections, and a final assessment of weak evidence and the next useful action. The workflow also reuses supplied context rather than asking the same questions again.

## Candidate adaptations for Flow

| Mechanism | Potential use in Flow |
|---|---|
| Problem, user impact, business impact, and evidence kept connected | Strengthen initiative refinement while linking existing product context. |
| Assumptions distinguished from open questions at the point of use | Make uncertainty visible without presenting plausible guesses as facts. Use plain labels; the source's emoji convention is optional. |
| Cross-section consistency checks | Check that the proposed work addresses the stated problem, that evidence concerns the intended users, and that measurements assess the intended outcome. |
| Primary, supporting, and guardrail metrics | Complement OMTM; an initiative's primary metric may be a nearer-term signal and is not automatically the product-wide OMTM. |
| Scope exclusions with reasons; dependencies and edge cases | Clarify delivery boundaries without losing deferred ideas or repeating shared architecture. |
| Final self-assessment and next action | Identify the weakest consequential assumption and the next useful test; document completeness is not evidence of readiness. |

The connection between sections matters more than their number or exact ordering. Flow could borrow this coherence in a concise initiative brief, expanding only where the work needs detail. Existing ownership remains: PRODUCT.md for durable direction, initiative records for scoped intent and findings, DESIGN.md and ARCHITECTURE.md for their decisions when present, research for source assessments, and selective PDR/ADR records for significant rationale.

## Adaptation limits

The upstream workflow specifies eight phases over several days, multiple workshops, companion skills, and stakeholder review. These are not adopted for Flow's solo-founder and small-team audience. Personas, market sizing, user-story syntax, and a full ten-section document should remain proportional choices rather than prerequisites.

Targets and expected impacts must be labeled as hypotheses until supported. A metric named in a PRD does not establish causality or commercial value. A clear target-user description can be enough without a named fictional persona. Preserve the distinction between delivery acceptance criteria and outcome evidence. PRD means Product Requirements Document; Flow's PDR means Product Decision Record, with a different purpose.

## Exploration, research, ideas, and intent

The user described the current activity as exploration and questioned whether these distinctions could help Flow without adding complexity. Proposed interpretation for discussion:

- **Exploration** is an activity that opens possibilities: browsing references, comparing approaches, sketching, and trying prototypes. It can begin without a bounded question.
- **Research** is an evidence-seeking activity directed at a question. It may happen within exploration or intentional delivery work; source inspection answers what a reference contains, not whether it will improve Flow.
- **Idea** remains the existing glossary concept: a possibility worth preserving. Either activity may produce or refine one.
- **Intent** expresses what we want to learn or achieve. An initiative carries a commitment to pursue an outcome; intent does not require another artifact type.

These describe different aspects of work, not a four-stage pipeline. Existing docs/research already accommodates source comparisons and exploratory proposals, so this note can live there while remaining explicitly exploratory.

Subsequent disposition, 2026-10-20: the user adopted these distinctions for the [glossary](../../GLOSSARY.md#exploration), which now owns current meanings. Initiative remains the term for work deliberately undertaken; intent describes purpose rather than a separate artifact. No new folder, status, or skill was selected. The [exploration idea](../ideas/exploration-and-prototyping.md) tracks remaining packaging questions. PRD adaptations above remain proposals.
