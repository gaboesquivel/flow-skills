# Flow

**From intent to verified software.**

## Mission

Make product engineering with AI agents simpler, faster, and more reliable—without sacrificing product understanding, engineering quality, or human judgment.

## Definition

Flow is a lightweight, human-led product engineering methodology for building and evolving software with AI agents.

It combines shared product context, reusable engineering skills, and practical development conventions in a continuous workflow from exploration to verified delivery.

Flow is agent-agnostic, UI-agnostic, and technology-agnostic. Its process is proportional to the work, not a mandatory sequence of ceremonies.

Flow is a documented way of working, not an agent router. Ordinary language should be the complete user interface to Flow; shortcuts and skills are optional conveniences.

## Experience

Working with Flow should feel like one continuous conversation with a product-minded engineering partner.

Humans define direction and make consequential decisions. Agents help explore, design, implement, review, and verify. Shared context preserves understanding as software evolves: product, design, architecture, decisions, and evidence stay current and discoverable.

## Principles

1. **Product before code.** Build useful software, not just completed tasks.
2. **Preserve intent.** Keep product, design, architecture, and significant decisions understandable and current.
3. **Human-led, agent-assisted.** Automate execution without unnecessarily replacing human judgment.
4. **Minimal process.** Use only the structure and skills the task requires.
5. **Evidence over claims.** Verify outcomes through appropriate tests, reviews, and real-world checks.
6. **Portable by design.** Work across agents, interfaces, frameworks, and tools.
7. **Improve through use.** Develop Flow using Flow, and simplify it through real experience.
8. **Agent-first, API-first.** Build every product for agents and people; define capabilities as contracts before interfaces.

Methodology practices that elaborate these principles live in [docs/principles.md](docs/principles.md) and [docs/methodology.md](docs/methodology.md) as optional judgment, not enforcement.

## Success

Reduce the time and effort between human intent and verified product value.

## Strategic chain

Everything introduced into Flow should strengthen this chain or reduce friction along it:

**Product thinking → Engineering discipline → Agent execution → Verified value**

The methodology defines what good product engineering looks like. Reusable skills and conventions make that methodology convenient to practice.

## Ecosystem

| Piece | Role |
| --- | --- |
| **Flow** | The methodology (this document and related practice docs) |
| **flow-skills** (this repository) | Reusable skills and conventions for agents |
| **[flow-next](https://github.com/gaboesquivel/flow-next)** / **[flow-mono](https://github.com/gaboesquivel/flow-mono)** | Independent application foundations (templates); [interop contract](docs/specs/005-flow-templates-interop.md) (supersedes [003](docs/specs/003-flow-templates-baseline-v2.md) for new work) |
| **[Flow Factory](https://github.com/gaboesquivel/flow-factory)** | Optional hosted, issue-driven orchestration and automated execution built on Flow—not Flow itself. [Flow mode](#flow-mode) is the in-session counterpart and does not depend on it. |

Templates remain usable without Flow. Flow owns the methodology; flow-skills implements portable agent behavior; templates own their application foundations.

## Dogfooding

Every meaningful improvement to Flow must be developed using Flow and validated against a realistic software development task.

That means maintaining relevant living documentation, using existing skills proportionally, and running retrospectives that can eliminate unnecessary complexity. The repeatable practice, including how to separate structural checks from live agent verification, is [Dogfood](docs/methodology.md#dogfood).

Primary internal dogfooding targets: **flow-skills** first, then experience validation on **flow-next** and **flow-mono**.

---

## This repository: flow-skills

Status: portable, voice-first catalog on `main` ([0004](docs/decisions/0004-portable-skill-catalog.md), [0005](docs/decisions/0005-misc-tldr-skill.md), [0006](docs/decisions/0006-flow-lite-and-flat-docs.md), [0007](docs/decisions/0007-flow-product-identity.md), [0008](docs/decisions/0008-leading-words-and-visual-summaries.md), [0009](docs/decisions/0009-adopter-product-context.md), [0010](docs/decisions/0010-optional-start-skill.md), [0013](docs/decisions/0013-restore-engineering-skills.md), [0014](docs/decisions/0014-handoff-skill.md), [0015](docs/decisions/0015-tasks-and-domain-modeling.md), [0016](docs/decisions/0016-start-in-place.md), [0017](docs/decisions/0017-claude-code-skill-coexistence.md), [0018](docs/decisions/0018-interview-extracts-intent.md), [0019](docs/decisions/0019-voice-first-invocation.md), [0020](docs/decisions/0020-flow-mode.md), [0021](docs/decisions/0021-autonomous-explore-and-ship.md), [0022](docs/decisions/0022-start-runs-explore.md), [0023](docs/decisions/0023-agent-first.md), [0024](docs/decisions/0024-gated-hand-offs.md), [0025](docs/decisions/0025-wave-checkpoints.md), [0026](docs/decisions/0026-process-depth.md), [0027](docs/decisions/0027-progress-board-skill.md), [0028](docs/decisions/0028-build-and-ship.md), [0029](docs/decisions/0029-spec-issues.md)); live verification in multiple agent hosts remains ongoing.

### Problem

AI makes it easy to ship faster than teams establish what matters. Disparate skills and heavy methodology leave founders reconciling workflows, terminology, and documentation alone.

flow-skills offers a small catalog: **context alignment** (`flow`) for root context and Flow setup, plus optional skills you reach by talking to your agent, typed or dictated. Optional template initialization is the [`start`](skills/start/SKILL.md) skill only — Flow setup plus a template bootstrap, not `flow start`, and not mandatory; it confirms template, name, destination, discovery depth, and delivery before writing. Templates work without Flow Skills. Skills may name the next skill and wait; the only automatic hand-offs are `start` → `explore` and explore's `interview` and `grill` phases, each behind the user's yes, and `ship` running `build` and `review` as part of landing ([decision 0028](docs/decisions/0028-build-and-ship.md); [0024](docs/decisions/0024-gated-hand-offs.md)). Adopter `AGENTS.md`, `CLAUDE.md`, or equivalent files change only when you opt into [Flow mode](#flow-mode).

**Adopter product context.** In another repository, `PRODUCT.md` is that product. This file is Flow's identity only. `flow` and `build` update an adopter's product docs when that product changes. They do not overwrite them with the mission, principles, or tagline above. [Decision 0009](docs/decisions/0009-adopter-product-context.md).

### Install and catalog

**Install:** `npx skills add gaboesquivel/flow-skills` via the [Agent Skills ecosystem](https://github.com/vercel-labs/skills).

| Layer | Skills |
| --- | --- |
| Context alignment | [`flow`](skills/flow/SKILL.md) — align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md` where hosts support discovery, and set up Flow: the opt-in Flow block with a Lite or Full [discovery depth](GLOSSARY.md#discovery-depth). Not always-on, and not template initialization. |
| Delivery | `explore`, `interview`, `grill`, `to-spec`, `to-tasks`, `build`, `review`, `ship`, `retro` |
| Advisory | `council` |
| Prototype | `prototype` |
| Shared language | `domain-modeling` |
| Quality | `debug` |
| Product discovery | `jtbd`, `competitors` |
| Writing | `write-agents`, `write-humans` |
| Project start | [`start`](skills/start/SKILL.md) — Flow setup plus a verified bootstrap from flow-next or flow-mono in one lane while `explore` shapes the product in the other; confirms template, name, destination, discovery depth, and delivery before writing |
| Misc | `tldr`, `handoff`, `board` |

Grouped descriptions and links: **[docs/skills.md](docs/skills.md)**. Say a skill's leading word ("interview me", "spec it", "ship it"); slash commands are optional. Every skill is reachable by phrase ([0019](docs/decisions/0019-voice-first-invocation.md)); `start` confirms template, name, and destination before it writes anything ([0022](docs/decisions/0022-start-runs-explore.md)). No skill enforces a sequence (`/build` does not require `/to-spec`).

**Default durable docs in adopter projects:** `docs/specs/NNN-short-name.md` and `docs/decisions/NNN-short-name.md`, plus root context files when useful. In pull-request mode each spec also gets a [spec issue](GLOSSARY.md#spec-issue) that copies the file, with its tasks as sub-issues; the file stays the source of truth ([decision 0029](docs/decisions/0029-spec-issues.md)).

**Not shipped as skills:** validation-board UI (the read-only [`board`](skills/board/SKILL.md) is a [progress board](GLOSSARY.md#progress-board)), OMTM automation, commercial discovery pipelines, or hosted, issue-triggered orchestration (Flow Factory). Project initialization is the optional [`start`](skills/start/SKILL.md) skill only (not a router or mandatory pipeline). Optional judgment for measurement and validation lives in [methodology](docs/methodology.md) as practice, not product enforcement.

### Flow mode

Opt-in conversational delivery ([decision 0020](docs/decisions/0020-flow-mode.md), [spec 009](docs/specs/009-flow-mode.md)). Saying "set up Flow here" has `flow` write one removable Flow block into the project's `AGENTS.md` (or `CLAUDE.md`): `Delivery:` and `Process:` lines and the phrases that reach each skill. Discovery depth and delivery are independent choices, asked together once, wherever Flow first needs them (decisions [0030](docs/decisions/0030-asked-delivery-and-local-mode.md) and [0032](docs/decisions/0032-local-build-lands-ship-verifies.md)). When the project has no goals yet, `flow` names `explore` next. Skills run independent steps as parallel workers by default ([decision 0031](docs/decisions/0031-fan-out-by-default.md)). After "break it down", `to-tasks` reports the ready set; "build it" has `build` run the whole task set on one spec branch, a worker per [frontier](GLOSSARY.md#frontier) task when the host supports workers and sequentially otherwise, ending in one pull request per spec (local mode: reviewed and merged into local `main`, nothing pushed, no remote needed); "ship it" lands the accepted result with no confirmation (pull-request mode: the one independent review of the spec, then merge; local mode: push `main`) and [verifies](GLOSSARY.md#verification) the shipped commit on its deployment ([0028](docs/decisions/0028-build-and-ship.md), [0029](docs/decisions/0029-spec-issues.md), [0032](docs/decisions/0032-local-build-lands-ship-verifies.md)). The [delivery mode](GLOSSARY.md#delivery-mode) decides where tasks live and how work lands; [`build`](skills/build/SKILL.md#delivery-mode) owns the rule.

### Catalog alignment (evaluate before adding skills)

| Chain stage | How the current catalog supports it |
| --- | --- |
| Product thinking | `explore`, `interview`, `grill`, `jtbd`, `competitors`, `council`; `flow` keeps product intent in root docs |
| Engineering discipline | `to-spec`, `to-tasks`, `domain-modeling`, `write-agents`, `write-humans`, `prototype`, `debug`; specs and decisions as flat durable artifacts |
| Agent execution | `build` (task-set orchestration in Flow mode), `ship`; portable packages with no mandatory router |
| Verified value | `review`, `ship`, `retro`, `tldr`, `board`; evidence, alignment, visual summaries, and a read-only progress view derived from git |

Further catalog growth needs its own decision. [0013](docs/decisions/0013-restore-engineering-skills.md) restored `council`, `ship`, `prototype`, `simplify`, `security`, `performance`, and `debug`. [0014](docs/decisions/0014-handoff-skill.md) adds `handoff`. [0015](docs/decisions/0015-tasks-and-domain-modeling.md) renames `to-tasks` and restores `domain-modeling`. [0019](docs/decisions/0019-voice-first-invocation.md) retires `simplify`, `security`, and `performance` in favor of host tools. [0027](docs/decisions/0027-progress-board-skill.md) adds `board`.

### Open choices

Measurable learning may inform maintainer research. No OMTM is selected for Flow itself; broader demand remains unvalidated.

**Starting a project.** Invoke the optional [`start`](skills/start/SKILL.md) skill when you want a verified new repository from flow-next or flow-mono. One lane bootstraps while `explore` shapes the product with you ([0022](docs/decisions/0022-start-runs-explore.md)). The bootstrap covers renamed identity, template setup and QA/build/eval, Portless startup smoke, baseline `PRODUCT.md` / `DESIGN.md` / `ARCHITECTURE.md`, and an independent initial commit when checks pass. There is no `flow start` command; discoverable `flow` must not be treated as initialization ([0010](docs/decisions/0010-optional-start-skill.md)).

See [documentation guide](docs/README.md) and [AGENTS.md](AGENTS.md) for maintenance.
