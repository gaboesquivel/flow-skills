# Flow glossary

Working meanings for Flow's product-engineering practice. Include only project-specific concepts and distinctions that affect decisions; [the methodology](docs/methodology.md#maintain-shared-language) describes how this vocabulary evolves.

## Flow

The lightweight, human-directed, agent-executed product engineering methodology defined in this repository's [PRODUCT.md](PRODUCT.md). Distinct from the flow-skills distribution, Flow Factory orchestration, application templates (flow-next, flow-mono), and an adopter project's own product. See [Product context](#product-context).

## Agentic product engineering

The practice of combining product judgment, design, and software engineering to direct AI agents across discovery, delivery, and learning, with people accountable for decisions, quality, and outcomes. This describes how products are developed; the resulting product need not contain AI agents.

## Agentic Product Engineer

A practitioner who uses product and engineering expertise to decide what is worth building, guide AI agents in building it, and evaluate whether it creates value. Agents can help investigate and challenge direction as well as execute work; the practitioner retains accountability.

## Product context

An adopter project's own product identity, normally in that project's `PRODUCT.md`, with design, architecture, and glossary beside it when they earn a file. Context alignment (`flow`) keeps product context current. It does not copy Flow's mission or principles into it. [Decision 0009](docs/decisions/0009-adopter-product-context.md).

## Context alignment

The [`flow`](skills/flow/SKILL.md) skill: keep the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` aligned with meaningful changes, and set up Flow in a project. Not template initialization, and it does not run other skills. Model-invocable like most Flow skills ("update the docs"); that is not an always-on guarantee. Earlier records call it **Flow Lite**; current documents do not ([decision 0026](docs/decisions/0026-process-depth.md)).

## Product alignment

The [`align`](skills/align/SKILL.md) skill: a read-only check of the whole product, as built, against its stated vision, users' problems, success metrics, and roadmap. Distinct from [context alignment](#context-alignment) (`flow`: docs follow the product), session alignment (`tldr`), and alignment review (`review`: a change against its spec). [Decision 0041](docs/decisions/0041-align-skill.md).

<a id="process-depth"></a>

## Discovery depth

Retired. Earlier records call it **process depth**: a Lite or Full setting recorded per project as the Flow block's `Process:` line. `explore` now asks in proportion to the change, with no named tiers, deeper research runs only on request, and setup asks no questions about depth or [delivery](#delivery-mode); a leftover `Process:` line is ignored and dropped on the next block write. Decisions [0036](docs/decisions/0036-one-explore-depth.md) and [0044](docs/decisions/0044-fast-delivery.md).

## Spec

One bet: a numbered document that tests one assumption and ships as one unit, with tasks as the slices inside it. A bet that depends on how another one does gets its own spec, stubbed as a [candidate](#candidate-spec) until its turn. The file is the record in both delivery modes; in GitHub mode the pull request links it, and an issue opens only on request. Its `Status:` line moves `candidate → draft → accepted → implemented`, or ends `dropped` only at the user's request. Acceptance is "accept the spec", or "build it" or "ship it" on a draft. The file is written on the work's branch and merges with the work. [`to-spec`](skills/to-spec/SKILL.md) owns the rules; decisions [0028](docs/decisions/0028-build-and-ship.md) and [0044](docs/decisions/0044-fast-delivery.md).

## Spec issue

Retired. Earlier records describe a GitHub issue per spec that linked the file and carried its status as a label. Specs now live only in files; in GitHub mode the pull request links the spec file, and issues or sub-issues open only on request (or as `Closes #N` for an issue the user named). Decisions [0029](docs/decisions/0029-spec-issues.md) and [0035](docs/decisions/0035-spec-issue-on-acceptance.md), superseded by [0044](docs/decisions/0044-fast-delivery.md).

## Exposure

A spec's line under Implementation Decisions saying where the slice runs, who can reach it, and how writes behave when it is deployed without authentication; with authentication out of scope and a deployable slice, write paths fail closed on deployment. [`to-spec`](skills/to-spec/SKILL.md) owns the template; [spec 021](docs/specs/021-demo-findings.md).

## Decision record

A numbered document under `docs/decisions/` that preserves the context, decision, and rationale for a choice among real alternatives that reaches beyond one spec or is costly to reverse. Other choices live in the spec's Implementation Decisions. Never holds scope or tasks. Accepted records are historical evidence; superseding or amending creates a new record and, once accepted, adds only a back-pointer to the old record's Status line and index row. Current product, design, and architecture documents reflect the accepted position today. [Decision 0026](docs/decisions/0026-process-depth.md).

## Flow skill

A portable `skills/<name>/SKILL.md` package in the Flow Skills distribution. Users reach skills by talking: an agent matches the skill's [leading word](#leading-word). Slash commands are optional shortcuts. No skill must be named explicitly ([decision 0019](docs/decisions/0019-voice-first-invocation.md), [decision 0022](docs/decisions/0022-start-runs-explore.md)). Skills may read local supporting files without imposing a mandatory workflow. The [skill catalog](docs/skills.md) groups skills for navigation; groups do not enforce invocation order.

## Delivery mode

Where `ship` lands work: **local** (needs only Git; `build` ends with a committed branch, and `ship` merges it into `main` and pushes when a remote exists) or **GitHub** (`Delivery: github`; formerly `pull-request`; `build` ends with an open pull request linking the spec file, and `ship` merges it). Delivery options, not separate methodologies: the skills and steps are the same, and each delivery phrase ends with [liveness](#liveness) in both. Never asked: GitHub when `origin` is a GitHub repository (stopping until `gh` is authenticated, never falling back), otherwise local; a `Delivery:` line in the [Flow block](#flow-block) or the request overrides, and a default branch that requires pull requests forces GitHub. The rule lives in [`build`](skills/build/SKILL.md#delivery-mode); decision [0044](docs/decisions/0044-fast-delivery.md) amends the earlier [0028](docs/decisions/0028-build-and-ship.md), [0030](docs/decisions/0030-asked-delivery-and-local-mode.md), [0032](docs/decisions/0032-local-build-lands-ship-verifies.md), and [0037](docs/decisions/0037-git-for-delivery-github-for-github-mode.md). What each mode needs from the environment: [requirements](PRODUCT.md#install-and-catalog).

## Flow block

The removable section between `<!-- BEGIN FLOW -->` and `<!-- END FLOW -->` that opts a project into Flow mode. It holds only a `Delivery:` line (an override of the inferred [delivery mode](#delivery-mode) when set), the phrase table, and a pointer to `flow`, and lives in the instruction file Git tracks: `AGENTS.md` when tracked, otherwise `CLAUDE.md`, which then imports `@AGENTS.md`. Adopter text outside the block and that import is never changed. [`flow`](skills/flow/SKILL.md#flow-block) owns the rules; decisions [0020](docs/decisions/0020-flow-mode.md) and [0036](docs/decisions/0036-one-explore-depth.md).

## Unspecced work

Work that resolves to no spec or task, from a one-line fix to a feature built from an `explore` brief. It never needs a spec. "Build it" ends with a reviewed, checked branch as for any work, and "ship it" lands it. A size guard, judged once, picks the review and never stops the work: one self-check against the request for small work, or the independent review when the guard escalates it. [`build`](skills/build/SKILL.md#unspecced-work) owns the guard; decisions [0034](docs/decisions/0034-no-ceremony-without-a-spec.md), [0039](docs/decisions/0039-build-never-requires-a-spec.md), and [0044](docs/decisions/0044-fast-delivery.md).

## Area

A task's `Area:` line: every package or directory it changes, comma-separated when there are several (such as `lib/feedback/connect, app/opportunities`), coarse and never a file path. [`to-tasks`](skills/to-tasks/SKILL.md) assigns it. [`build`](skills/build/SKILL.md#task-set) uses it to keep tasks that change the same files from landing as if they were independent. [Decision 0031](docs/decisions/0031-fan-out-by-default.md); [spec 026](docs/specs/026-clean-baseline-and-worktrees.md); amended by [decision 0042](docs/decisions/0042-outcome-build-and-ship.md) and [spec 028](docs/specs/028-outcome-build-and-ship.md).

## Frontier

The tasks of a spec's task set whose blockers have all integrated. `build` runs them in parallel by default, each in its own worktree or on disjoint files in the shared checkout. There are no waves. Replaces the wave of [decision 0025](docs/decisions/0025-wave-checkpoints.md); [decision 0029](docs/decisions/0029-spec-issues.md); amended by [decision 0042](docs/decisions/0042-outcome-build-and-ship.md) and [spec 028](docs/specs/028-outcome-build-and-ship.md).

## Work in flight

Work started but not yet on the default branch: worktrees, task branches, and unfinished tasks. Flow loses none of it. Every worktree has its own branch, finished work reaches the work branch, unfinished tasks are reported rather than dropped, a branch or worktree is removed only when its commits are on the default branch or the user dropped the work, and every report lists what is left. [`build`](skills/build/SKILL.md#work-in-flight) owns the rule; [decision 0044](docs/decisions/0044-fast-delivery.md).

## Integration owner

The one session that integrates a delivery (a spec, or one unspecced change): it merges contributed branches and opens or updates the pull request. Recorded once, as a session role, in the pull request description or the spec's `Execution:` line. Missing or conflicting ownership is unknown, never assumed. [`write-agents`](skills/write-agents/SKILL.md#sessions) owns the rule; [decision 0052](docs/decisions/0052-git-first-coordination.md).

## Acceptance scenario

The one representative end-to-end journey a spec names in its Testing Decisions: the actor, the starting state with realistic data, and numbered steps with the observable result of each, plus the same journey through the agent interface when the spec names agent users. A draft without one is not accepted: acceptance, and a "build it" or "ship it" on that draft, stops and names what is missing. [`to-spec`](skills/to-spec/SKILL.md) owns the rule; decisions [0032](docs/decisions/0032-local-build-lands-ship-verifies.md) and [0044](docs/decisions/0044-fast-delivery.md).

## Requirement verdict

The status a spec review gives each step of the spec's acceptance scenario: **satisfied**, **unmet**, or **unresolved**, with cited evidence. No evidence means unresolved; unmet blocks the merge. Other unmet requirements are ordinary findings. [`review`](skills/review/SKILL.md#inspect) owns the rule; [spec 022](docs/specs/022-requirement-verdicts.md).

## Liveness

The light check that ends "push it", "build it", and "ship it": the remote ref contains the commit and, when the host reports deployments, the deployment for that commit is ready and its URL answers 2xx. It reports `live`, `pushed, no deployment reported`, `reachable, commit unconfirmed`, `not live`, or `unverified`, and never gates. It runs no tests, scenario, or browser; behavior is [`review`](skills/review/SKILL.md)'s. [`ship`](skills/ship/SKILL.md#liveness) owns the rule; decisions [0040](docs/decisions/0040-ship-verifies-liveness.md) and [0048](docs/decisions/0048-delivery-phrases-are-approvals.md).

## Verification

Former name for [liveness](#liveness) after shipping.

## Candidate spec

A stub for a later bet: the problem and the assumption it tests, written as a spec file with status `candidate` in both delivery modes. Fleshed out only when its turn comes, after the bet it depends on ships; `to-spec` then completes the same file. Decisions [0022](docs/decisions/0022-start-runs-explore.md), [0026](docs/decisions/0026-process-depth.md), and [0044](docs/decisions/0044-fast-delivery.md).

## Human summary

A visual presentation for a person. Prefer generative UI (GenUI) when the host actually provides it; otherwise Mermaid, tables, and a short statement. The [`tldr`](skills/tldr/SKILL.md) skill owns this, including session recaps and "show me". [`write-humans`](skills/write-humans/SKILL.md) drafts prose. There is no separate `human` skill; other skills, such as `align`, may lead their own reports with a visual. [Decision 0008](docs/decisions/0008-leading-words-and-visual-summaries.md).

## Leading word

The short phrase a user says, typed or dictated, to reach a Flow skill, such as "interview me" or "ship it". Each skill's description names it with two or three dictation-safe variants (one for the delivery skills, so dictation cannot blur them; [decision 0048](docs/decisions/0048-delivery-phrases-are-approvals.md)), and the [skill catalog](docs/skills.md) lists the first. Following Matt Pocock's terminology in [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md), the phrase also anchors how the agent recognizes and carries out the skill, so prefer familiar words over invented vocabulary. Avoid generic host verbs such as "plan" or "review the code". [Decision 0019](docs/decisions/0019-voice-first-invocation.md) redefines the term from [0008](docs/decisions/0008-leading-words-and-visual-summaries.md). `flow start` is not a leading word and not a skill. The optional skill **`start`** initializes from flow-next or flow-mono, asking only what the request leaves open ([decision 0010](docs/decisions/0010-optional-start-skill.md), [decision 0022](docs/decisions/0022-start-runs-explore.md), [decision 0044](docs/decisions/0044-fast-delivery.md)); it is [context alignment](#context-alignment) plus a template bootstrap ([decision 0026](docs/decisions/0026-process-depth.md)). Source limits: [writing research](docs/research/2026-10-19-writing.md#matt-pocock-writing-for-agents).

## Specification

A numbered document that captures a bounded increment of work; in Flow, a [spec](#spec). Default path in Flow's own repository: `docs/specs/NNN-short-name.md`. Adopter projects may use their own conventions.

## Exploration

An activity that opens possibilities through browsing references, comparing approaches, sketching, or trying prototypes. It can begin without a bounded question and may include research.

## Research

An evidence-seeking activity directed at a question. It may happen within exploration; its findings can inform specs and decisions without committing to a direction.

## Intent

What we want to learn or achieve. Intent gives work its purpose; a spec or conversation may carry it without a separate tracker.

## Validation board

A shared representation of hypotheses, risky assumptions, experiments, evidence, and decisions across iterations. Flow does not ship a validation-board product; the term describes a possible practice, not a required folder structure.

## Progress board

The read-only kanban of a project's specs by stage that the [`board`](skills/board/SKILL.md) skill derives from git. It shows where work stands, not hypotheses or evidence; distinct from a [validation board](#validation-board). [Decision 0027](docs/decisions/0027-progress-board-skill.md).
