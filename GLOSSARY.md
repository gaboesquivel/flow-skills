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

The [`flow`](skills/flow/SKILL.md) skill: keep the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` aligned with meaningful changes, and set up Flow in a project. Not template initialization, and it does not run other skills. Model-invocable like most Flow skills ("update the docs"); that is not an always-on guarantee. Earlier records call it **Flow Lite**; current documents do not, so Lite means only [process depth](#process-depth) ([decision 0026](docs/decisions/0026-process-depth.md)).

## Process depth

How much process a project wants: **Lite** or **Full**, asked once at setup ("set up Flow here" or `start`) and recorded as a `Process:` line in the project's Flow block. It is `explore`'s default depth for new work; unset means Lite. Lite: brief, spec 001 in full with its tasks, later bets as candidates, choices inside specs. Full: Lite plus deeper discovery and a [decision record](#decision-record) for each choice among alternatives. Neither specifies later bets up front. [Decision 0026](docs/decisions/0026-process-depth.md).

## Spec

One bet: a numbered document that tests one assumption and ships as one unit, with tasks as the slices inside it. A bet that depends on how another one does gets its own spec, stubbed as a [candidate](#candidate-spec) until its turn. [`to-spec`](skills/to-spec/SKILL.md) owns the rule.

## Decision record

A numbered record of a choice among real alternatives that reaches beyond one spec or is costly to reverse. Other choices live in the spec's Implementation Decisions. Never holds scope or tasks. [Decision 0026](docs/decisions/0026-process-depth.md).

## Flow skill

A portable `skills/<name>/SKILL.md` package in the Flow Skills distribution. Users reach skills by talking: an agent matches the skill's [leading word](#leading-word). Slash commands are optional shortcuts. No skill must be named explicitly ([decision 0019](docs/decisions/0019-voice-first-invocation.md), [decision 0022](docs/decisions/0022-start-runs-explore.md)). Skills may read local supporting files without imposing a mandatory workflow. The [skill catalog](docs/skills.md) groups skills for navigation; groups do not enforce invocation order.

## Delivery mode

How `ship` lands a spec's work in a project: **local** or **pull request**. Distinct from [process depth](#process-depth). The rule lives in [`ship`](skills/ship/SKILL.md#delivery-mode); [decision 0020](docs/decisions/0020-flow-mode.md) records why. The [deploy target](#deploy-target) sits beside it on a `Deploy:` line.

## Deploy target

The platform that builds previews and deployments for a project, such as `vercel`, or `none`. Recorded as a `Deploy:` line in the project's Flow block; `ship` infers it from repository configuration when unset and defers deploy steps to the platform's own skill or CLI. [Decision 0025](docs/decisions/0025-wave-checkpoints.md).

## Wave

The tasks of a spec's task set that are ready when `ship` starts them; a wave ends when each has integrated, failed, or been blocked. Its combined change gets one five-axis review and one [checkpoint](#checkpoint). [Decision 0025](docs/decisions/0025-wave-checkpoints.md).

## Checkpoint

The report `ship` posts after each [wave](#wave): what integrated or failed, checks, the commit, the preview from the [deploy target](#deploy-target), and screenshots when the host has a browser tool. A pull request comment in pull-request mode, a message in local mode; by default the next wave waits for the user's go. [Decision 0025](docs/decisions/0025-wave-checkpoints.md).

## Candidate spec

A stub spec for a later bet: the problem, the assumption it tests, and status `candidate`. Fleshed out only when its turn comes, after the bet it depends on ships. Decisions [0022](docs/decisions/0022-start-runs-explore.md) and [0026](docs/decisions/0026-process-depth.md).

## Human summary

A visual presentation for a person. Prefer generative UI (GenUI) when the host actually provides it; otherwise Mermaid, tables, and a short statement. The [`tldr`](skills/tldr/SKILL.md) skill owns this, including session recaps and "show me". [`write-humans`](skills/write-humans/SKILL.md) drafts prose. There is no separate `human` skill. [Decision 0008](docs/decisions/0008-leading-words-and-visual-summaries.md).

## Leading word

The short phrase a user says, typed or dictated, to reach a Flow skill, such as "interview me" or "ship it". Each skill's description names it with two or three dictation-safe variants, and the [skill catalog](docs/skills.md) lists the first. Following Matt Pocock's terminology in [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md), the phrase also anchors how the agent recognizes and carries out the skill, so prefer familiar words over invented vocabulary. Avoid generic host verbs such as "plan" or "review the code". [Decision 0019](docs/decisions/0019-voice-first-invocation.md) redefines the term from [0008](docs/decisions/0008-leading-words-and-visual-summaries.md). `flow start` is not a leading word and not a skill. The optional skill **`start`** initializes from flow-next or flow-mono after the user confirms template, name, and destination ([decision 0010](docs/decisions/0010-optional-start-skill.md), [decision 0022](docs/decisions/0022-start-runs-explore.md)); it is [context alignment](#context-alignment) plus a template bootstrap ([decision 0026](docs/decisions/0026-process-depth.md)). Source limits: [writing research](docs/research/2026-10-19-writing.md#matt-pocock-writing-for-agents).

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
