# Skill catalog

Skills live in [`skills/`](../skills/); `scripts/validate.mjs` holds the authoritative list. Flow is Claude Code first ([decision 0062](decisions/0062-claude-code-first.md), [decision 0064](decisions/0064-cursor-plugin.md)): install it as a Claude Code plugin or a Cursor plugin to get the skills plus the guard hook, the session report of work in flight, and the `flow-reviewer` agent, or run `npx skills add gaboesquivel/flow-skills` on any Agent Skills host for the skills alone ([agent compatibility](agent-compatibility.md#installation)). No mandatory sequence. Skills may name the next skill and wait; the only automatic hand-off is `start` → `explore`, when the request describes the product and behind the user's yes. Plugin, starters, project scripts, and host each [own one job](methodology.md#who-owns-what). `build` slices work with several outcomes, and the host sizes the fan-out under its concurrency cap ([Slices](../skills/build/SKILL.md#slices), [decision 0060](decisions/0060-slice-by-area.md) as amended by [0062](decisions/0062-claude-code-first.md)). Substantial work names its [delivery appetite](../GLOSSARY.md#delivery-appetite), and new scope mid-flight gets a [scope trade-off](../GLOSSARY.md#scope-trade-off). "Push it", "build it", and "ship it" are approvals: `build` ends with a reviewed, checked branch, `ship` merges it, and "push it" has `ship` push a branch; each ends with a [liveness](../GLOSSARY.md#liveness) check ([decision 0048](decisions/0048-delivery-phrases-are-approvals.md), amending [0044](decisions/0044-fast-delivery.md); [decision 0024](decisions/0024-gated-hand-offs.md)).

[Agent compatibility](agent-compatibility.md) · [Decision 0006](decisions/0006-flow-lite-and-flat-docs.md) · [Decision 0009](decisions/0009-adopter-product-context.md) · [Decision 0015](decisions/0015-tasks-and-domain-modeling.md) · [Decision 0019](decisions/0019-voice-first-invocation.md) · [Decision 0062](decisions/0062-claude-code-first.md) · [Spec 002](specs/002-flow-lite-and-flat-docs.md) · [Spec 059](specs/059-claude-code-first.md)

Talk to your agent, by typing or dictation. Each skill has a [leading word](../GLOSSARY.md#leading-word): the phrase you say to reach it. Each row below gives that phrase, what you get, and what it writes; the skill link has the procedure. Most descriptions carry two or more variants, while "build it" keeps one so dictation cannot blur it. Slash commands (`/explore`, `/ship`, …) remain optional shortcuts. No skill must be named explicitly.

## Process

1. **Install** — the Claude Code plugin, the Cursor plugin, or the Agent Skills CLI, which copies this repository's `skills/` tree into the agent you choose. One of those, not several.
2. **Work** — Build your product and say what you want; "sync the docs" updates root context with **`sync-docs`**. Work needs no spec unless you want one: say "build it" for [unspecced work](../GLOSSARY.md#unspecced-work), or just ask your agent ([work without a spec](../README.md#work-without-a-spec)).
3. **Document** — When saving artifacts, default to `docs/specs/NNN-short-name.md` and `docs/decisions/NNN-short-name.md` unless the project already uses something else.

The delivery skills and the paths between them are drawn in the README: [how it works](../README.md#how-it-works). Every step is skippable; there is no required order.

Product discovery, writing, advisory, experience, and design skills are optional and do not block delivery.

## Which one?

| You say | You get | Writes |
| --- | --- | --- |
| Native Plan (Shift+Tab, `/plan`) | A plan for how to implement a change you already chose | Nothing until you approve |
| "Explore this" | A partner that knows your goals and constraints, asks how the problem is solved today, and helps decide whether and what to build and how you'll know | Nothing; an agreed brief on request |
| "Research X", "competitors for X" | A dated, sourced note another session can decide from | The note and an existing index; "just tell me here" stays in chat |
| "Check alignment" | Whether the product still fits its goals and what the outcome evidence shows | Nothing |
| "Sync the docs" | Root docs updated to match accepted direction | The affected root docs |

## Context alignment

| Skill | Say | What happens |
| --- | --- | --- |
| [sync-docs](../skills/sync-docs/SKILL.md) | "sync the docs" | Updates `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` to accepted direction after meaningful changes; drafts and Proposed records stay labeled as proposals. "Set up Flow here" writes the opt-in [Flow block](../GLOSSARY.md#flow-block), touching no adopter text outside it, and refreshes an older block in place, keeping its `Delivery:` line. **Writes** those files. Not template initialization ([decision 0070](decisions/0070-research-and-clearer-names.md)). |

## Delivery

| Skill | Say | What happens |
| --- | --- | --- |
| [explore](../skills/explore/SKILL.md) | "explore this" | A product-engineering conversation that reads the project's goals, commitments, and constraints first; for substantial work asks how the problem is solved today and can recommend adopting, integrating, testing, deferring, stopping, or a differentiated slice; names a diverging commitment and asks whether it is an experiment or a pivot; settles the outcome sentence when an idea becomes an initiative. "Interview me" and "grill this" change the style. **Writes nothing**; an agreed new-product brief goes to `PRODUCT.md` on request ([decision 0069](decisions/0069-direction-changes-at-adoption.md)). |
| [to-spec](../skills/to-spec/SKILL.md) | "spec it" | A numbered draft spec: what and why, an Outcome sentence for initiatives, [Exposure](../GLOSSARY.md#exposure), and an [acceptance scenario](../GLOSSARY.md#acceptance-scenario); decides one spec or several. "Accept the spec", or "build it" or "ship it" on a draft, accepts it and only the records it links ([the rule](../skills/to-spec/SKILL.md#status-and-acceptance)). **Writes** the spec and any Proposed record on the work's branch; no issue unless asked. |
| [to-tasks](../skills/to-tasks/SKILL.md) | "break it down" | Vertical-slice tasks with blockers and an [area](../GLOSSARY.md#area) each, and the ready set. **Writes** the spec's Tasks checklist. |
| [build](../skills/build/SKILL.md) | "build it" | The identified work implemented, reviewed at its risk tier, checked once, and [live](../GLOSSARY.md#liveness) on its branch, never merged. **Writes** a branch: a ready pull request (GitHub mode) or a commit (local mode). [Unspecced work](../GLOSSARY.md#unspecced-work) needs no spec. |
| [review](../skills/review/SKILL.md) | "review it" | A fresh-context review through [`flow-reviewer`](../agents/flow-reviewer.md) on top of `/code-review`, with [requirement verdicts](../GLOSSARY.md#requirement-verdict), scope, glossary, and `DESIGN.md` checks. **Writes** fixes for confirmed defects; "review only" writes nothing. |
| [ship](../skills/ship/SKILL.md) | "ship it" | The work landed on the default branch with no confirmation, built first when needed, and the shipped commit's [liveness](../GLOSSARY.md#liveness). "Push it" pushes a branch with no pull request. **Writes** the default branch ([0048](decisions/0048-delivery-phrases-are-approvals.md)). |

## Product discovery

| Skill | Say | What happens |
| --- | --- | --- |
| [research](../skills/research/SKILL.md) | "research X" | A sourced note answering the question, or a competitive brief for "competitors for X": the decision it serves, findings marked observed, claimed, or inferred, limits, and implications, updating a current note instead of duplicating it. **Writes** the note and an existing index; "just tell me here" answers in chat, and "should we research…?" is discussion ([decision 0070](decisions/0070-research-and-clearer-names.md)). |
| [align](../skills/align/SKILL.md) | "check alignment" | The product compared with its goals, problems, and metrics, and each outcome with the evidence ("did it land", "are we building the right thing"); shipped with impact unknown is a valid answer. **Writes nothing** (decisions [0041](decisions/0041-align-skill.md), [0046](decisions/0046-measurement-assistance.md), [0070](decisions/0070-research-and-clearer-names.md)). |

## Shared language

| Skill | Say | What happens |
| --- | --- | --- |
| [domain-modeling](../skills/domain-modeling/SKILL.md) | "what do we call this" | Settled project terms. **Writes** `GLOSSARY.md`; decision records sparingly. |

## Advisory

| Skill | Say | What happens |
| --- | --- | --- |
| [council](../skills/council/SKILL.md) | "ask the council" | Independent perspectives on a consequential decision. **Writes nothing**. |
| [experience](../skills/experience/SKILL.md) | "walk the experience" | A walk of a running product as its user, with reproduction steps, impact, and confidence for each friction found ([decision 0068](decisions/0068-experience-skill.md)). **Writes nothing**. |

## Design

| Skill | Say | What happens |
| --- | --- | --- |
| [design](../skills/design/SKILL.md) | "design this" | Two to four rendered visual directions; you choose. **Writes** the chosen direction to `DESIGN.md` with its assets ([decision 0051](decisions/0051-design-skill.md)). "Prototype this" or "spike it" builds a throwaway. |

Debugging, code simplification, security audits, and performance work belong to the host ([0019](decisions/0019-voice-first-invocation.md), [0062](decisions/0062-claude-code-first.md)).

## Writing

| Skill | Say | What happens |
| --- | --- | --- |
| [write-agents](../skills/write-agents/SKILL.md) | "write agent instructions" | Agent instructions with one home per fact; owns the shared Sessions, Context freshness, and Tools rules. **Writes** the instruction files you name. |

## Project start

| Skill | Say | What happens |
| --- | --- | --- |
| [start](../skills/start/SKILL.md) | "start a Next.js project" | A verified project from flow-next or flow-mono, with `explore` alongside when the request describes a product; asks only what the request leaves open ([spec 033](specs/033-template-fast-start.md)). **Writes** the renamed project, baseline root docs, the Flow block, and one initial commit, its done signal ([0067](decisions/0067-flow-boundaries.md)). |

## Retired

[Decision 0062](decisions/0062-claude-code-first.md) moved these to Claude Code or into other skills: `interview` and `grill` (now `explore`), `align` and `measure` (merged as `product`, renamed `align` by [decision 0070](decisions/0070-research-and-clearer-names.md)), `prototype` (now `design`), `push` (now `ship`), `handoff` and `tldr` (the host's sessions, transcripts, and recaps), `debug` and `retro` (the host), and `board` (a maintainer script until 2026-11-03, then removed; spec status lines, pull requests, and the SessionStart work-in-flight report cover it). [Spec 059](specs/059-claude-code-first.md) removed `jtbd`, `competitors`, and `write-humans`: each tied with no skill in an on-trial comparison; competitive briefs return through `research` ([spec 070](specs/070-product-engineering-partner.md)).

**Renamed in [decision 0070](decisions/0070-research-and-clearer-names.md):** `product` is `align` and `flow` is `sync-docs`. Natural phrases still reach them; explicit paths move (`/flow:product` → `/flow:align`, `/flow:flow` → `/flow:sync-docs`, or `/align` and `/sync-docs` on Agent Skills hosts). An existing Flow block that names `flow` is refreshed on the next "set up Flow here" or "sync the docs". An Agent Skills install from before the rename can leave `flow/` and `product/` beside the new folders, both answering the same phrases: remove the old two (`pnpm context` reports the drift). `flow` remains the plugin and project name.

## Maintain (this repository)

```bash
pnpm validate
pnpm test
```

Edit skill source under `skills/` directly. [Attribution](../ATTRIBUTION.md) and per-skill notices apply where material was adapted.
