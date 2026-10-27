# Flow distribution review and remediation plan

Date: 2026-10-27. Status: historical review baseline. Subsequent remediation is recorded in [verification evidence](../../tests/smoke/2026-10-27-remediation.md) and [decision 0002](../decisions/0002-local-skill-ownership.md). Findings below describe the pre-remediation state; linked maintained files may now differ.

**Post-remediation (same date):** Implementation follows [decision 0002](../decisions/0002-local-skill-ownership.md). Sync/patch scripts and active manifests live under [archive/2026-10-27-distribution/](../archive/2026-10-27-distribution/). File paths in findings below describe the tree **at review time** unless noted otherwise. Current automated evidence: [remediation smoke note](../../tests/smoke/2026-10-27-remediation.md).

## Assessment

Flow has useful practices and locally copied skills, but it currently packages several different workflows rather than one coherent Flow workflow. The largest obstacle is active upstream synchronization and inherited behavioral contracts, not the historical archive. Removing old names alone would leave the underlying friction intact.

Review scope: current working tree, including untracked distribution files; all 23 skill entrypoints, supporting material relevant to references and portability, bootstrap and installer, sync and patch scripts, validation, tests, CI, release guidance, and current product/methodology/initiative context. Historical research was treated as evidence, not current instructions. This was a single-agent repository review, not an independent council or a live evaluation across agent products.

Baseline: `HEAD` was `94d43fd` (initial commit); much of the distribution was untracked and several shared documents already modified. Existing work was preserved. The previous request to own copied skills without upstream skill dependencies and remain agent/UI agnostic informs this plan; decision 0001 still describes the older sync model. Implementation should explicitly supersede that portion of the decision rather than silently rewrite history.

## Findings

### 1. High — release maintenance can erase Flow edits

Sources: [sync script](../archive/2026-10-27-distribution/sync-upstreams.ts), [patch script](../archive/2026-10-27-distribution/apply-flow-patches.mjs), [manifest](../archive/2026-10-27-distribution/upstreams.manifest.json), [release process](../RELEASE.md).

The manifest resolves upstream `main` unless a pin is supplied. Sync recursively deletes each imported skill directory before copying upstream content and applying string replacements. The lock records the resolved revision; it does not constrain subsequent syncs. Release instructions require this refresh. Direct Flow edits outside the patch transforms can therefore disappear during normal maintenance.

The `--report` option still resolves current upstream revisions and writes the lock and report while hashing the existing local trees. This can associate a new source revision with content that was never imported. Patch metadata assigns the same modification list to every imported skill regardless of applicability. The broad ADR replacement also caused finding 2.

Recommendation: keep local source authoritative; remove sync/patch machinery and active upstream manifests after retaining attribution. Future outside ideas should arrive as individually reviewed edits, not automatic imports.

### 2. High — shipped skills contain broken references

Sources: [domain modeling](../../skills/domain-modeling/SKILL.md), [performance](../../skills/performance-optimization/SKILL.md), [security](../../skills/security-and-hardening/SKILL.md), their supporting references.

- Domain modeling links to `./decision record-FORMAT.md`; the actual file is `ADR-FORMAT.md`. Its directory diagrams also say `decision/`, while prose says `docs/decisions/`.
- Performance references missing `../../references/performance-checklist.md`; its optimization-patterns reference also points outside the copied tree.
- Security references missing `../../references/security-checklist.md`; its hardening-patterns reference repeats the missing dependency.
- Setup support files refer to unshipped `/wayfinder` and `/improve-codebase-architecture`; the validator does not inspect these files.

These are incomplete copies and faulty adaptations. Preserve or rewrite useful supporting material locally, and remove references to unavailable workflows. Example glossary links inside templates are illustrative, not missing distribution dependencies; checks must distinguish them.

### 3. High — manual activation and composition contradict each other

Sources: [bootstrap](../../bootstrap/AGENTS.snippet.md), [implement](../../skills/implement/SKILL.md), [grill-with-docs](../../skills/grill-with-docs/SKILL.md), [retro](../../skills/retro/SKILL.md), [skill mechanics](../../skills/write-for-agents/SKILL-MECHANICS.md), `skills/*/agents/openai.yaml`.

Every entrypoint disables model invocation and the bootstrap promises manual specialized skills. Implement nevertheless calls TDD and code-review; grill-with-docs calls two other skills; retro calls writing-for-agents. The bundled skill-mechanics document itself says user-only skills cannot invoke one another. Adapter policy is also inconsistent: only some OpenAI metadata files explicitly disable implicit invocation.

Recommendation: distinguish explicit user activation, permitted supporting-reference reads, and optional delegation. Use portable file references for required support. State host limitations honestly; do not promise one frontmatter flag enforces identical behavior everywhere. Test supported adapters before claiming compatibility.

### 4. High — review can miss precisely the work under review

Source: [code-review](../../skills/code-review/SKILL.md).

The skill advertises work-in-progress review but restricts inspection to `git diff <ref>...HEAD`, requires a nonempty committed diff, and asks for a baseline when none was given. This excludes staged, unstaged, and untracked work. Here the distribution is largely untracked, so following that procedure would omit the principal review surface. It also requires upstream tracker setup and parallel agents without a single-agent fallback.

Recommendation: support repository audit, working-tree review, and committed comparison explicitly; report the actual scope and baseline. Tracker setup should not block a code review. Delegate only when supported and authorized; otherwise label the single-agent review.

### 5. High — installation identity and verification do not establish reproducibility

Sources: [README](../../README.md), [package](../../package.json), [CLI](../../scripts/init/cli.mjs), [manifest writer](../../scripts/init/bootstrap.mjs).

- README recommends `npx flow-skills-init`, but the declared package is `@gaboesquivel/flow-skills`; the bin name alone does not establish an unscoped package with that name. No publication of that separate package was verified.
- A versioned init package installs the default GitHub source independently of its own release version. Manifest version and bootstrap can therefore describe one release while installed skills come from another revision.
- Verification checks markers and manifest existence, not installed skill content or completeness. `--skip-skills` still prints generic verification success and installer metadata.
- The installer shells out to network-dependent `npx skills@1.7.4`, even with `--local`. Local source does not mean offline installation.
- Agent detection recognizes a few markers but has no functional role in the install contract.

Recommendation: define one documented package/entrypoint, install the exact bundled release, record actual source/version and installation mode, and verify installed content. A standard external installer can remain an optional transport; it must not be a runtime dependency between skills. Prefer a small bundled local-copy path for deterministic setup, honoring existing consumer conventions.

### 6. Medium — malformed bootstrap markers are not safely handled

Source: [bootstrap merge](../../scripts/init/bootstrap.mjs).

The merge uses the first start and end markers independently. In an isolated reproduction, reversed markers duplicated intervening user content and left two start/end pairs. Duplicate blocks remained duplicated. Partial markers are appended around rather than diagnosed. Normal-case idempotency testing does not cover these states.

Recommendation: validate marker count and order before mutation; preserve bytes outside a valid block. For malformed or conflicting blocks, return an actionable diagnostic without writing. Test missing, reversed, duplicate, valid, and absent markers, plus preservation on installation failure.

### 7. High — current tests give false confidence about distribution quality

Sources: [validator](../../scripts/validate.mjs), [tests](../../tests), [CI](../../.github/workflows/ci.yml), [smoke checklist](../../tests/smoke/README.md).

Validation reads entrypoints only, parses a small frontmatter subset, permits an external `triage`, and checks only a few reference phrasings. It does not verify supporting links, actual lock hashes, adapters, or workflow contradictions. Most unit checks assert a skill count or exact sentence. They pass despite findings 2–4. Integration asserts 23 directories and bootstrap existence, not the behavior promised by the skills.

The full integration invokes a synchronous child process without its own timeout; the test's timeout is not a reliable bound on a blocked synchronous process. CI tests Node 24 only, while the package claims Node >=20 and uses `import.meta.dirname`, unavailable in early Node 20 versions. Runtime support needs an explicit supported floor and matrix.

Recommendation: validate the entire shipped dependency closure and package contents; test observable install behavior and failure cases. Keep bounded network smoke tests separate from offline tests. Add small agent behavior scenarios rather than more sentence-presence assertions. Do not retain a magic count of 23 as a product invariant.

### 8. Medium — upstream setup and ceremonies obstruct ordinary work

Sources: [setup](../archive/2026-10-27-distribution/setup-matt-pocock-skills/SKILL.md), [spec](../../skills/to-spec/SKILL.md), [tickets](../../skills/to-tickets/SKILL.md), [TDD](../../skills/tdd/SKILL.md), [grilling](../../skills/grilling/SKILL.md).

Planning and review depend on `/setup-matt-pocock-skills`, extra `docs/agents/` configuration, triage labels, and a `.scratch/` task layout. Setup omits triage configuration when `triage` is absent, while spec/tickets still expect the vocabulary. Spec mandates an extremely extensive story list and publication; TDD requires user confirmation for every test seam and bans refactoring within its loop; grilling requires exhausting every branch and a final confirmation. These conflict with Flow's proportional process and reuse of established authorization.

Recommendation: discover existing project conventions, keep small tasks direct, ask only consequential unresolved questions, and draft versus publish according to the user's request. Fold useful setup discovery into a neutral initialization capability only where needed. Remove upstream-specific setup dependencies before deleting that skill.

### 9. Medium — delivery authority is inconsistent

Sources: [implement](../../skills/implement/SKILL.md), [ship](../../skills/ship/SKILL.md), [prototype](../../skills/prototype/SKILL.md).

Implement always commits; prototype mandates a throwaway branch and folding validated decisions into production code; ship defines explicit authority for delivery but treats absence of deployment as partial delivery even for a library. These are differing assumptions about what the original request authorizes.

Recommendation: implement verifies its authorized change; ship owns requested delivery actions. A prototype should answer the question and preserve useful evidence without silently promoting production changes. Completion must fit the product: a library may have no application deployment.

### 10. Medium — agent/UI neutrality is not implemented consistently

Sources: research, grilling, code-review, prototype and its UI/logic guides, smoke checklist, installer.

Research and grilling require background agents; review requires parallel agents; several instructions require a tool literally named `Skill`. Prototypes prescribe HTML or browser routes even when the useful artifact could be a CLI/API experiment. Current manual smoke coverage is Cursor-only and unfilled. Optional host adapters are compatible with neutrality; mandatory host-specific execution is not.

Recommendation: describe capabilities and observable results, provide sequential/tool-neutral fallbacks, and treat browser-specific prototype recipes as optional branches. Keep host-specific metadata thin and validated.

### 11. Medium — current documents describe conflicting product states

Sources: PRODUCT.md, docs/README.md, docs/methodology.md, initiative index and development initiative, writing idea, decision 0001, README.

Examples: the docs guide points to nonexistent categorized skill directories; methodology says no Flow skill executes domain modeling yet; the initiative index still says skill design is planned while the initiative says shipped; product lists implemented boundaries as open. Writing still uses `writing-for-*`, despite the requested `write-for-*` names; the human-writing capability is absent. Broader discovery/metrics/validation-board aspirations are not implemented by the engineering catalog and should not be presented as proven shipped behavior.

Recommendation: reconcile current scope, implemented capabilities, proposals, and evaluation status. Preserve substantive ideas and their dispositions. Do not delete the archive to make a stale current index look clean. Distinguish context initialization from deterministic skill installation.

### 12. Medium — attribution needs preservation before removing provenance machinery

Sources: root LICENSE, skill UPSTREAM.md files, upstream manifest and lock.

Current provenance identifies repositories, revisions, and an MIT label. No separate license files exist inside the skill trees; root LICENSE carries Flow's copyright and points to provenance files. This is a packaging gap requiring verification of original notices, not a legal determination.

Recommendation: retain exact applicable source notices and license text with copied substantial material, in a concise attribution home and portable per-skill notices where necessary. Verify against original pinned sources during remediation. Ownership of maintenance does not mean erasing authorship. Never remove the only attribution while deleting sync metadata.

## Proposed implementation sequence

These are tasks within the existing methodology-and-skills initiative, not a new management system. They are a remediation plan, not completed work.

| Order | Change | Acceptance evidence |
|---|---|---|
| 1 | Establish local ownership: preserve source/license notices, supersede sync portions of decision 0001, remove sync/patch scripts, active upstream manifest/lock/report, and their release/validator coupling. | Existing skill content survives unchanged except deliberate edits; validate and tests operate without upstream fetches or upstream metadata; no current maintenance command can overwrite skills from upstream. |
| 2 | Repair the shipped reference closure and normalize decisions; remove unshipped wayfinder/triage workflow assumptions. | All required local links resolve inside shipped files; decision instructions consistently use `docs/decisions/`; a broken supporting-file fixture fails validation. |
| 3 | Reconcile activation, composition, authorization, and portable execution across the catalog. Remove upstream setup dependency; support repository/worktree review. | Small fix, repo audit with untracked files, no tracker, no subagents, and explicit skill invocation all complete without invented prerequisites or unauthorized publication/delivery. |
| 4 | Make installation deterministic and safe; align package invocation, bundled release identity, verification, conflict handling, and runtime support. | Fresh and repeated installs, offline local install, exact artifact hashes, malformed markers, existing customized skills, failed install preservation, and packaged-release execution pass. Network checks have real child-process deadlines. |
| 5 | Reconcile owning docs and writing capabilities; prune copied scaffolding and unsupported claims. | Current indexes match actual distribution; `write-for-agents` rename updates every reference and adapter; `write-for-humans` has clear behavior and evaluation examples; ideas retain dispositions; shipped/planned/evaluated states are explicit. |
| 6 | Run bounded behavioral evaluation and release checks. | Recorded results cover at least two supported host environments plus single-agent/no-special-tool fallback; failures prevent release claims; installed artifact, not just checkout, passes reference and packaging checks. |

Dependencies: 1 precedes final distribution simplification; 2 and 3 establish the content contract used by 4–6. Add focused regression tests with each implementation task, not only at the end. Do not run destructive upstream sync as part of remediation. Preserve unrelated working-tree changes throughout.

## Catalog disposition

| Skills/material | Recommendation |
|---|---|
| flow, council, extract, ship, doctor | Keep; align composition, completion, installation diagnostics, and proportional output. |
| setup-matt-pocock-skills | Retire after removing callers; retain only useful convention discovery in neutral initialization. |
| grilling, grill-with-docs | Keep useful interview behavior; remove exhaustive confirmation gates. Consider merging the tiny wrapper after testing whether it adds value. |
| domain-modeling, research, prototype | Keep; repair references, preserve Flow meanings, add capability fallbacks and appropriate artifact choices. |
| to-spec, to-tickets, implement, code-review | Adapt to existing repository conventions, direct tasks, working-tree review, and authorized mutations. |
| tdd, systematic-debugging, verification-before-completion | Retain core evidence/test discipline; prune absolute ceremonies and repeated slogans. Consolidation is optional, not required for the first remediation. |
| code-simplification, security-and-hardening, performance-optimization | Keep useful guidance; repair dependencies and separate context-specific web budgets/checklists from universal requirements. |
| retro | Keep evidence-based improvement; remove compulsory tool coupling and avoid automatic proliferation of process/check tooling. |
| writing-for-agents; absent human-writing skill | Rename to write-for-agents and implement write-for-humans with concise Flow-owned contracts. |
| Imported creation logs and pressure-test material | Move useful evaluation fixtures out of the installed runtime payload; remove nonessential upstream development history after preserving any useful rationale. |
| docs/archive and substantive ideas/research | Preserve; repair navigation/status where needed. Historical presence is not active legacy behavior. |

## Verification and limitations

- `pnpm validate` was blocked by sandbox denial of the tsx CLI IPC socket (`listen EPERM`), not a validation finding. Running the same validator via `node --import tsx scripts/validate.ts` succeeded: 23 skills validated.
- Seven focused tests passed via `node --test tests/bootstrap.test.mjs tests/skill-references.test.mjs tests/skills-metadata.test.mjs`.
- A local link audit found the missing references described above; illustrative glossary template links were excluded from substantive findings.
- Isolated bootstrap reproductions confirmed duplicate blocks persist and reversed markers duplicate surrounding content. Temporary fixtures were removed.
- Full `pnpm test`: seven passed, one failed. The full-init integration failed after approximately 70 seconds because `npx` could not resolve `registry.npmjs.org` (`ENOTFOUND`). This is an environment/network limitation and evidence that even `--local` requires registry access; it does not establish an installer failure in a connected environment. No upstream sync, publication, push, release, or live agent behavior evaluation was performed.
- External package publication, current host semantics, source license notices, and release-command availability were not verified online. These are explicit remediation checks, not asserted external facts.

Release recommendation: do not label the distribution ready until reference integrity, installation, and behavioral contract findings are resolved. A smaller coherent catalog is preferable to preserving 23 entries as a target.
