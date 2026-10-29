import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Surfaces that must reflect decision 0042 ship landing copy, not pre-amendment 0028-only hand-offs. */
export const CATALOG_PHRASE_SURFACES = [
  'README.md',
  'docs/skills.md',
  'docs/agent-compatibility.md',
  'PRODUCT.md',
]

/** Stale catalog wording superseded by 0042 (historical decision text may still quote it). */
export const STALE_SHIP_PIPELINE_PHRASE = 'running `build` and `review` as part of landing'

export function collectCatalogPhraseErrors(repoRoot) {
  const errors = []
  for (const rel of CATALOG_PHRASE_SURFACES) {
    const abs = join(repoRoot, rel)
    if (!existsSync(abs)) continue
    const text = readFileSync(abs, 'utf8')
    if (text.includes(STALE_SHIP_PIPELINE_PHRASE)) {
      errors.push(
        `${rel}: stale ship pipeline phrase; use decision 0042 landing copy (proofs when missing, not a named build→review hand-off).`,
      )
    }
  }
  return errors
}
