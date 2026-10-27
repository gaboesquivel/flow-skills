# Documentation guide

Conventions for Flow Skills and a default pattern adopters may follow. Create documents only when there is meaningful content.

| Location | Owns |
|---|---|
| [PRODUCT.md](../PRODUCT.md) | Purpose, problem, capabilities, scope, and open product choices |
| [GLOSSARY.md](../GLOSSARY.md) | Project-specific meanings and essential distinctions |
| [principles.md](principles.md) | Guiding principles (working draft) |
| [methodology.md](methodology.md) | How principles apply in practice (optional judgment, not enforcement) |
| [skills.md](skills.md) | Skill catalog and links to `skills/*/SKILL.md` |
| [AGENTS.md](../AGENTS.md) | Instructions for maintaining this repository |
| DESIGN.md / ARCHITECTURE.md at the root | Current experience and technical decisions; create when useful |
| [specs/](specs/README.md) | Numbered specifications for bounded increments of work |
| [decisions/](decisions/README.md) | Significant decision records and rationale |
| [references.md](references.md) | Source index for maintainer research |
| [research/](research) | Evidence and assessments (maintainer context, not adopter scaffolding) |
| [assets/](assets) | Documentation images |
| [skills/](../skills) at the root | Portable skill packages |

## Durable work (adopters)

Default paths when a project has no existing convention:

- `docs/specs/NNN-short-name.md` — bounded work and intent
- `docs/decisions/NNN-short-name.md` — significant choices and rationale

Keep current product, design, architecture, and shared language in root `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `GLOSSARY.md`. Use the [`flow`](../skills/flow/SKILL.md) skill (Flow Lite) or manual edits to align them after meaningful changes. Do not require PRD, PDR, or ADR parallel trees.

## Maintainer archive

[Historical archive](archive/2026-10-18/INDEX.md) and [archived ideas and initiatives](archive/2026-10-27-ideas-initiatives/README.md) preserve superseded structure and proposals. They are not current instructions.

Follow [AGENTS.md](../AGENTS.md#maintain-context) for context maintenance and decision-record rules.
