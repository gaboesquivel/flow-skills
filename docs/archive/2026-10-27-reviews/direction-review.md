# Direction review, second pass

Date: 2026-10-27. Status: **archived historical evidence** — superseded by [decision 0004](../../decisions/0004-portable-skill-catalog.md) and [skill catalog](../../skills.md). This note does not adopt a decision, start an initiative, or authorize edits.

A first pass the same day, on the pre-rename tree, recommended narrowing Flow's claim: the installable catalog was an engineering pipeline, and the Lean Startup methodology was documented but unbuilt. The source then changed. This pass reviews that updated tree.

## For the reviewing agent

Read this note against the repository. For each finding, reply confirmed, refuted, or uncertain, and cite the file that decides it. Treat quotes below as claims to check, not as authority.

Do not implement from this note unless the user asks. Do not create a decision record from it. Do not treat agreement with the verdict as proof.

This pass did not re-run `pnpm test`, did not execute the skills in a live session, and did not read every line of all 25 skills. `pnpm validate` was run once on 2026-10-27 and printed `Validated 25 skills and their local references.`

## Verdict

Still narrow the product claim. Confidence: medium-high that the methodology is not what the skills run; medium that the right next move is an external decision rather than more catalog work.

The update improved the engineering front of the workflow. It added `explore` and `requirements`, shortened names, and pointed `flow` at that sequence. It also labeled that front "Discovery" and made `npx skills@latest add` the primary public install. Commercial discovery, an OMTM, a validation board, methodology learning, and a completed external trial are still absent. Flow itself still has no selected metric and still says demand is unvalidated.

## What changed since the first pass

Checked in the working tree on this date:

- `skills/` contains 25 directories. Legacy directories `grilling`, `code-review`, `code-simplification`, `security-and-hardening`, `performance-optimization`, `systematic-debugging`, `verification-before-completion`, and `handoff` are gone.
- [Decision 0003](../../decisions/0003-skill-naming.md) accepts the short names, adds `explore` and `requirements`, and sets `npx skills@latest add gaboesquivel/flow-skills` as the primary public installation.
- [README.md](../../../README.md) groups skills as Core, Discovery, Delivery, Quality, and Writing, and leads with that `npx` command. The local `scripts/init/cli.mjs` path is described as optional bootstrap.
- [skills/flow/SKILL.md](../../../skills/flow/SKILL.md) workflow is now Explore → Requirements → Spec → Tasks → Build → Review → Ship → Retro.
- [tests/smoke/2026-10-27-scenario-status.md](../../../tests/smoke/2026-10-27-scenario-status.md) adds an "Explore and requirements boundaries" row, marked Pass from contracts.
- [scripts/validate.mjs](../../../scripts/validate.mjs) requires exactly 25 skill directories.

Unchanged in substance:

- [PRODUCT.md](../../../PRODUCT.md) still defines Flow as a Lean Startup methodology connecting discovery, strategy, design, engineering, launch, and learning, and still says commercial discovery, a validation-board UI, methodology learning, and context initialization remain under development.
- No skill entrypoint contains `OMTM`, `validation board`, `buyer`, or `revenue`.
- [docs/initiatives/initialization.md](../2026-10-27-ideas-initiatives/initiatives/initialization.md) still has no successful external trial. [docs/initiatives/website.md](../2026-10-27-ideas-initiatives/initiatives/website.md) is still planning, with no reader evidence.
- [Decision 0002](../../decisions/0002-local-skill-ownership.md) still says local ownership and the offline installer do not establish product value or cross-host behavior.

## Findings

### F1. The new Discovery group is a requirements front end

`skills/explore/SKILL.md` maps users, jobs, constraints, risks, and open questions, then stops when the next activity is clear. It recommends `requirements`, `grill`, or `to-spec`. `skills/requirements/SKILL.md` captures problem, users, functional requirements, non-goals, and acceptance criteria, and says this skill captures what must be true for success. `skills/flow/SKILL.md` still opens with: "Turn a user request into a small, useful, verifiable software change."

That is a better engineering sequence than spec-to-ship alone. It is the activity [PRODUCT.md](../../../PRODUCT.md) already separated from commercial discovery. The same section says installation does not implement commercial discovery, the validation board, methodology learning, or context initialization.

README's "Discovery" row lists `explore`, `requirements`, `grill`, `grill-with-docs`, `domain-modeling`, `research`, and `prototype`. A reader can take that row as the missing Lean Startup loop. The skill text does not run buyers, revenue, experiments, evidence, or a continue / change / stop decision on a commercial assumption.

### F2. Two accepted decisions disagree on installation

[Decision 0002](../../decisions/0002-local-skill-ownership.md) is accepted and says to install the bundled skill trees offline, and that an offline installer keeps publication separate from setup. It superseded the Skills CLI coupling in decision 0001.

[Decision 0003](../../decisions/0003-skill-naming.md) is also accepted, supersedes nothing, and sets this as the primary public installation:

```bash
npx skills@latest add gaboesquivel/flow-skills
```

[README.md](../../../README.md) leads with that command and calls the local bootstrap optional.

[scripts/validate.mjs](../../../scripts/validate.mjs) treats `npx skills` and `skills add` as retired dependencies inside skill markdown. The check does not scan README or decision records, so validate can pass while the public install path is the dependency the validator forbids in skills. `pnpm validate` did pass on this tree.

[smoke-remediation.md](smoke-remediation.md) still describes an installer that runs with an empty PATH so it cannot depend on `npx`. That evidence describes the local bootstrap. It does not describe the command README now tells a founder to run first.

### F3. Current indexes still describe the previous catalog

These files were not brought in line with the 25-skill tree:

- [docs/ideas/README.md](../2026-10-27-ideas-initiatives/ideas/README.md) still says the writing work has a "rename plan proposed".
- [docs/ideas/writing.md](../2026-10-27-ideas-initiatives/ideas/writing.md) says the naming plan is implemented via decision 0003, then keeps a table of longer proposed names and says to retain `code-review`, `code-simplification`, `security-and-hardening`, `performance-optimization`, `systematic-debugging`, and `verification-before-completion`. The header calls that table historical. The idea index does not.
- [docs/ideas/exploration-and-prototyping.md](../2026-10-27-ideas-initiatives/ideas/exploration-and-prototyping.md) says separate explore entry points "remain unselected" and that skill boundaries are unresolved. `skills/explore/SKILL.md` exists.
- [docs/initiatives/methodology-and-skills.md](../2026-10-27-ideas-initiatives/initiatives/methodology-and-skills.md) records the 25-skill naming refactor as implemented, and still says the current research focus is to study Lean Startup practices before defining Flow's product skills.
- [smoke-remediation.md](smoke-remediation.md) says `pnpm validate` passed with 23 skill directories. The validator now errors unless it finds 25. This pass's validate run reported 25. The remediation note is stale evidence, not a description of the current check.

### F4. Scenario passes for the new skills are text contracts

[tests/smoke-contracts.test.mjs](../../../tests/smoke-contracts.test.mjs) expects `explore` to include `do not authorize implementation` and `requirements`, and `requirements` to include `to-spec` and `does not authorize coding`. It also asserts `names.length` is 25.

[tests/smoke/2026-10-27-scenario-status.md](../../../tests/smoke/2026-10-27-scenario-status.md) marks "Explore and requirements boundaries" Pass on that contract evidence. The release gate in the same file still requires live runs in a second agent product. Decision 0002 still says structural evidence does not establish product value.

### F5. The learning loop is still only in the methodology

[docs/methodology.md](../../methodology.md) tells practitioners to refine an initiative around consequential assumptions and, when measurement can guide the decision, to define an OMTM with population, calculation, window, source, baseline, target, and decision response.

[PRODUCT.md](../../../PRODUCT.md) says no OMTM has been selected for Flow itself, and that broader demand for Flow remains unvalidated.

The skill tree does not carry those instructions. `flow` says passing tests are not proof of product value, and no later skill collects that value. The website initiative's hero still states intended value and says no reader evidence has been collected. The initialization initiative's named external trial has not run.

The idea index still says no reviewed idea has been marked deferred or dropped.

### F6. The catalog count is again a fixed check

[distribution-review.md](distribution-review.md) said not to keep a magic skill count as a product invariant, after tests treated 23 as one. [scripts/validate.mjs](../../../scripts/validate.mjs) and [tests/smoke-contracts.test.mjs](../../../tests/smoke-contracts.test.mjs) now require 25. The count matches the tree today. It will fail the next deliberate add or removal even when the references are intact.

## What the update did establish

- The shipped names match decision 0003's directory list. Validate accepts the reference closure.
- `explore` and `requirements` are distinct from `grill` and `to-spec` in their own instructions, and they refuse to treat discussion as implementation authority.
- [skills/review/SKILL.md](../../../skills/review/SKILL.md) covers a repository audit, the working tree including untracked files, and a committed comparison. The earlier defect that review ignored untracked work is not the current `review` skill.
- Upgrade renames for the old directory names live in `scripts/init/install.mjs` (removed with bootstrap installer) as `SKILL_RENAMES`. `handoff` is in `RETIRED_SKILL_NAMES`.

## Recommendation to challenge

Keep the 25-skill catalog as the engineering distribution. Do not describe `explore` plus `requirements` as the Lean Startup methodology. Before any release or website claim, reconcile which install path is authoritative: decision 0002's offline bootstrap, or decision 0003's `npx skills@latest add`. Update the stale idea, initiative, and remediation sentences so they describe this tree.

The smallest test that matches the problem in PRODUCT.md is still one session on a product other than this repository: name the buyer, the riskiest assumption, and the evidence that would change the decision, then continue, change, or stop. A second-host contract pass, a landing page, or another green validate run would leave this recommendation as it is.

## What would change the verdict

Confirm a move toward "continue" only if an installed skill, on a repository other than this one, produces a written assumption and a continue / change / stop decision that cites that skill rather than only `docs/methodology.md`.

Refute F1 if a current skill entrypoint actually runs commercial discovery or a validation board and this pass missed it. Refute F2 if a later decision explicitly chooses one install path and the README matches it. Refute F3 where a cited file has since been updated. Refute F4 if the explore/requirements row is backed by a recorded live session rather than the substring contract.
