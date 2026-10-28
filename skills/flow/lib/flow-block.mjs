// Idempotent writer for the project Flow block (decision 0020).
// Usage: node flow-block.mjs <project-dir> [local|pull-request]
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
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

export function buildFlowBlock({ delivery } = {}) {
  const mode = DELIVERY_MODES.includes(delivery) ? delivery : 'unset'
  return [
    BEGIN,
    '## Flow',
    '',
    'This project uses Flow skills. Say a phrase to load its skill; the installed `flow` skill describes this block. Delete the block to opt out.',
    '',
    `Delivery: ${mode}`,
    '',
    '| Say | Skill |',
    '| --- | --- |',
    ...PHRASES.map(([say, skill]) => `| ${say} | \`${skill}\` |`),
    END,
  ].join('\n')
}

function locate(text) {
  const begins = text.split(BEGIN).length - 1
  const ends = text.split(END).length - 1
  if (begins === 0 && ends === 0) return null
  const start = text.indexOf(BEGIN)
  const end = text.indexOf(END)
  if (begins !== 1 || ends !== 1 || end < start) throw new Error('Malformed Flow block markers; fix them by hand before re-running.')
  return { start, end: end + END.length }
}

// Returns the recorded mode, or null when the block is missing or unset.
export function readDelivery(text) {
  const at = locate(text)
  if (!at) return null
  const match = /^Delivery:\s*(\S+)/mu.exec(text.slice(at.start, at.end))
  return match && DELIVERY_MODES.includes(match[1]) ? match[1] : null
}

// Replaces the block in place or appends it; text outside the markers is preserved byte for byte.
export function upsertFlowBlock(text, { delivery } = {}) {
  const block = buildFlowBlock({ delivery: delivery ?? readDelivery(text) })
  const at = locate(text)
  if (at) return text.slice(0, at.start) + block + text.slice(at.end)
  if (!text) return `${block}\n`
  return `${text}${text.endsWith('\n') ? '' : '\n'}\n${block}\n`
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
  return { file, changed: after !== before }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [dir = '.', delivery] = process.argv.slice(2)
  if (delivery && !DELIVERY_MODES.includes(delivery)) {
    console.error(`Delivery must be one of: ${DELIVERY_MODES.join(', ')}`)
    process.exit(1)
  }
  const { file, changed } = writeFlowBlock(resolve(dir), { delivery })
  console.log(`${changed ? 'Updated' : 'Unchanged'}: ${file}`)
}
