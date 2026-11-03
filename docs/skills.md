# Skill catalog

Skills live in [`skills/`](../skills/); `scripts/validate.mjs` holds the authoritative list. Flow is Claude Code first ([decision 0062](decisions/0062-claude-code-first.md), [decision 0064](decisions/0064-cursor-plugin.md)): install it as a Claude Code plugin or a Cursor plugin to get the skills plus the guard hook, the session report of work in flight, and the `flow-reviewer` agent, or run `npx skills add gaboesquivel/flow-skills` on any Agent Skills host for the skills alone ([agent compatibility](agent-compatibility.md#installation)). No mandatory sequence. Skills may name the next skill and wait; the only automatic hand-off is `start` → `explore`, behind the user's yes. `build` slices a multi-area change by disjoint area, and the host sizes the fan-out under its concurrency cap ([Slices](../skills/build/SKILL.md#slices), [decision 0060](decisions/0060-slice-by-area.md) as amended by [0062](decisions/0062-claude-code-first.md)). Substantial work names its [delivery appetite](../GLOSSARY.md#delivery-appetite), and new scope mid-flight gets a [scope trade-off](../GLOSSARY.md#scope-trade-off). "Push it", "build it", and "ship it" are approvals: `build` ends with a reviewed, checked branch, `ship` merges it, and "push it" has `ship` push a branch; each ends with a [liveness](../GLOSSARY.md#liveness) check ([decision 0048](decisions/0048-delivery-phrases-are-approvals.md), amending [0044](decisions/0044-fast-delivery.md); [decision 0024](decisions/0024-gated-hand-offs.md)).

[Agent compatibility](agent-compatibility.md) · [Decision 0006](decisions/0006-flow-lite-and-flat-docs.md) · [Decision 0009](decisions/0009-adopter-product-context.md) · [Decision 0015](decisions/0015-tasks-and-domain-modeling.md) · [Decision 0019](decisions/0019-voice-first-invocation.md) · [Decision 0062](decisions/0062-claude-code-first.md) · [Spec 002](specs/002-flow-lite-and-flat-docs.md) · [Spec 059](specs/059-claude-code-first.md)

Talk to your agent, by typing or dictation. Each skill has a [leading word](../GLOSSARY.md#leading-word): the phrase you say to reach it. The first phrase is listed below; most descriptions carry two or more variants, while "build it" keeps one so dictation cannot blur it. Slash commands (`/explore`, `/ship`, …) remain optional shortcuts. No skill must be named explicitly.

## Process

1. **Install** — the Claude Code plugin, the Cursor plugin, or the Agent Skills CLI, which copies this repository's `skills/` tree into the agent you choose. One of those, not several.
2. **Work** — Build your product and say what you want; "update the docs" aligns root context with **`flow`**. Work needs no spec unless you want one: say "build it" for [unspecced work](../GLOSSARY.md#unspecced-work), or just ask your agent ([work without a spec](../README.md#work-without-a-spec)).
3. **Document** — When saving artifacts, default to `docs/specs/NNN-short-name.md` and `docs/decisions/NNN-short-name.md` unless the project already uses something else.

The delivery skills and the paths between them are drawn in the README: [how it works](../README.md#how-it-works). Every step is skippable; there is no required order.

Product discovery, writing, advisory, and design skills are optional and do not block delivery.

## Context alignment

| Skill | Say | When to use |
| --- | --- | --- |
| [flow](../skills/flow/SKILL.md) | "update the docs" | Align the current project's root docs after meaningful changes; "set up Flow here" asks no delivery question, writes the opt-in [Flow block](../GLOSSARY.md#flow-block) into the instruction file Git tracks (adding an `@AGENTS.md` import to `CLAUDE.md` when needed, touching no adopter text outside the block and import), reports the layout, and names `explore` when the project has no goals yet. The block's `Delivery:` line only overrides the inferred [delivery mode](../GLOSSARY.md#delivery-mode) (decisions [0020](decisions/0020-flow-mode.md) and [0044](decisions/0044-fast-delivery.md)). Not a pipeline and not template initialization. |

## Delivery

| Skill | Say | When to use |
| --- | --- | --- |
| [explore](../skills/explore/SKILL.md) | "explore this" | Asks in proportion to the change, with no named depth tiers and never the delivery mode: a fix or small change gets no questions; a feature gets intent, journeys, the agent lens, and the metric it should move, if any; a new product adds the riskiest assumption, kill criterion, main metric, and a pre-mortem. "Interview me" asks with a guess on each question until it can predict your answers; "grill this" stress-tests a plan's riskiest claims with evidence. One confirmation of the brief, committed on the work's branch, never on the default branch; or a clearer intent or a killed idea. Next steps: "build it" builds the brief with no spec, or "spec it" for a tracked bet (decisions [0036](decisions/0036-one-explore-depth.md), [0039](decisions/0039-build-never-requires-a-spec.md), [0044](decisions/0044-fast-delivery.md)). A goal that contradicts an accepted decision, spec, or `PRODUCT.md` fact on the current branch stops at a direction-change gate for your yes ([decision 0038](decisions/0038-direction-changes-are-confirmed-and-recorded.md)). |
| [to-spec](../skills/to-spec/SKILL.md) | "spec it" | Turn conversation into a numbered spec file with contract-first interfaces, an [Exposure](../GLOSSARY.md#exposure) line, and one required [acceptance scenario](../GLOSSARY.md#acceptance-scenario); label assumptions; write later bets as `candidate` stub files, committed on the spec's branch. Writes the spec as a `draft` on the work's branch, and any decision beside it as **Proposed**, and opens no issue unless you ask. "Accept the spec", or "build it" or "ship it" on a draft, accepts it; `to-spec` owns [the rule](../skills/to-spec/SKILL.md#status-and-acceptance). "Share the draft" opens a draft pull request linking the file ([0044](decisions/0044-fast-delivery.md)). |
| [to-tasks](../skills/to-tasks/SKILL.md) | "break it down" | Vertical-slice tasks with blockers, listed as a checklist in the spec's Tasks section (GitHub sub-issues only on request); gives each task an [area](../GLOSSARY.md#area), which may list several directories; reports the ready set and waits for "build it". |
| [build](../skills/build/SKILL.md) | "build it" | Implement authorized work on a branch, then verify it without merging: the review at the tier its risk sets, fixes, checks once on the final head, and branch [liveness](../GLOSSARY.md#liveness). Ends with an open pull request (GitHub mode) or a committed branch (local mode), and reports any unfinished work with its branch. Slices a multi-area change by area and leaves the fan-out to the host; [unspecced work](../GLOSSARY.md#unspecced-work) needs no spec. Owns the size guard (risk tiers; human-tier paths ship on your yes) and [delivery mode](../skills/build/SKILL.md#delivery-mode) ([0044](decisions/0044-fast-delivery.md), [0048](decisions/0048-delivery-phrases-are-approvals.md)). |
| [review](../skills/review/SKILL.md) | "review it" | A fresh-context review through the [`flow-reviewer`](../agents/flow-reviewer.md) agent: Claude Code's `/code-review` at the size guard's tier (Quick → low, Standard → medium, Deep → high), plus what only Flow checks: [requirement verdicts](../GLOSSARY.md#requirement-verdict) on the acceptance scenario, scope, glossary naming, and `DESIGN.md` UI checks. Labels findings Important, Nit, or Pre-existing, repairs confirmed defects within three rounds ("review only" stays read-only). `build` runs it on every build ([0058](decisions/0058-review-passes-and-risk-tiers.md), [0062](decisions/0062-claude-code-first.md)). |
| [ship](../skills/ship/SKILL.md) | "ship it" | Land on the default branch with no confirmation: `build` first unless the branch is already verified, then merge through the gate and report [liveness](../GLOSSARY.md#liveness) of the shipped commit from its `liveness.mjs` script. Refuses a partial spec unless told, work another session owns, and a head whose required checks are pending or failing. "Push it" pushes the current or named branch with no pull request, review, or CI wait, and the host deploys it ([0044](decisions/0044-fast-delivery.md), [0048](decisions/0048-delivery-phrases-are-approvals.md)). |

## Shared language

| Skill | Say | When to use |
| --- | --- | --- |
| [domain-modeling](../skills/domain-modeling/SKILL.md) | "what do we call this" | Refine terminology and update `GLOSSARY.md`; offer `docs/decisions/` records sparingly. |

## Advisory

| Skill | Say | When to use |
| --- | --- | --- |
| [council](../skills/council/SKILL.md) | "ask the council" | Independent perspectives on a consequential decision. It does not implement or approve. |

## Design

| Skill | Say | When to use |
| --- | --- | --- |
| [design](../skills/design/SKILL.md) | "design this" | Compare two to four rendered visual directions against `PRODUCT.md`, choose one, and record it with its canonical assets in `DESIGN.md`. Skip it when a change fits the existing `DESIGN.md` ([decision 0051](decisions/0051-design-skill.md)). "Prototype this" or "spike it" builds a throwaway: layout variants on the real route behind `?variant=`, or a one-file logic spike. |

Debugging, code simplification, security audits, and performance work belong to the host ([0019](decisions/0019-voice-first-invocation.md), [0062](decisions/0062-claude-code-first.md)).

## Product discovery

| Skill | Say | When to use |
| --- | --- | --- |
| [product](../skills/product/SKILL.md) | "are we building the right thing" | Read-only check of the whole product against its vision, problems, metrics, and roadmap, and of each metric and journey against the evidence, naming what blocks a conclusion ("measure our progress"). Decisions [0041](decisions/0041-align-skill.md) and [0046](decisions/0046-measurement-assistance.md). |

## Writing

| Skill | Say | When to use |
| --- | --- | --- |
| [write-agents](../skills/write-agents/SKILL.md) | "write agent instructions" | Draft or edit agent instructions so each fact has one home. Owns the shared Sessions, Context freshness, and Tools rules; Sessions keeps what the host does not: isolate shared runtime state between parallel writers, and report sibling work you cannot see. |

## Project start

| Skill | Say | When to use |
| --- | --- | --- |
| [start](../skills/start/SKILL.md) | "start a Next.js project" | Initialize a clone of flow-next or flow-mono (created with `gh repo create --template`, then `pnpm setup`) in place, with `explore` alongside when the request describes a product, asking only what the request leaves open (a preset only when unclear, a GitHub repository only when no non-template remote exists); outside a template clone, falls back to copying the template ([spec 033](specs/033-template-fast-start.md)). Passes the preset as `FLOW_PRESET` to `pnpm setup` and does not provision from this skill. Renames identity, runs setup, QA, the identity scan, and the `.gitignore` check, writes baseline root docs and the Flow block, then makes one initial commit, on top of the template history in a clone ([spec 026](specs/026-clean-baseline-and-worktrees.md)). The initial commit is its done signal ([0044](decisions/0044-fast-delivery.md)). "Set up Flow here" plus a template bootstrap. |

## Retired

[Decision 0062](decisions/0062-claude-code-first.md) moved these to Claude Code or into other skills: `interview` and `grill` (now `explore`), `align` and `measure` (now `product`), `prototype` (now `design`), `push` (now `ship`), `handoff` and `tldr` (the host's sessions, transcripts, and recaps), `debug` and `retro` (the host), and `board` (a maintainer script until 2026-11-03, then removed; spec status lines, pull requests, and the SessionStart work-in-flight report cover it). [Spec 059](specs/059-claude-code-first.md) removed `jtbd`, `competitors`, and `write-humans`: each tied with no skill in an on-trial comparison.

## Maintain (this repository)

```bash
pnpm validate
pnpm test
```

Edit skill source under `skills/` directly. [Attribution](../ATTRIBUTION.md) and per-skill notices apply where material was adapted.
