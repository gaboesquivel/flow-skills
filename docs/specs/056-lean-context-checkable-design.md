# 056 — Lean agent context and checkable design rules

Status: implemented (2026-11-03).

## Problem Statement

Agents in Flow repositories spend context reading instructions before they read the work. Flow already says to keep always-loaded guidance short and prefer a check over prose ([`write-agents`](../../skills/write-agents/SKILL.md), `retro` Instruction files (retro retired by [0062](../decisions/0062-claude-code-first.md))), but nothing measures it. Nobody can say how much an adopter repository loads at session start, whether its installed skills match its lock, or whether two installed skills fight over the same request. The same gap shows in design: `DESIGN.md` files hold good rules, but most are prose an agent cannot check, so an agent ships a screen that "looks fine" and breaks the identity in small ways.

The evidence comes from an audit of the six repositories on 2026-11-02 (each default branch, plus the local install where skills are gitignored). Token figures are estimates at four characters per token.

| Repository | Always-loaded instructions | Installed skills (metadata est.) | Largest on-demand files |
| --- | --- | --- | --- |
| flow-skills | `AGENTS.md` 4.8 KB (~1.2k) | 26 Flow skills (~1.2k) | `PRODUCT.md` ~5.1k, `GLOSSARY.md` ~4.7k, `build` ~4.5k, `write-agents` ~3.9k |
| flow-next | `AGENTS.md` 2.5 KB (~0.6k) | 43 committed (~2.9k) | `portless` ~8.4k, `shadcn` ~5.4k, `typesafe-ai` ~4.5k |
| flow-mono | `AGENTS.md` 2.8 KB (~0.7k) + `apps/web/AGENTS.md` | 44 committed (~2.9k) | same stack skills as flow-next |
| flow-factory | `AGENTS.md` 1.3 KB (~0.3k) | 8 station skills, runtime only | `ARCHITECTURE.md` ~0.7k |
| gaboesquivel (package) | `AGENTS.md` 5.3 KB (~1.3k), **no `CLAUDE.md`** | 1 in lock (`gabo`) | — |
| gaboesquivel.com | `AGENTS.md` 8.4 KB (~2.1k) | **87 installed, 46 in lock** (~7.2k) | `DESIGN.md` 36.7 KB (~9.2k), `ARCHITECTURE.md` ~4.6k, `design-taste-frontend` ~9.9k |

Specific findings:

1. **Install drift.** gaboesquivel.com's `docs/agents/skills.md` says `.agents/skills/` must match `skills-lock.json`, and that `tdd` and `test-driven-development` are not installed. Locally, 41 skills sit outside the lock, both of those among them. A fresh clone would get a different agent from the one the maintainer runs. The same happens at user level: on this maintainer's machine, older copies of all 25 Flow skills in `~/.claude/skills` shadow the source, so a session in flow-skills loads stale `explore` and `to-spec` text (`pnpm validate` already warns).
2. **Design rules point at skills the lock does not install.** gaboesquivel.com's `DESIGN.md` assigns roles to `frontend-design`, `better-ui`, `emil-design-eng`, `emilkowal-animations`, `review-animations`, `find-animation-opportunities`, and `tailwind-design-system`. None is in the lock.
3. **Overlapping triggers.** The same install holds near-duplicates competing for one request: `security` / `security-and-hardening`, `performance` / `performance-optimization`, `debug` / `diagnosing-bugs` / `debugging-and-error-recovery`, `interview` / `interview-me`, `to-tasks` / `to-tickets` / `planning-and-task-breakdown`, `review` / `code-review-and-quality`.
4. **Descriptions outside the format.** `upstash-redis-js` has a 1,547-character description, over the 1,024-character limit in the [Agent Skills specification](https://agentskills.io/specification). Third-party descriptions in the templates run to 600–900 characters, against about 200 for Flow's own.
5. **No `CLAUDE.md` in one repository.** The gaboesquivel package has `AGENTS.md` but no tracked `CLAUDE.md`; the other five use `@AGENTS.md`. Current Claude Code reads `AGENTS.md` natively when no `CLAUDE.md` exists (v2.1.277 and later, per its memory docs), so this matters only on older versions. Report it; change nothing unless an older host is in use.
6. **Design rules are mostly prose.** gaboesquivel.com's `DESIGN.md` has machine-readable tokens in front matter and one enforced rule (`check:motion`), but its identity bans (gradients, 01/02/03 markers, eyebrow labels, a second accent, `zinc`/`gray`/`slate` in new code) are prose only. About a third of the file is per-page sections (homepage, `/work`, `/contact`, `/bio`) that load for any visual change.
7. **User-invoked skills still cost listing space.** `DESIGN.md` calls `review-animations` and `find-animation-opportunities` user-invoked, yet as installed the model can invoke them, so their descriptions sit in every session's skill listing. Claude Code's `disable-model-invocation: true` keeps a description out of the listing; the listing budget is 1% of the context window, and the least-invoked descriptions are dropped first when it overflows.
8. **Description voice.** Anthropic's best practices say to write descriptions in the third person. Flow's are imperative ("Compare visual directions…"), in line with its leading-word convention ([decision 0008](../decisions/0008-leading-words-and-visual-summaries.md)). Whether this costs triggering accuracy is unmeasured.
9. **What is already lean.** Flow's own skills are 1.2–17.8 KB, all under 120 lines, well inside Anthropic's 500-line guidance. flow-factory's `AGENTS.md` is a 1.3 KB pointer table. The Flow block in gaboesquivel.com is about 330 tokens. The bloat is in what adopters install and in large root documents, not in Flow's catalog.

Sources and their limits: [research note](../research/2026-11-02-skills-and-agent-context.md).

## Solution

Measure context, then fix the largest costs, and make design rules checkable. Three moves:

- **Measure.** A free, local script reports what each repository loads at session start, what it loads on demand, install drift against the lock, description problems, and likely trigger collisions. It reports against budgets; it never blocks work. `retro` runs it as its context-bloat check.
- **Trim at the source.** Fix the findings above in the repositories that own them: resync installs to locks, decide which design skills belong in the lock, split per-page design detail out of the always-read part of `DESIGN.md`, add the missing loader.
- **Design rules an agent can follow and verify.** `design` leaves a `DESIGN.md` where an agent can tell why each rule exists and how to tell whether a screen meets it. Rules that can be checked mechanically get a check in the adopter repository, as gaboesquivel.com's motion check and Taste Skill's lint and browser gates already do.

The skills change by stating outcomes, not by adding procedures. The sources' lessons enter Flow as the reasons behind those outcomes and as evidence, so an agent knows what good looks like and chooses how to get there.

The assumption under test: **once context cost is visible as a number, the maintainer will act on it, and the always-loaded and design-change context in the two largest adopters (gaboesquivel.com, the templates) drops by at least half without losing rules an agent needs.** If the report changes nothing, drop the budgets and keep the script as a `retro` aid.

## User Stories

1. As the maintainer, I run one command on any of the six repositories and see what an agent loads before it starts, so that I can find the largest cost first.
2. As the maintainer, I see that installed skills differ from the lock, so that the agent on my machine is the agent a fresh clone gets.
3. As an agent asked to build a screen, I read the core design rules and only the section for the route I am changing, and I can run the checks those rules name, so that I do not ship a "looks fine" screen that breaks the identity.
4. As a user running `retro`, I get a context-bloat finding with numbers, so that a proposal to trim is backed by evidence instead of taste.

## Implementation Decisions

**How the skill changes are written.** Every skill edit in this spec follows [`write-agents`](../../skills/write-agents/SKILL.md): state the outcome and the constraint, name the behavioural failure it prevents, and prefer a check or a script over prose when one can prevent the failure. Anthropic's context-engineering guidance makes the same point: prompts at the "right altitude", neither hardcoded logic nor vague guidance. So in the edited skills:

- No rule templates, fixed headings, mandated file paths, or numeric budgets. Examples may illustrate (a token, a lint, a render at named widths; a linked file or a path-scoped rule), labelled as examples.
- Host-specific mechanisms (`disable-model-invocation`, `.claude/rules/` with `paths:`, `/context`) appear as one way to reach an outcome, never as the requirement.
- Where a skill already states the outcome, add nothing; the lesson is evidence for the existing text.
- Each edited skill grows by at most about 10% of its size, preferably less, by replacing text rather than adding it.

How each lesson lands:

| Lesson (source) | Failure it prevents | What changes |
| --- | --- | --- |
| Load little up front, the rest on demand (Anthropic docs, context-engineering post) | Agents read everything every session | Nothing in the skills: `write-agents` already says to keep always-loaded guidance short and disclose detail through references. The script measures it. |
| Instructions alone are advisory; checks hold (Spotify) | A rule broken again despite prose | Nothing in the skills: `write-agents` already prefers a check, and `retro` has the prevention ladder. Cited as evidence. |
| A rule carries its reason (rico) | The agent follows the letter and misses the intent in cases nobody wrote down | `design`: recorded rules say why they exist. |
| Document only what exists (rico) | The agent reaches for a described but unbuilt variant | Nothing: `flow` already keeps `DESIGN.md` consistent with what shipped. |
| A gate before "done" (Taste Skill) | A "looks fine" screen ships and breaks the identity | `design`: it is clear which rules a check enforces and which need someone to look; mechanical checks exist or are named as work for `build`. |
| One source for installed skills (audit) | A fresh clone gets a different agent from the maintainer's | `write-agents`: the skills an agent gets come from the project's committed source, and skills only the user starts do not compete for automatic activation. |
| Measure before trimming (audit) | Trim proposals based on impression | `retro`: instruction-size findings cite a measurement, labelled as an estimate. |

**Measurement script.** `skills/retro/context.mjs` (moved to `scripts/context.mjs` by spec 059), bundled with `retro` so every repository that installs Flow's skills has it (`node <retro folder>/context.mjs [--repo <path>] [--json]`; `pnpm context` in flow-skills). It measures the working tree, which is what the agent sees, including gitignored installs. Node only, no dependencies, no network. It reports:

- *Always loaded:* `CLAUDE.md` and `AGENTS.md` with `@` imports resolved, plus `name` and `description` of every skill the host would list (committed and installed, from `.claude/skills`, `.agents/skills`, and `skills/` where the repository uses them).
- *On demand:* each `SKILL.md` body, each root context file (`PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md`), and the Flow block, measured as one block wherever it appears.
- *Hygiene:* installed skills not in `skills-lock.json` and the reverse; skills a project document calls user-invoked that the model can still invoke; descriptions over 1,024 characters or missing a "Use when" trigger; names that break the specification's rules; skill pairs whose descriptions share most trigger words (a heuristic, reported as "possible overlap"); `AGENTS.md` without a loader for Claude Code.
- *Estimate:* characters ÷ 4, labelled as an estimate, so the script runs with no key and no network. Anthropic's token-counting endpoint is free but needs an API key; an optional `--calibrate` run may use it when a key is already set, never as a requirement.

The script complements what the host already shows. In Claude Code: `/context` (what is loaded now), `/doctor` (skill listing cost), and `/skill-doctor` (unused skills). Those see one session in one host; the script compares repositories, checks locks, and works for any host.

The script holds its budgets as defaults: reference points drawn from host documentation and the audit, reported as over or under, never as a failure, and never copied into skill text. The agent or maintainer reading the report decides what to do:

| Measure | Budget |
| --- | --- |
| Always-loaded instruction files | 2,000 tokens |
| Listed skill metadata | 4,000 tokens |
| One skill description | 1,024 characters (hard limit in the spec); Flow's own aim for 250 |
| One `SKILL.md` body | 500 lines and 5,000 tokens; move detail to linked files one level deep |
| Core `DESIGN.md` (read for any visual change) | 3,000 tokens |

`pnpm metrics` keeps its "skill words" line; the new script owns context figures. `pnpm validate` does not call it in this spec.

**`retro`.** Outcome: a finding about instruction or context size is backed by a measurement, labelled as an estimate, not by impression. `pnpm context`, the host's own context view, or a plain size count all qualify. It still proposes edits and never makes them.

**`write-agents`.** Outcome: every clone of a project gets the same agent, because the skills it loads come from the project's committed source (for example its skills lock), and skills only the user starts stay out of automatic activation where the host allows it. No budgets in the skill; the existing guidance on short always-loaded context and stronger mechanisms stays as it is.

**`design`.** Outcome for its Record step: an agent reading `DESIGN.md` can tell why each rule exists and how to tell whether a screen meets it; rules that rely on judgment are visibly so; mechanical checks exist or are named as work for `build`; and detail for one surface is reachable without reading every other surface's detail. How the project writes and splits it is the project's. `build` already runs the project's checks and gains no step. `flow` keeps `DESIGN.md` aligned and does not split it unasked.

**Adopter changes.** Each is a change in its own repository, proposed by this spec and owned there. Flow does not require adopter instruction changes ([PRODUCT.md](../../PRODUCT.md) Flow mode), so these land only with the maintainer's yes in each repository.

- *gaboesquivel.com:* resync `.agents/skills/` to the lock; decide which design skills `DESIGN.md` relies on and either add them to the lock or remove their roles from `DESIGN.md`; resolve the duplicate-trigger pairs by keeping one of each; move per-page sections out of `DESIGN.md` into linked files; add a source check for the identity bans that can be checked mechanically, next to `check:motion`.
- *flow-next and flow-mono:* review the committed third-party stack skills against the budgets; for each over budget, keep, pin an older version, or drop it from the template default. Third-party bodies are not edited (attribution and upstream ownership).
- *gaboesquivel (package):* `AGENTS.md` is 53 lines, under Claude Code's 200-line target. Move the `content/projects/**` and `content/tech/**` sections to linked files only if the report shows it over budget. Add `CLAUDE.md` with `@AGENTS.md` only if a host without native `AGENTS.md` support is in use.
- *flow-factory:* no change; it is the reference for a lean pointer `AGENTS.md`.
- *flow-skills:* `PRODUCT.md` and `GLOSSARY.md` are read only when relevant and are not trimmed in this spec.

**Coordination.** The flow-review-ci session is editing the Flow block, `review`, and CI workflows in these repositories. This spec changes none of them. Running `pnpm context` in CI is a later choice for whoever owns CI then.

**Article.** The draft [Designing with AI in Flow](../blog/designing-with-ai.md) ships on this branch, indexed in [`docs/blog/README.md`](../blog/README.md), unpublished like the first article ([spec 051](051-code-quality-article.md)). It describes Flow as it is today and marks this spec's changes as proposals.

**Exposure:** no deployable behaviour. A local maintainer script, skill text, and documents; nothing is deployed.

No decision record: the budgets are hypotheses in this spec, and the script is reversible.

## Testing Decisions

`context.mjs` gets node tests on fixtures under `tests/fixtures/` (the pattern `validate` already uses): an `@` import counted once, a skill outside the lock, an over-long description, a missing "Use when", a `CLAUDE.md`-less repository, and a Flow block measured on its own. Tests assert on `--json` output, not on wording. Skill text changes are reviewed against this spec; `pnpm validate` covers links.

**Acceptance scenario.** Actor: the maintainer. Starting state: the six repositories as audited on 2026-11-02 (gaboesquivel.com with 87 installed skills and 46 locked; the package without `CLAUDE.md`).

1. Run `pnpm context --repo ~/Code/gaboesquivel.com`. → The report lists always-loaded instructions near 2.1k tokens, listed skill metadata over budget, the skills installed outside the lock (41 against `main`'s lock on 2026-11-02; the count follows the checked-out branch), `upstash-redis-js` over the description limit, possible overlaps its heuristic can see (for example `tdd` / `test-driven-development`; overlaps by meaning, such as `debug` / `diagnosing-bugs`, need a reader), and `DESIGN.md` near 9.2k (over the core budget).
2. Run it on `~/Code/gaboesquivel`. → It reports `AGENTS.md` with no `CLAUDE.md` as information, not as over budget.
3. Run it on `~/Code/flow-factory`. → Every figure is under budget.
4. Ask "let's do a retro" in flow-skills after a session. → The Instruction files candidate cites the report's numbers and proposes edits without making them.
5. Ask "design this" for a new surface in a test project. → In the recorded `DESIGN.md`, a reader can tell for each rule why it exists and whether a check enforces it or it needs a look; detail for the new surface can be read without the rest.
6. After the gaboesquivel.com change lands there, run step 1 again. → Zero drift, no description over the limit, no overlap pair left unexplained, core `DESIGN.md` under 3,000 tokens, and the mechanical identity bans fail a check when violated in a test edit.
7. Compare steps 1 and 6. → Always-loaded plus core design context is at least 50% lower, or the spec records why not (the kill check).
8. Read the diff of `retro`, `write-agents`, and `design`. → Each added sentence states an outcome or constraint and the failure behind it; none prescribes a template, heading set, file path, budget, or host-only flag as a requirement; each skill grew by about 10% or less.

## Tasks

- [x] **T1 — Context report.** `skills/retro/context.mjs`, `pnpm context`, fixtures and tests. Done when steps 1–3 pass on the real repositories. Blocks T2 and T5.
- [x] **T2 — `retro` measures before proposing trims.** Done when steps 4 and 8 pass. Blocked by T1. Step 4 not yet run in a live retro.
- [x] **T3 — `write-agents` install-source outcome.** Done when step 8 passes for it. Independent.
- [x] **T4 — `design` leaves followable, verifiable rules.** Done when steps 5 and 8 pass. Step 5 not yet run in a live design session.
- [x] **T5 — gaboesquivel.com.** Resync, design-skill decision, overlap pairs, `DESIGN.md` split, identity-ban check. Its own PR in that repository. Done when step 6 passes. Blocked by T1 (to measure) and T4 (outcome to meet). Landed in gaboesquivel/gaboesquivel.com#27: always-loaded plus core design context ~15.4k → ~7.7k tokens (−50%) against that day's `main`, about −58% against the 2026-11-02 audit; zero drift, no description over the limit, no overlap pair, core `DESIGN.md` ~2.3k tokens, and `check:design` fails on each new identity ban (steps 6 and 7 satisfied).
- [x] **T8 — Article draft.** `docs/blog/designing-with-ai.md`, on this branch.

T1, T3, and T4 can run in parallel. The gaboesquivel package needs no task unless T1 shows it over budget. T5 touches another repository and must not overlap the flow-review-ci session's files there.

## Out of Scope

- Paid services, paid tiers, or paid APIs, including Spotify's Portal. Anthropic's token-counting endpoint is free and stays optional calibration.
- A read-blocking hook that routes large-file reads to a cheaper worker. It is the strongest idea in the Spotify write-up, but Flow's repositories have few large files and the routed worker in that write-up is a paid platform. Revisit with a candidate spec if `pnpm context` or a session transcript shows large reads dominate.
- The Flow block, `review`, and CI workflows (flow-review-ci).
- Editing third-party skill bodies.
- A public landing page or versioned release site for any skill (Taste Skill's packaging), and a post-drafting skill built on `gabo`. Both are noted in the research as ideas, not bets here.
- Publishing the article.
- A stack-skill review in flow-next and flow-mono (keep, pin, or drop per skill). Since [0062](../decisions/0062-claude-code-first.md) templates load Flow from the plugin; the review happens with the next template work.
- A description voice experiment (imperative against third person). The maintainer tests it manually.

## Further Notes

- Appetite (assumed): T1–T4 and T8 in one session; T5 one short session.
- Open assumptions: characters ÷ 4 is close enough to rank costs (it misranks code-heavy files); hosts list every installed skill's metadata at session start (true for Claude Code; other hosts vary); the maintainer wants gaboesquivel.com's 41 extra skills gone rather than added to the lock.
- The @so_ainsight post saved as "running X with Claude Code" is a list of eight open-source UI and motion repositories; it informs the design-skill research, not this spec's measures.
