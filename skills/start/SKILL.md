---
name: start
description: Initialize a new project from flow-next or flow-mono with verified setup, renamed identity, and an independent initial Git commit, while explore shapes the product. Use when the user says "start a Next.js project", "start a new project", or "start a monorepo".
disable-model-invocation: false
---

# Start

**New product.** Initialize a **new application** from [flow-next](https://github.com/gaboesquivel/flow-next) or [flow-mono](https://github.com/gaboesquivel/flow-mono) while `explore` shapes the product in the same sitting. It is the `flow` skill's "set up Flow here" plus a template bootstrap (decision 0026): the same Flow block, the same process depth question, and the same goals.

Deterministic rename, destination safety, baseline docs, and commit-gating rules live in this skill's `lib/` modules. Use them instead of blind global replace or destructive Git commands.

## Gather inputs

Take what the invocation already says before asking. `inferTemplateFromRequest` from `lib/identity.mjs` picks the template the request names, using the hints in `TEMPLATE_HINTS` (`lib/constants.mjs`). A project name in the request, or the current directory's name, is the proposed name.

Ask only for what is still missing, in one question round:

1. **Project name** (product identity; drives package name and Portless host).
2. **Local destination directory.** Default to the **current working directory** when `assessDestination` accepts it; propose a nested or sibling directory only when the user asks or the current one is refused.
3. **Template** — only when not inferred. Recommend **flow-next** for a single Next.js app, **flow-mono** for Turborepo (`apps/web`, `packages/ui`).
4. **Optional GitHub remote** — only when the user wants a new repository created or linked; never assume push access.
5. **Discovery depth** — only when not stated: **Lite** (recommended) or **Full**, as the `flow` skill defines them.
6. **Delivery** — independent of item 5, as `flow` defines it; only when not stated: **local** or **pull requests**, as `build`'s Delivery mode section defines them. Suggest local when no GitHub repository is created, and pull requests when one is; this basis is start-specific because the repository is being created.

If an answer does not arrive, ask again; do not substitute a destination the user did not confirm.

Resolve every bootstrap question, including files to preserve, before confirming; the bootstrap lane reports blockers rather than asking.

Derive identity with `deriveProjectIdentity` from `lib/identity.mjs`: slug, `package.json` name, Portless name, and `<slug>.localhost` host. Display title stays the name the user gave.

## Confirm before writing

A spoken request can be misheard, so write nothing until the user agrees. State the template, project name (with slug and host), destination, any GitHub repository to create with its visibility, the process depth, the delivery mode, the Flow block it will write, and the hand-off to `explore` at that depth, then wait for an explicit yes. Anything else is not a yes; correct and restate.

## Run two lanes

After the yes:

- **Bootstrap lane.** A worker runs every section from "Obtain template" through "Initial commit" below, in the order under "Bootstrap order", and reports the completion facts.
- **Explore lane.** The main session hands the conversation to `explore` as a new-product run at the confirmed process depth, using the user's description as its first input. Explore drafts in conversation and writes nothing until the bootstrap lane reports its initial commit.

When the host has no independent workers, run the bootstrap first, then `explore`, and say so. When `explore` is not installed, finish the bootstrap and suggest exploring next.

A failed bootstrap does not discard the exploration: report the blocker and keep exploring; the brief waits until a repository exists.

## Obtain template (independent of upstream history)

Prefer GitHub **Use this template** when authorized:

```bash
gh repo create <owner>/<repo> --template gaboesquivel/<template> --clone <destination>
```

Otherwise clone the template into a temporary directory, then copy it into the destination with `copyTemplateInto` from `lib/git-safety.mjs`. It skips the template's `.git` and never overwrites existing files. Run `git init` in the destination when it has no `.git`, and leave **no remote** until the user authorizes one.

- Never keep `origin` pointing at `gaboesquivel/flow-next` or `gaboesquivel/flow-mono`.
- Add the user's remote only when explicitly provided and authorized.
- Use `assessDestination` and `assertNoTemplateOrigin` from `lib/git-safety.mjs` before writing files.

**Bootstrapping in place.** A destination that holds only agent setup (the entries in `AGENT_SETUP_ENTRY_NAMES`, `lib/constants.mjs`) counts as empty. Bootstrap at that root, not in a nested folder. Keep those files, adding only the Flow block: when the template ships its own copy of a kept file, report it in `skipped` and leave the adopter's version. For other files (for example a prompt log), `assessDestination` names them; settle whether to keep them during Gather inputs, then pass them as `preserve`.

**Stop** when the destination has unexpected files without authorization, or when the path already has Git commits. Never `reset`, `clean`, or delete history of an existing project.

## Rename template identifiers

Use `renameAllowlistForTemplate`, `applyRenamesInTree`, and `scanTreeForStaleIdentifiers` from `lib/rename.mjs`. The allowlist names the files to rename; do not widen it with a global replace.

**Preserve** package imports (`@repo/ui`, `web`) and legitimate references to the template repositories. The scan's preserved paths and skipped directories are `STALE_SCAN_PRESERVE_REL_PATHS` and `STALE_SCAN_SKIP_DIR_NAMES` in `lib/constants.mjs`.

After renames, identity verification **fails** while stale template identifiers remain outside preserved paths.

## Dependencies and setup

In the new project root, run the template's `pnpm setup` (installs curated **technical** skills from `.agents`). Do not install flow-skills into the new repo; when the user already installed them at this root, keep them. Do not set `FLOW_SETUP_SKIP_SKILLS` unless the user asks. Never commit secrets; keep `.env.local` and build artifacts out of Git.

## Baseline product documentation

Write `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `GLOSSARY.md` for **this product** using `buildBaselineDocs` from `lib/baseline-docs.mjs`. Record template name, commit SHA, derived slug/host, and the template route shell. Do not copy Flow's mission, tagline, or principles from flow-skills. If `pnpm qa` reports formatting issues on those files, run the project's formatter (for example `pnpm exec oxfmt --write` on the new root docs) before re-running checks.

## Bootstrap order

Everything shares one tree, so run independent steps as concurrent processes, not workers, in five stages; each stage waits for the previous one:

1. The identity renames.
2. `pnpm setup` alongside the baseline docs.
3. qa, eval, identity scan, and build.
4. The dev server (portless_startup).
5. The HTTP smoke checks and the Operator fail-closed check.

Run gitignore_artifacts in any stage after setup. When the host cannot run processes concurrently, run the same steps in this order and say so.

## Verification (required before success)

Record each check as **passed**, **failed**, or **unavailable**. A passing build or unit tests alone is **not** sufficient.

| Check | Command / action |
| --- | --- |
| setup | `pnpm setup` |
| qa | `pnpm qa` |
| build | `pnpm build` |
| eval | `pnpm eval` (offline GenUI + Eve smoke; assertion failure = failed) |
| portless_startup | `pnpm setup:portless`, then `pnpm dev`; note the URL Portless prints |
| http_home | HTTP GET `/` on the Portless origin |
| http_genui | HTTP GET `/genui` |
| http_mcp | HTTP GET `/api/mcp` or `/.well-known/mcp.json` |
| operator_fail_closed | Operator/MCP operator without `OPERATOR_SECRET` must fail closed |
| identity_scan | `scanTreeForStaleIdentifiers` returns no issues |
| gitignore_artifacts | `git check-ignore` for `.env.local`, `node_modules`, `.next` |

Authenticated Operator behavior may be **unavailable** when no secret is configured; that is not a failure. Credential-dependent live model calls may be **unavailable**; distinguish from failed essential local behavior.

If any **essential** check **failed**, report the blocker and do **not** claim a successful bootstrap or create a misleading success commit.

## Flow block

Once every essential check passes, write the project's Flow block with the `flow` skill's `lib/flow-block.mjs`: pass the project's absolute path, the confirmed delivery (`local` or `pull-request`), and `--process <lite|full>`, so both lines are filled and the initial commit includes the block. Touch nothing outside its markers. When `flow` is not installed, skip the block and say so.

## Initial commit

Only when `canCreateInitialCommit` from `lib/commit-gate.mjs` returns ok:

1. Review staged files for secrets and build artifacts.
2. Commit with `chore: initialize <slug>` (see `formatInitialCommitMessage`).
3. Confirm `git status` is clean, no remote points at a template repo, and report the commit SHA.

Do not use `--no-verify`. Do not push or deploy unless explicitly authorized.

## Boundaries

- Edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or equivalent instruction files only to write the Flow block.
- Do not automatically invoke `flow` or any delivery pipeline; `explore` is the only hand-off.
- Do not bundle Flow Factory or a workflow router.

## Completion

Report template and template commit SHA, destination path, preserved and skipped files, renamed slug and Portless host, files created or updated, whether the Flow block was written with its delivery mode and process depth, each verification check, initial commit SHA (if created), and blockers. Report the bootstrap lane when it finishes, without interrupting an open exploration question.
