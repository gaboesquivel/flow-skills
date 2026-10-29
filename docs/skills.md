# Skill catalog

Skills live in [`skills/`](../skills/); `scripts/validate.mjs` holds the authoritative list. Install with `npx skills add gaboesquivel/flow-skills`. No mandatory sequence. Skills may name the next skill and wait; the only automatic hand-offs are `start` → `explore` and explore's `interview` questions and, for a new product, its `grill`, each behind the user's yes. Independent work runs in parallel by default ([`write-agents`](../skills/write-agents/SKILL.md#workers)). `build` ends with a ready branch; `ship` lands it in either delivery mode with checks once, the independent review only when the size guard escalates or you ask, and a check that the shipped commit is deployed ([decision 0044](decisions/0044-fast-delivery.md), amending [0042](decisions/0042-outcome-build-and-ship.md) and [0028](decisions/0028-build-and-ship.md); [decision 0024](decisions/0024-gated-hand-offs.md)).

[Agent compatibility](agent-compatibility.md) · [Decision 0006](decisions/0006-flow-lite-and-flat-docs.md) · [Decision 0009](decisions/0009-adopter-product-context.md) · [Decision 0015](decisions/0015-tasks-and-domain-modeling.md) · [Decision 0018](decisions/0018-interview-extracts-intent.md) · [Decision 0019](decisions/0019-voice-first-invocation.md) · [Spec 002](specs/002-flow-lite-and-flat-docs.md) · [Spec 008](specs/008-tasks-and-domain-modeling.md)

Talk to your agent, by typing or dictation. Each skill has a [leading word](../GLOSSARY.md#leading-word): the phrase you say to reach it. The first phrase is listed below; each skill's description carries two or three variants. The Flow block's phrase table lives in [`flow-block.mjs`](../skills/flow/lib/flow-block.mjs) (`PHRASES`), and a test checks each phrase against its skill's description. Slash commands (`/interview`, `/ship`, …) remain optional shortcuts. No skill must be named explicitly.

## Process

1. **Install** — Agent Skills CLI copies this repository’s `skills/` tree into the agent you choose.
2. **Work** — Build your product and say what you want; "update the docs" aligns root context with **`flow`**. Work needs no spec unless you want one: say "build it" for [unspecced work](../GLOSSARY.md#unspecced-work), or just ask your agent ([work without a spec](../README.md#work-without-a-spec)).
3. **Document** — When saving artifacts, default to `docs/specs/NNN-short-name.md` and `docs/decisions/NNN-short-name.md` unless the project already uses something else.

The delivery skills and the paths between them are drawn in the README: [how it works](../README.md#how-it-works). Every step is skippable; there is no required order.

Product discovery, writing, advisory, prototype, quality, and misc skills are optional and do not block delivery.

## Context alignment

| Skill | Say | When to use |
| --- | --- | --- |
| [flow](../skills/flow/SKILL.md) | "update the docs" | Align the current project's root docs after meaningful changes; "set up Flow here" asks no delivery question, writes the opt-in [Flow block](../GLOSSARY.md#flow-block) into the instruction file Git tracks (adding an `@AGENTS.md` import to `CLAUDE.md` when needed, touching no adopter text outside the block and import), reports the layout, and names `explore` when the project has no goals yet. The block's `Delivery:` line only overrides the inferred [delivery mode](../GLOSSARY.md#delivery-mode) (decisions [0020](decisions/0020-flow-mode.md) and [0044](decisions/0044-fast-delivery.md)). Not a pipeline and not template initialization. |

## Delivery

| Skill | Say | When to use |
| --- | --- | --- |
| [explore](../skills/explore/SKILL.md) | "explore this" | Asks in proportion to the change, with no named depth tiers and never the delivery mode: a fix or small change gets no questions; a feature gets intent, journeys, and the agent lens; a new product adds the riskiest assumption, kill criterion, main metric, a pre-mortem, and `grill`. Deeper research only when you ask for `competitors` or `jtbd`. One confirmation of the brief, committed on an `explore/<slug>` branch, never on the default branch; or a clearer intent or a killed idea. Next steps: "build it" builds the brief with no spec, or "spec it" for a tracked bet; a new product gets spec 001 and candidate stubs only on "spec it" (decisions [0036](decisions/0036-one-explore-depth.md), [0039](decisions/0039-build-never-requires-a-spec.md), [0044](decisions/0044-fast-delivery.md)). A goal that contradicts an accepted decision, spec, or `PRODUCT.md` fact on the current branch stops at a direction-change gate for your yes ([decision 0038](decisions/0038-direction-changes-are-confirmed-and-recorded.md), amended by [0044](decisions/0044-fast-delivery.md)). |
| [interview](../skills/interview/SKILL.md) | "interview me" | Extract what you actually want, with a guess attached to each question, before any plan or spec exists. |
| [grill](../skills/grill/SKILL.md) | "grill me" | Stress-test an idea or plan with focused questions and evidence. |
| [to-spec](../skills/to-spec/SKILL.md) | "spec it" | Turn conversation into a numbered spec file with contract-first interfaces, an [Exposure](../GLOSSARY.md#exposure) line, and one required [acceptance scenario](../GLOSSARY.md#acceptance-scenario); label assumptions; write later bets as `candidate` stub files, committed on the spec's branch ([spec 026](specs/026-clean-baseline-and-worktrees.md)). Writes the spec as a `draft` on its feature branch (renaming an `explore/` branch), and any decision beside it as **Proposed**, and opens no issue unless you ask. Acceptance ("accept the spec", or "build it" or "ship it" on a draft) sets the file to `accepted` and its linked decisions to **Accepted** in one commit, with back-pointers on the records and specs they supersede or amend ([0038](decisions/0038-direction-changes-are-confirmed-and-recorded.md)). A draft without an acceptance scenario stops the request. "Share the draft" opens a draft pull request linking the file (decisions [0028](decisions/0028-build-and-ship.md), [0032](decisions/0032-local-build-lands-ship-verifies.md), and [0044](decisions/0044-fast-delivery.md), which retired the spec issue). |
| [to-tasks](../skills/to-tasks/SKILL.md) | "break it down" | Vertical-slice tasks with blockers, listed as a checklist in the spec's Tasks section (GitHub sub-issues only on request); gives each task an [area](../GLOSSARY.md#area), which may list several directories ([spec 026](specs/026-clean-baseline-and-worktrees.md)); reports the ready set and waits for "build it". |
| [build](../skills/build/SKILL.md) | "build it" | End authorized work with a ready branch: an open pull request whose body links the spec file (GitHub mode), or a committed branch (local mode). Never waits on CI and never merges; checks run once, in `ship`. Runs independent tasks in parallel by default, integrates every task on one branch per spec, and loses no [work in flight](../GLOSSARY.md#work-in-flight). The size guard, judged once, picks a self-check or, for large or risky work, the independent review in `ship`; [unspecced work](../GLOSSARY.md#unspecced-work) needs no spec ([0034](decisions/0034-no-ceremony-without-a-spec.md), [0039](decisions/0039-build-never-requires-a-spec.md), [0042](decisions/0042-outcome-build-and-ship.md), [0044](decisions/0044-fast-delivery.md)). Owns [delivery mode](../skills/build/SKILL.md#delivery-mode). |
| [review](../skills/review/SKILL.md) | "check it against the spec" | One independent review on five axes, with [requirement verdicts](../GLOSSARY.md#requirement-verdict) on the acceptance scenario for spec work. `ship` runs it when the size guard escalates or you say "review it". Separate axis workers are optional ([0042](decisions/0042-outcome-build-and-ship.md), [0044](decisions/0044-fast-delivery.md)). |
| [ship](../skills/ship/SKILL.md) | "ship it" | Land in either delivery mode with no confirmation: build first when needed, finish this work's leftovers, check once (CI in GitHub mode; the suite once on the merge result in local mode), run the independent review only when the size guard escalates or you ask, merge (the pull request, or into `main` and push when a remote exists), then [verify](../GLOSSARY.md#verification) the shipped commit is deployed. Refuses a partial spec unless told ([0044](decisions/0044-fast-delivery.md)). |
| [retro](../skills/retro/SKILL.md) | "let's do a retro" | Retrospective on the agent environment after a session. |

## Shared language

| Skill | Say | When to use |
| --- | --- | --- |
| [domain-modeling](../skills/domain-modeling/SKILL.md) | "what do we call this" | Refine terminology and update `GLOSSARY.md`; offer `docs/decisions/` records sparingly. |

## Advisory

| Skill | Say | When to use |
| --- | --- | --- |
| [council](../skills/council/SKILL.md) | "ask the council" | Independent perspectives on a consequential decision. It does not implement or approve. |

## Prototype

| Skill | Say | When to use |
| --- | --- | --- |
| [prototype](../skills/prototype/SKILL.md) | "prototype this" | Build a throwaway experiment for a design, interaction, API, or logic question. |

## Quality

| Skill | Say | When to use |
| --- | --- | --- |
| [debug](../skills/debug/SKILL.md) | "debug this" | Investigate a reproducible failure from evidence before changing code. |

Code simplification, security audits, and performance work belong to host tools ([0019](decisions/0019-voice-first-invocation.md)).

## Product discovery

| Skill | Say | When to use |
| --- | --- | --- |
| [jtbd](../skills/jtbd/SKILL.md) | "jobs to be done" | Frame jobs, struggling moments, and the progress someone wants. |
| [competitors](../skills/competitors/SKILL.md) | "who are the competitors" | Map alternatives, differentiation, and why people move or stay. |
| [align](../skills/align/SKILL.md) | "are we building the right thing" | Read-only check of the whole product against its vision, problems, metrics, and roadmap ([decision 0041](decisions/0041-align-skill.md)). Session alignment is `tldr`. |

## Writing

| Skill | Say | When to use |
| --- | --- | --- |
| [write-humans](../skills/write-humans/SKILL.md) | "write this up" | Draft or edit clear prose for human readers. |
| [write-agents](../skills/write-agents/SKILL.md) | "write agent instructions" | Draft or edit agent instructions so each fact has one home. |

## Project start

| Skill | Say | When to use |
| --- | --- | --- |
| [start](../skills/start/SKILL.md) | "start a Next.js project" | Initialize from flow-next or flow-mono while `explore` shapes the product, asking only what the request leaves open (destination, template, an optional GitHub repository, a preset only when unclear). Passes the preset as `FLOW_PRESET` to `pnpm setup` and does not provision from this skill. Renames identity, runs setup, QA, the identity scan, and the `.gitignore` check, writes baseline root docs and the Flow block, then makes one independent initial commit ([spec 026](specs/026-clean-baseline-and-worktrees.md)). Done when the first deployment is green ([0044](decisions/0044-fast-delivery.md)). "Set up Flow here" plus a template bootstrap. |

## Misc

| Skill | Say | When to use |
| --- | --- | --- |
| [tldr](../skills/tldr/SKILL.md) | "tldr" | Visual human summary of named material, or a session recap and alignment check. Prose stays with `write-humans`. |
| [board](../skills/board/SKILL.md) | "show the board" | Read-only kanban of specs by stage (Candidate, Specced, Ready, Building, Shipped), derived from spec files, checklists, branches, and merges in git; builds record nothing for it ([0044](decisions/0044-fast-delivery.md)). Opens a live local page, or a static snapshot with `--once`. |
| [handoff](../skills/handoff/SKILL.md) | "hand off" | Compact the current conversation into a temporary handoff document so a fresh agent can continue. |

## Maintain (this repository)

```bash
pnpm validate
pnpm test
```

Edit skill source under `skills/` directly. [Attribution](../ATTRIBUTION.md) and per-skill notices apply where material was adapted.
