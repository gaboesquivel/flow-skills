# Discovery entry points: explore redesign research

Explored 2026-10-28. Research for a proposed redesign of `explore` as the single discovery entry point: interview-style extraction plus grill-style challenge, self-proposed depth tiers (Skip / Lite / Full), and a confirmed product brief written to `PRODUCT.md`. This note records source evidence and candidate adaptations; it does not adopt the redesign, a brief template, or any upstream workflow.

Builds on, without repeating: [refinement comparison](2026-10-19-refinement-comparison.md) (idea-refine, grill-me), [Lean Startup skill comparison](2026-10-20-lean-startup-skill-comparison.md), [Lean UX and Startup Canvas](2026-10-20-lean-ux-and-startup-canvas.md), [PRD structure](2026-10-20-prd-structure-exploration.md) (primary/supporting/guardrail metrics, assumption labels), [competitive landscape](2026-10-20-competitive-landscape.md) (Spec Kit, OpenSpec, BMAD positioning), and [skill engineering methods](2026-10-27-skill-engineering-methods.md).

## Sources and inspection limits

Live `main` source review on 2026-10-28; nothing installed or executed. Commits noted where retrieved.

| Source | Files inspected | Revision |
| --- | --- | --- |
| [obra/superpowers `brainstorming`](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md) | `SKILL.md` (full); `builder-check-prompt.md` and `visual-companion.md` listed, not read | `2ce8aa1` |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/main/skills) | [`idea-refine`](https://github.com/addyosmani/agent-skills/blob/main/skills/idea-refine/SKILL.md), [`interview-me`](https://github.com/addyosmani/agent-skills/blob/main/skills/interview-me/SKILL.md), [`code-review-and-quality`](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md), [`doubt-driven-development`](https://github.com/addyosmani/agent-skills/blob/main/skills/doubt-driven-development/SKILL.md) (via summarizing fetch) | `aeac41d` |
| [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | [`bmad-product-brief/SKILL.md`](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-product-brief/SKILL.md), `bmod-method/help/analysis-skills.md`, [`docs/plan/choose-a-planning-path.md`](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/plan/choose-a-planning-path.md), [`docs/plan/explore-and-validate-an-idea.md`](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/plan/explore-and-validate-an-idea.md) | `61e01f8` |
| [GitHub Spec Kit](https://github.com/github/spec-kit) | [`templates/commands/specify.md`](https://github.com/github/spec-kit/blob/main/templates/commands/specify.md), [`clarify.md`](https://github.com/github/spec-kit/blob/main/templates/commands/clarify.md) (via summarizing fetch) | `222a973` |
| [OpenSpec](https://github.com/Fission-AI/OpenSpec) | [`docs/explore.md`](https://github.com/Fission-AI/OpenSpec/blob/main/docs/explore.md) (full), `docs/commands.md` propose entry | `6d04a1b` |
| [gstack `office-hours`](https://github.com/garrytan/gstack/tree/main/office-hours) | `SKILL.md`, `sections/phase-2a-startup-diagnostic.md` (via summarizing fetch); other phase files not read | `9e3308f` |
| [Every compound-engineering `ce-brainstorm`](https://github.com/EveryInc/compound-engineering-plugin/tree/main/skills/ce-brainstorm) | `SKILL.md`, `references/phase-0.md` (tiers), `references/blindspot-pass.md`; other references not read | `00d0a5b` |
| Method anchors | [Klein, HBR premortem](https://hbr.org/2007/09/performing-a-project-premortem) (partial page), [Torres, opportunity solution trees](https://www.producttalk.org/opportunity-solution-trees/), RAT and kill-criteria secondary search results; OMTM per [existing assessment](2026-10-19-productskills-and-lean.md#lean-analytics-and-one-metric-that-matters) | — |

Not verified: the Lean Canvas page (leanstack.com redirects through leanfoundry.com to leanspark.ai; not followed), Klein's full procedure (paywalled page returned only the summary), Rik Higham's original RAT article (secondary sources only), Annie Duke's kill-criteria wording in *Quit* (podcast and blog summaries only). Older BMAD "Quick Flow / BMad Method / Enterprise" tracks appear only in community mirrors; current repo docs no longer describe tracks. Some upstream summaries came through a fetch tool that paraphrases; exact wording should be rechecked before quoting.

## What each source does at discovery time

### Superpowers `brainstorming`

- **Flow.** First decides "what do I actually know": if everything is in the request, just do it. Otherwise: read referenced material first ("never ask what the project or their context already answers"), open with a ~200-word playback plus one question, alternate playback and one open question per message, lay out 2–3 approaches and have the user pick, write a design doc, get approval, hand off to `writing-plans` only.
- **Depth.** After the approach is picked, states size in plain words (small change vs project); the user can override; if it grows, stop and step up. Several independent projects are split and brainstormed one at a time.
- **Artifact.** `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`, committed: intent and why, goals/non-goals/anti-goals, constraints, approaches with trade-offs and the pick, decided parts of the how, what is left to the builder. Projects get a fresh-subagent "builder check" whose questions are sorted into answered / decided-by-agent (marked as its call) / asked of the user.
- **Gate.** Hard: nothing is built until the human approves the doc; "sounds good" to the idea is not approval of an unwritten doc.

### Addy Osmani `idea-refine`, `interview-me`, review skills

- **idea-refine.** Diverge (How Might We, 3–5 sharpening questions, 5–8 variations), converge to 2–3 directions, then a one-pager: problem, recommended direction, key assumptions each with a test method, MVP scope, "Not Doing (and Why)", open questions. Saves to `docs/ideas/<name>.md` only on confirmation. No explicit depth tiers.
- **interview-me.** Already adapted as Flow `interview` ([0018](../decisions/0018-interview-extracts-intent.md)). Writes nothing by default; offers `docs/intent/<topic>.md` only on an explicit yes, then ends the turn.
- **code-review-and-quality.** Five axes: Correctness, Readability & Simplicity, Architecture, Security, Performance; severity prefixes (unprefixed required, Critical, Nit, Optional/Consider, FYI). Not discovery, recorded at request.
- **doubt-driven-development.** Fresh-context adversarial reviewer on a stripped artifact (claim, extract, doubt, reconcile, stop after three cycles). No formal pre-mortem.

### BMAD Method

- **Structure has changed.** Current docs describe discovery tools as "independent tools, not stages," chosen by what the intent is missing. Size follows the intent; risk, unclear requirements, and coordination add planning. No named tracks in current repo docs.
- **Separation of modes.** `bmad-product-brief` describes a product the user already believes in and "never asks whether the product should exist"; doubt goes to `bmad-prfaq` (working backwards) or `bmad-forge-idea` (one question at a time with its own best answer; outcomes Hardened, Killed, or Clearer, each valid). `bmad-advanced-elicitation` offers pre-mortem, first principles, and red team as a menu at pauses.
- **Depth inside the brief.** After a brain dump, offers Fast path (batch remaining gaps into one or two questions, draft with `[ASSUMPTION]` tags) or Coaching path (section by section with pushback). "Right-size to purpose": passion project vs investor input.
- **Artifact.** `{output_folder}/{initiative}/brief-<slug>/brief-<slug>.md` (1–2 pages) plus `addendum.md` for detail belonging downstream and an append-only `.memlog.md`. Written in real time as a draft; finalization includes an explicit accounting of what went where. Web research runs in subagents that return digests.
- **Gate.** The brief is the user's; draft persists from the start, finalized with the user. Headless mode never prompts and halts `blocked` when intent is ambiguous.

### GitHub Spec Kit `/specify`, `/clarify`

- **/specify** writes `specs/<NNN>-<name>/spec.md` immediately: scenarios, functional requirements, measurable technology-agnostic success criteria, assumptions. At most three `[NEEDS CLARIFICATION]` markers, prioritized scope > security > UX > technical; informed guesses go to Assumptions. Self-checks against a quality checklist (up to three iterations). No approval gate beyond answering open markers.
- **/clarify** scans a fixed ambiguity taxonomy, asks at most five questions, one at a time, each multiple choice or ≤5 words with a recommended answer first; records `Q → A` under `## Clarifications` and applies it to the spec. Skippable with a warning about rework risk.

### OpenSpec `/opsx:explore` and propose

- Explore is "a conversation, not a generator": reads code, compares options, draws diagrams, narrows scope. Writes nothing unless the user asks or accepts an offer, then only the artifacts named. Bailing out is "a win." Skip it when you already know what and how. Propose then writes `openspec/changes/<name>/` (proposal, delta specs) from the conversation.

### gstack `office-hours`

- Gathers repo context, asks the user's goal, then routes: Startup mode (diagnostic) or Builder mode (design partner), switching mid-session if signals change; asks product stage.
- Six forcing questions (demand reality, status quo, desperate specificity, narrowest wedge, observation and surprise, future-fit), asked one at a time, **three selected by stage**; skip any already answered; on impatience ask the two most critical then move on. Premise challenge and 2–3 alternatives (including a minimal viable one) always run.
- Writes a design doc to the gstack state directory (outside the repo) only after the user explicitly picks an alternative. Ends with a concrete real-world assignment for the user.

### Every compound-engineering `ce-brainstorm`

- Answers WHAT to build; `ce-plan` adds HOW to the same artifact. Tiers: **Lightweight** (ends in a chat paragraph, no file, no research or approach generation), **Standard**, **Deep** (with a feature vs product sub-mode when actors, outcome, positioning, or primary flows are unresolved). "When the tier is uncertain, take the heavier one."
- A file is written only when a later reader needs a recorded decision: `<root>/plans/YYYY-MM-DD-HHMM-<type>-<topic>-plan.md`, gated by a "Ready for Planning Check."
- **Blindspot pass:** when the user cannot evaluate a territory (not merely undecided), offer to map the decisions, options, and defaults first; declined or headless means defaults recorded as explicit assumptions.

### Method anchors

- **Lean Canvas** (Maurya): problem, customer segments, UVP, solution, channels, revenue, costs, key metrics, unfair advantage. Page not re-inspected; Flow's canvas assessment stands.
- **Riskiest assumption test** (Higham, 2016, secondary): test the assumption most likely wrong and most damaging if wrong before building an MVP; then the next.
- **Pre-mortem** (Klein, HBR 2007): assume the project has failed and generate plausible reasons; makes dissent safe. Cheap, works solo.
- **OMTM** (Croll and Yoskovitz): one metric for the current stage; already adopted in methodology with context-dependent review.
- **Kill criteria** (Duke, *Quit*, secondary): exit conditions set in advance to counter escalation of commitment; revisited at check-ins.
- **Opportunity solution tree** (Torres): outcome, opportunities, solutions, assumption tests; compare at least three solutions for a target opportunity and test riskiest assumptions across them.

## Cross-source patterns

1. **Recover before asking** is universal (Superpowers, BMAD, OpenSpec, gstack, CE, Flow `interview`).
2. **One question per turn with a proposed answer** is converging practice (Spec Kit recommended option, BMAD forge "own best answer," Flow `interview` guess). Superpowers is the outlier: open questions first, menus only when stuck.
3. **Question budgets are explicit**: Spec Kit ≤5, idea-refine 3–5, gstack 3 per stage, BMAD fast path 1–2 batched.
4. **Depth is decided by the agent, stated in plain words, and overridable**; escalation mid-session is allowed (Superpowers, CE, gstack). The lightest tier writes nothing (CE Lightweight, Superpowers clear task, OpenSpec skip).
5. **Writes are gated** (Superpowers, idea-refine, interview-me, OpenSpec, gstack); BMAD and Spec Kit write drafts early and refine.
6. **Artifacts are per-initiative and dated**, never the root product document: `docs/ideas/`, `docs/superpowers/specs/`, `plans/`, `brief-<slug>/`, `specs/NNN-*/`, `openspec/changes/`.
7. **Killing the idea is a valid outcome** (BMAD forge, OpenSpec, gstack premise challenge).
8. **Solution alternatives are mandatory** (Superpowers, gstack, idea-refine, OST), distinct from customer alternatives and status quo.
9. **Extraction and challenge are separated** in BMAD (brief vs forge/PRFAQ) and in Addy (interview-me vs idea-refine vs doubt-driven); combined in gstack and CE through ordered phases.
10. **Metrics in discovery are light**: Spec Kit and BMAD ask for success criteria; none requires a main metric plus leading signal plus guardrail plus kill criterion.

## Adopt / adapt / reject

| Mechanism | Source | Disposition | Note for `explore` |
| --- | --- | --- | --- |
| Agent proposes tier in plain words; user overrides; step up mid-session | Superpowers, CE | adopt | Matches Skip / Lite / Full. State the tier and why in one line. |
| Lightest tier writes nothing | CE Lightweight, Superpowers, OpenSpec | adopt | Skip ends in chat; no brief. |
| "When uncertain, take the heavier tier" | CE | adapt | Conflicts with minimal process. Prefer the lighter tier and escalate on evidence. |
| Stage-routed question subsets; skip answered; two-question fallback when impatient | gstack | adapt | Map Lite to a few questions selected by product stage; borrow the impatience rule. |
| Explicit question budget | Spec Kit, idea-refine | adapt | Soft budget per tier; keep `interview`'s stop rule as the real criterion. |
| Extract first, then challenge only the riskiest claims | BMAD separation, gstack ordering | adopt | Do not grill while extracting; grill after the intent is restated. |
| Killed / clearer as valid outcomes | BMAD forge, OpenSpec | adopt | A brief is not the only success; no write when the idea dies. |
| 2–3 solution approaches incl. minimal one, user picks | Superpowers, gstack, OST | adapt | Full only, or when the solution is contested; keep separate from "alternatives including status quo." |
| Blindspot pass for can't-evaluate territory | CE | adopt | Map decisions with defaults instead of extracting guesses. |
| `[ASSUMPTION]` labels on inferred content; headless defaults as assumptions | BMAD, CE, Spec Kit | adopt | Fits existing assumption/evidence distinction. |
| Fresh-context builder/readiness check on the written brief | Superpowers, CE | adapt | Full only; optional subagent; fallback is a self-check. |
| Draft written on disk from the start, append-only memlog, addendum | BMAD | reject | Violates write-on-confirmation and minimal process. |
| Dated per-topic design doc as the discovery artifact | Superpowers, CE, idea-refine | adapt | Use for feature-level work (spec or research); reserve `PRODUCT.md` for durable product facts. |
| Hard gate and single mandated next skill | Superpowers | reject | Flow has no mandatory sequence ([0004](../decisions/0004-portable-skill-catalog.md)). |
| Personas, party mode, generated voices | BMAD | reject | Out of scope for a portable small catalog. |
| Concrete real-world assignment at the end | gstack | adapt | Next useful activity can be a cheap test of the riskiest assumption, not code. |
| Pre-mortem as an on-demand critique | Klein, BMAD elicitation | adopt | Full tier, a few lines; feeds riskiest assumptions and kill criterion. |
| Mandatory OMTM + leading + guardrail + kill criterion | proposal | adapt | No comparable source requires all four; label targets as hypotheses and allow "unknown." |

## Findings that bear on the proposed design

- **Writing to `PRODUCT.md` is unusual.** Every compared system writes a per-initiative, dated artifact. `PRODUCT.md` is durable identity in adopter projects ([0009](../decisions/0009-adopter-product-context.md)); per-feature explorations there would churn it. Candidate: Full on a new product writes `PRODUCT.md`; feature-level explore proposes only durable deltas to `PRODUCT.md` and puts the rest in chat, a spec, or research.
- **Turn boundary conflict.** `interview` ends the turn on an explicit yes and does not save in the same turn; the proposal ends by writing. Reconcile by showing the exact text or diff to be written and treating an explicit yes to that text as authorization.
- **Combining extract and challenge.** BMAD deliberately separates them; Addy splits across three skills. A combined skill needs ordering (extract, restate, confirm, then challenge riskiest claims) or users get pushback before their intent is stated.
- **Metrics burden.** Four metrics in Lite invite invented numbers. Flow itself has "no OMTM selected" in its own `PRODUCT.md`. The kill criterion is the most distinctive and cheapest; the rest can be "unknown, next step: measure."
- **Single entry point vs voice-first catalog.** BMAD moved toward independent tools picked by the gap, not one entry. Keeping `interview`, `grill`, `jtbd`, `competitors` reachable directly avoids forcing Full-tier ceremony on users who only want one.

## Open questions

- Does `explore` absorb `interview` and `grill`, or call their patterns while they remain separately invocable?
- Where does a Lite brief for an existing product go when it is not a durable product change?
- Should Full-tier research files land in `docs/research/` in adopter repos, and who indexes them?
- What eval scenarios distinguish correct tier choice, restraint (Skip), and a killed idea?
