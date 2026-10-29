/**
 * Deterministic PR alignment rules for flow-skills.
 * Adopters: adjust ROOT_CONTEXT_PATHS and path patterns at the top for your layout.
 */
import { execSync } from 'node:child_process'
import { collectCatalogPhraseErrors } from './check-catalog-phrases.mjs'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_CONTEXT_PATHS = [
  'PRODUCT.md',
  'DESIGN.md',
  'ARCHITECTURE.md',
  'GLOSSARY.md',
  'docs/methodology.md',
  'docs/principles.md',
]

const SPEC_PATH = /^docs\/specs\/(\d{3})-[a-z0-9-]+\.md$/u
const DECISION_PATH = /^docs\/decisions\/(\d{4})-[a-z0-9-]+\.md$/u
const SKILL_SKILL_MD = /^skills\/[a-z][a-z0-9-]{0,63}\/SKILL\.md$/u

export const hasAlignmentExemptLabel = ({ prLabels = [] }) =>
  prLabels.some((label) => label.trim().toLowerCase() === 'alignment-exempt')

export const hasDocsOnlyMarker = ({ prBody = '' }) =>
  /^[ \t]*Alignment:\s*docs-only[ \t]*$/imu.test(prBody.replaceAll('\r\n', '\n'))

function normalizeChanged(files) {
  return [...new Set(files.map((f) => f.replace(/^\.\//u, '').replace(/\\/gu, '/')))].filter(Boolean)
}

export const isRootContextOnly = ({ changedFiles }) => {
  const files = normalizeChanged(changedFiles)
  return files.length > 0 && files.every((file) => ROOT_CONTEXT_PATHS.includes(file))
}

export const hasAlignmentEscape = ({ prBody = '', prLabels = [], changedFiles = [] }) =>
  hasAlignmentExemptLabel({ prLabels }) || (hasDocsOnlyMarker({ prBody }) && isRootContextOnly({ changedFiles }))

function validateSkillMarkdownRefs({ repoRoot, filePath }) {
  const errors = []
  const abs = join(repoRoot, filePath)
  if (!existsSync(abs)) return errors
  const text = readFileSync(abs, 'utf8').replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gmu, '')
  const refs = [...text.matchAll(/\]\(([^)]+)\)/gu)].map((m) => m[1])
  refs.push(...[...text.matchAll(/`((?:\.\.?\/)[^`\n]+\.(?:md|sh|ts|mjs))`/gu)].map((m) => m[1]))
  for (let ref of refs) {
    if (/^(?:[a-z]+:|#)/iu.test(ref)) continue
    ref = ref.split('#')[0]
    const resolved = resolve(dirname(abs), ref)
    const rel = relative(resolve(repoRoot, 'skills'), resolved)
    if (rel === '..' || rel.startsWith(`..${sep}`) || !existsSync(resolved)) errors.push(`${filePath}: broken local reference ${ref}`)
  }
  return errors
}

function addedFiles(changedFiles, statusByPath) {
  return changedFiles.filter((f) => statusByPath?.[f] === 'A' || statusByPath?.[f] === 'added')
}

export function evaluatePrAlignment({
  changedFiles,
  prBody = '',
  prLabels = [],
  repoRoot,
  statusByPath = {},
}) {
  const errors = []
  const warnings = []
  const files = normalizeChanged(changedFiles)
  const labelExempt = hasAlignmentExemptLabel({ prLabels })
  const docsOnly = hasDocsOnlyMarker({ prBody }) && isRootContextOnly({ changedFiles: files })
  const fileSet = new Set(files)

  const skillSkillMd = files.filter((f) => SKILL_SKILL_MD.test(f))
  if (skillSkillMd.length && !fileSet.has('tests/smoke-contracts.test.mjs') && !labelExempt) {
    errors.push(
      `Skill contract change (${skillSkillMd.join(', ')}): update tests/smoke-contracts.test.mjs or add label alignment-exempt.`,
    )
  }

  for (const file of files.filter((f) => f.startsWith('skills/') && f.endsWith('.md'))) {
    errors.push(...validateSkillMarkdownRefs({ repoRoot, filePath: file }))
  }

  const rootTouched = files.filter((f) => ROOT_CONTEXT_PATHS.includes(f))
  if (rootTouched.length && !labelExempt && !docsOnly) {
    const hasSpecOrDecision = files.some((f) => SPEC_PATH.test(f) || DECISION_PATH.test(f))
    if (!hasSpecOrDecision) {
      errors.push(
        `Root context changed (${rootTouched.join(', ')}) without docs/specs/ or docs/decisions/ in the same PR. Add a spec or decision, put Alignment: docs-only on its own line when every changed path is root context, or add label alignment-exempt.`,
      )
    }
  }

  for (const file of files.filter((f) => f.startsWith('docs/specs/') && f.endsWith('.md') && f !== 'docs/specs/README.md' && !SPEC_PATH.test(f))) {
    errors.push(`${file}: spec filename must match docs/specs/NNN-short-name.md`)
  }

  for (const file of files.filter((f) => SPEC_PATH.test(f))) {
    const isNew = statusByPath[file] === 'A' || statusByPath[file] === 'added'
    if (!isNew || labelExempt) continue
    const readme = join(repoRoot, 'docs/specs/README.md')
    const slug = file.replace(/^docs\/specs\//u, '')
    const text = existsSync(readme) ? readFileSync(readme, 'utf8') : ''
    if (!text.includes(slug)) errors.push(`${file}: new spec should be linked from docs/specs/README.md or use alignment-exempt.`)
  }

  for (const file of files.filter((f) => f.startsWith('docs/decisions/') && f.endsWith('.md') && f !== 'docs/decisions/README.md')) {
    if (!DECISION_PATH.test(file)) errors.push(`${file}: decision filename must match docs/decisions/NNNN-short-name.md`)
    const isNew = statusByPath[file] === 'A' || statusByPath[file] === 'added'
    if (!isNew || labelExempt) continue
    const readme = join(repoRoot, 'docs/decisions/README.md')
    const slug = file.replace(/^docs\/decisions\//u, '')
    const text = existsSync(readme) ? readFileSync(readme, 'utf8') : ''
    if (!text.includes(slug)) errors.push(`${file}: new decision record should update docs/decisions/README.md or use alignment-exempt.`)
  }

  if (files.some((f) => f.startsWith('skills/')) && !files.includes('docs/skills.md') && skillSkillMd.length) {
    warnings.push('skills/ changed including SKILL.md; consider updating docs/skills.md if catalog descriptions changed.')
  }

  if (!labelExempt) errors.push(...collectCatalogPhraseErrors(repoRoot))

  return { errors, warnings }
}

function parseArgs(argv) {
  const out = { base: '', head: 'HEAD', prBody: process.env.FLOW_PR_BODY ?? '', prLabels: (process.env.FLOW_PR_LABELS ?? '').split(',').map((s) => s.trim()).filter(Boolean) }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--base' && argv[i + 1]) { out.base = argv[++i]; continue }
    if (argv[i] === '--head' && argv[i + 1]) { out.head = argv[++i]; continue }
    if (argv[i] === '--pr-body' && argv[i + 1]) { out.prBody = argv[++i]; continue }
    if (argv[i] === '--labels' && argv[i + 1]) { out.prLabels = argv[++i].split(',').map((s) => s.trim()).filter(Boolean); continue }
  }
  return out
}

export function parseNameStatus(raw) {
  if (!raw?.trim()) return { files: [], statusByPath: {} }
  const files = []
  const statusByPath = {}
  for (const line of raw.split('\n')) {
    const parts = line.split('\t').map((part) => part.replace(/\\/gu, '/'))
    const status = parts[0] ?? 'M'
    const code = status[0]
    if ((code === 'R' || code === 'C') && parts.length >= 3) {
      const from = parts[1]
      const to = parts[parts.length - 1]
      files.push(from, to)
      statusByPath[from] = 'D'
      statusByPath[to] = 'added'
      continue
    }
    const path = parts[parts.length - 1]
    if (!path) continue
    files.push(path)
    statusByPath[path] = code === 'A' ? 'added' : code
  }
  return { files, statusByPath }
}

function gitChangedFiles(base, head) {
  const raw = execSync(`git diff --name-status --no-renames ${base}...${head}`, { encoding: 'utf8' }).trim()
  return parseNameStatus(raw)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const { base, head, prBody, prLabels } = parseArgs(process.argv)
  if (!base) {
    console.error('Usage: node scripts/check-pr-alignment.mjs --base <sha> --head <sha> [--pr-body "..."] [--labels a,b]')
    process.exitCode = 1
  } else {
    const { files, statusByPath } = gitChangedFiles(base, head)
    const { errors, warnings } = evaluatePrAlignment({ changedFiles: files, prBody, prLabels, repoRoot, statusByPath })
    for (const w of warnings) console.warn(`warning: ${w}`)
    if (errors.length) {
      console.error(errors.join('\n'))
      process.exitCode = 1
    } else console.log(`PR alignment OK (${files.length} paths, base=${base}, head=${head}).`)
  }
}
