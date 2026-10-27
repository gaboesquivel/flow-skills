# Flow Skills

[Flow](PRODUCT.md) helps solo founders and small teams turn product intent into useful, verified work. Its skills are maintained here, work with existing repository conventions, and require no external skill packages or fixed agent, UI, or technology stack.

## Install

```bash
npx skills@latest add gaboesquivel/flow-skills
```

This installs the bundled `skills/` tree from this repository. No companion repositories or upstream skill catalogs are required.

Optional project bootstrap (AGENTS.md markers and `.flow-skills/manifest.json`) from a local checkout:

```bash
node /path/to/flow-skills/scripts/init/cli.mjs
```

The bootstrap installer copies the same bundled tree into `.agents/skills` by default, merges a small `AGENTS.md` snippet, and records content hashes for upgrades. Use `--skills-dir path/to/skills` for an existing host convention, or `--skip-skills` for bootstrap only. Repeat installs preserve surrounding instructions and stop before overwriting customized content.

## Skills (25)

Request skills by name in your agent's supported interface. Start with `flow` for a broad task, or a focused skill when the work is clear. No mandatory setup interview or tracker is required.

| Group | Skills |
| --- | --- |
| Core | `flow`, `council`, `doctor`, `extract`, `ship` |
| Discovery | `explore`, `requirements`, `grill`, `grill-with-docs`, `domain-modeling`, `research`, `prototype` |
| Delivery | `to-spec`, `to-tickets`, `implement`, `tdd`, `review`, `retro` |
| Quality | `simplify`, `security`, `performance`, `debug`, `verify` |
| Writing | `write-for-humans`, `write-for-agents` |

Typical optional sequence: explore → requirements → to-spec → to-tickets → implement → review → ship → retro. Each step is independently invokable.

Skills express explicit workflow activation. An activated skill may read linked supporting guidance within its scope; that does not authorize unrelated workflows or delivery actions. Host metadata support varies, so cross-host behavior remains subject to [evaluation](tests/smoke/README.md).

## Maintain

```bash
pnpm validate
pnpm test
```

Checks need no dependency installation. Tests include packing and installing the release offline; npm and tar must be available. Edit `skills/` directly. There is no upstream sync or patch pipeline. Adapted material retains its [attribution and original licenses](ATTRIBUTION.md).

[Methodology](docs/methodology.md) · [Documentation guide](docs/README.md) · [Local ownership decision](docs/decisions/0002-local-skill-ownership.md) · [Skill naming decision](docs/decisions/0003-skill-naming.md) · [Release checks](docs/RELEASE.md)
