# 044 — Fresh agent context and visual human experience

Status: **implemented** (2026-10-31)  
Repository: `gaboesquivel/flow-skills`  
Priority: **P2 — after coordination + scope policy**  
Dependencies: specs 042 and 043's ownership, artifact and budget conventions.

## Problem

The Signal retrospective reported stale context, conflicting decisions, unaware parallel sessions and lengthy reports. Prompt-log corruption and secret leakage are risks to prevent, not independently verified incidents in this planning pass. Flow has `tldr` and `board`, but visual/progressive disclosure is not the default at consequential delivery handoffs. More Markdown can make matters worse unless facts have one authoritative home.

## Outcome

Every participating agent starts from current, relevant product intent and visible Git work, distinguishes accepted from proposed information, and maintains documentation only when meaningful. Humans see concise outcome-focused and visual summaries before lengthy technical detail, without requiring new host-specific rendering systems.

## Context authority and freshness

- `AGENTS.md` and optional host instruction file: minimal routing, repo commands and safety; do not copy the full methodology or product description.
- `PRODUCT.md`: current product outcome, users (including agent users when relevant), journeys and OMTM.
- `DESIGN.md`: current accepted UX, visual identity and interaction principles.
- `ARCHITECTURE.md`: current system boundaries, contracts, important operational decisions.
- `GLOSSARY.md`: canonical domain vocabulary; create only for meaningful shared distinctions.
- `docs/specs`: accepted/draft delivery intent, scope, proof and timebox. `docs/decisions`: consequential historical alternatives/rationale; proper amendments without standalone registry. Code and Git/PRs establish actual implemented state; neither automatically invalidates accepted intent.
- On session/task start and before *consequential* shared edits/merge, inspect relevant current owner docs, active branch and PR/spec/decision changes and reachable sibling work; read only relevant sections; never recursively load all docs or every historical prompt log.
- Distinguish acceptance status from location: a draft on `main` remains a draft, and an accepted change on a branch is not yet deployed. Label accepted, proposed, implemented and unknown separately from main, branch or uncommitted state. Current accepted owner documents take precedence over old amended records; a conflict needs an explicit tradeoff, not auto-accepting the newest timestamp.
- Optional per-worktree ignored `progress.md` can help resume interrupted work, but may be stale. Git commits, PRs and docs remain durable. Never automatically use another worktree's scratch as accepted project truth.
- Prompt log, where used, must be append-only per session with timestamp, host/model when known, sanitized prompt, observable action/result, and trace identifiers for later retros. Redact credentials, environment values and auth tokens *before writing* (including public repos); consider secrets currently committed to logs compromised and rotate/remediate out of band. Logging must not block basic delivery when telemetry is unavailable. No automatic Git tracking of secret-bearing logs.

## Human communication contract

- Lead with **decision, scope, progress/risk, next action**, not implementation narration. Keep most replies short and the tone direct, natural and appropriately skeptical.
- Prefer host-native rich UI where available; otherwise compact Markdown table, Mermaid diagram when it genuinely explains structure, or a short paragraph. Charts may show only measured facts; uncertain numbers must be marked as such. No mandatory forms, graphic decoration, screenshots or invented metrics.
- At major handoffs (`explore` brief, spec ready, build ready, ship result, retro), show a concise digest of outcome, accepted vs deferred scope, current timebox/budget health (if measurable), relevant active work/conflicts, verification status and one next action. Link the full spec/diff rather than pasting walls of Markdown.
- `tldr` / 'show me' stays a deliberate command for detailed visual recaps. Applying a concise-summary default elsewhere must not force an additional skill invocation or a second review step.
- `board` should derive progress from Git/spec/PR evidence, not maintain its own tasks database; state honestly what it cannot know about live sessions.
- `interview` should use the host's existing conversation UI rather than require an AI UX widget; progressive disclosure and useful defaults are patterns, not external runtime dependencies.
- Documentation for humans: improve `docs/methodology.md`, `docs/README.md`, `docs/skills.md`, and website's explanatory pages only where they reuse the same source. No parallel 'human docs' trees, no copied active policy in each decision.

## Required skill changes

`flow`, `write-agents`, `start`, `explore`, `interview`, `to-spec`, `build`, `review`, `ship`, `tldr`, `board`, `retro` (only relevant paragraphs, no new skill). Coordinate with 042/043 so each rule has one canonical owner and linked references.

## Acceptance scenario

1. Open a fresh session on a worktree with accepted main architecture and an unmerged contradicting decision: assistant labels the proposal, identifies affected scope, avoids silently choosing it and reports only relevant context.
2. Start with an accepted delivery budget and another active branch modifying the same area: assistant surfaces possible collision and scope impact before consequential editing; never claims a lock.
3. During a long task, an ignored progress note supports recovery but does not override newer accepted Git state.
4. Where logging is already enabled, two sessions use separate files and a synthetic secret is redacted before persistence. If no logging implementation exists, verify the guidance with a scenario and report executable redaction as not exercised; do not build a logger for this spec.
5. In host with no GenUI, summary uses concise Markdown/Mermaid only as needed. Host with GenUI can render useful visuals without adding custom Flow UI code.
6. After building, agent gives a brief human summary with verified outcome, unresolved items, cost/time if actually measured, and a link to durable evidence. Full raw logs remain accessible on request, not pasted by default.

## Non-goals

No hosted memory service, SQLite/MCP coordination layer inside Skills, mandatory prompt logging in every adopter project, automatic continuous telemetry, site redesign, new human-only spec copies, or new skill invocation pipeline.

## Tasks

- [x] 01: Establish selective context refresh and separate document status from Git location. **Area:** skills, docs, repository root. **Blocked by:** landed 042; reconcile against 043 before final delivery. Proof: a draft on main does not override accepted policy, and recovery notes do not override current evidence.
- [x] 02: Apply concise handoff summaries and clarify optional logging safeguards. **Area:** skills, docs. **Blocked by:** 01. Proof: meaningful handoffs expose outcome, remaining work and evidence without duplicate documents or mandatory visual widgets.

## Delivery and session boundary

Delivered by session A after the maintainer made it the sole implementation owner for 042–044, with an independent session B review; the sequencing below is the original plan. Session B may inspect and prepare this spec while session A implements 043. Do not independently rewrite 043's scope, budget, artifact or scheduling policy. Keep proposed shared-file edits on B's isolated branch and list overlaps. After 043 lands, incorporate its changes without rewriting remote history, reconcile the overlapping skills/docs, then review and check the final head. Land 044 only after 043.

Use existing context-ownership and visual-summary decisions unless a new cross-cutting choice emerges. No automatic third decision record. One bounded PR, representative context and handoff scenarios ([recorded run](../../tests/smoke/2026-10-31-context-freshness.md)), and repository-required checks. Additional host trials are optional and report availability; no required UI screenshot matrix, baseline comparison or new logging infrastructure.
