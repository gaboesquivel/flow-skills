---
name: start
description: Initialize a new project from flow-next or flow-mono with that product's own root context docs.
disable-model-invocation: true
---

# Start

Help the user begin a **new application** from [flow-next](https://github.com/gaboesquivel/flow-next) or [flow-mono](https://github.com/gaboesquivel/flow-mono). Manual invocation only. This is not Flow Lite (`flow`) and not a mandatory pipeline.

## Choose a template

| Template | When |
| --- | --- |
| **flow-next** | Single Next.js application |
| **flow-mono** | Turborepo with `apps/web` and `packages/ui` |

Prefer GitHub **Use this template** when the host supports it. Otherwise clone or copy the template repository without Flow's methodology identity.

## Initialize

1. Confirm the **product name** and repository location with the user.
2. Create or prepare the project directory. Initialize git when the user wants version control.
3. Create **product-specific** root docs when they would hold meaningful content: `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `GLOSSARY.md`. Write the adopter's product identity only — never copy Flow's mission, principles, or tagline from flow-skills.
4. Point to template `README.md`, `docs/INTEROP.md`, and `pnpm setup` for stack setup. Mention `FLOW_SETUP_SKIP_SKILLS=1` when skills install should be skipped.

## Boundaries

- Do not edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or equivalent instruction files.
- Do not install or require flow-skills in the new project.
- Do not imply that `implement`, `review`, or `flow` must run next.
- Do not bundle Flow Factory or a workflow router.

## Completion

State which template was used, which files were created, and what the user should run next (`pnpm setup`, `pnpm dev`, deployment). Note anything not executed (deploy, live credentials).
