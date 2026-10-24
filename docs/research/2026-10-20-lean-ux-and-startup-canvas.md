# Lean UX and startup canvas exploration

Explored 2026-10-20. User-selected references, particularly Startup Canvas for the existing canvas idea. Both remain candidates; no canvas format, required artifact, or skill boundary is adopted.

## Sources and limits

- **Wondel Lean UX:** [listing](https://www.skills.sh/wondelai/skills/lean-ux), full [SKILL.md](https://github.com/wondelai/skills/blob/main/lean-ux/SKILL.md) (metadata version 1.4.0), and [hypothesis canvas](https://github.com/wondelai/skills/blob/main/lean-ux/references/hypothesis-canvas.md). Reviewed live main without a pinned revision. Other supporting files and the books it cites were not reviewed; this assessment concerns the skill's interpretation, not the full Lean UX methodology.
- **Paweł Huryn Startup Canvas:** [listing](https://www.skills.sh/phuryn/pm-skills/startup-canvas) and full [SKILL.md at revision 07b34f64](https://github.com/phuryn/pm-skills/blob/07b34f64ee828df08953f505b7f747aef85ae7c6/pm-product-strategy/skills/startup-canvas/SKILL.md). Its linked presentation and Product Compass articles were not inspected, so no visual-layout assessment is implied.

Neither skill was installed or executed. Their examples and prescriptions are source material, not evidence of effectiveness in Flow.

## Lean UX: connect experience choices to learning

Useful candidates include separating business assumptions from user assumptions, prioritizing consequential uncertainty, and relating a proposed experience to a specific audience, behavior, outcome, and observable signal. Decomposing a large hypothesis can expose cheaper tests. Collaborative exploration of alternatives and selecting sufficient prototype fidelity fit Flow's existing exploration direction.

Adaptation matters:

- Preserve concise written context. The source's preference for shared understanding over documentation cannot replace durable context for agents working across sessions. Findings should update the owning product, design, or initiative record.
- Choose the least costly test capable of answering the question; low visual fidelity is not inherently cheaper or more informative than agent-generated working software.
- A usability result does not establish demand, paid conversion, or retention. The hypothesis log pairs a paid-conversion hypothesis with prototype completion as its measure; that tests only part of the causal chain. Successful component tests likewise do not prove the combined product outcome.
- Its universal score, workshops, weekly cadence, staggered sprints, hypothesis per story, and requirement for recent invalidation are not adopted. A solo founder can use the reasoning without those ceremonies. Delivery completion and outcome evidence remain distinct.
- Prototype participant counts and the quoted five-user heuristic are not general validation thresholds. Proto-personas remain assumptions; agent-generated perspectives do not substitute for customer evidence. Preserve inconclusive results and reasons for deferral rather than automatically removing every failed idea.

## Startup Canvas: make strategic choices explicit

The source combines nine strategy sections—vision, market segments, relative costs, value proposition, trade-offs, metrics, growth, capabilities, and competitive defensibility—with cost structure and revenue streams. It concludes by surfacing critical hypotheses and suggesting experiments.

The strongest candidates for Flow are explicit exclusions, the first customer segment, the before/after customer outcome compared with alternatives, required capabilities, and whether distribution, costs, and revenue assumptions fit together. Its distinction between cost positioning and actual operating costs is useful. Defensibility questions can challenge unsupported differentiation claims without requiring an early product to demonstrate a moat.

Treat the source's preference over other canvases as author judgment. Partnerships and resources may be central even at an early stage. Do not require multiple segments, a binary low-cost/premium position, a North Star plus quarterly OMTM, or invented financial estimates to fill boxes. Reuse known context, label assumptions and unknowns, and select measurement appropriate to the decision. Flow already adopts OMTM with a context-dependent review point.

## Candidate relationship within Flow

| View | Question | Existing information owner |
|---|---|---|
| Strategy/business canvas | Who are we serving, what choices distinguish the product, and how might it sustain itself? | PRODUCT.md for current context; research for evidence and alternatives |
| Experience hypothesis | What change might help a user achieve an outcome, and how could we test it? | Initiative and experiment records; DESIGN.md for accepted experience decisions |
| Validation board | What are we testing, what happened, and what decision follows? | Shared hypothesis, experiment, evidence, and decision records; representation remains open |

Proposal: explore a compact canvas view of existing product context, linked to the validation board's tests, rather than maintain a second authoritative strategy document. The canvas expresses the current set of assumptions and choices; the board preserves how evidence changes them. Whether a separate visual view earns its maintenance cost remains unresolved.

For the [development initiative](../initiatives/methodology-and-skills.md), a useful later exercise is to map one real product question across these views and check for missing context or duplication before selecting a schema or skill. The [canvas idea](../ideas/validation-board-and-canvas.md) retains that open choice.
