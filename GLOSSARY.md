# Flow glossary

Working meanings for Flow's product-engineering practice. Include only project-specific concepts and distinctions that affect decisions; [the methodology](docs/methodology.md#maintain-shared-language) describes how this vocabulary evolves.

## Flow

The lightweight, human-led product engineering methodology defined in this repository's [PRODUCT.md](PRODUCT.md). Distinct from the flow-skills distribution, Flow Factory orchestration, application templates (flow-next, flow-mono), and an adopter project's own product. See [Product context](#product-context).

## Agentic product engineering

The practice of combining product judgment, design, and software engineering to direct AI agents across discovery, delivery, and learning, with people accountable for decisions, quality, and outcomes. This describes how products are developed; the resulting product need not contain AI agents.

## Agentic Product Engineer

A practitioner who uses product and engineering expertise to decide what is worth building, guide AI agents in building it, and evaluate whether it creates value. Agents can help investigate and challenge direction as well as execute work; the practitioner retains accountability.

## Product context

An adopter project's own product identity, normally in that project's `PRODUCT.md`, with design, architecture, and glossary beside it when they earn a file. Flow Lite aligns product context. It does not copy Flow's mission or principles into it. [Decision 0009](docs/decisions/0009-adopter-product-context.md).

## Flow Lite

The [`flow`](skills/flow/SKILL.md) skill: keep the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` aligned with meaningful changes. Not a workflow router and not project initialization. Model-invocable like most Flow skills ("update the docs"); that is not an always-on guarantee.

## Flow skill

A portable `skills/<name>/SKILL.md` package in the Flow Skills distribution. Users reach skills by talking: an agent matches the skill's [leading word](#leading-word). Slash commands are optional shortcuts. No skill must be named explicitly ([decision 0019](docs/decisions/0019-voice-first-invocation.md), [decision 0022](docs/decisions/0022-start-runs-explore.md)). Skills may read local supporting files without imposing a mandatory workflow. The [skill catalog](docs/skills.md) groups skills for navigation; groups do not enforce invocation order.

## Delivery mode

How `ship` lands a spec's work in a project: **local** (a reviewed spec branch merged into local `main` with `--no-ff` and pushed, tasks as checkboxes in the spec) or **pull request** (one GitHub pull request closing the task issues). Recorded as a `Delivery:` line in the project's Flow block. Distinct from Flow Lite and from explore's depth tiers. [Decision 0020](docs/decisions/0020-flow-mode.md).

## Candidate spec

A stub spec for a later vertical slice: the problem, the assumption the slice tests, and status `candidate`. Fleshed out only after the first slice ships. [Decision 0022](docs/decisions/0022-start-runs-explore.md).

## Human summary

A visual presentation for a person. Prefer generative UI (GenUI) when the host actually provides it; otherwise Mermaid, tables, and a short statement. The [`tldr`](skills/tldr/SKILL.md) skill owns this, including session recaps and "show me". [`write-humans`](skills/write-humans/SKILL.md) drafts prose. There is no separate `human` skill. [Decision 0008](docs/decisions/0008-leading-words-and-visual-summaries.md).

## Leading word

The short phrase a user says, typed or dictated, to reach a Flow skill, such as "interview me" or "ship it". Each skill's description names it with two or three dictation-safe variants, and the [skill catalog](docs/skills.md) lists the first. Following Matt Pocock's terminology in [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md), the phrase also anchors how the agent recognizes and carries out the skill, so prefer familiar words over invented vocabulary. Avoid generic host verbs such as "plan" or "review the code". [Decision 0019](docs/decisions/0019-voice-first-invocation.md) redefines the term from [0008](docs/decisions/0008-leading-words-and-visual-summaries.md). `flow start` is not a leading word and not a skill. The optional skill **`start`** initializes from flow-next or flow-mono after the user confirms template, name, and destination ([decision 0010](docs/decisions/0010-optional-start-skill.md), [decision 0022](docs/decisions/0022-start-runs-explore.md)); it is not Flow Lite. Source limits: [writing research](docs/research/2026-10-19-writing.md#matt-pocock-writing-for-agents).

## Decision record

A numbered document under `docs/decisions/` that preserves the context, decision, and rationale for a significant choice. Accepted records are historical evidence; superseding creates a new record. Current product, design, and architecture documents reflect the accepted position today.

## Specification

A numbered document that captures a bounded increment of work. Default path in Flow's own repository: `docs/specs/NNN-short-name.md`. Adopter projects may use their own conventions.

## Exploration

An activity that opens possibilities through browsing references, comparing approaches, sketching, or trying prototypes. It can begin without a bounded question and may include research.

## Research

An evidence-seeking activity directed at a question. It may happen within exploration; its findings can inform specs and decisions without committing to a direction.

## Intent

What we want to learn or achieve. Intent gives work its purpose; a spec or conversation may carry it without a separate tracker.

## Validation board

A shared representation of hypotheses, risky assumptions, experiments, evidence, and decisions across iterations. Flow does not ship a validation-board product; the term describes a possible practice, not a required folder structure.

## Progress board

The read-only kanban of a project's specs by stage that the [`board`](skills/board/SKILL.md) skill derives from git. It shows where work stands, not hypotheses or evidence; distinct from a [validation board](#validation-board). [Decision 0025](docs/decisions/0025-progress-board-skill.md).
