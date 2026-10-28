# References

Central index of references captured in Flow Skills research, consolidated on 2026-10-19. Inclusion does not mean adoption or endorsement.

Current research notes record what was inspected and its limits. Sources found only in the historical archive are marked historical; they were not reverified during this consolidation. Live upstream links can change. Detailed assessments and exact citations remain in research rather than being duplicated here.

## Engineering methods (skill reliability)

Primary sources for the 2026 skill-reliability initiative. Flow adapts ideas; it does not vend, sync, or depend on these repositories at runtime. Full comparison: [research/2026-10-27-skill-engineering-methods.md](research/2026-10-27-skill-engineering-methods.md).

- [Matt Pocock — skills](https://github.com/mattpocock/skills) — `writing-for-agents`, `grill-me`, `grill-with-docs`, `prototype`, `handoff`, `implement` (inspected 2026-10-27).
- [Lauren Tan — pstack](https://github.com/cursor/plugins/tree/main/pstack) — `correct`, `blast-radius`, `architect`, `how`, `why`, `interrogate`, `create-verification-skill`, `poteto-mode/playbooks/eval.md` (inspected 2026-10-27). Central mode and full playbook orchestration not adopted.
- [Addy Osmani — agent-skills](https://github.com/addyosmani/agent-skills) — verification, simplification, review, Git workflow, specification-related skills (prior research plus spot checks 2026-10-27).
- [Jesse Vincent — Superpowers](https://github.com/obra/superpowers) — test-driven skill authoring, systematic debugging (inspected 2026-10-27). Full workflow chaining not adopted.
- [Anthropic Agent Skills](https://github.com/anthropics/skills) — Skill Creator evaluation approach (inspected 2026-10-27).
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills) — focused packaging and engineering rules (inspected 2026-10-27). Framework-specific rules stay out of universal Flow skills.

## Workflow and engineering

Primary workflow and engineering influence.

- [Addy Osmani — agent-skills](https://github.com/addyosmani/agent-skills) — [Historical research](archive/2026-10-18/docs/context.md).
- [documentation and adrs](https://github.com/addyosmani/agent-skills/blob/main/skills/documentation-and-adrs/SKILL.md) — [Current research](research/2026-10-19-refinement-comparison.md).
- [git workflow and versioning](https://github.com/addyosmani/agent-skills/blob/main/skills/git-workflow-and-versioning/SKILL.md) — [Current research](research/2026-10-19-refinement-comparison.md).
- [idea refine](https://github.com/addyosmani/agent-skills/blob/main/skills/idea-refine/SKILL.md) — [Current research](research/2026-10-19-refinement-comparison.md).
- [refinement criteria](https://github.com/addyosmani/agent-skills/blob/main/skills/idea-refine/refinement-criteria.md) — [Current research](research/2026-10-19-refinement-comparison.md).
- [interview me](https://github.com/addyosmani/agent-skills/blob/main/skills/interview-me/SKILL.md) — adapted as `interview`; [decision 0018](decisions/0018-interview-extracts-intent.md).
- [spec driven development](https://github.com/addyosmani/agent-skills/blob/main/skills/spec-driven-development/SKILL.md) — [Current research](research/2026-10-19-refinement-comparison.md).

## Composition and refinement

Concise skills, questioning, composition, and implementation.

- [Matt Pocock — skills](https://github.com/mattpocock/skills) — [Historical research](archive/2026-10-18/docs/context.md).
- [domain modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) and [glossary format](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md) — adopted focused glossary and active terminology-maintenance practices; [assessment and boundaries](research/2026-10-20-domain-language.md). Shipped as [`domain-modeling`](../skills/domain-modeling/SKILL.md) ([0015](decisions/0015-tasks-and-domain-modeling.md)).
- [Eric Evans — DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) — primary shared-language reference; [assessment](research/2026-10-20-domain-language.md). No wholesale adoption of DDD architecture patterns.
- [grill with docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) — [Current research](research/2026-10-19-refinement-comparison.md).
- [implement spec](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md) — [Current research](research/2026-10-19-refinement-comparison.md).
- [implement](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md) — [Current research](research/2026-10-19-refinement-comparison.md).
- [prototype](https://github.com/mattpocock/skills/blob/main/skills/engineering/prototype/SKILL.md) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).
- [to spec](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-focused-refinement.md).
- [wayfinder](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).
- [grill me](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) — [Current research](research/2026-10-19-refinement-comparison.md).
- [grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) — adapted locally as `grill`; [Current research](research/2026-10-19-refinement-comparison.md).

## Product discovery and strategy

Product discovery, strategy, scope, and measurement.

- [Paweł Huryn — Startup Canvas](https://www.skills.sh/phuryn/pm-skills/startup-canvas) — user-highlighted candidate for the canvas idea, strategic trade-offs, and business-model assumptions; [assessment and proposed information ownership](research/2026-10-20-lean-ux-and-startup-canvas.md#startup-canvas-make-strategic-choices-explicit).
- [Refound AI / Lenny Skills — idea validation](https://www.skills.sh/refoundai/lenny-skills/idea-validation) — user-selected candidate for contextual validation methods and assessing customer commitment; [assessment and source limitations](research/2026-10-20-lean-startup-skill-comparison.md#refound-ai-idea-validation).
- [Dean Peters — PRD development](https://www.skills.sh/deanpeters/product-manager-skills/prd-development) — user-selected structure inspiration; [exploration of the workflow and template](research/2026-10-20-prd-structure-exploration.md). No PRD format or workflow adopted.
- [Wondel — Lean Analytics](https://www.skills.sh/wondelai/skills/lean-analytics) — user-selected reference for the adopted OMTM concept; the full skill remains a candidate. [Assessment and adoption limits](research/2026-10-19-productskills-and-lean.md#lean-analytics-and-one-metric-that-matters).
- [Alistair Croll — The One Metric That Matters](https://leananalyticsbook.com/one-metric-that-matters/) — primary conceptual source; [assessment](research/2026-10-19-productskills-and-lean.md#lean-analytics-and-one-metric-that-matters).
- [Dave McClure — Startup Metrics for Pirates](https://www.slideshare.net/slideshow/startup-metrics-for-pirates-long-version/89026) — AARRR as a candidate diagnostic lens; [assessment and source-review limitations](research/2026-10-19-productskills-and-lean.md#business-context-growth-and-skill-boundaries).
- [Amplitude — About the North Star Framework](https://www.amplitude.com/books/north-star/about-north-star-framework?siteLocation=bottom-page) — candidate customer-value measurement approach; [assessment and source-review limitations](research/2026-10-19-productskills-and-lean.md#business-context-growth-and-skill-boundaries).

- [Uxcel — product discovery](https://uxcel.com/ai-skills/pm-discovery) — candidate for risk-based discovery and separation of discovery from test design; [assessment and skill source](research/2026-10-19-productskills-and-lean.md#uxcel-product-discovery).
- [ProductSkills](https://github.com/assimovt/productskills) — [Current research](research/2026-10-19-productskills-and-lean.md).
- [experiment design](https://github.com/assimovt/productskills/blob/main/skills/experiment-design/SKILL.md) — [Current research](research/2026-10-19-productskills-and-lean.md).
- [prd writing](https://github.com/assimovt/productskills/blob/main/skills/prd-writing/SKILL.md) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-focused-refinement.md).
- [problem validation](https://github.com/assimovt/productskills/blob/main/skills/problem-validation/SKILL.md) — [Current research](research/2026-10-19-productskills-and-lean.md).
- [strategy doc](https://github.com/assimovt/productskills/blob/main/skills/strategy-doc/SKILL.md) — [Current research](research/2026-10-19-productskills-and-lean.md).

## Lean Startup and experimentation

Learning loops and experiment design. The skill references below are candidates, not adopted instructions.

- [Asgard AI — UX Lean Startup](https://www.skills.sh/asgard-ai-platform/skills/ux-lean-startup) — user-selected candidate for experiment cards and a continuing learning log; [upstream assessment and template limitations](research/2026-10-20-lean-startup-skill-comparison.md#asgard-ai-ux-lean-startup).
- [Founder Playbook — Lean Startup](https://www.skills.sh/getagentseal/founder-playbook/lean-startup) — user-selected candidate for experiment selection, backward planning, and evidence review; [upstream source assessment](research/2026-10-20-lean-startup-skill-comparison.md#founder-playbook).
- [Booklib — Lean Startup](https://www.skills.sh/booklib-ai/booklib/lean-startup) — user-highlighted candidate for strategy application/review, supporting references, and evaluation design; [source assessment and rubric limitations](research/2026-10-20-lean-startup-skill-comparison.md#booklib).
- [Wondel — Lean Startup skill](https://github.com/wondelai/skills/blob/main/lean-startup/SKILL.md) — [Current research](research/2026-10-19-productskills-and-lean.md).
- [Wondel — Lean Startup overview](https://skills.wondel.ai/skills/lean-startup/) — [Current research](research/2026-10-19-productskills-and-lean.md).
- [Eric Ries — Lean Startup principles](https://theleanstartup.com/principles) — [Current research](research/2026-10-19-productskills-and-lean.md).

## Iteration velocity

Direction and feedback as part of iteration.

- [Guillermo Rauch — First Round interview](https://review.firstround.com/podcast/how-vercel-found-extreme-product-market-fit-by-focusing-on-simplification-guillermo-rauch-vercels-ceo/) — [Current research](research/2026-10-19-iteration-and-documentation.md).

## Discovery and shaping

Additional sources retained from initial research; not automatically adopted.

- [Shape Up — Principles of Shaping](https://basecamp.com/shapeup/1.1-chapter-02) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-focused-refinement.md).
- [Design Council — Double Diamond](https://www.designcouncil.org.uk/resources/framework-for-innovation/) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-focused-refinement.md).
- [benefits of opportunity solution trees](https://www.producttalk.org/2023/11/benefits-of-opportunity-solution-trees/) — [Historical research](archive/2026-10-18/docs/context.md).
- [assumption testing](https://www.producttalk.org/assumption-testing/) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).
- [getting started with discovery](https://www.producttalk.org/getting-started-with-discovery/) — candidate outcome-to-opportunity and assumption-testing reasoning; [current assessment and source-review limitations](research/2026-10-19-productskills-and-lean.md#business-context-growth-and-skill-boundaries), with [historical research](archive/2026-10-18/docs/research/2026-10-18-focused-refinement.md).
- [glossary discovery assumption testing](https://www.producttalk.org/glossary-discovery-assumption-testing/) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).

## Discovery entry points

Candidate sources for the `explore` redesign (depth tiers, write gates, extract-then-challenge). Not adopted. Full comparison: [research/2026-10-28-explore-discovery-entry-points.md](research/2026-10-28-explore-discovery-entry-points.md).

- [Superpowers — brainstorming](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md) — size stated in plain words, 2–3 approaches, gated design doc (inspected 2026-10-28).
- [Addy Osmani — idea-refine](https://github.com/addyosmani/agent-skills/blob/main/skills/idea-refine/SKILL.md) and [code-review-and-quality](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md) — one-pager on confirmation; five review axes (inspected 2026-10-28).
- [BMAD Method — product brief and idea validation](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/plan/explore-and-validate-an-idea.md) — extraction and challenge kept apart; killed is a valid outcome (inspected 2026-10-28).
- [Spec Kit — clarify](https://github.com/github/spec-kit/blob/main/templates/commands/clarify.md) — at most five questions, recommended answer first (inspected 2026-10-28).
- [OpenSpec — explore](https://github.com/Fission-AI/OpenSpec/blob/main/docs/explore.md) — conversation that writes nothing unless asked (inspected 2026-10-28).
- [gstack — office-hours](https://github.com/garrytan/gstack/tree/main/office-hours) — stage-selected forcing questions, ends with a real-world assignment (partially inspected 2026-10-28).
- [Every — ce-brainstorm](https://github.com/EveryInc/compound-engineering-plugin/tree/main/skills/ce-brainstorm) — Lightweight / Standard / Deep tiers, blindspot pass (partially inspected 2026-10-28).
- [Gary Klein — project premortem](https://hbr.org/2007/09/performing-a-project-premortem) — summary only; full page paywalled.

## Design and exploration

Design candidates and alternative approaches. Inclusion does not add a Flow capability.

- [Wondel — Lean UX](https://www.skills.sh/wondelai/skills/lean-ux) — user-selected candidate for experience hypotheses, assumption decomposition, and lightweight experiments; [assessment and adaptation limits](research/2026-10-20-lean-ux-and-startup-canvas.md#lean-ux-connect-experience-choices-to-learning).
- [Impeccable](https://www.skills.sh/pbakaus/impeccable/impeccable) — adopted principles: purpose-specific design priorities and page-level context; [selective assessment and source files](research/2026-10-19-impeccable.md).
- [Emil Kowalski — design skills](https://github.com/emilkowalski/skills) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).
- [prototype](https://github.com/emilkowalski/skills/blob/main/skills/prototype/SKILL.md) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).
- [brainstorming](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).
- [visual companion](https://github.com/obra/superpowers/blob/main/skills/brainstorming/visual-companion.md) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).

## Decision records and skill conventions

Documentation and packaging references retained from initial research.

- [Agent Skills specification](https://agentskills.io/specification#progressive-disclosure) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-focused-refinement.md).
- [documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-exploration-and-explanation.md).
- [GitHub Spec Kit](https://github.com/github/spec-kit) — [Historical research](archive/2026-10-18/docs/research/2026-10-18-focused-refinement.md).

## Historical provenance

Source history, not methodological authority.

- [Original shared conversation (historical provenance)](https://chatgpt.com/share/6ad4e692-0e88-83e8-8c6c-98ecbc2edce2) — [Historical research](archive/2026-10-18/docs/context.md).

## Agentic products and validation boards

- [Rangle — Agentic Product Engineering](https://rangle.io/expertise/agentic-product-engineering) — candidate role-framing reference; [assessment and attribution limits](research/2026-10-20-agentic-product-engineering.md). Flow's working meanings live in [GLOSSARY.md](../GLOSSARY.md#agentic-product-engineering).
- [Lean Startup Machine Validation Board — Grace Ng's explanation](https://www.lean.org/the-lean-post/articles/why-lean-startup-experiments-are-hard-to-design/) — [board reference and adaptation notes](research/2026-10-19-agentic-validation-board.md).
- [Is Agentic methodology](https://is-agentic.com/methodology) and [developer documentation](https://is-agentic.com/docs) — agent readiness reference; [assessment](research/2026-10-19-agentic-validation-board.md).
- [Illai Gescheit — LinkedIn post](https://www.linkedin.com/posts/illaigescheit_tomorrow-i-will-present-some-of-the-concepts-share-7497608709372571648-zbpp/) — user-supplied inspiration, inaccessible and unverified; [archived persona-testing idea](archive/2026-10-27-ideas-initiatives/ideas/README.md).

## Writing

User-selected references for the two planned writing skills; specific upstream rules remain candidates.

- [Factory — human-writing](https://www.skills.sh/factory-ai/factory-plugins/human-writing) — [source assessment](research/2026-10-19-writing.md#factory-human-writing).
- [Matt Pocock — writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md) — progressive disclosure and task-specific routing adopted in [current practice](methodology.md#write-context-for-agents-and-humans); the leading-word term is adopted in [GLOSSARY.md](../GLOSSARY.md#leading-word). Other mechanics stay as assessed in [writing research](research/2026-10-19-writing.md#matt-pocock-writing-for-agents).

## Miscellaneous

- [Addy Osmani — skills website](https://skills.addy.ie/) — adopted primary website presentation reference; [archived website plan](archive/2026-10-27-ideas-initiatives/initiatives/website.md#references-and-limits).
- [Gabo Esquivel — website](https://gaboesquivel.com/) — adopted website visual identity and palette reference; exact tokens await visual inspection. [Archived website plan](archive/2026-10-27-ideas-initiatives/initiatives/website.md#references-and-limits).

- [HumanLayer — skills](https://github.com/humanlayer/skills) — saved for possible Git and pull-request workflow inspiration. Low-priority reference only; not an adopted influence. Repository overview inspected on 2026-10-19; individual skills not assessed.

## Competitive landscape and directory conventions

[Imported October 20 report](research/2026-10-20-competitive-landscape.md) compares Flow-named tools, workflow frameworks, and `docs/` versus `.flow/`. Its primary-source link table is retained in the report. Claims and original session citation tokens were not reverified during cleanup; proposed adoption, rejection, naming, and workflow changes remain unadopted.

## Distribution evaluation

- [Skill catalog](skills.md) — current skills, spoken leading words, and `SKILL.md` links.
- [Decision 0019](decisions/0019-voice-first-invocation.md) — voice-first invocation; retires `simplify`, `security`, and `performance`. Cites Vercel's [`deploy-to-vercel`](https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel) as a phrase-shaped description pattern (inspected 2026-10-28).
- [Decision 0013](decisions/0013-restore-engineering-skills.md) — restored `council`, `ship`, `prototype`, `simplify`, `security`, `performance`, and `debug`.
- [Decision 0014](decisions/0014-handoff-skill.md) — `handoff` compacts a conversation for a fresh agent.
- [Spec 006](specs/006-skill-reliability.md) — behavioral verification and skill reliability bounded work.
- [Decision 0008](decisions/0008-leading-words-and-visual-summaries.md) — leading words; visual human summaries stay in `tldr`.
- [Decision 0009](decisions/0009-adopter-product-context.md) — adopter product identity stays in the adopter's `PRODUCT.md`.
- [Decision 0004](decisions/0004-portable-skill-catalog.md) — catalog and `npx skills add gaboesquivel/flow-skills` install path.
- [Agent compatibility](agent-compatibility.md) — invocation metadata and host limitations.
- [October 27 pre-0004 reviews (archive)](archive/2026-10-27-reviews/README.md) — direction review, distribution review, and retired bootstrap smoke notes.
- [October 27 direction review, fourteen-skill catalog](research/2026-10-27-direction-review-14.md) — advisory review of `main` after decisions 0004–0009. Not an adopted decision.

## Maintenance

Add useful references here as they arise, with their purpose and a link to the relevant assessment. Record inspection dates, limitations, and any pinned revision in that assessment. Keep proposed influences distinct from accepted methodology; preserve source citations beside the claims they support.
