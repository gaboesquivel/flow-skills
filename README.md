# Flow Skills

Portable, manually invoked [agent skills](https://agentskills.io) for product and engineering work. Works across agents and UIs; no Flow router, setup command, or changes to adopter instruction files.

[Product direction](PRODUCT.md) · **[Skill catalog](docs/skills.md)** · [Methodology](docs/methodology.md) · [Documentation guide](docs/README.md)

## Install

```bash
npx skills add gaboesquivel/flow-skills
```

Choose agent and scope in the installer. [Agent compatibility](docs/agent-compatibility.md) covers other install paths and metadata limits.

## Invoke

Run skills only when you explicitly ask: slash commands (`/explore`, `/to-spec`, …), skill picker, or the host’s equivalent. `disable-model-invocation: true` requests manual activation where supported.

## Catalog (12)

| Group | Skills |
| --- | --- |
| Delivery | `explore`, `grill`, `to-spec`, `to-tickets`, `implement`, `review`, `retro` |
| Product discovery | `interview`, `jtbd`, `competitors` |
| Writing | `write-agents`, `write-humans` |

Each skill is independent. Optional flow, descriptions, and links to `SKILL.md` files: **[docs/skills.md](docs/skills.md)**.

Default docs in adopter projects: `docs/specs/NNN-short-name.md`, `docs/decisions/NNN-short-name.md` (or existing conventions).

## Maintain

```bash
pnpm validate
pnpm test
```

[Release checks](docs/RELEASE.md) · [Attribution](ATTRIBUTION.md)
