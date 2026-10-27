/**
 * Deterministic PR alignment rules for flow-skills.
 * Adopters: adjust ROOT_CONTEXT_PATHS and path patterns at the top for your layout.
 */
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
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

export function hasAlignmentEscape({ prBody = '', prLabels = [] }) {
  const labels = prLabels.map((l) => l.toLowerCase())
  if (labels.includes('alignment-exempt')) return true
  if (/\bAlignment:\s*docs-only\b/iu.test(prBody)) return true
  return false
}

function normalizeChanged(files) {
  return [...new Set(files.map((f) => f.replace(/^\.\//u, '').replace(/\\/gu, '/')))].filter(Boolean)
}

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
  const exempt = hasAlignmentEscape({ prBody, prLabels })
  const fileSet = new Set(files)

  const skillSkillMd = files.filter((f) => SKILL_SKILL_MD.test(f))
  if (skillSkillMd.length && !fileSet.has('tests/smoke-contracts.test.mjs') && !exempt) {
    errors.push(
      `Skill contract change (${skillSkillMd.join(', ')}): update tests/smoke-contracts.test.mjs or add label alignment-exempt.`,
    )
  }

  for (const file of files.filter((f) => f.startsWith('skills/') && f.endsWith('.md'))) {
    errors.push(...validateSkillMarkdownRefs({ repoRoot, filePath: file }))
  }

  const rootTouched = files.filter((f) => ROOT_CONTEXT_PATHS.includes(f))
  if (rootTouched.length && !exempt) {
    const hasSpecOrDecision = files.some((f) => SPEC_PATH.test(f) || DECISION_PATH.test(f))
    if (!hasSpecOrDecision) {
      errors.push(
        `Root context changed (${rootTouched.join(', ')}) without docs/specs/ or docs/decisions/ in the same PR. Add a spec or decision, or use Alignment: docs-only / label alignment-exempt.`,
      )
    }
  }

  for (const file of files.filter((f) => f.startsWith('docs/specs/') && f.endsWith('.md') && f !== 'docs/specs/README.md' && !SPEC_PATH.test(f))) {
    errors.push(`${file}: spec filename must match docs/specs/NNN-short-name.md`)
  }

  for (const file of files.filter((f) => SPEC_PATH.test(f))) {
    const isNew = statusByPath[file] === 'A' || statusByPath[file] === 'added'
    if (isNew && !fileSet.has('docs/specs/README.md') && !exempt) {
      const readme = join(repoRoot, 'docs/specs/README.md')
      const slug = file.replace(/^docs\/specs\//u, '')
      if (existsSync(readme) && !readFileSync(readme, 'utf8').includes(slug)) {
        errors.push(`${file}: new spec should be linked from docs/specs/README.md or use alignment-exempt.`)
      }
    }
  }

  for (const file of files.filter((f) => f.startsWith('docs/decisions/') && f.endsWith('.md') && f !== 'docs/decisions/README.md')) {
    if (!DECISION_PATH.test(file)) errors.push(`${file}: decision filename must match docs/decisions/NNNN-short-name.md`)
    const isNew = statusByPath[file] === 'A' || statusByPath[file] === 'added'
    if (isNew && !fileSet.has('docs/decisions/README.md') && !exempt) {
      errors.push(`${file}: new decision record should update docs/decisions/README.md or use alignment-exempt.`)
    }
  }

  if (files.some((f) => f.startsWith('skills/')) && !files.includes('docs/skills.md') && skillSkillMd.length) {
    warnings.push('skills/ changed including SKILL.md; consider updating docs/skills.md if catalog descriptions changed.')
  }

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

function gitChangedFiles(base, head) {
  const raw = execSync(`git diff --name-status ${base}...${head}`, { encoding: 'utf8' }).trim()
  if (!raw) return { files: [], statusByPath: {} }
  const files = []
  const statusByPath = {}
  for (const line of raw.split('\n')) {
    const parts = line.split('\t')
    const status = parts[0]?.[0] ?? 'M'
    const path = parts[parts.length - 1]?.replace(/\\/gu, '/')
    if (!path) continue
    files.push(path)
    statusByPath[path] = status === 'A' ? 'added' : status
  }
  return { files, statusByPath }
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
