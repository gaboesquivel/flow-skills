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

Reduce the time and effort between human intent and verified product value. Process should cost minutes, not rounds: checks run once at pull request time, and shipping verifies only that the change is live. Remove ceremony, never the practice: keep good product, lean startup, and engineering practices, and cut any step that repeats them or records state no one reads.

| Metric | From | To | Target (hypothesis, low confidence) |
| --- | --- | --- | --- |
| **Idea → prod** (main) | First prompt of the session where the work begins | Live: production deploy answers (apps), or merged to `main` (flow-skills) | Small change < 15 min; feature < 2 h |
| Time to start | First prompt to `start` | First green deploy | < 5 min; flow-next and flow-mono ship Vercel-ready so `start` deploys with no extra setup |
| Time to close PR | First commit on the branch | Merge | Median < 10 min (baseline 7.4 min, p90 60 min) |

Diagnostics explain where the time goes: user turns and confirmations, local check runs, CI waits and failures, agent workers, and skill words loaded.

Measured only on the dogfood repositories (flow-skills, flow-next, flow-mono) by a maintainer script that joins host session logs, git, GitHub, and deployment data. Nothing ships to adopters.

**Kill criterion:** if session logs cannot link at least 80% of merged changes to their starting prompt, idea → prod falls back to first commit → live.

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

Status: portable, voice-first catalog on `main` ([0004](docs/decisions/0004-portable-skill-catalog.md), [0005](docs/decisions/0005-misc-tldr-skill.md), [0006](docs/decisions/0006-flow-lite-and-flat-docs.md), [0007](docs/decisions/0007-flow-product-identity.md), [0008](docs/decisions/0008-leading-words-and-visual-summaries.md), [0009](docs/decisions/0009-adopter-product-context.md), [0010](docs/decisions/0010-optional-start-skill.md), [0013](docs/decisions/0013-restore-engineering-skills.md), [0014](docs/decisions/0014-handoff-skill.md), [0015](docs/decisions/0015-tasks-and-domain-modeling.md), [0016](docs/decisions/0016-start-in-place.md), [0017](docs/decisions/0017-claude-code-skill-coexistence.md), [0018](docs/decisions/0018-interview-extracts-intent.md), [0019](docs/decisions/0019-voice-first-invocation.md), [0020](docs/decisions/0020-flow-mode.md), [0021](docs/decisions/0021-autonomous-explore-and-ship.md), [0022](docs/decisions/0022-start-runs-explore.md), [0023](docs/decisions/0023-agent-first.md), [0024](docs/decisions/0024-gated-hand-offs.md), [0025](docs/decisions/0025-wave-checkpoints.md), [0026](docs/decisions/0026-process-depth.md), [0027](docs/decisions/0027-progress-board-skill.md), [0028](docs/decisions/0028-build-and-ship.md), [0029](docs/decisions/0029-spec-issues.md), [0030](docs/decisions/0030-asked-delivery-and-local-mode.md), [0031](docs/decisions/0031-fan-out-by-default.md), [0032](docs/decisions/0032-local-build-lands-ship-verifies.md), [0033](docs/decisions/0033-shared-files-and-reviewed-head.md), [0034](docs/decisions/0034-no-ceremony-without-a-spec.md), [0035](docs/decisions/0035-spec-issue-on-acceptance.md), [0036](docs/decisions/0036-one-explore-depth.md), [0037](docs/decisions/0037-git-for-delivery-github-for-github-mode.md), [0038](docs/decisions/0038-direction-changes-are-confirmed-and-recorded.md)); live verification in multiple agent hosts remains ongoing.

### Problem

AI makes it easy to ship faster than teams establish what matters. Disparate skills and heavy methodology leave founders reconciling workflows, terminology, and documentation alone.

flow-skills offers a small catalog: **context alignment** (`flow`) for root context and Flow setup, plus optional skills you reach by talking to your agent, typed or dictated. Optional template initialization is the [`start`](skills/start/SKILL.md) skill only — Flow setup plus a template bootstrap, not `flow start`, and not mandatory; it confirms only what the request leaves unclear before writing ([decision 0044](docs/decisions/0044-fast-delivery.md)). Templates work without Flow Skills. Skills may name the next skill and wait; the only automatic hand-offs are `start` → `explore` and explore's `interview` and `grill` phases, each behind the user's yes. `ship` waits for green checks once, lands, and verifies the change is live; an independent review runs only when the change is large or risky or you ask ([decision 0044](docs/decisions/0044-fast-delivery.md), amending [0042](docs/decisions/0042-outcome-build-and-ship.md); [0024](docs/decisions/0024-gated-hand-offs.md)). Adopter `AGENTS.md`, `CLAUDE.md`, or equivalent files change only when you opt into [Flow mode](#flow-mode).

**Adopter product context.** In another repository, `PRODUCT.md` is that product. This file is Flow's identity only. `flow` and `build` update an adopter's product docs when that product changes. They do not overwrite them with the mission, principles, or tagline above. [Decision 0009](docs/decisions/0009-adopter-product-context.md).

### Install and catalog

**Install:** `npx skills add gaboesquivel/flow-skills` via the [Agent Skills ecosystem](https://github.com/vercel-labs/skills).

**Requirements.** What a skill needs depends on its tier ([decision 0037](docs/decisions/0037-git-for-delivery-github-for-github-mode.md)):

| Tier | Skills or features | Needs |
| --- | --- | --- |
| Thinking | `grill`, `interview`, `council`, `jtbd`, `competitors`, `align`, `domain-modeling`, `debug`, `tldr`, `write-humans`, `write-agents`, `retro`, `handoff`, `prototype` | Nothing: any folder, or none |
| Delivery chain | `flow` (the Flow block), `start`, `explore`, `to-spec`, `to-tasks`, `build`, `review`, `ship`, `board` | A Git repository; outside one, the skill offers `git init` and stops on a no |
| GitHub mode | Spec issues, sub-issues, pull requests, deployment liveness checks | GitHub access, on top of Git |

Local delivery needs only Git, so the whole chain works with GitLab, Bitbucket, or no remote. Thinking skills may read Git when it exists and never ask the delivery question.

| Layer | Skills |
| --- | --- |
| Context alignment | [`flow`](skills/flow/SKILL.md) — align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md` where hosts support discovery, and set up Flow: the opt-in [Flow block](GLOSSARY.md#flow-block) recording the [delivery mode](GLOSSARY.md#delivery-mode). Not always-on, and not template initialization. |
| Delivery | `explore`, `interview`, `grill`, `to-spec`, `to-tasks`, `build`, `review`, `ship`, `retro` |
| Advisory | `council` |
| Prototype | `prototype` |
| Shared language | `domain-modeling` |
| Quality | `debug` |
| Product discovery | `jtbd`, `competitors`, `align` |
| Writing | `write-agents`, `write-humans` |
| Project start | [`start`](skills/start/SKILL.md) — Flow setup plus a verified bootstrap from flow-next or flow-mono in one lane while `explore` shapes the product in the other; confirms template, name, destination, preset, and delivery before writing |
| Misc | `tldr`, `handoff`, `board` |

Grouped descriptions and links: **[docs/skills.md](docs/skills.md)**. Say a skill's leading word ("interview me", "spec it", "ship it"); slash commands are optional. Every skill is reachable by phrase ([0019](docs/decisions/0019-voice-first-invocation.md)); `start` confirms template, name, destination, and preset before it writes anything ([0022](docs/decisions/0022-start-runs-explore.md)). No skill enforces a sequence (`/build` does not require `/to-spec`).

**Default durable docs in adopter projects:** `docs/specs/NNN-short-name.md` and `docs/decisions/NNN-short-name.md`, plus root context files when useful. In GitHub mode each accepted spec also gets a [spec issue](GLOSSARY.md#spec-issue) that copies the file, with its tasks as sub-issues; the file stays the source of truth (decisions [0029](docs/decisions/0029-spec-issues.md) and [0035](docs/decisions/0035-spec-issue-on-acceptance.md)).

**Not shipped as skills:** validation-board UI (the read-only [`board`](skills/board/SKILL.md) is a [progress board](GLOSSARY.md#progress-board)), OMTM automation, commercial discovery pipelines, or hosted, issue-triggered orchestration (Flow Factory). Project initialization is the optional [`start`](skills/start/SKILL.md) skill only (not a router or mandatory pipeline). Optional judgment for measurement and validation lives in [methodology](docs/methodology.md) as practice, not product enforcement.

### Flow mode

Opt-in conversational delivery ([decision 0020](docs/decisions/0020-flow-mode.md), [spec 009](docs/specs/009-flow-mode.md)). Saying "set up Flow here" has `flow` write one removable [Flow block](GLOSSARY.md#flow-block) into the project's tracked instruction file: a `Delivery:` line and the phrases that reach each skill. Delivery is the only setup question, asked once wherever Flow first needs it (decisions [0030](docs/decisions/0030-asked-delivery-and-local-mode.md) and [0036](docs/decisions/0036-one-explore-depth.md)); `explore` has one default depth and runs deeper research only on request. When the project has no goals yet, `flow` names `explore` next. Skills use parallel workers only where they pay: context-heavy steps, steps that run while the user is answering, and reviews that must be independent ([decision 0031](docs/decisions/0031-fan-out-by-default.md), amended by [0042](docs/decisions/0042-outcome-build-and-ship.md) and [0043](docs/decisions/0043-workers-when-they-pay.md)). After "break it down", `to-tasks` reports the ready set; "build it" has `build` finish the task set on one spec branch, choosing workers, worktrees, and scheduling, and end in one pull request per spec (local mode: reviewed and merged into local `main`, nothing pushed, no remote needed); "ship it" waits for green checks once and lands with no confirmation (GitHub mode: merge the pull request; local mode: push `main`), then [verifies](GLOSSARY.md#verification) only that the change is live; the independent review runs only when the size guard escalates or you ask ([0028](docs/decisions/0028-build-and-ship.md), [0029](docs/decisions/0029-spec-issues.md), [0032](docs/decisions/0032-local-build-lands-ship-verifies.md), [0042](docs/decisions/0042-outcome-build-and-ship.md), [0044](docs/decisions/0044-fast-delivery.md)). The [delivery mode](GLOSSARY.md#delivery-mode) decides where tasks live and how work lands; [`build`](skills/build/SKILL.md#delivery-mode) owns the rule.

### Catalog alignment (evaluate before adding skills)

| Chain stage | How the current catalog supports it |
| --- | --- |
| Product thinking | `explore`, `interview`, `grill`, `jtbd`, `competitors`, `council`; `flow` keeps product intent in root docs |
| Engineering discipline | `to-spec`, `to-tasks`, `domain-modeling`, `write-agents`, `write-humans`, `prototype`, `debug`; specs and decisions as flat durable artifacts |
| Agent execution | `build` (outcomes and proofs for an implementation, in either delivery mode), `ship`; portable packages with no mandatory router |
| Verified value | `review`, `ship`, `retro`, `tldr`, `board`, `align`; evidence, alignment, visual summaries, a read-only progress view derived from git, and a product-wide check against vision and metrics |

Further catalog growth needs its own decision. [0013](docs/decisions/0013-restore-engineering-skills.md) restored `council`, `ship`, `prototype`, `simplify`, `security`, `performance`, and `debug`. [0014](docs/decisions/0014-handoff-skill.md) adds `handoff`. [0015](docs/decisions/0015-tasks-and-domain-modeling.md) renames `to-tasks` and restores `domain-modeling`. [0019](docs/decisions/0019-voice-first-invocation.md) retires `simplify`, `security`, and `performance` in favor of host tools. [0027](docs/decisions/0027-progress-board-skill.md) adds `board`. [0041](docs/decisions/0041-align-skill.md) adds `align`.

### Open choices

Measurable learning may inform maintainer research. Idea → prod is Flow's main metric ([Success](#success)); broader demand remains unvalidated.

**Starting a project.** Invoke the optional [`start`](skills/start/SKILL.md) skill when you want a verified new repository from flow-next or flow-mono. One lane bootstraps while `explore` shapes the product with you ([0022](docs/decisions/0022-start-runs-explore.md)). The bootstrap covers renamed identity, template setup and QA/build/eval, Portless startup smoke, baseline `PRODUCT.md` / `DESIGN.md` / `ARCHITECTURE.md`, and an independent initial commit when checks pass. There is no `flow start` command; discoverable `flow` must not be treated as initialization ([0010](docs/decisions/0010-optional-start-skill.md)).

See [documentation guide](docs/README.md) and [AGENTS.md](AGENTS.md) for maintenance.
