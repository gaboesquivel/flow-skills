# Exploration and explanation through connected documentation

Status: proposal for discussion  
Date: 2026-10-18  
Evidence: [primary-source research](../research/2026-10-18-exploration-and-explanation.md)

Research references confirmed by the user: Matt Pocock’s Wayfinder and Emil Kowalski’s skills. This confirmation does not adopt the proposed command structure.

## User direction

A key benefit of Flow should be that people and agents can recover why a product, design, or architectural choice was made. Preserve meaningful steps from ideas through research, experiments, and decisions in lean documentation. Support creative brainstorming, evidence-seeking exploration, and disposable UI or logic prototypes that can challenge the current product definition.

The user is exploring command names and boundaries. These proposals do not supersede accepted decisions yet.

## Recommended capabilities

| Activity | Purpose | Durable result |
| --- | --- | --- |
| Explain | Answer what, how, or why using project evidence | A concise answer with source links; a diagram only when useful |
| Brainstorm | Generate and develop alternatives with the user | A short idea note when options are worth retaining |
| Explore | Investigate a bounded uncertainty | A research note with evidence, conclusion, and remaining unknowns |
| Refine | Resolve ambiguity and tradeoffs around a direction | Updates to the affected living documents when choices settle |
| Prototype | Test a question through a concrete UI or logic artifact | Findings, limitations, and a link to the artifact |

These are different working behaviors, not five obligatory steps. Refine can recommend ideas as well as ask questions; brainstorm can ask enough to understand the problem.

Start with four public entry points in this area: `explain`, `explore`, `refine`, and `prototype`. Offer brainstorming as an explicit mode of exploration initially, such as `/explore brainstorm`, rather than another required command. The exact syntax and skill packaging remain open; these commands are not installed.

## Explain

Prefer `explain` over `why`: it covers rationale, behavior, and relationships with one professional, descriptive name. Ordinary “why” questions should invoke the same capability.

Read relevant current specifications and follow links to decision records, research, and ideas. Inspect implementation or linked issue/PR history when necessary to establish what exists and whether it agrees with the docs. Historical reasoning comes from recorded evidence, not from plausible interpretation of code.

Answer directly, cite the supporting records, and distinguish documented rationale from inference or missing evidence. Check whether a decision is accepted, superseded, or merely proposed. Report disagreements between current code and documents instead of silently resolving them. A record may explain why an approach was chosen without proving it remains the best approach today.

Default to a short answer. Add a small diagram only when relationships or flows are easier to understand visually. Explanation is read-only by default; it does not manufacture a retrospective decision record or produce another permanent report for every question.

Example question: “Why do we have search and chat?” If no record explains the choice, the answer should say so, then separately describe the observed roles of each interface. It must not invent a prior user study or rationale.

## Explore and brainstorm

An exploration begins with a question and a stopping point. Borrow Wayfinder's explicit unknowns, linked evidence, and willingness to leave distant questions unresolved. A ticket map is optional for work large enough to justify it.

Brainstorming emphasizes meaningfully different possibilities, tradeoffs, and building on the user's contributions. Research emphasizes evidence that discriminates between those possibilities. Generated ideas remain hypotheses until supported.

Every completed explicit exploration leaves or updates one concise research note. Include the question, useful findings or options, sources or observations, conclusion, unresolved assumptions, and next useful action. If the session only brainstormed, say no external research or validation was performed; speculative ideas are not findings.

Use `docs/ideas/` for standalone concepts worth retaining or an idea that will outlive several investigations. Link that note from subsequent research. Keep options inside the research note for a small combined session; avoid creating both files merely to satisfy a template.

## Prototype

Prototype work starts with a question or assumption, and enough indication of what an informative result would look like. Choose the cheapest artifact that helps: sketches, interactive UI variants, executable logic, or a technical spike.

For UI comparisons, vary meaningful interaction or design choices rather than cosmetic details alone. Two or three alternatives may be useful; a fixed count is unnecessary. For a logic or feasibility question, one small executable demonstration may suffice.

Experiments may intentionally depart from PRODUCT.md, DESIGN.md, or ARCHITECTURE.md. State what is being challenged and keep the experiment separate from production. Exploring an alternative does not itself replace an accepted decision.

Use mocked data and shortcuts where they serve the question. Skip production hardening and unrelated test infrastructure. Verify that the demonstration runs and that the observation actually bears on the assumption; performance or correctness experiments may need measurements or focused tests.

Record the question, variants or approach, observations, limitations, and what was learned in the relevant research note. A user preference is not customer validation; a working mock is not evidence of real integration feasibility. A selected prototype still needs deliberate reconciliation with specifications and normal implementation verification before becoming production work.

Executable scratch assets may stay in `work/` or another explicitly isolated prototype location. Preserve durable findings under `docs/`, with useful screenshots or a reproducible artifact reference. If the executable is discarded, the note must still explain the observation and its limits.

## Lean documentation and traceability

Preserve meaningful options, evidence, decisions, and changed understanding, rather than a transcript of every turn. Documents should link forward to resulting decisions and back to supporting evidence where available.

- `docs/ideas/`: worthwhile possibilities and their disposition.
- `docs/research/`: questions, evidence, experiments, and conclusions.
- `docs/pdr/` and `docs/adr/`: significant accepted choices and rationale, with status and replacement links.
- Root PRODUCT.md, DESIGN.md, and ARCHITECTURE.md: the current project specifications, referencing significant decisions.
- Feature issues and implementation: specific behavior and delivery evidence, linked to relevant specifications and decisions.

These links support explanation; they are not a requirement that every change create every artifact. Ordinary choices can carry a brief reason in the relevant specification or feature issue. Create folders and notes only when there is substantive content.

Keep existing root specifications in place for now. Store new durable supporting knowledge under `docs/`; do not duplicate the specifications there or create a second task tracker.

## Relationship to the accepted workflow

[PDR 0001](../pdr/0001-focused-refinement.md) treats exploration as part of refinement and does not require a separate public command. This proposal adds an optional evidence-oriented Explore entry and makes brainstorming behavior explicit. If adopted, record the amendment without removing the original rationale. The accepted product/design/architecture focuses remain applicable.

## Questions to resolve through use

- Does a brainstorming mode feel distinct enough, or does it earn its own command?
- Does Explain recover documented rationale, correctly identify missing evidence, and expose superseded decisions?
- Can prototype work challenge established direction without accidentally promoting it to production?
- Do exploration notes remain useful and small across sessions?
