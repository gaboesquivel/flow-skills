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
| **flow-next / flow-mono** | Independent application foundations (templates) |
| **Flow Factory** | Optional agent orchestration and automated execution built on Flow—not Flow itself |

Templates remain usable without Flow. Flow owns the methodology; flow-skills implements portable agent behavior; templates own their application foundations.

## Dogfooding

Every meaningful improvement to Flow must be developed using Flow and validated against a realistic software development task.

That means maintaining relevant living documentation, using existing skills proportionally, checking that changes work across supported environments, and running retrospectives that can eliminate unnecessary complexity.

Primary internal dogfooding targets: **flow-skills** first, then experience validation on **flow-next** and **flow-mono**.

---

## This repository: flow-skills

Status: fourteen-skill portable catalog on `main` ([0004](docs/decisions/0004-portable-skill-catalog.md), [0005](docs/decisions/0005-misc-tldr-skill.md), [0006](docs/decisions/0006-flow-lite-and-flat-docs.md), [0007](docs/decisions/0007-flow-product-identity.md)); live verification in multiple agent hosts remains ongoing.

### Problem

AI makes it easy to ship faster than teams establish what matters. Disparate skills and heavy methodology leave founders reconciling workflows, terminology, and documentation alone.

flow-skills offers a small catalog: **Flow Lite** for root context alignment, plus optional skills invoked only when you ask. No initialization, no pipeline router, no requirement to modify adopter `AGENTS.md`, `CLAUDE.md`, or equivalent files.

### Install and catalog

**Install:** `npx skills add gaboesquivel/flow-skills` via the [Agent Skills ecosystem](https://github.com/vercel-labs/skills).

| Layer | Skills |
| --- | --- |
| Flow Lite | [`flow`](skills/flow/SKILL.md) — align `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md` (discoverable where hosts support it) |
| Delivery | `explore`, `grill`, `to-spec`, `to-tickets`, `implement`, `review`, `retro` |
| Product discovery | `interview`, `jtbd`, `competitors` |
| Writing | `write-agents`, `write-humans` |
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
| Verified value | `review`, `retro`, `tldr`; evidence and alignment checks without claiming a feature shipped |

Gaps to respect: no new skills unless they clearly strengthen the chain or reduce friction; prefer simplifying or extending existing skills over catalog growth.

### Open choices

Strategic themes (measurable learning, API-first agentic products) may inform maintainer research. No OMTM is selected for Flow itself; broader demand remains unvalidated.

See [documentation guide](docs/README.md) and [AGENTS.md](AGENTS.md) for maintenance.
