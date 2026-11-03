import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LEADING_PHRASES } from '../skills/flow/lib/flow-block.mjs'

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
  errors.push(...collectLeadingPhraseErrors(repoRoot))
  return errors
}

/** Lowercased `description` of every skills/<name>/SKILL.md; catalog phrases live there, not in a table. */
export function skillDescriptions(repoRoot) {
  const dir = join(repoRoot, 'skills')
  if (!existsSync(dir)) return {}
  const out = {}
  for (const name of readdirSync(dir)) {
    const file = join(dir, name, 'SKILL.md')
    if (!existsSync(file)) continue
    const match = /^description:\s*(.+)$/mu.exec(readFileSync(file, 'utf8'))
    if (match) out[name] = match[1].toLowerCase()
  }
  return out
}

/** Every leading phrase the Flow block names must be carried by some skill's description. */
export function collectLeadingPhraseErrors(repoRoot, phrases = LEADING_PHRASES) {
  if (!existsSync(join(repoRoot, 'skills'))) return []
  const descriptions = Object.values(skillDescriptions(repoRoot))
  return phrases.filter((phrase) => !descriptions.some((d) => d.includes(`"${phrase.toLowerCase()}"`))).map((phrase) => `Flow block phrase "${phrase}" is in no skill description`)
}
