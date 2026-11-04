import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectBrandMarkErrors } from './check-brand-mark.mjs'
import { collectCatalogPhraseErrors } from './check-catalog-phrases.mjs'
import { collectDocLinkErrors } from './check-doc-links.mjs'
import { skillWords } from './metrics.mjs'
import { ESSENTIAL_CHECK_IDS } from '../skills/start/lib/commit-gate.mjs'

// Explicit-only skills must be named to run. Empty since decision 0022 made `start` speakable with a
// pre-write confirmation; keep the set so a future skill with irreversible effects can opt out.
export const EXPLICIT_SKILL_NAMES = new Set([])

export const EXPECTED_SKILL_NAMES = [
  'build',
  'council',
  'design',
  'domain-modeling',
  'explore',
  'flow',
  'product',
  'review',
  'ship',
  'start',
  'to-spec',
  'to-tasks',
  'write-agents',
].sort()

export function validateSkills(root) {
  const errors = []
  const names = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  if (names.join(',') !== EXPECTED_SKILL_NAMES.join(',')) {
    const missing = EXPECTED_SKILL_NAMES.filter((name) => !names.includes(name))
    const extra = names.filter((name) => !EXPECTED_SKILL_NAMES.includes(name))
    if (missing.length) errors.push(`Missing skills: ${missing.join(', ')}`)
    if (extra.length) errors.push(`Unexpected skills: ${extra.join(', ')}`)
  }
  for (const name of names) {
    const folder = join(root, name)
    if (!/^[a-z][a-z0-9-]{0,63}$/u.test(name)) errors.push(`${name}: invalid directory name`)
    if (!existsSync(join(folder, 'SKILL.md'))) { errors.push(`${name}: missing SKILL.md`); continue }
    const skill = readFileSync(join(folder, 'SKILL.md'), 'utf8')
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(skill)
    const fields = {}
    if (!frontmatter) errors.push(`${name}: missing frontmatter`)
    else for (const line of frontmatter[1].split(/\r?\n/u)) {
      const match = /^([a-z][a-z-]*):\s*(.+)$/u.exec(line)
      if (!match) { errors.push(`${name}: frontmatter must use nonempty single-line fields`); continue }
      if (match[1] in fields) errors.push(`${name}: duplicate field ${match[1]}`)
      // A plain YAML scalar cannot hold ': ' or ' #'; installers that parse YAML then drop the skill. Single-quote such values.
      const quoted = /^'((?:[^']|'')*)'$/u.exec(match[2])
      if (!quoted && /: | #/u.test(match[2])) errors.push(`${name}: frontmatter ${match[1]} contains ': ' or ' #'; wrap it in single quotes`)
      fields[match[1]] = quoted ? quoted[1].replaceAll("''", "'") : match[2]
    }
    if (fields.name !== name) errors.push(`${name}: name mismatch`)
    if (!fields.description) errors.push(`${name}: missing description`)
    const explicit = EXPLICIT_SKILL_NAMES.has(name)
    const invocation = fields['disable-model-invocation']
    if (explicit && invocation !== 'true') errors.push(`${name}: explicit-only skill must set disable-model-invocation: true`)
    if (!explicit && invocation !== 'false') errors.push(`${name}: model-invocable skill must set disable-model-invocation: false`)
    if (!explicit && !/Use when the user says "/u.test(fields.description ?? '')) errors.push(`${name}: description must name spoken trigger phrases`)
    for (const key of Object.keys(fields)) if (!['name', 'description', 'disable-model-invocation'].includes(key)) errors.push(`${name}: unsupported frontmatter field ${key}`)
    const files = listMarkdownAndSupportFiles(folder)
    if (files.includes('ATTRIBUTION.md') && !files.includes('LICENSE')) errors.push(`${name}: attribution requires bundled license`)
    for (const file of files.filter((file) => file.endsWith('.md'))) {
      const path = join(folder, file)
      const text = stripFencedCode(readFileSync(path, 'utf8'))
      const refs = [...text.matchAll(/\]\(([^)]+)\)/gu)].map((match) => match[1])
      refs.push(...[...text.matchAll(/`((?:\.\.?\/)[^`\n]+\.(?:md|sh|ts|mjs))`/gu)].map((match) => match[1]))
      for (let ref of refs) {
        if (/^(?:[a-z]+:|#)/iu.test(ref)) continue
        ref = ref.split('#')[0]
        const resolved = resolve(dirname(path), ref)
        // A skill installed alone has only its own folder, so links stay inside it.
        const rel = relative(folder, resolved)
        if (rel === '..' || rel.startsWith(`..${sep}`) || !existsSync(resolved)) errors.push(`${name}/${file}: missing or outside-the-skill reference ${ref}`)
      }
      for (const forbidden of ['setup-matt-pocock-skills', 'using-superpowers', 'Skill tool', 'superpowers:', '/wayfinder', '/improve-codebase-architecture', 'upstreams.lock.json', 'sync-upstreams', 'flow-skills-init', 'scripts/init']) {
        if (text.includes(forbidden)) errors.push(`${name}/${file}: retired dependency ${forbidden}`)
      }
      if (/docs\/(?:adr|pdr|decision)\//u.test(text)) errors.push(`${name}/${file}: legacy decision path`)
      for (const bare of collectBareFilenameErrors(text, folder)) errors.push(`${name}/${file}: ${bare}`)
    }
    const adapter = join(folder, 'agents', 'openai.yaml')
    if (!existsSync(adapter)) errors.push(`${name}: missing agents/openai.yaml`)
    else {
      const adapterText = readFileSync(adapter, 'utf8')
      const implicit = explicit ? /allow_implicit_invocation:\s*false/u : /allow_implicit_invocation:\s*true/u
      if (!implicit.test(adapterText)) errors.push(`${name}: adapter implicit-invocation policy mismatch`)
      for (const issue of collectAdapterErrors(adapterText)) errors.push(`${name}: ${issue}`)
    }
  }
  return errors
}

export const SHORT_DESCRIPTION_MAX = 60

// Adapter interface fields shown in host pickers: both present, short, and phrased as a label.
export function collectAdapterErrors(adapterText) {
  const errors = []
  const field = (key) => {
    const match = new RegExp(`^\\s+${key}:\\s*(.*)$`, 'mu').exec(adapterText)
    return match ? match[1].trim().replace(/^(["'])(.*)\1$/u, '$2').trim() : ''
  }
  if (!field('display_name')) errors.push('adapter missing display_name')
  const short = field('short_description')
  if (!short) errors.push('adapter missing short_description')
  else {
    if (short.length > SHORT_DESCRIPTION_MAX) errors.push(`adapter short_description is ${short.length} characters (max ${SHORT_DESCRIPTION_MAX})`)
    if (short.endsWith('.')) errors.push('adapter short_description must not end with a period')
  }
  return errors
}

// Fenced code blocks hold examples and commands, not references; every Markdown check (and its
// tests) strips them through this one function so they cannot disagree.
export function stripFencedCode(text) {
  return text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gmu, '')
}

// Bare backtick filenames (no slash) that look like skill-bundled files must exist in the citing
// skill's own directory: a packaged skill must work when installed alone. A helper owned by another
// skill is named with a path (for example the `flow` skill's `lib/flow-block.mjs`), which this
// check leaves alone. Scope is deliberately narrow to avoid false positives on adopter-project
// names: script extensions (.sh, .mjs, .cjs, .js, .ts, .py) and lowercase-initial .md names only,
// so `AGENTS.md`, `PRODUCT.md`, `package.json`, and other project files are never checked.
export const BARE_FILENAME_PATTERN = /`([a-z0-9][A-Za-z0-9_.-]*\.(?:sh|mjs|cjs|js|ts|py|md))`/gu

export function collectBareFilenameErrors(text, skillDir) {
  const errors = []
  const known = skillFileNames(skillDir)
  for (const name of new Set([...text.matchAll(BARE_FILENAME_PATTERN)].map((match) => match[1]))) {
    if (!known.has(name)) errors.push(`bare filename \`${name}\` not found in this skill's directory`)
  }
  return errors
}

const skillFileNameCache = new Map()
function skillFileNames(skillDir) {
  const key = resolve(skillDir)
  if (!skillFileNameCache.has(key)) {
    const names = new Set()
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(join(dir, entry.name))
        else names.add(entry.name)
      }
    }
    walk(key)
    skillFileNameCache.set(key, names)
  }
  return skillFileNameCache.get(key)
}

// `start` lists its verification checks in a table whose first column is "Check"; the IDs must
// equal ESSENTIAL_CHECK_IDS in lib/commit-gate.mjs so the gate and the prose cannot drift.
export function collectCheckTableErrors(skillMarkdown, essentialIds = ESSENTIAL_CHECK_IDS) {
  const lines = skillMarkdown.split(/\r?\n/u)
  const header = lines.findIndex((line) => /^\|\s*Check\s*\|/u.test(line))
  if (header === -1) return ['start/SKILL.md: missing check table (header row starting with "| Check |")']
  const ids = []
  for (const line of lines.slice(header + 2)) {
    if (!line.startsWith('|')) break
    ids.push(line.split('|')[1].trim().replace(/^`(.*)`$/u, '$1'))
  }
  const missing = essentialIds.filter((id) => !ids.includes(id))
  const extra = ids.filter((id) => !essentialIds.includes(id))
  const errors = []
  if (missing.length) errors.push(`start/SKILL.md: check table missing ESSENTIAL_CHECK_IDS ${missing.join(', ')}`)
  if (extra.length) errors.push(`start/SKILL.md: check table has IDs not in ESSENTIAL_CHECK_IDS ${extra.join(', ')}`)
  return errors
}

function listMarkdownAndSupportFiles(folder) {
  const out = []
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (entry.isFile()) out.push(entry.name)
    else if (entry.isDirectory() && entry.name !== 'agents') {
      for (const nested of readdirSync(join(folder, entry.name), { withFileTypes: true })) if (nested.isFile()) out.push(`${entry.name}/${nested.name}`)
    }
  }
  return out
}

const DECISION_STATUSES = ['accepted', 'proposed', 'superseded', 'amended', 'deprecated', 'rejected', 'withdrawn', 'dropped']

/** A decision's status word, from YAML front matter or a `Status:` line; the website reads the same. */
export const decisionStatus = (text) => {
  const raw = text.match(/^---\n[\s\S]*?^status:\s*(\S+)[\s\S]*?^---$/mu)?.[1] ?? text.match(/^\**Status:?\**:?\s*(.+)$/mu)?.[1] ?? ''
  return raw.replace(/[*_`]/gu, '').match(/^[a-z]+/iu)?.[0]?.toLowerCase() ?? ''
}

// Spec 061: an accepted spec whose Tasks checklist is all ticked has shipped without its status changing.
export function collectSpecStatusErrors(file, text) {
  if (decisionStatus(text) !== 'accepted') return []
  const tasks = /^##[ \t]+Tasks[ \t]*\r?\n([\s\S]*?)(?=^##[ \t]|(?![\s\S]))/mu.exec(text)?.[1] ?? ''
  const boxes = [...tasks.matchAll(/^[ \t]*[-*+][ \t]+\[([ xX])\]/gmu)].map((match) => match[1])
  if (!boxes.length || boxes.some((box) => box === ' ')) return []
  return [`docs/specs/${file}: every task is ticked but the spec is still accepted; set \`Status: implemented\``]
}

// Specs and decisions: well-formed names, unique numbers (parallel sessions pick "next free number"
// independently), an index entry, and a known decision status, so a missing link fails locally instead of in CI.
export function collectRecordErrors(docsDir) {
  const errors = []
  for (const [folder, digits] of [['decisions', 4], ['specs', 3]]) {
    const path = join(docsDir, folder)
    if (!existsSync(path)) continue
    const readme = join(path, 'README.md')
    const index = existsSync(readme) ? readFileSync(readme, 'utf8') : null
    const seen = new Map()
    for (const file of readdirSync(path).filter((file) => file.endsWith('.md') && file !== 'README.md').sort()) {
      if (!new RegExp(`^\\d{${digits}}-[a-z0-9-]+\\.md$`, 'u').test(file)) { errors.push(`docs/${folder}/${file}: name must match ${'N'.repeat(digits)}-short-name.md`); continue }
      const number = file.slice(0, digits)
      if (seen.has(number)) errors.push(`docs/${folder}/${file}: number ${number} already used by ${seen.get(number)}; renumber to the next free number`)
      else seen.set(number, file)
      if (index !== null && !index.includes(file)) errors.push(`docs/${folder}/${file}: link it from docs/${folder}/README.md`)
      if (folder === 'decisions' && !DECISION_STATUSES.includes(decisionStatus(readFileSync(join(path, file), 'utf8')))) {
        errors.push(`docs/${folder}/${file}: start with a status line, for example "Status: **Accepted** (YYYY-MM-DD)", using one of ${DECISION_STATUSES.join(', ')}`)
      }
      if (folder === 'specs') {
        const text = readFileSync(join(path, file), 'utf8')
        errors.push(...collectSpecStatusErrors(file, text))
      }
    }
  }
  return errors
}

// Dogfooding: Claude Code loads skills from .claude/skills, which must point at the source tree.
export function collectSkillsLinkErrors(repoRoot) {
  const link = join(repoRoot, '.claude', 'skills')
  if (!existsSync(link) || realpathSync(link) !== realpathSync(join(repoRoot, 'skills'))) {
    return ['.claude/skills must link to skills/ (run: ln -s ../skills .claude/skills)']
  }
  return []
}

// A user-level install shadows .claude/skills in Claude Code, so dogfooding silently runs an older catalog.
// Warning only: CI and contributors without a user-level install see nothing.
export function collectShadowedSkillWarnings(repoRoot, userSkills = join(homedir(), '.claude', 'skills')) {
  const stale = EXPECTED_SKILL_NAMES.filter((name) => {
    const installed = join(userSkills, name, 'SKILL.md')
    return existsSync(installed) && readFileSync(installed, 'utf8') !== readFileSync(join(repoRoot, 'skills', name, 'SKILL.md'), 'utf8')
  })
  return stale.length ? [`${userSkills} shadows skills/ with older copies of: ${stale.join(', ')}. Refresh with \`npx skills update -g\` or remove them.`] : []
}

export function collectFixtureNestedGitErrors(repoRoot) {
  const errors = []
  const fixturesRoot = join(repoRoot, 'tests', 'fixtures')
  if (!existsSync(fixturesRoot)) return errors
  const walk = (dir, rel = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' && entry.isDirectory()) {
        errors.push(`${join('tests/fixtures', rel, '.git').replace(/^\.\//u, '')}: remove nested .git; init in a throwaway clone per fixture README`)
        continue
      }
      if (entry.isDirectory()) walk(join(dir, entry.name), rel ? `${rel}/${entry.name}` : entry.name)
    }
  }
  walk(fixturesRoot)
  return errors
}

const pluginScripts = (handler, variable) => {
  const line = [handler?.command, ...(handler?.args ?? [])].join(' ')
  return [...line.matchAll(new RegExp(`\\$\\{${variable}\\}"?/([^\\s"']+)`, 'gu'))].map((match) => match[1])
}

const checkManifest = (errors, manifest, rel, pkg) => {
  if (!manifest) return
  if (manifest.name !== 'flow') errors.push(`${rel}: name must be "flow", found ${JSON.stringify(manifest.name)}`)
  if (pkg && manifest.version !== pkg.version) errors.push(`${rel}: version ${manifest.version} must match package.json ${pkg.version}`)
}

// Plugin shell: each manifest names the plugin `flow` at package.json's version, and every hook command that
// runs a script under the host's plugin-root variable points at a file that exists.
export function collectPluginErrors(repoRoot) {
  const errors = []
  const readJson = (rel) => {
    const path = join(repoRoot, rel)
    if (!existsSync(path)) { errors.push(`${rel}: missing`); return null }
    try { return JSON.parse(readFileSync(path, 'utf8')) } catch (e) { errors.push(`${rel}: invalid JSON (${e.message})`); return null }
  }
  const pkg = readJson('package.json')
  checkManifest(errors, readJson('.claude-plugin/plugin.json'), '.claude-plugin/plugin.json', pkg)
  checkManifest(errors, readJson('.cursor-plugin/plugin.json'), '.cursor-plugin/plugin.json', pkg)
  const hooks = readJson('hooks/hooks.json')
  if (hooks) {
    if (!hooks.hooks || typeof hooks.hooks !== 'object') errors.push('hooks/hooks.json: must wrap the event map in a top-level "hooks" key')
    else for (const [event, groups] of Object.entries(hooks.hooks)) {
      if (!Array.isArray(groups)) { errors.push(`hooks/hooks.json: ${event} must be an array of matcher groups`); continue }
      for (const group of groups) for (const handler of group?.hooks ?? []) {
        const scripts = pluginScripts(handler, 'CLAUDE_PLUGIN_ROOT')
        if (handler.type === 'command' && !scripts.length) errors.push(`hooks/hooks.json: ${event} command must run a script under \${CLAUDE_PLUGIN_ROOT}`)
        for (const script of scripts) if (!existsSync(join(repoRoot, script))) errors.push(`hooks/hooks.json: ${event} references missing ${script}`)
      }
    }
  }
  const cursorHooks = readJson('hooks/cursor-hooks.json')
  if (cursorHooks) {
    if (!cursorHooks.hooks || typeof cursorHooks.hooks !== 'object') errors.push('hooks/cursor-hooks.json: must wrap the event map in a top-level "hooks" key')
    else for (const event of ['beforeShellExecution', 'sessionStart']) {
      const handlers = cursorHooks.hooks[event]
      if (!Array.isArray(handlers)) { errors.push(`hooks/cursor-hooks.json: ${event} must be an array of commands`); continue }
      for (const handler of handlers) {
        const scripts = pluginScripts(handler, 'CURSOR_PLUGIN_ROOT')
        if (!scripts.length) errors.push(`hooks/cursor-hooks.json: ${event} command must run a script under \${CURSOR_PLUGIN_ROOT}`)
        for (const script of scripts) if (!existsSync(join(repoRoot, script))) errors.push(`hooks/cursor-hooks.json: ${event} references missing ${script}`)
      }
    }
  }
  return errors
}

// Spec 059: every SKILL.md the catalog loads, summed, stays within this many words (counted as `pnpm metrics` counts them).
export const SKILL_WORD_BUDGET = 10_000

export function collectSkillWordErrors(skillsDir, budget = SKILL_WORD_BUDGET) {
  const words = skillWords(skillsDir)
  if (!words || words.total <= budget) return []
  return [`skills: SKILL.md words total ${words.total}, over the ${budget} budget (largest: ${words.largest.map(([n, c]) => `${n} ${c}`).join(', ')})`]
}

// Plugin agents (agents/*.md) need front matter with a name and a description, or the host skips them.
export function collectAgentErrors(repoRoot) {
  const dir = join(repoRoot, 'agents')
  if (!existsSync(dir)) return []
  const errors = []
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const text = readFileSync(join(dir, file), 'utf8')
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(text)
    if (!frontmatter) { errors.push(`agents/${file}: missing frontmatter`); continue }
    for (const key of ['name', 'description']) {
      if (!new RegExp(`^${key}:[ \\t]*\\S`, 'mu').test(frontmatter[1])) errors.push(`agents/${file}: frontmatter ${key} required`)
    }
  }
  return errors
}

export function validateRepository(repoRoot) {
  const errors = validateSkills(join(repoRoot, 'skills'))
  errors.push(...collectDocLinkErrors(join(repoRoot, 'docs')))
  errors.push(...collectRecordErrors(join(repoRoot, 'docs')))
  const startSkill = join(repoRoot, 'skills', 'start', 'SKILL.md')
  if (existsSync(startSkill)) errors.push(...collectCheckTableErrors(readFileSync(startSkill, 'utf8')))
  else errors.push('skills/start/SKILL.md: missing')
  errors.push(...collectSkillsLinkErrors(repoRoot))
  errors.push(...collectCatalogPhraseErrors(repoRoot))
  errors.push(...collectBrandMarkErrors(repoRoot))
  errors.push(...collectFixtureNestedGitErrors(repoRoot))
  errors.push(...collectPluginErrors(repoRoot))
  errors.push(...collectAgentErrors(repoRoot))
  errors.push(...collectSkillWordErrors(join(repoRoot, 'skills')))
  return errors
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const errors = validateRepository(repoRoot)
  for (const warning of collectShadowedSkillWarnings(repoRoot)) console.warn(`warning: ${warning}`)
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log(`Validated ${EXPECTED_SKILL_NAMES.length} skills, documentation links, local references, adapters, record names and indexes, spec status, catalog phrases, brand mark geometry, fixture layout, the plugin manifest, hooks, and agents, start's check table, and the ${SKILL_WORD_BUDGET}-word skill budget (${skillWords(join(repoRoot, 'skills')).total} words).`)
}
