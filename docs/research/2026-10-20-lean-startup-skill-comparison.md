# Lean Startup skills: comparative exploration

Reviewed 2026-10-20. User-selected research for defining Flow's product skills and workflow, with particular interest in Booklib. Both remain candidate references; this review does not adopt their instructions or select skill boundaries.

## Sources and inspection limits

The supplied skills.sh pages could not be retrieved. The corresponding upstream skill files were inspected instead:

- **Founder Playbook:** [directory listing supplied by the user](https://www.skills.sh/getagentseal/founder-playbook/lean-startup); [SKILL.md](https://github.com/getagentseal/founder-playbook/blob/main/skills/lean-startup/SKILL.md), plus the cycle-planning and MVP-selection sections of [examples.md](https://github.com/getagentseal/founder-playbook/blob/main/skills/lean-startup/examples.md). Other supporting files were not fully assessed.
- **Booklib:** [directory listing supplied by the user](https://www.skills.sh/booklib-ai/booklib/lean-startup); [SKILL.md](https://github.com/booklib-ai/booklib/blob/main/skills/lean-startup/SKILL.md), [practices catalog](https://github.com/booklib-ai/booklib/blob/main/skills/lean-startup/references/api_reference.md), [review checklist](https://github.com/booklib-ai/booklib/blob/main/skills/lean-startup/references/review-checklist.md), and [three evaluation cases](https://github.com/booklib-ai/booklib/blob/main/skills/lean-startup/evals/evals.json). Skill metadata reports version 1.0 and MIT licensing.
- **Comparison:** rechecked Addy's [idea-refine](https://github.com/addyosmani/agent-skills/blob/main/skills/idea-refine/SKILL.md), alongside Flow's [earlier comparison](2026-10-19-refinement-comparison.md) and [product and Lean Startup research](2026-10-19-productskills-and-lean.md).

These are live-main source reviews without pinned commits or runtime evaluation. The skills are interpretations of Lean Startup, not independent evidence of business effectiveness or verification of every claim attributed to Eric Ries. No skill was installed or executed. Existing research on Ries, Wondel, Uxcel, ProductSkills, and the validation board remains relevant.

## Founder Playbook

Its entry point is a broad reference for decisions under uncertainty. Useful mechanisms include planning backward from the intended learning, distinguishing value from growth assumptions, selecting among experiments that require different amounts of software, and examining progress against a baseline. The inspected example planner records disconfirming evidence, measurement, scope exclusions, results, and an inconclusive outcome.

Flow assessment: use these as optional reasoning aids within initiative refinement and outcome review. Keep one compact record attached to the initiative rather than introduce a worksheet for every framework. Choosing an experiment should follow the uncertainty and available evidence.

Limits: the main skill includes categorical growth-engine routing, regular pivot meetings, and broad instructions to link every feature to a hypothesis and metric. These should not become universal requirements for routine delivery. Its simplified growth economics and MVP-quality statements need context rather than literal adoption. Our recommendation is to preserve the learning objective while selecting proportional methods and retaining relevant quality requirements.

## Booklib

### Most useful design ideas

The skill has two modes: applying strategy and reviewing strategy. It reuses or gathers context about maturity, venture type, uncertainty, and resources, then directs the agent to relevant practices. A separate catalog and checklist provide detail. Its feedback guidance discourages invented defects and calls for recognizing sound work.

This is a useful candidate structure for Flow: helping shape an initiative and revisiting its rationale can share concepts and records while answering different user needs. The distinction need not imply two separate skills. References should be loaded for the current decision rather than become a mandatory tour through book chapters.

### Where adaptation matters

The checklist makes some process choices appear universally necessary: A/B testing, cohort analysis, regular pivot meetings, and familiarity with a pivot catalog. It also treats a metrics spike as an indicator of product/market fit. Flow should assess applicability and evidence quality before assigning severity. Limited traffic, long buying cycles, or work on a known problem may call for different methods.

The catalog's validation stage is a useful reminder to follow up after delivery. It should not collapse delivery completion and learning into one status: a technically complete change may still have inconclusive outcome evidence. Flow already distinguishes these in its methodology; the board's eventual representation remains open.

### Evaluation cases expose a useful caution

Booklib includes two flawed-plan cases and one intended positive case. Testing both criticism and restraint is useful, but the expected answers need scrutiny:

- The feature-request case labels support tickets as opinions. Tickets may document actual failed tasks; their evidential value depends on their content. They can establish a problem without establishing the retention effect of a proposed solution.
- The positive case tests manually written summaries while naming action on AI-generated summaries as the risky assumption. Opens and satisfaction do not directly measure action; interest in continuing does not establish willingness to pay. Manual delivery can test the service's usefulness, but its results alone do not establish AI reliability or trust. The rubric nevertheless directs the reviewer to praise the plan and treat suggestions as minor.

Proposed Flow evaluation principle: reward accurate assessment of the relationship between hypothesis, method, evidence, and decision. Numerical thresholds and familiar template fields are insufficient. Recognize strengths while identifying substantive gaps, and preserve uncertainty when the evidence cannot answer the question. These are source-review findings, not results from running Booklib.

## Flow's differentiation

Addy's idea-refine already addresses target users, success, alternatives, value, feasibility, differentiation, assumptions, and an MVP intended to test them. Describing it as having no product discovery would be inaccurate. This comparison does not audit the entire Addy collection.

Flow's intended emphasis is a maintained connection between business and customer uncertainty, experiment selection, engineering delivery, observed outcomes, and the next decision. Our assessment is that the differentiator should be demonstrated through that continuity across shared project records. The presence of another Lean Startup skill alone does not establish distinctiveness or demand.

## Questions for the product-skill design discussion

1. What should trigger help: an unclear opportunity, a risky assumption, an experiment to design, or evidence to interpret? Map these needs before selecting command names.
2. How should discovery and initiative refinement share context without duplicating interviews or documentation?
3. Which parts of experiment design and outcome review need independent entry points, and which belong inside existing work?
4. What evidence is sufficient for the next decision, and what remains unknown? Keep inconclusive, stop, and further-research outcomes available.
5. How should a change of direction update PRODUCT.md and the initiative, with a PDR only when warranted, while preserving the experiment's original intent and findings?

One candidate relationship to explore is: refine a consequential uncertainty, choose a useful test, deliver only what that test needs, inspect evidence, and revisit the decision. This is a discussion aid, not an adopted sequence; open exploration and ordinary implementation remain valid entry points.

The [archived development initiative](../archive/2026-10-27-ideas-initiatives/initiatives/methodology-and-skills.md) owned historical discussion. [Business discovery and metrics](../archive/2026-10-27-ideas-initiatives/ideas/business-discovery-and-product-metrics.md) and [collaborative refinement](../archive/2026-10-27-ideas-initiatives/ideas/collaborative-refinement.md) retain unresolved packaging choices in archive.

## Refound AI: idea validation

Explored 2026-10-20 as an additional user-selected candidate. Inspected the [skills.sh listing](https://www.skills.sh/refoundai/lenny-skills/idea-validation), upstream [SKILL.md](https://github.com/refoundai/lenny-skills/blob/main/skills/idea-validation/SKILL.md), and selected entries in [artifacts.md](https://github.com/refoundai/lenny-skills/blob/main/skills/idea-validation/references/artifacts.md), including validation paths, demand signals, live-product experimentation, and design-partner counterexamples. Live main, no pinned revision or execution evaluation. The original podcast/newsletter material and guest-insights file were not independently checked; attributed advice and company stories remain this collection's secondary summaries.

Useful candidates for Flow:

- **Choose the validation method contextually.** The artifact collection describes interviews, manual delivery, prototypes with design partners, and a small public launch. Existing domain knowledge, access to customers, cost, and the assumption being tested affect the choice. This adds specificity to the earlier Lean Startup references without requiring a separate path for every initiative.
- **Examine the quality of commitment.** Payment, repeated use, willingness to invest effort, and unsolicited requests can be more informative than compliments. Each answers a different question; none alone establishes product/market fit. Preserve who provided the signal and their relationship to the founder.
- **Test understanding rather than justify a favorite solution.** Seek explanations of the current problem and contrary evidence. Map an existing workflow against the proposed experience when effort reduction is the value hypothesis.
- **Keep working software available as an experiment.** Cheap, reversible code can sometimes be the quickest useful test. Manual delivery and design partners are options, not universal prerequisites; the collection includes cases warning that large design partners can pull a product away from its intended audience.

Limits and tensions: the main file's named paths do not exactly match the supporting four-path framework. Its claim that a worthwhile problem must yield massive workflow compression is too narrow for products delivering other forms of value. The artifact collection also contains fixed interview counts, prescribed sprints, and claims that brief tests validate product/market fit; these are not adopted. Warm contacts can provide useful evidence, while cold prospects can still be unrepresentative. Some entries support early friends-and-family testing while the entry point warns against warm leads, reinforcing the need for contextual judgment.

For later skill design, this reference is most useful for method selection and evidence interpretation within refinement. Keep those candidates linked to the existing initiative and experiment records rather than add another mandatory scorecard or mark an entire idea permanently validated.

## Asgard AI: UX Lean Startup

Explored 2026-10-20 as an additional user-selected candidate. The supplied [skills.sh listing](https://www.skills.sh/asgard-ai-platform/skills/ux-lean-startup) could not be retrieved; inspected upstream [SKILL.md](https://github.com/asgard-ai-platform/skills/blob/main/ux-lean-startup/SKILL.md) and its full [experiment templates](https://github.com/asgard-ai-platform/skills/blob/main/ux-lean-startup/references/experiment-templates.md). Live main, no pinned revision, installation, or execution evaluation. These are instructional templates, not evidence that the methods or numerical defaults improve outcomes. The sample-size table was not independently verified.

Useful candidates for Flow:

- **A compact experiment record:** connect the assumption and customer segment to the test, time/cost budget, measurement source, observation window, decision criteria, actual result, learning, and next action. This can inform the existing validation-board direction without adding a separate required document.
- **A continuing learning history:** preserve tested assumptions, results, decisions, and changes of direction across cycles. This supports Flow's intended continuity from discovery through delivery and learning.
- **Separate experience evidence from automation evidence:** its manual-service and Wizard of Oz templates record user outcomes alongside operational effort and errors. For agentic products, successful manual delivery can support the value hypothesis while automated reliability, cost, and trust remain untested.
- **Prioritize consequential uncertainty:** consider both the consequence of being wrong and the strength of existing evidence. The numerical scoring ladder is an optional source device, not an adopted Flow rule.

Limits that matter for adaptation:

- The landing-page example declares 20 signups a pass although its stated criterion requires at least 50. The generic card also defines pass and fail as exhaustive complements while offering an undefined gray interval. Flow evaluation cases should catch contradictions between stated criteria and reported verdicts, and distinguish an inconclusive result from a failed assumption.
- Fixed conversion, retention, interview, iteration-count, and effort defaults are not universal benchmarks. In particular, the claim that functional prototypes take months is unsuitable as a default for agent-assisted development. Choose the least costly informative test in the actual context.
- Signups show response to an offer through a particular channel; they do not alone establish the underlying problem, delivered value, or willingness to pay. Stated willingness to pay differs from payment. Counts and ratios are useful only in relation to the decision, rather than inherently vanity or actionable metrics.
- The pivot matrix overstates diagnosis: favorable interviews with weak usage do not establish an execution problem, and team exhaustion does not prove a manual service works. Preserve alternative explanations, recruitment limits, and uncertain findings before choosing the next action.
- Its requirement to complete every field before experimenting, mandatory meeting after three unsuccessful cycles, and North Star field should not become Flow gates. Open exploration remains valid, and an experiment's primary measure need not be a product-wide OMTM or North Star.

Disposition: retain as a candidate for experiment-record and validation-board design. The structure is useful; its deterministic verdicts and numerical defaults need revision before reuse. No new skill, glossary term, or methodology requirement is adopted.
