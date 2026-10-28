# 0017 — Coexist with Claude Code built-in skills

Status: **Accepted** (2026-10-27). Related: [0004](0004-portable-skill-catalog.md), [0006](0006-flow-lite-and-flat-docs.md), [0009](0009-adopter-product-context.md), [0013](0013-restore-engineering-skills.md).

## Context

Claude Code ships its own skills and commands alongside any installed Flow skills. Several overlap with the Flow catalog:

| Flow skill | Claude Code counterpart | Difference |
| --- | --- | --- |
| `simplify` | `/simplify` | Same name. Flow refactors for clarity with exact behavior; Claude Code reviews changed code and applies cleanups. |
| `review` | `/code-review` | Flow also checks intent and root-context alignment; Claude Code hunts correctness bugs at effort levels. |
| `security` | `/security-review` | Flow hardens untrusted-input handling; Claude Code audits branch changes. |
| `flow`, `start` | `/init`, memory | `/init` writes `CLAUDE.md`; Flow keeps context in `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md` and never edits adopter instruction files. |
| `handoff` | Automatic compaction | Compaction shrinks the current session; `handoff` writes a document for a fresh agent. |
| `to-tasks` | Session task list | The task list is ephemeral; `to-tasks` produces durable vertical slices. |

Flow skills except `flow` set `disable-model-invocation: true`, while Claude Code's built-ins may be model-invoked. Plain requests such as "review this" therefore tend to reach the built-in, not Flow.

Most other Claude skills do not overlap: document formats, artifacts, browser and simulator control, scheduling, and API reference sit outside Flow's scope. Flow has no Claude Code counterpart for product discovery, specs, decision records, or shared language.

## Decision

- Flow owns **intent and durable artifacts**: root context, specs, decisions, glossary, and product discovery. Host skills own **execution and output formats**. Using both is supported.
- Keep the Flow `simplify` name. Flow is agent-agnostic ([0004](0004-portable-skill-catalog.md)); one host's built-in does not justify renaming a portable skill. Document the collision instead.
- Keep overlapping Flow skills (`review`, `security`, `handoff`, `to-tasks`) because their contracts differ from the host counterparts. Users choose per task.
- In Claude Code projects, root context files remain the single home for product facts. `CLAUDE.md` and host memory should point to them rather than restate them.
- Skill bodies stay vendor-neutral. Host-specific guidance lives in [agent compatibility](../agent-compatibility.md).

## Rationale

Renaming or dropping skills for one host would fragment the portable catalog. The overlaps are about different contracts, not duplicated behavior, so documentation resolves the confusion at lower cost. Duplicated project context across `CLAUDE.md` and root docs would violate one authoritative home.

## Alternatives

- **Rename Flow `simplify`** (for example `clarify`). Removes the name clash but churns every host for a Claude Code–specific issue. Revisit if live verification shows `/simplify` resolving to the wrong skill.
- **Drop overlapping Flow skills in favor of built-ins.** Loses intent alignment and portability to other hosts.

## Consequences

- [Agent compatibility](../agent-compatibility.md) gains a Claude Code section covering the name clash and overlaps.
- Which `simplify` Claude Code runs when both are installed is unverified; record it during live smoke verification.
