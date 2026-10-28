---
name: start
description: Initialize a new project from flow-next or flow-mono with verified setup, renamed identity, and an independent initial Git commit, while explore shapes the product. Use when the user says "start a Next.js project", "start a new project", or "start a monorepo".
disable-model-invocation: false
---

# Start

**New product.** Initialize a **new application** from [flow-next](https://github.com/gaboesquivel/flow-next) or [flow-mono](https://github.com/gaboesquivel/flow-mono) while `explore` shapes the product in the same sitting. This is not Flow Lite (`flow`).

Deterministic rename, destination safety, baseline docs, and commit-gating rules live in this skill's `lib/` modules. Use them instead of blind global replace or destructive Git commands.

## Gather inputs

Take what the invocation already says before asking. `inferTemplateFromRequest` from `lib/identity.mjs` maps "Next.js", "next", or a flow-next URL to **flow-next**, and "mono", "monorepo", "Turborepo", or a flow-mono URL to **flow-mono**. A project name in the request, or the current directory's name, is the proposed name.

Ask only for what is still missing, in one question round:

1. **Project name** (product identity; drives package name and Portless host).
2. **Local destination directory.** Default to the **current working directory** when `assessDestination` accepts it; propose a nested or sibling directory only when the user asks or the current one is refused.
3. **Template** — only when not inferred. Recommend **flow-next** for a single Next.js app, **flow-mono** for Turborepo (`apps/web`, `packages/ui`).
4. **Optional GitHub remote** — only when the user wants a new repository created or linked; never assume push access.

If an answer does not arrive, ask again; do not substitute a destination the user did not confirm.

Resolve every bootstrap question, including files to preserve, before confirming; the bootstrap lane reports blockers rather than asking.

Derive identity with `deriveProjectIdentity` from `lib/identity.mjs`: slug, `package.json` name, Portless name, and `<slug>.localhost` host. Display title stays the name the user gave.

## Confirm before writing

A spoken request can be misheard, so write nothing until the user agrees. State the template, project name (with slug and host), destination, and any GitHub repository to create with its visibility, then wait for an explicit yes. Anything else is not a yes; correct and restate.

## Run two lanes

After the yes:

- **Bootstrap lane.** A worker runs every section from "Obtain template" through "Initial commit" below, unchanged, and reports the completion facts.
- **Explore lane.** The main session hands the conversation to `explore` as a new-product run at Full depth (unless the user picks another depth), using the user's description as its first input. Explore drafts in conversation and writes nothing until the bootstrap lane reports its initial commit.

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

**Bootstrapping in place.** A destination that holds only agent setup — `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.claude/`, `.agents/`, `.cursor/`, `skills-lock.json` — counts as empty. Bootstrap at that root, not in a nested folder. Keep those files as they are: when the template ships its own copy of a kept file, report it in `skipped` and leave the adopter's version. For other files (for example a prompt log), `assessDestination` names them; settle whether to keep them during Gather inputs, then pass them as `preserve`.

**Stop** when the destination has unexpected files without authorization, or when the path already has Git commits. Never `reset`, `clean`, or delete history of an existing project.

## Rename template identifiers

Use `renameAllowlistForTemplate`, `applyRenamesInTree`, and `scanTreeForStaleIdentifiers` from `lib/rename.mjs`. Update package names, Portless config, titles, MCP server names, discovery metadata, README startup host, tests that embed the dev host, and Operator prompts — including flow-mono's stale "Flow Next" operator line.

**Preserve** upstream interoperability prose in `docs/INTEROP.md`, `.env.example` template comments, baseline root docs that record the template source, vendored `.agents` skills, package imports (`@repo/ui`, `web`), and legitimate references to the template repositories.

After renames, identity verification **fails** while stale template identifiers remain outside preserved paths. The scan skips `.claude/`, `.cursor/`, and `.agents/`, where installed skills legitimately name the templates.

## Dependencies and setup

In the new project root, run the template's `pnpm setup` (installs curated **technical** skills from `.agents`). Do not install flow-skills into the new repo; when the user already installed them at this root, keep them. Do not set `FLOW_SETUP_SKIP_SKILLS` unless the user asks. Never commit secrets; keep `.env.local` and build artifacts out of Git.

## Baseline product documentation

Write `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `GLOSSARY.md` for **this product** using `buildBaselineDocs` from `lib/baseline-docs.mjs`. Record template name, commit SHA, derived slug/host, and the template route shell. Do not copy Flow's mission, tagline, or principles from flow-skills. If `pnpm qa` reports formatting issues on those files, run the project's formatter (for example `pnpm exec oxfmt --write` on the new root docs) before re-running checks.

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

Once every essential check passes, write the project's Flow block into `AGENTS.md` (or `CLAUDE.md` when that is the only instruction file) in the format the `flow` skill defines for "set up Flow here", so the initial commit includes it. Touch nothing outside its markers. When `flow` is not installed, skip the block and say so.

## Initial commit

Only when `canCreateInitialCommit` from `lib/commit-gate.mjs` returns ok:

1. Review staged files for secrets and build artifacts.
2. Commit with `chore: initialize <slug>` (see `formatInitialCommitMessage`).
3. Confirm `git status` is clean, no remote points at a template repo, and report the commit SHA.

Do not use `--no-verify`. Do not push or deploy unless explicitly authorized.

## Boundaries

- Edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or equivalent instruction files only to write the Flow block.
- Do not install or require flow-skills in the new project; keep an existing installation.
- Do not automatically invoke `flow` or any delivery pipeline; `explore` is the only hand-off.
- Do not bundle Flow Factory or a workflow router.

## Completion

Report template and template commit SHA, destination path, preserved and skipped files, renamed slug and Portless host, files created or updated, whether the Flow block was written, each verification check, initial commit SHA (if created), and blockers. Report the bootstrap lane when it finishes, without interrupting an open exploration question.
