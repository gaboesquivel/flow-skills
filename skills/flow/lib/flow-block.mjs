// Idempotent writer for the project Flow block (decision 0020).
// Usage: node flow-block.mjs <project-dir> [local|pull-request]
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BEGIN = '<!-- BEGIN FLOW -->'
export const END = '<!-- END FLOW -->'
export const DELIVERY_MODES = ['pull-request', 'local']

const PHRASES = [
  ['"explore this"', 'explore'],
  ['"interview me"', 'interview'],
  ['"grill this"', 'grill'],
  ['"spec it"', 'to-spec'],
  ['"break it down"', 'to-tasks'],
  ['"build it"', 'implement'],
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

// Returns the recorded mode, or null when the block is missing or unset.
export function readDelivery(text) {
  const at = locate(text)
  if (!at) return null
  const match = /^Delivery:[ \t]*(.*)$/imu.exec(text.slice(at.start, at.end))
  return match ? normalizeDelivery(match[1]) : null
}

// Replaces the block in place or appends it; text outside the markers is preserved byte for byte.
export function upsertFlowBlock(text, { delivery } = {}) {
  const eol = eolOf(text)
  const block = buildFlowBlock({ delivery: normalizeDelivery(delivery) ?? readDelivery(text), eol })
  const at = locate(text)
  if (at) return text.slice(0, at.start) + block + text.slice(at.end)
  if (!text) return `${block}${eol}`
  return `${text}${text.endsWith('\n') ? '' : eol}${eol}${block}${eol}`
}

// AGENTS.md, or CLAUDE.md when that is the only instruction file.
export function instructionFile(projectDir) {
  const agents = join(projectDir, 'AGENTS.md')
  const claude = join(projectDir, 'CLAUDE.md')
  return !existsSync(agents) && existsSync(claude) ? claude : agents
}

export function writeFlowBlock(projectDir, { delivery } = {}) {
  const file = instructionFile(projectDir)
  const before = existsSync(file) ? readFileSync(file, 'utf8') : ''
  const after = upsertFlowBlock(before, { delivery })
  if (after !== before) writeFileSync(file, after)
  const claude = join(projectDir, 'CLAUDE.md')
  const warning = file !== claude && existsSync(claude) && !/^\s*@AGENTS\.md\b/mu.test(readFileSync(claude, 'utf8'))
    ? 'CLAUDE.md does not import AGENTS.md, so Claude Code may not see the Flow block; add a line "@AGENTS.md" to CLAUDE.md.'
    : null
  return { file, changed: after !== before, warning }
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
  const { file, changed, warning } = writeFlowBlock(resolve(dir), { delivery })
  console.log(`${changed ? 'Wrote' : 'Unchanged'}: ${file}`)
  if (warning) console.warn(`warning: ${warning}`)
}
