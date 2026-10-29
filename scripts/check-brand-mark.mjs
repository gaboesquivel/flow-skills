import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/** Source of the Throughline geometry; DESIGN.md says every surface uses the same outlines. */
export const MARK_SOURCE = 'site/components/logo.tsx'

/** Static files that embed the mark and cannot import it. */
export function brandMarkSurfaces(repoRoot) {
  const brand = join(repoRoot, 'site', 'public', 'brand')
  const svgs = existsSync(brand)
    ? readdirSync(brand).filter((f) => f.startsWith('throughline-') && f.endsWith('.svg')).sort().map((f) => `site/public/brand/${f}`)
    : []
  return ['site/app/icon.svg', ...svgs]
}

/** Path strings from `THROUGHLINE_PATHS` in the logo component, or null when it cannot be parsed. */
export function readMarkPaths(source) {
  const block = source.match(/THROUGHLINE_PATHS = \[([\s\S]*?)\]/u)
  if (!block) return null
  const paths = [...block[1].matchAll(/"([^"]+)"/gu)].map((m) => m[1])
  return paths.length ? paths : null
}

export function collectBrandMarkErrors(repoRoot) {
  const sourceFile = join(repoRoot, MARK_SOURCE)
  if (!existsSync(sourceFile)) return []
  const paths = readMarkPaths(readFileSync(sourceFile, 'utf8'))
  if (!paths) return [`${MARK_SOURCE}: export the mark outlines as THROUGHLINE_PATHS`]
  const errors = []
  for (const rel of brandMarkSurfaces(repoRoot)) {
    const abs = join(repoRoot, rel)
    if (!existsSync(abs)) { errors.push(`${rel}: missing; DESIGN.md lists it as a canonical brand asset`); continue }
    const text = readFileSync(abs, 'utf8')
    const missing = paths.filter((d) => !text.includes(`d="${d}"`)).length
    if (missing) errors.push(`${rel}: ${missing} Throughline outline(s) differ from THROUGHLINE_PATHS in ${MARK_SOURCE}; update all mark variants together (DESIGN.md)`)
  }
  return errors
}
