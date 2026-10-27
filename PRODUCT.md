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
| **[Flow Factory](https://github.com/gaboesquivel/flow-factory)** | Optional agent orchestration and automated execution built on Flow—not Flow itself |

Templates remain usable without Flow. Flow owns the methodology; flow-skills implements portable agent behavior; templates own their application foundations.

## Dogfooding

Every meaningful improvement to Flow must be developed using Flow and validated against a realistic software development task.

That means maintaining relevant living documentation, using existing skills proportionally, and running retrospectives that can eliminate unnecessary complexity. The repeatable practice, including how to separate structural checks from live agent verification, is [Dogfood](docs/methodology.md#dogfood).

Primary internal dogfooding targets: **flow-skills** first, then experience validation on **flow-next** and **flow-mono**.

---

## This repository: flow-skills

Status: fifteen-skill portable catalog on `main` ([0004](docs/decisions/0004-portable-skill-catalog.md), [0005](docs/decisions/0005-misc-tldr-skill.md), [0006](docs/decisions/0006-flow-lite-and-flat-docs.md), [0007](docs/decisions/0007-flow-product-identity.md), [0008](docs/decisions/0008-leading-words-and-visual-summaries.md), [0009](docs/decisions/0009-adopter-product-context.md), [0010](docs/decisions/0010-optional-start-skill.md)); live verification in multiple agent hosts remains ongoing.

### Problem

AI makes it easy to ship faster than teams establish what matters. Disparate skills and heavy methodology leave founders reconciling workflows, terminology, and documentation alone.

flow-skills offers a small catalog: **Flow Lite** for root context alignment, plus optional skills invoked only when you ask. No initialization, no pipeline router, no requirement to modify adopter `AGENTS.md`, `CLAUDE.md`, or equivalent files.

**Adopter product context.** In another repository, `PRODUCT.md` is that product. This file is Flow's identity only. Flow Lite and `implement` update an adopter's product docs when that product changes. They do not overwrite them with the mission, principles, or tagline above. [Decision 0009](docs/decisions/0009-adopter-product-context.md).

### Install and catalog

**Install:** `npx skills add gaboesquivel/flow-skills` via the [Agent Skills ecosystem](https://github.com/vercel-labs/skills).

| Layer | Skills |
| --- | --- |
| Flow Lite | [`flow`](skills/flow/SKILL.md) — align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md` where hosts support discovery. Not always-on, and not project initialization. |
| Delivery | `explore`, `grill`, `to-spec`, `to-tickets`, `implement`, `review`, `retro` |
| Product discovery | `interview`, `jtbd`, `competitors` |
| Writing | `write-agents`, `write-humans` |
| Project start | [`start`](skills/start/SKILL.md) — initialize from flow-next or flow-mono (manual only) |
| Misc | `tldr` |

Grouped descriptions and links: **[docs/skills.md](docs/skills.md)**. Every skill except `flow` requires explicit invocation. No skill enforces a sequence (`/implement` does not require `/to-spec`).

**Default durable docs in adopter projects:** `docs/specs/NNN-short-name.md` and `docs/decisions/NNN-short-name.md`, plus root context files when useful.

**Not shipped as skills:** validation-board UI, OMTM automation, commercial discovery pipelines, repository bootstrap, workflow orchestration, or Flow Factory. Optional judgment for measurement and validation lives in [methodology](docs/methodology.md) as practice, not product enforcement.

### Catalog alignment (evaluate before adding skills)

| Chain stage | How the current catalog supports it |
| --- | --- |
| Product thinking | `explore`, `grill`, `interview`, `jtbd`, `competitors`; `flow` keeps product intent in root docs |
| Engineering discipline | `to-spec`, `to-tickets`, `write-agents`, `write-humans`; specs and decisions as flat durable artifacts |
| Agent execution | `implement`; portable packages with no mandatory router |
| Verified value | `review`, `retro`, `tldr`; evidence, alignment, and visual summaries without claiming a feature shipped |

Gaps to respect: no new skills unless they clearly strengthen the chain or reduce friction; prefer simplifying or extending existing skills over catalog growth.

### Open choices

Strategic themes (measurable learning, API-first agentic products) may inform maintainer research. No OMTM is selected for Flow itself; broader demand remains unvalidated.

**Starting a project.** Invoke the optional [`start`](skills/start/SKILL.md) skill when you want help choosing flow-next or flow-mono and creating product-specific root docs. There is no `flow start` command; discoverable `flow` must not be treated as initialization ([0010](docs/decisions/0010-optional-start-skill.md)).

See [documentation guide](docs/README.md) and [AGENTS.md](AGENTS.md) for maintenance.
