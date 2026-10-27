# Local-source remediation verification

**Historical.** Bootstrap installer and 25-skill catalog superseded by [decision 0004](../../docs/decisions/0004-portable-skill-catalog.md).

Date: 2026-10-27. Scope: current working tree and npm-packed artifact, on macOS with Node 24.20.0. This is implementation evidence, not a published release or a cross-host compatibility claim.

## Changes verified

- Active upstream sync/patch scripts, manifests, and report retired into a dated historical archive; neither install, validation, testing, nor release depends on them.
- Original license notices verified against locally cached source checkouts at the revisions recorded in root ATTRIBUTION.md, and copied into adapted skill directories.
- Required decision/security/performance references repaired; all installed references validated, including supporting files.
- Core skills use existing repository conventions, supporting-file reads, and capability fallbacks instead of upstream setup or compulsory tool names. Review includes untracked work. Writing skills use the previously requested write-for-agents and write-for-humans names.
- Installer uses bundled source offline, records version/content hashes, supports an explicit project-relative skill directory, rejects malformed/custom bootstrap blocks and customized skills, and rolls back on write failure. Retired installed directories are preserved for explicit review.
- CI configured for Node 22 and 24 on Linux and macOS. Only the current macOS/Node 24 environment was executed in this session.

## Deterministic checks

`pnpm validate` passed: 23 skill directories and required local references. The count is observed, not a fixed acceptance requirement.

`pnpm test` passed: 30 tests, no skips (install, package, reference fixtures, smoke behavior contracts, prototype fixture). Coverage includes exact bootstrap byte preservation, duplicate/partial/reversed markers, offline CLI installation, idempotency, managed upgrades, custom conflicts, bootstrap-only state, symlink/metadata/source-overlap refusal, write-failure rollback, invalid flags, malformed references/metadata, and packed-release installation with exact source hashes and notices. The install subprocess runs with an empty PATH, preventing incidental dependency on npx or an external skills installer.

The package test runs `npm pack --offline --ignore-scripts`, extracts the tarball, validates its skill reference closure, and invokes its bundled installer in a fresh project. It does not publish the package.

## Fresh-context behavior checks

Two isolated agent contexts were given only a skill location and task-local input, without the review diagnosis or expected answer. No model diversity was requested or claimed; exact model identifiers were not reported by the workers.

| Task | Observed result | Limitation |
| --- | --- | --- |
| Review a fixture working tree with product requirements and an untracked checkout module; no extra agents | Read the untracked module and dependency, found the per-line discount contrary to the once-per-order requirement, demonstrated 19 versus expected 22 cents, and reported a single-agent read-only review. No baseline or tracker setup requested. | Small synthetic repository; one agent environment. |
| Rewrite an inflated installer release note using write-for-humans | Produced a concise paragraph preserving offline-after-download behavior, customization diagnostics, and the limitation that not all agent products were evaluated. No publication or file mutation. | One writing example, not a broad voice or audience evaluation. |

## Remaining limits

Scenario matrix status: [scenario status](2026-10-27-scenario-status.md). Structural remediation and local-source ownership are complete. A second live agent product and automatic-activation checks remain before broad cross-host release claims. Node 22 and Linux are configured in CI but were not executed locally. External package publication and production adoption are unverified. These limits prevent a claim of broad release readiness.

The installer stops on an old manifest without schemaVersion rather than guessing ownership from the legacy digest. Reconcile/back up any custom skills, AGENTS block, and old manifest explicitly before replacing legacy installation metadata. There is no destructive force option. Filesystem rollback is best-effort; if restoration itself fails, backups remain at the path named in the diagnostic for recovery.
