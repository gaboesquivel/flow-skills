# Flow glossary

Working meanings for Flow's product-engineering practice. Include only project-specific concepts and distinctions that affect decisions; [the methodology](docs/methodology.md#maintain-shared-language) describes how this vocabulary evolves.

## Flow

The lightweight, human-led product engineering methodology defined in this repository's [PRODUCT.md](PRODUCT.md). Distinct from the flow-skills distribution, Flow Factory orchestration, application templates (flow-next, flow-mono), and an adopter project's own product. See [Product context](#product-context).

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

Retired. Earlier records call it **process depth**: a Lite or Full setting recorded per project as the Flow block's `Process:` line. `explore` now has one default depth, deeper research runs only on request, and setup asks only for [delivery](#delivery-mode); a leftover `Process:` line is ignored and dropped on the next block write. [Decision 0036](docs/decisions/0036-one-explore-depth.md).

## Spec

One bet: a numbered document that tests one assumption and ships as one unit, with tasks as the slices inside it. A bet that depends on how another one does gets its own spec, stubbed as a [candidate](#candidate-spec) until its turn. Its `Status:` line moves `candidate → draft → accepted → implemented`: `to-spec` writes drafts without asking first and sets `accepted` when the user approves the spec ("accept the spec"), moving its linked decision records from **Proposed** to **Accepted**; `build` sets `implemented` on an accepted spec once its last task integrates, and `ship` lands only accepted specs, setting `implemented` if still missing. In both delivery modes the file is written on the spec's feature branch, never alone on the default branch, and merges with the work (local-mode candidate stubs excepted). In GitHub mode a [spec issue](#spec-issue) carries the same state as a label, and the `accepted` label is the gate. [`to-spec`](skills/to-spec/SKILL.md) owns the rules; decisions [0028](docs/decisions/0028-build-and-ship.md) and [0029](docs/decisions/0029-spec-issues.md).

## Spec issue

In GitHub mode, the GitHub issue for a [spec](#spec): a one-way copy of the spec file, written only by skills, labelled `candidate`, `draft`, or `accepted`. It opens at acceptance: "spec it" publishes nothing, "accept the spec" opens it labelled `accepted`, and "share the draft" opens it early as `draft`. The spec's tasks are its sub-issues, with blocking links; the pull request that delivers the spec closes them all. The file stays the source of truth. [`to-spec`](skills/to-spec/SKILL.md#spec-issue) owns the rules; decisions [0029](docs/decisions/0029-spec-issues.md) and [0035](docs/decisions/0035-spec-issue-on-acceptance.md).

## Exposure

A spec's line under Implementation Decisions saying where the slice runs, who can reach it, and how writes behave when it is deployed without authentication; with authentication out of scope and a deployable slice, write paths fail closed on deployment. [`to-spec`](skills/to-spec/SKILL.md) owns the template; [spec 021](docs/specs/021-demo-findings.md).

## Decision record

A numbered record of a choice among real alternatives that reaches beyond one spec or is costly to reverse. Other choices live in the spec's Implementation Decisions. Never holds scope or tasks. [Decision 0026](docs/decisions/0026-process-depth.md).

## Flow skill

A portable `skills/<name>/SKILL.md` package in the Flow Skills distribution. Users reach skills by talking: an agent matches the skill's [leading word](#leading-word). Slash commands are optional shortcuts. No skill must be named explicitly ([decision 0019](docs/decisions/0019-voice-first-invocation.md), [decision 0022](docs/decisions/0022-start-runs-explore.md)). Skills may read local supporting files without imposing a mandatory workflow. The [skill catalog](docs/skills.md) groups skills for navigation; groups do not enforce invocation order.

## Delivery mode

How `build` delivers work and `ship` lands it in a project: **local** (tasks as the spec's checklist; `build` reviews the spec branch and merges it into local `main`, and "ship it" pushes `main` when a remote exists; needs no remote) or **GitHub** (`Delivery: github`; formerly `pull-request`), with a [spec issue](#spec-issue) with tasks as sub-issues, one pull request per spec that `ship` merges, and GitHub access needed. Either way `ship` then runs [verification](#verification). Asked once as **Delivery** the first time a delivery-chain skill needs it (never by a thinking skill), the only setup question, and recorded as the [Flow block](#flow-block)'s `Delivery:` line; a default branch that requires pull requests is reported, not asked. The rule lives in [`build`](skills/build/SKILL.md#delivery-mode); decisions [0020](docs/decisions/0020-flow-mode.md), [0028](docs/decisions/0028-build-and-ship.md), [0029](docs/decisions/0029-spec-issues.md), [0030](docs/decisions/0030-asked-delivery-and-local-mode.md), [0032](docs/decisions/0032-local-build-lands-ship-verifies.md), [0036](docs/decisions/0036-one-explore-depth.md), and [0037](docs/decisions/0037-git-for-delivery-github-for-github-mode.md) record why. What each mode needs from the environment: [requirements](PRODUCT.md#install-and-catalog).

## Flow block

The removable section between `<!-- BEGIN FLOW -->` and `<!-- END FLOW -->` that opts a project into Flow mode. It holds only the `Delivery:` line, the phrase table, and a pointer to `flow`, and lives in the instruction file Git tracks: `AGENTS.md` when tracked, otherwise `CLAUDE.md`, which then imports `@AGENTS.md`. Adopter text outside the block and that import is never changed. [`flow`](skills/flow/SKILL.md#flow-block) owns the rules; decisions [0020](docs/decisions/0020-flow-mode.md) and [0036](docs/decisions/0036-one-explore-depth.md).

## Unspecced work

Work that resolves to no spec or task, from a one-line fix to a feature built from an `explore` brief. It never needs a spec. "Build it" gives it the full local check suite, then lands it as the [delivery mode](#delivery-mode) does. A size guard picks the review and never stops the work: one self-check against the request for small work, or the one independent review when the guard escalates it. [`build`](skills/build/SKILL.md#unspecced-work) owns the guard; decisions [0034](docs/decisions/0034-no-ceremony-without-a-spec.md) and [0039](docs/decisions/0039-build-never-requires-a-spec.md).

## Shared file

A file the project's instructions tell every session to append to, such as a prompt log. Only the orchestrator writes it, on the work's branch; commits that change only shared files after the review do not move the reviewed head. [`build`](skills/build/SKILL.md#shared-files) owns the rule; [decision 0033](docs/decisions/0033-shared-files-and-reviewed-head.md).

## Area

A task's `Area:` line: every package or directory it changes, comma-separated when there are several (such as `lib/feedback/connect, app/opportunities`), coarse and never a file path. [`to-tasks`](skills/to-tasks/SKILL.md) assigns it; [`build`](skills/build/SKILL.md#task-set) schedules by it. [Decision 0031](docs/decisions/0031-fan-out-by-default.md); [spec 026](docs/specs/026-clean-baseline-and-worktrees.md).

## Baseline failure

A check that already fails on a spec's head before any task runs, or a later batch failure that bisect traces to no task. [`build`](skills/build/SKILL.md#task-set) stops on it before starting workers. [Spec 026](docs/specs/026-clean-baseline-and-worktrees.md).

## Frontier

The tasks of a spec's task set whose blockers have all integrated. `build` starts every frontier task at once, up to the host's concurrency limit, and starts a task the moment its blockers integrate; there are no waves. Replaces the wave of [decision 0025](docs/decisions/0025-wave-checkpoints.md); [decision 0029](docs/decisions/0029-spec-issues.md).

## Checkpoint

The report `build` posts after each integration batch: tasks integrated, running, and blocked, the local suite result, the commit, and screenshots when the host has a browser tool. A pull request comment in GitHub mode, a message in local mode. Checkpoints never wait for CI or the user unless the user asked to wait at checkpoints; CI is waited on only for the final pull request. Decisions [0025](docs/decisions/0025-wave-checkpoints.md) and [0029](docs/decisions/0029-spec-issues.md).

## Acceptance scenario

The one representative end-to-end journey a spec names in its Testing Decisions: the actor, the starting state with realistic data, and numbered steps with the observable result of each, plus the same journey through the agent interface when the spec names agent users. A spec without one is not accepted. [`to-spec`](skills/to-spec/SKILL.md) owns the rule; [decision 0032](docs/decisions/0032-local-build-lands-ship-verifies.md).

## Requirement verdict

The status a spec review gives each of the spec's user stories, acceptance criteria, and acceptance scenario steps: **satisfied**, **unmet**, or **unresolved**, with cited evidence. No evidence means unresolved; unmet is a blocking finding in review. [`review`](skills/review/SKILL.md#inspect) owns the rule; [spec 022](docs/specs/022-requirement-verdicts.md).

## Verification

What `ship` does once after the merge or push: confirm the shipped commit's checks are green on GitHub, its deployment succeeded, and its environment URL answers with a 2xx. It runs no scenario or browser. With no deployment it reports **deployment unverified**; a failure is **shipped, verification failed**, and nothing is rolled back unless asked. [`ship`](skills/ship/SKILL.md#verify) owns the rule; decisions [0032](docs/decisions/0032-local-build-lands-ship-verifies.md) and [0040](docs/decisions/0040-ship-verifies-liveness.md).

## Candidate spec

A stub for a later bet: the problem and the assumption it tests. In GitHub mode it is an issue labelled `candidate`, with no file; in local mode, a spec file with status `candidate`. Fleshed out only when its turn comes, after the bet it depends on ships; `to-spec` then writes the file and relabels the same issue. Decisions [0022](docs/decisions/0022-start-runs-explore.md), [0026](docs/decisions/0026-process-depth.md), and [0029](docs/decisions/0029-spec-issues.md).

## Human summary

A visual presentation for a person. Prefer generative UI (GenUI) when the host actually provides it; otherwise Mermaid, tables, and a short statement. The [`tldr`](skills/tldr/SKILL.md) skill owns this, including session recaps and "show me". [`write-humans`](skills/write-humans/SKILL.md) drafts prose. There is no separate `human` skill; other skills, such as `align`, may lead their own reports with a visual. [Decision 0008](docs/decisions/0008-leading-words-and-visual-summaries.md).

## Leading word

The short phrase a user says, typed or dictated, to reach a Flow skill, such as "interview me" or "ship it". Each skill's description names it with two or three dictation-safe variants, and the [skill catalog](docs/skills.md) lists the first. Following Matt Pocock's terminology in [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md), the phrase also anchors how the agent recognizes and carries out the skill, so prefer familiar words over invented vocabulary. Avoid generic host verbs such as "plan" or "review the code". [Decision 0019](docs/decisions/0019-voice-first-invocation.md) redefines the term from [0008](docs/decisions/0008-leading-words-and-visual-summaries.md). `flow start` is not a leading word and not a skill. The optional skill **`start`** initializes from flow-next or flow-mono after the user confirms template, name, and destination ([decision 0010](docs/decisions/0010-optional-start-skill.md), [decision 0022](docs/decisions/0022-start-runs-explore.md)); it is [context alignment](#context-alignment) plus a template bootstrap ([decision 0026](docs/decisions/0026-process-depth.md)). Source limits: [writing research](docs/research/2026-10-19-writing.md#matt-pocock-writing-for-agents).

## Decision record

A numbered document under `docs/decisions/` that preserves the context, decision, and rationale for a significant choice. Accepted records are historical evidence; superseding or amending creates a new record and, once accepted, adds only a back-pointer to the old record's Status line and index row. Current product, design, and architecture documents reflect the accepted position today.

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
