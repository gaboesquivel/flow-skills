# ProductSkills and Lean Startup — exploration

Reviewed 2026-10-19. Recommendations below remain proposals.

The ProductSkills catalog covers discovery, research, strategy, positioning, prioritization, scoping, PRDs, launch, metrics, experiments, and roadmaps. This supports a broader product remit than engineering preparation alone. Inspected the catalog and the problem-validation, strategy-doc, and experiment-design skill bodies; this is not an audit of every skill.

The problem-validation skill requires evidence but uses multiplied ordinal ratings and fixed go/no-go thresholds. Recommendation: retain evidence discipline without treating those thresholds as universal validation. Its experiment-design skill focuses heavily on controlled A/B tests. Recommendation: include methods suitable before meaningful traffic exists, such as interviews, prototype sessions, and manual service trials, with explicit limitations on what each establishes.

Lean Startup describes continuous build-measure-learn and validated learning. Recommendation: interpret validation as reducing consequential uncertainty before increasing investment, rather than proving an entire business before any prototype. A canvas can organize hypotheses but does not establish their truth. See the subsequent [validation-board direction](2026-10-19-agentic-validation-board.md).

Sources:
- https://github.com/assimovt/productskills
- https://github.com/assimovt/productskills/blob/main/skills/problem-validation/SKILL.md
- https://github.com/assimovt/productskills/blob/main/skills/strategy-doc/SKILL.md
- https://github.com/assimovt/productskills/blob/main/skills/experiment-design/SKILL.md
- https://theleanstartup.com/principles

## Wondel Lean Startup reference

Reviewed 2026-10-19: landing page and main SKILL.md (metadata version 1.4.0); supporting references and runtime behavior were not evaluated. Candidate reference, not adopted instructions.

Useful mechanism: plan backward from learning to evidence to the smallest experiment. The skill includes alternative MVP forms and advance decision criteria. Its mandatory numerical diagnostic and generalized evidence ladder need scrutiny before reuse.

Flow assessment: adapt the experiment-planning mechanism while retaining qualitative discovery, open exploration, and initiative-level proportionality. Evidence strength should be assessed against the particular assumption; usage alone does not establish willingness to pay. Do not import the whole framework as a mandatory checklist.

Sources:
- https://skills.wondel.ai/skills/lean-startup/
- https://github.com/wondelai/skills/blob/main/lean-startup/SKILL.md

## Uxcel product discovery

Reviewed 2026-10-19: overview and pm/processes/discovery/SKILL.md, metadata version 1.0.0. Source review only; companion skills and runtime orchestration were not audited. Candidate, not adopted.

Useful specifics: identify value, usability, feasibility, or business-viability risk before selecting research; scale evidence to cost and reversibility; distinguish discovery planning from experiment design. Continuous learning and outcomes over output already overlap with Flow.

Assessment: use risk identification as a lightweight prompt inside refinement, not four new phases. Consider the discovery/testing boundary when designing composition. Do not automatically import its weekly cadence, mandatory audit handoff, or approval of every research choice. Those would need justification for solo-founder use.

Sources:
- https://uxcel.com/ai-skills/pm-discovery
- https://github.com/Uxcel-Lab/product-skills/blob/main/pm/processes/discovery/SKILL.md

## Business context, growth, and skill boundaries

Explored 2026-10-19. The user requested lightweight business and market discovery, product metrics, experimentation, and context awareness. Current direction is recorded in [PRODUCT.md](../../PRODUCT.md#business-context-and-measurable-outcomes); the applications below remain proposals. No skill implementation or workflow restructuring was undertaken.

### Sources and limitations

- [Dave McClure — Startup Metrics for Pirates](https://www.slideshare.net/slideshow/startup-metrics-for-pirates-long-version/89026): AARRR identifies acquisition, activation, retention, referral, and revenue as areas for measurement. Candidate diagnostic lens, not an adopted funnel or mandatory dashboard.
- [Eric Ries — Lean Startup principles](https://theleanstartup.com/principles): build-measure-learn and validated learning support Flow's existing focus on assumptions, experiments, evidence, and decisions. This is an established conceptual influence; particular templates and thresholds are not thereby adopted.
- [Product Talk — Getting started with discovery](https://www.producttalk.org/getting-started-with-discovery/): connects outcomes, opportunities, solutions, and assumption testing. Candidate reasoning aid; no mandatory cadence or opportunity solution tree is proposed.
- [Amplitude — About the North Star Framework](https://www.amplitude.com/books/north-star/about-north-star-framework?siteLocation=bottom-page): describes a customer-value measure intended to lead sustainable business results. Candidate measurement approach; the relationship between a chosen metric and business results needs evidence in the product's own context.

This follow-up checked web search excerpts for these primary sources, alongside Flow's existing research; it was not a full review of the slide deck or linked guides. These sources describe frameworks, not evidence that incorporating them will improve Flow. No customer research, market sizing, analytics, or comparative workflow evaluation was performed.

### Proposed application

**Business context:** use independent dimensions for customer and buyer, product and delivery, revenue, distribution, and maturity. Separate user from payer where relevant. Let evidence about the current product, segment, or initiative qualify company-stage labels. Reuse known context rather than require a questionnaire.

**Market discovery:** investigate the ideal customer profile, alternatives including manual work and doing nothing, differentiation, and plausible routes to customers when they affect a decision. Distribution uncertainty can warrant testing before additional feature development.

**Market sizing:** keep TAM/SAM/SOM optional. For a revenue estimate, start with identifiable customers and plausible annual spend; constrain the serviceable market by product and geographic limits, and the obtainable market by reach, conversion, capacity, and an explicit time horizon. Adapt the calculation to the revenue model, distinguishing transaction volume from business revenue. Record sources, ranges, and assumptions. Market size does not establish demand.

**Metrics:** use AARRR to locate a relevant uncertainty or constraint rather than require all five categories. Consider a North Star only when there is a useful hypothesis about recurring customer value. Start with one intended outcome, supporting signals, and a guardrail where warranted. Define whose behavior is measured, the event, denominator, and period; use cohorts where relevant. Business-specific measures should follow the value and revenue model rather than a universal KPI list.

**Agentic products:** distinguish human users, customer accounts, and agent executions. Tool-call volume can indicate friction as well as use. Successful customer tasks are a candidate value signal, not automatic evidence of commercial viability. Preserve evidence provenance as discussed in the [validation-board research](2026-10-19-agentic-validation-board.md).

**Experimentation:** connect business intent to a customer problem, consequential assumption, smallest useful test or change, evidence, and decision. Define how results will inform the decision before investing further. Interviews, observed prototype use, and paid trials answer different questions; low traffic should not force premature A/B testing. Engineering checks establish correctness, while customer evidence evaluates the intended outcome. Results may remain inconclusive.

Illustrative example, not an actual finding: new accounts struggle to complete a useful API task; setup complexity is the suspected cause. Test guided setup with a small group, observe unaided completion and time to first success, and use the findings to decide whether further onboarding work is warranted. Do not infer a causal effect from an uncontrolled observation alone.

### Packaging rationale and open questions

The proposed starting point is optional depth within the existing discovery and learning loop. Business discovery overlaps heavily with commercial discovery and initiative refinement. Metrics has a stronger potential standalone trigger because definitions, instrumentation planning, and interpretation can be needed independently. Experimentation already spans refinement and reviewing outcomes.

The [archived candidate skill boundaries](../archive/2026-10-27-ideas-initiatives/ideas/business-discovery-and-product-metrics.md) remain open in archive. Evaluate whether discovery and refinement need distinct entry points, whether business discovery is repeatedly useful independently, and whether a metrics specialist reduces work without duplicating outcome selection. Actual use should inform these choices before implementation.

## Lean Analytics and One Metric That Matters

Follow-up reviewed 2026-10-20. The user adopted the OMTM concept for Flow; the entire Wondel skill and its prescribed procedures are not thereby adopted.

Sources inspected:

- [Wondel — Lean Analytics listing](https://www.skills.sh/wondelai/skills/lean-analytics) and upstream [SKILL.md](https://github.com/wondelai/skills/blob/main/lean-analytics/SKILL.md), metadata version 1.2.0, plus [OMTM reference](https://github.com/wondelai/skills/blob/main/lean-analytics/references/omtm.md). Other supporting files and runtime behavior were not evaluated; live main was not pinned.
- [Alistair Croll — The One Metric That Matters](https://leananalyticsbook.com/one-metric-that-matters/), on the Lean Analytics authors' site. The article describes a current focus that changes over time, selected in light of business, maturity, and audience. It also discusses choosing measurements that inform an action and agreeing on that action before collecting results. Historical examples are not current benchmarks.

Wondel makes the concept operational through contextual metric selection, a counter-metric, a target and review date, and a planned response. Its supporting note distinguishes focusing on one metric from collecting only one and describes reasons to change focus. These are useful inputs to Flow's measurement practice.

Limits: do not import the mandatory 0–10 score, universal five-stage gates, six-model classification, interview counts, or numerical benchmarks as requirements. A count or total is not inherently useless, nor does a ratio establish causality. Interview activity and agreement counts do not establish willingness to pay. A missed target may require checking data quality, sample size, or the hypothesis before deciding to pivot. Metric changes should preserve the old results and rationale rather than conceal failure.

### Relationship to existing concepts

For Flow's application, AARRR remains a candidate lens for locating a constraint; OMTM gives the current measurement effort a primary focus; an optional North Star expresses recurring customer value over a longer horizon. They can complement each other without requiring three separate measurement systems. An experiment may measure a nearer-term signal, but its relationship to the product's OMTM must be explained rather than assumed.

The concept belongs in the product and measurement practice, not as a generic glossary entry. [PRODUCT.md](../../PRODUCT.md#business-context-and-measurable-outcomes) owns adopted direction; [the methodology](../methodology.md#observe-and-revisit) owns application; the [archived metrics idea](../archive/2026-10-27-ideas-initiatives/ideas/business-discovery-and-product-metrics.md) owns unresolved skill packaging in archive. No metric or target has been selected for Flow itself, and no skill implementation follows from this adoption.
