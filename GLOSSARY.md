# Flow glossary

Project-specific distinctions that change decisions. A term earns an entry when a capable contributor could reasonably get it wrong without it; procedure lives with the owner each entry links ([the methodology](docs/methodology.md#maintain-shared-language) describes how this evolves).

## Flow

The human-directed, agent-executed product engineering methodology defined in this repository's [PRODUCT.md](PRODUCT.md). Not the flow-skills distribution, Flow Factory orchestration, the application templates (flow-next, flow-mono), or an adopter project's own product.

## Agentic product engineering

Combining product judgment, design, and engineering to direct AI agents across discovery, delivery, and learning, with people accountable for decisions, quality, and outcomes. It describes how a product is developed; the product need not contain agents. <a id="agentic-product-engineer"></a>The **Agentic Product Engineer** is the practitioner who decides what is worth building, directs the agents, and evaluates whether it created value.

## Product context

An adopter project's own product identity, normally its `PRODUCT.md`, with design, architecture, and glossary beside it when they earn a file. [Context alignment](#context-alignment) keeps it current and never copies Flow's mission into it ([decision 0009](docs/decisions/0009-adopter-product-context.md)).

## Context alignment

The [`sync-docs`](skills/sync-docs/SKILL.md) skill ("sync the docs"): update a project's root files to accepted direction after meaningful changes, and set up Flow there. It writes; [product alignment](#product-alignment) only reports. Not template initialization, and it runs no other skill. Records before [decision 0070](docs/decisions/0070-research-and-clearer-names.md) call it `flow`, and earlier ones **Flow Lite**.

## Product alignment

The [`align`](skills/align/SKILL.md) skill ("check alignment"): a read-only check of the product as built against its goals, users' problems, and [outcome evidence](#outcome-evidence). Distinct from [context alignment](#context-alignment) (docs follow accepted direction) and from `review` (one change against its spec). Records from [0062](docs/decisions/0062-claude-code-first.md) to [0070](docs/decisions/0070-research-and-clearer-names.md) call it `product`.

## Spec

One independently deliverable increment: a numbered document stating the outcome, acceptance boundary, and what is out of scope, with tasks as the slices inside it. Work that should wait on what another spec teaches is a [candidate spec](#candidate-spec). The file is the record in both delivery modes; an issue opens only on request. Status runs `candidate → draft → accepted → implemented` (or `dropped` at the user's request); acceptance is "accept the spec", or "build it" or "ship it" on a draft. [`to-spec`](skills/to-spec/SKILL.md) owns the rules.

## Exposure

A spec's line saying where deployable behavior runs, who can reach it, and how writes behave without authentication; writes fail closed. [`to-spec`](skills/to-spec/SKILL.md) owns the template.

## Decision record

A numbered document under `docs/decisions/` for a choice among real alternatives that reaches beyond one spec or is costly to reverse; other choices live in the spec. Accepted records are historical evidence: change of direction adds a new record and back-pointers on the old one's Status line, while current documents state the accepted position. [`to-spec`](skills/to-spec/SKILL.md) owns the test.

## Flow skill

A portable `skills/<name>/SKILL.md` package. Users reach it by talking (its [leading word](#leading-word)); slash commands are optional shortcuts, and the [catalog](docs/skills.md) groups skills without ordering them.

## Delivery mode

Where `ship` lands work: **local** (Git only; merged into `main`) or **GitHub** (a pull request linking the spec). Never asked: GitHub when `origin` is a GitHub repository, otherwise local; a `Delivery:` line in the [Flow block](#flow-block) or the request overrides. The routing and fallback rules live in [`build`](skills/build/SKILL.md#delivery-mode).

## Issue trigger

The optional `build-it` label from a repository writer: that issue's "build it", run by the host's trigger, ending at a pull request and never shipping. [`build`](skills/build/SKILL.md#issue-trigger) owns it ([decision 0055](docs/decisions/0055-capability-based-github-and-host-triggered-builds.md)).

## Flow block

The removable section between `<!-- BEGIN FLOW -->` and `<!-- END FLOW -->` that opts a project into Flow mode: an optional `Delivery:` line and a pointer to `sync-docs`, in the instruction file Git tracks. [`sync-docs`](skills/sync-docs/SKILL.md#flow-block) owns the rules; a block naming the older `flow` skill is refreshed on its next write.

## Unspecced work

Work with no spec or task, from a one-line fix to a feature built from a settled conversation or brief. "Build it" still ends in a reviewed, checked branch; a size guard sets the review tier and never stops the work. [`build`](skills/build/SKILL.md#size-guard) owns the guard.

## Area

A task's `Area:` line: the packages or directories it changes, never a file path. [`to-tasks`](skills/to-tasks/SKILL.md) assigns it, and [`build`](skills/build/SKILL.md#task-set) uses it to keep tasks that touch the same files from running as if independent.

## Frontier

The tasks of a spec whose blockers have all integrated. There are no waves ([`build` Slices](skills/build/SKILL.md#slices)).

## Work in flight

Work started but not on the default branch: kept worktrees, branches with commits not on it, and open pull requests. The SessionStart report ([`hooks/wip.mjs`](hooks/wip.mjs)) lists it and writes nothing.

## First useful release

The outcome that makes a new product worth using; it bounds active work while the vision in `PRODUCT.md` stays broad. A statement in the brief, not a document. [`explore`](skills/explore/SKILL.md) names it; [`to-spec`](skills/to-spec/SKILL.md) delivers it through one spec or several ([decision 0066](docs/decisions/0066-specs-sized-by-delivery.md)).

## Delivery appetite

How much time (and material model, evaluation, or infrastructure cost) an increment is worth, with its first verifiable slice and non-goals. A target, not a guarantee, recorded in the increment's spec or pull request and never in `PRODUCT.md`.

## Scope trade-off

The response to new scope that changes an accepted boundary: defer, replace, reject, or expand the appetite, naming what changes. A correctness, security, or required-check blocker is not scope. [`build`](skills/build/SKILL.md#scope-guard) owns it.

## Delivery branch

The one remote branch of a delivery (`spec/<number>-<slug>`, else a short descriptive name) and its one pull request, a draft until verified. [`build`](skills/build/SKILL.md#pull-request) owns it.

## Vertical slice

One verifiable outcome cut through every layer it needs: a `to-tasks` task, or a group of small tasks that must land together. Never one technical layer. The host decides the fan-out ([`build` Slices](skills/build/SKILL.md#slices)).

## Acceptance scenario

The one representative journey a spec's Acceptance names: actor, realistic starting state, and numbered steps with observable results (also through the agent interface when the spec names agent users). A draft without one is not accepted. [`to-spec`](skills/to-spec/SKILL.md) owns the rule.

## Focused check

The smallest test that proves one behavior: it fails without the change and runs alone with one command. Consequential contracts get theirs first; UI gets none by default. [`build`](skills/build/SKILL.md#tests) owns the rule.

## Requirement verdict

The status `review` gives each step of an acceptance scenario: **satisfied**, **unmet**, or **unresolved**, with cited evidence. No evidence means unresolved; unmet blocks. [`review`](skills/review/SKILL.md#inspect) owns it.

## Liveness

The light check that ends "push it", "build it", and "ship it": the remote has the commit and, when the host reports a deployment for it, that deployment answers. It reports a state and never gates; it is not a test or a behavior check (`review`'s). The states are defined by [`liveness.mjs`](skills/ship/scripts/liveness.mjs) ([decision 0048](docs/decisions/0048-delivery-phrases-are-approvals.md)).

## Candidate spec

A stub for later work worth remembering: the problem and what it waits on, status `candidate`. `to-spec` completes the same file when its turn comes.

## Leading word

The short phrase a user says, typed or dictated, to reach a Flow skill, such as "explore this" or "ship it". A description names one or a few dictation-safe variants (one for the delivery skills, so dictation cannot blur them), and the [catalog](docs/skills.md) lists the first. Prefer familiar words; avoid generic host verbs like "plan". `flow start` is neither a leading word nor a skill; `start` is the optional template bootstrap. [Decisions 0019](docs/decisions/0019-voice-first-invocation.md) and [0048](docs/decisions/0048-delivery-phrases-are-approvals.md); source limits in the [writing research](docs/research/2026-10-19-writing.md#matt-pocock-writing-for-agents).

## Exploration

Opening possibilities without a bounded question: references, alternatives, sketches, prototypes. Run by [`explore`](skills/explore/SKILL.md); it adopts nothing until the user does, and research it does for the conversation stays in chat.

## Research note

A dated, sourced file another session can decide from, written by [`research`](skills/research/SKILL.md) on an explicit request ("research X", "competitors for X"). It separates observed capability, vendor claim, and inference, and proposes rather than adopts. Distinct from research done inside an [exploration](#exploration), which stays in chat.

## Outcome evidence

What shows whether shipped work changed the outcome it was for, named in the spec's **Outcome** sentence with the decision it informs. Distinct from delivery proof (the behavior works and the evidence can be obtained), which `build` checks before shipping; [product alignment](#product-alignment) judges outcome evidence afterwards, and unknown stays unknown.

## Validation board

A possible practice, not a Flow product or required folder: a shared view of hypotheses, risky assumptions, experiments, and evidence.

## Capability page

A website page, sourced from `docs/capabilities/`, explaining what Flow contributes in one area; it links to the owners of each rule and defines none. Distinct from a host's capabilities ([decision 0055](docs/decisions/0055-capability-based-github-and-host-triggered-builds.md)). Contract: [`docs/capabilities/README.md`](docs/capabilities/README.md).

## Retired

Kept for older records and links.

- <a id="process-depth"></a><a id="discovery-depth"></a>**Discovery depth** (earlier **process depth**): a Lite or Full setting in the Flow block. `explore` now asks in proportion to the change. Decisions [0036](docs/decisions/0036-one-explore-depth.md) and [0044](docs/decisions/0044-fast-delivery.md).
- <a id="spec-issue"></a>**Spec issue**: a GitHub issue per spec. Specs live only in files; issues open on request. [Decision 0044](docs/decisions/0044-fast-delivery.md).
- <a id="integration-owner"></a>**Integration owner**: one session per delivery that merged contributed branches. Claude Code owns sessions now ([decision 0062](docs/decisions/0062-claude-code-first.md)).
- <a id="progress-board"></a>**Progress board**: a kanban of specs by stage, removed 2026-11-03. Spec status lines, pull requests, and the [work-in-flight](#work-in-flight) report replace it; unrelated to a [validation board](#validation-board).
- <a id="verification"></a>**Verification**: former name for [liveness](#liveness).
- <a id="human-summary"></a>**Human summary** (a `tldr` skill output): replaced by the host's recaps ([decision 0062](docs/decisions/0062-claude-code-first.md)).
