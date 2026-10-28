// Idempotent writer for the project Flow block (decision 0020) and the instruction-file layout (spec 021).
// Usage: node flow-block.mjs <project-dir> [local|pull-request]
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BEGIN = '<!-- BEGIN FLOW -->'
export const END = '<!-- END FLOW -->'
export const DELIVERY_MODES = ['pull-request', 'local']

// The one phrase table; docs link here and tests check each phrase against its skill's description.
export const PHRASES = [
  ['"explore this"', 'explore'],
  ['"interview me"', 'interview'],
  ['"grill this"', 'grill'],
  ['"spec it"', 'to-spec'],
  ['"break it down"', 'to-tasks'],
  ['"build it"', 'build'],
  ['"check it against the spec"', 'review'],
  ['"ship it" (add "local" or "with a PR" for one run)', 'ship'],
  ['"update the docs"', 'flow'],
]

const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n')

export function normalizeDelivery(value) {
  const mode = String(value ?? '').trim().toLowerCase().replace(/[\s_]+/gu, '-')
  if (mode === 'pr' || mode === 'pullrequest') return 'pull-request'
  return DELIVERY_MODES.includes(mode) ? mode : null
}

export function buildFlowBlock({ delivery, eol = '\n' } = {}) {
  return [
    BEGIN,
    '## Flow',
    '',
    'This project uses Flow skills. Say a phrase to load its skill; the installed `flow` skill describes this block. Delete the block to opt out.',
    '',
    `Delivery: ${normalizeDelivery(delivery) ?? 'unset'}`,
    '',
    '| Say | Skill |',
    '| --- | --- |',
    ...PHRASES.map(([say, skill]) => `| ${say} | \`${skill}\` |`),
    END,
  ].join(eol)
}

// Offsets of each marker that sits outside fenced code blocks.
function markerOffsets(text, marker) {
  const offsets = []
  let fence = null
  let offset = 0
  for (const line of text.split('\n')) {
    const open = /^\s{0,3}(`{3,}|~{3,})/u.exec(line)
    if (fence) {
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length) fence = null
    } else if (open) fence = open[1]
    else {
      const at = line.indexOf(marker)
      if (at !== -1) offsets.push(offset + at)
    }
    offset += line.length + 1
  }
  return offsets
}

function locate(text) {
  const begins = markerOffsets(text, BEGIN)
  const ends = markerOffsets(text, END)
  if (begins.length === 0 && ends.length === 0) return null
  if (begins.length !== 1 || ends.length !== 1 || ends[0] < begins[0]) throw new Error('Malformed Flow block markers; fix them by hand before re-running.')
  return { start: begins[0], end: ends[0] + END.length }
}

function readLine(text, name) {
  const at = locate(text)
  if (!at) return null
  return new RegExp(`^${name}:[ \\t]*(.*)$`, 'imu').exec(text.slice(at.start, at.end))?.[1] ?? null
}

// Return the recorded value, or null when the block is missing or unset.
export const readDelivery = (text) => normalizeDelivery(readLine(text, 'Delivery'))

// Replaces the block in place or appends it; text outside the markers is preserved byte for byte.
// Retired lines (`Deploy:`, decision 0028; `Process:`, decision 0036) are dropped because the block is rebuilt from its known lines.
export function upsertFlowBlock(text, { delivery } = {}) {
  const eol = eolOf(text)
  const block = buildFlowBlock({ delivery: normalizeDelivery(delivery) ?? readDelivery(text), eol })
  const at = locate(text)
  if (at) return text.slice(0, at.start) + block + text.slice(at.end)
  if (!text) return `${block}${eol}`
  return `${text}${text.endsWith('\n') ? '' : eol}${eol}${block}${eol}`
}

// Exit status of `git <args>` in the project; 128 when it is not a Git work tree.
const git = (projectDir, ...args) => spawnSync('git', args, { cwd: projectDir, stdio: 'ignore' }).status
const isIgnored = (projectDir, name) => git(projectDir, 'check-ignore', '-q', name) === 0
const IMPORT = '@AGENTS.md'

// AGENTS.md when it exists and Git does not ignore it (a template may regenerate an ignored one); otherwise CLAUDE.md.
export function instructionFile(projectDir) {
  const agents = join(projectDir, 'AGENTS.md')
  return existsSync(agents) && !isIgnored(projectDir, 'AGENTS.md') ? agents : join(projectDir, 'CLAUDE.md')
}

export function writeFlowBlock(projectDir, { delivery } = {}) {
  const file = instructionFile(projectDir)
  const before = existsSync(file) ? readFileSync(file, 'utf8') : ''
  const after = upsertFlowBlock(before, { delivery })
  if (after !== before) writeFileSync(file, after)
  return { file, changed: after !== before }
}

// Adds `@AGENTS.md` as the first line of an existing CLAUDE.md when AGENTS.md exists or is ignored (generated);
// the rest of the file is untouched.
export function ensureImport(projectDir) {
  const file = join(projectDir, 'CLAUDE.md')
  const agentsWanted = existsSync(join(projectDir, 'AGENTS.md')) || isIgnored(projectDir, 'AGENTS.md')
  if (!existsSync(file) || !agentsWanted) return { file, changed: false }
  const text = readFileSync(file, 'utf8')
  if (/^[ \t]*@AGENTS\.md\b/mu.test(text)) return { file, changed: false }
  writeFileSync(file, `${IMPORT}${eolOf(text)}${text}`)
  return { file, changed: true }
}

// For the setup report: the block's file, whether Git will track it (in a work tree, not ignored), and CLAUDE.md's imports.
export function describeLayout(projectDir) {
  const blockFile = relative(projectDir, instructionFile(projectDir))
  const tracked = git(projectDir, 'rev-parse', '--is-inside-work-tree') === 0 && !isIgnored(projectDir, blockFile)
  const claude = join(projectDir, 'CLAUDE.md')
  const imports = existsSync(claude) ? readFileSync(claude, 'utf8').match(/^@\S+/gmu) ?? [] : []
  return { blockFile, tracked, imports }
}

const isMain = () => {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (isMain()) {
  const [dir = '.', delivery] = process.argv.slice(2)
  if (delivery && !normalizeDelivery(delivery)) {
    console.error(`Delivery must be one of: ${DELIVERY_MODES.join(', ')}`)
    process.exit(1)
  }
  const project = resolve(dir)
  const { file, changed } = writeFlowBlock(project, { delivery })
  console.log(`${changed ? 'Wrote' : 'Unchanged'}: ${file}`)
  if (ensureImport(project).changed) console.log(`Imported: ${IMPORT} in ${join(project, 'CLAUDE.md')}`)
  const layout = describeLayout(project)
  console.log(`Layout: ${JSON.stringify(layout)}`)
  if (!layout.tracked) console.warn(`warning: Git will not commit ${layout.blockFile}, so the Flow block stays out of the repository.`)
}
