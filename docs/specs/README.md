# Specifications

Numbered specifications describe a bounded increment of work: product, research, marketing, engineering, or cross-functional.

Default path: `docs/specs/NNN-short-name.md` (three-digit sequence, kebab-case slug). Choose the next number free on every branch, not just this one (`pnpm next-number` here). Projects with an established convention keep it.

Specs in this repository, one per line so parallel branches merge cleanly:

- [001-portable-skill-catalog.md](001-portable-skill-catalog.md)
- [002-flow-lite-and-flat-docs.md](002-flow-lite-and-flat-docs.md)
- [003-flow-templates-baseline-v2.md](003-flow-templates-baseline-v2.md) (historical template baseline)
- [004-pr-alignment-review.md](004-pr-alignment-review.md)
- [005-flow-templates-interop.md](005-flow-templates-interop.md) (candidate; template interoperability contract owned by the template repositories)
- [006-skill-reliability.md](006-skill-reliability.md)
- [007-catalog-skill-restoration.md](007-catalog-skill-restoration.md)
- [008-tasks-and-domain-modeling.md](008-tasks-and-domain-modeling.md)
- [009-flow-mode.md](009-flow-mode.md)
- [010-explore-redesign.md](010-explore-redesign.md)
- [011-start-with-explore.md](011-start-with-explore.md)
- [012-progress-board.md](012-progress-board.md)
- [013-consolidation.md](013-consolidation.md)
- [014-faster-pr-ci.md](014-faster-pr-ci.md)
- [015-wave-checkpoints.md](015-wave-checkpoints.md)
- [016-process-depth.md](016-process-depth.md)
- [017-build-and-ship.md](017-build-and-ship.md)
- [018-spec-issues.md](018-spec-issues.md)
- [019-delivery-choice.md](019-delivery-choice.md)
- [020-ship-verifies.md](020-ship-verifies.md)
- [021-demo-findings.md](021-demo-findings.md)
- [022-requirement-verdicts.md](022-requirement-verdicts.md)
- [023-git-and-github-requirements.md](023-git-and-github-requirements.md)
- [024-direction-change-gate.md](024-direction-change-gate.md)
- [025-build-without-a-spec.md](025-build-without-a-spec.md)
- [026-clean-baseline-and-worktrees.md](026-clean-baseline-and-worktrees.md)
- [027-vercel-first-setup.md](027-vercel-first-setup.md)
- [028-outcome-build-and-ship.md](028-outcome-build-and-ship.md)
- [029-standalone-skill-install.md](029-standalone-skill-install.md)
- [030-adaptive-explore.md](030-adaptive-explore.md) (dropped)
- [031-fast-delivery.md](031-fast-delivery.md)
- [032-prism-website.md](032-prism-website.md)
- [033-template-fast-start.md](033-template-fast-start.md)
- [034-measurement-support.md](034-measurement-support.md)
- [035-delivery-phrases.md](035-delivery-phrases.md)
- [036-agent-does-the-work.md](036-agent-does-the-work.md)
- [038-throughline-identity.md](038-throughline-identity.md)
- [039-design-skill.md](039-design-skill.md)
- [040-site-refinement.md](040-site-refinement.md)
- [041-skill-evaluation.md](041-skill-evaluation.md)
- [042-git-first-coordination.md](042-git-first-coordination.md) (implemented)
- [043-defensive-delivery.md](043-defensive-delivery.md) (accepted)
- [044-context-and-human-experience.md](044-context-and-human-experience.md) (draft; after 042 and 043)

Significant standalone decisions belong in `docs/decisions/`, not in a spec. See [decisions](../decisions/README.md).

## Retrospective implementation order (042–044)

Publish these drafts and proposed decisions 0052–0053 through a documentation PR first. Merging planning documents does not accept their policy or mark implementation complete. Keep existing accepted rules in force until each implementation accepts its own spec and linked decision.

1. Session A builds 042; session B independently reviews its exact branch head and exercises overlap/recovery. One implementation PR; no concurrent edits in A's checkout.
2. After 042 lands, fresh sessions load its source. A builds 043; B prepares 044 on its own branch/worktree and lists shared-file overlaps. B does not redefine 043's scope or scheduling policy.
3. After 043 lands, B incorporates it without rewriting remote history, reconciles overlaps, and completes 044. A can independently review B's final head. Review and required checks cover the reconciled head before landing.

Each writer owns one branch and one worktree inside the ignored project worktree directory. One integration owner per spec; `build it` delivers a ready PR and `ship it` lands it under existing protections. Do not launch all three implementations against the same base. Other repositories and starter version updates follow separately; this sequence changes flow-skills first.
