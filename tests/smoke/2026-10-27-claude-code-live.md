# Live run: Claude Code in meta-cto (2026-10-27)

Host: Claude Code 2.1.308 (CLI bundled with the desktop app), headless `-p` runs. Adopter: meta-cto, a flow-next app with all twenty-four Flow skills installed under `.claude/skills/` via `npx skills add`. `npx skills update -p` reported every skill current; installed copies matched `main`.

Each run allowed only `Read`, `Grep`, `Glob`, and `Skill`, and the prompt said not to edit files. No adopter file changed.

## Results

| Scenario | Prompt | Outcome |
| --- | --- | --- |
| Discovery | Session init | Pass. All twenty-four Flow skills listed; `/flow`, `/tldr`, `/review`, `/simplify` registered as slash commands next to built-ins such as `/code-review` and `/security-review`. |
| Explicit `tldr` | `/tldr summarize PRODUCT.md visually…` | Pass. Read `PRODUCT.md`; returned a Mermaid diagram and a fact table, no prose summary. |
| `simplify` name clash | `/simplify lib/ — only state which skill instructions you loaded…` | Pass. Loaded the project's Flow `simplify` from `.claude/skills/simplify`; the built-in did not run. Only one `simplify` appears in the session skill list, so the installed skill shadows the built-in. |
| Implicit question | "Is GLOSSARY.md consistent with PRODUCT.md?" | Pass (expected). Answered from reads without invoking any skill. Flow Lite was not surfaced for a read-only question. |
| Explicit `flow` | `/flow check whether root docs are aligned. Report only…` | Pass. Read the four root docs, README, routes, and MCP tool catalog; reported concrete drift (a wrong MCP tool name in `GLOSSARY.md`, routes missing from `ARCHITECTURE.md`) and kept meta-cto's product identity instead of Flow's. |

## Limitations

- Headless runs, one prompt each; no interactive skill picker and no multi-turn session.
- Edits were disallowed, so write paths (`implement`, saving specs, applying `flow` updates) were not exercised.
- Implicit surfacing of `flow` after ordinary edits remains unobserved.
