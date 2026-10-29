# Documentation guide

Conventions for Flow Skills and a default pattern adopters may follow. Create documents only when there is meaningful content.

| Location | Owns |
|---|---|
| [PRODUCT.md](../PRODUCT.md) | Flow's identity in **this** repository, plus ecosystem boundaries, dogfooding, and the flow-skills catalog. An adopter project's `PRODUCT.md` is that product ([0009](decisions/0009-adopter-product-context.md)) |
| [GLOSSARY.md](../GLOSSARY.md) | Project-specific meanings and essential distinctions |
| [principles.md](principles.md) | Optional methodology themes; the eight principles live in PRODUCT.md |
| [methodology.md](methodology.md) | How principles apply in practice (optional judgment, not enforcement) |
| [skills.md](skills.md) | Skill catalog and links to `skills/*/SKILL.md` |
| [AGENTS.md](../AGENTS.md) | Instructions for maintaining this repository |
| [DESIGN.md](../DESIGN.md) at the root | Flow's visual identity (Throughline mark, Prism tokens) and cross-surface design intent |
| ARCHITECTURE.md at the root | Current technical decisions; create when useful |
| [specs/](specs/README.md) | Numbered specifications for bounded increments of work |
| [pr-review-contract.md](pr-review-contract.md) | Agent-agnostic PR review and alignment checklist (CI-enforced on this repo) |
| [decisions/](decisions/README.md) | Significant decision records and rationale |
| [references.md](references.md) | Source index for maintainer research |
| [research/](research) | Evidence and assessments (maintainer context, not adopter scaffolding) |
| [assets/](assets) | Documentation images |
| [skills/](../skills) at the root | Portable skill packages |
| [site/](../site/README.md) at the root | The Flow website; renders the documents above, owns none ([spec 032](specs/032-prism-website.md)) |

## Durable work (adopters)

Default paths when a project has no existing convention:

- `docs/specs/NNN-short-name.md` — bounded work and intent
- `docs/decisions/NNN-short-name.md` — significant choices and rationale

Keep the current product, design, architecture, and shared language in that project's root `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `GLOSSARY.md`. Use the [`flow`](../skills/flow/SKILL.md) skill or manual edits to align them after meaningful changes. Do not copy this repository's Flow identity into an adopter `PRODUCT.md`. Do not require PRD, PDR, or ADR parallel trees. Do not treat `flow` as a template initializer. Optional template initialization may use the [`start`](../skills/start/SKILL.md) skill ([0010](decisions/0010-optional-start-skill.md)) or GitHub **Use this template** on flow-next or flow-mono.

## Maintainer archive

[Historical archive](archive/2026-10-18/INDEX.md) and [archived ideas and initiatives](archive/2026-10-27-ideas-initiatives/README.md) preserve superseded structure and proposals. They are not current instructions.

Follow [AGENTS.md](../AGENTS.md#maintain-context) for context maintenance and decision-record rules.
