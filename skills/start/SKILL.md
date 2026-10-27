---
name: start
description: Initialize a new project from flow-next or flow-mono with verified setup, renamed identity, and an independent initial Git commit.
disable-model-invocation: true
---

# Start

**New product.** Initialize a **new application** from [flow-next](https://github.com/gaboesquivel/flow-next) or [flow-mono](https://github.com/gaboesquivel/flow-mono). Manual invocation only. This is not Flow Lite (`flow`) and not a mandatory pipeline. Do not invoke `flow`, `explore`, `implement`, or `review` automatically when this skill finishes.

Deterministic rename, destination safety, baseline docs, and commit-gating rules live in this skill's `lib/` modules. Use them instead of blind global replace or destructive Git commands.

## Gather inputs

Ask only for:

1. **Project name** (product identity; drives package name and Portless host).
2. **Local destination directory** (empty unless the user explicitly authorizes overwrite).
3. **Template** — recommend **flow-next** for a single Next.js app, **flow-mono** for Turborepo (`apps/web`, `packages/ui`).
4. **Optional GitHub remote** — only when the user wants a new repository created or linked; never assume push access.

Do not run product discovery, interviews, or specs during initialization.

Derive identity with `deriveProjectIdentity` from `lib/identity.mjs`: slug, `package.json` name, Portless name, and `<slug>.localhost` host. Display title stays the name the user gave.

## Obtain template (independent of upstream history)

Prefer GitHub **Use this template** when authorized:

```bash
gh repo create <owner>/<repo> --template gaboesquivel/<template> --clone <destination>
```

Otherwise clone the template, then **remove only that checkout's** `.git`, run `git init`, and leave **no remote** until the user authorizes one.

- Never keep `origin` pointing at `gaboesquivel/flow-next` or `gaboesquivel/flow-mono`.
- Add the user's remote only when explicitly provided and authorized.
- Use `assessDestination` and `assertNoTemplateOrigin` from `lib/git-safety.mjs` before writing files.

**Stop** when the destination is nonempty without authorization, or when the path already has Git commits. Never `reset`, `clean`, or delete history of an existing project.

## Rename template identifiers

Use `renameAllowlistForTemplate`, `applyRenamesInTree`, and `scanTreeForStaleIdentifiers` from `lib/rename.mjs`. Update package names, Portless config, titles, MCP server names, discovery metadata, README startup host, tests that embed the dev host, and Operator prompts — including flow-mono's stale "Flow Next" operator line.

**Preserve** upstream interoperability prose in `docs/INTEROP.md`, `.env.example` template comments, baseline root docs that record the template source, vendored `.agents` skills, package imports (`@repo/ui`, `web`), and legitimate references to the template repositories.

After renames, identity verification **fails** while stale template identifiers remain outside preserved paths.

Do not create or edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or equivalent instruction files.

## Dependencies and setup

In the new project root, run the template's `pnpm setup` (installs curated **technical** skills from `.agents`). Do not install flow-skills into the new repo. Do not set `FLOW_SETUP_SKIP_SKILLS` unless the user asks. Never commit secrets; keep `.env.local` and build artifacts out of Git.

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

## Initial commit

Only when `canCreateInitialCommit` from `lib/commit-gate.mjs` returns ok:

1. Review staged files for secrets and build artifacts.
2. Commit with `chore: initialize <slug>` (see `formatInitialCommitMessage`).
3. Confirm `git status` is clean, no remote points at a template repo, and report the commit SHA.

Do not use `--no-verify`. Do not push or deploy unless explicitly authorized.

## Boundaries

- Do not edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or equivalent instruction files.
- Do not install or require flow-skills in the new project.
- Do not automatically invoke `flow`, `explore`, or any delivery pipeline.
- Do not bundle Flow Factory or a workflow router.

## Completion

Report template and template commit SHA, destination path, renamed slug and Portless host, files created or updated, each verification check, initial commit SHA (if created), and blockers.

Recommended **example** sequence for new projects (not mandatory): install Flow Skills → invoke `start` → invoke `flow` to align product context → invoke `explore` when discovery is needed → use other skills independently.
