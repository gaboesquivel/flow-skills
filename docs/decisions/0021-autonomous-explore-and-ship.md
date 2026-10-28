# 0021 — Autonomous explore and ship: GitHub issues, grouped pull requests

Status: **Accepted** (2026-10-28). Amends [0019](0019-voice-first-invocation.md) (push confirmation). Number 0020 is reserved by the Flow mode draft on another branch. Related: [0004](0004-portable-skill-catalog.md), [0015](0015-tasks-and-domain-modeling.md). Spec: [010](../specs/010-explore-redesign.md).

## Context

Dogfooding spec 010 showed two frictions. The work shipped as five pull requests for small, coupled skill edits, and every step stopped for confirmation or a permission prompt. `to-tasks` published issues only on request, so tasks lived in chat unless someone asked.

## Decision

- **Files and issues by default.** `explore`, once spec-ready with a brief, writes the spec to `docs/specs/` and publishes tasks as GitHub issues through `to-tasks`. Research stays in `docs/research/`. `to-tasks` publishes GitHub issues by default; another tracker only when the project already uses one, and a local draft without GitHub access.
- **Grouped pull requests.** Tasks are not pull requests. `ship` puts an exploration's research, spec, and root-context changes on one branch and pull request, and a spec's tasks on one branch and pull request. Split only large, independently shippable work or work that needs separate review.
- **Autonomous runs.** `explore` and `ship` suggest the host's autonomous permission mode before multi-step runs (for example Claude Code auto mode). Skills keep their own gates: the `PRODUCT.md` text yes, and one push confirmation per run that states the pull request and merge plan. Merging still requires the user's authorization.

## Rationale

One pull request per coherent change keeps review proportional and avoids rebasing chains of tiny branches. Issues give tasks a durable home that pull requests can close. Suggesting the host's autonomous mode removes permission-prompt friction without giving skills authority the user did not grant.

## Consequences

- `explore`, `ship`, `to-tasks`, and `to-spec` change together; smoke contracts cover the new rules.
- Hosts without an autonomous mode run with ordinary prompts.
- Adopters without GitHub get local task drafts.
