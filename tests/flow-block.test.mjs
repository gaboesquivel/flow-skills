import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { BEGIN, END, buildFlowBlock, describeLayout, ensureImport, instructionFile, readDelivery, upsertFlowBlock, writeFlowBlock } from '../skills/flow/lib/flow-block.mjs'

const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')

test('block has markers, a Delivery line, the flow pointer, and stays short', () => {
  const block = buildFlowBlock()
  assert.ok(block.startsWith(BEGIN) && block.endsWith(END))
  assert.match(block, /^Delivery: unset$/mu)
  assert.doesNotMatch(block, /^Process:/mu)
  assert.match(block, /`flow` skill/u)
  assert.match(block, /"ship it".*`ship`/u)
  assert.ok(block.split('\n').length <= 25)
})

test('upsert appends once, then updates in place without touching outside text', () => {
  const original = '# Project\n\nKeep this.\n'
  const once = upsertFlowBlock(original)
  assert.ok(once.startsWith(original))
  assert.equal(upsertFlowBlock(once), once)
  const edited = `${once}\n## After\n`.replace('Delivery: unset', 'Delivery: stale')
  const updated = upsertFlowBlock(edited, { delivery: 'local' })
  assert.equal(updated.split(BEGIN).length, 2)
  assert.ok(updated.startsWith(original) && updated.endsWith('\n## After\n'))
  assert.equal(readDelivery(updated), 'local')
})

test('re-running keeps a recorded delivery mode unless overridden', () => {
  const local = upsertFlowBlock('', { delivery: 'local' })
  assert.equal(readDelivery(upsertFlowBlock(local)), 'local')
  assert.equal(readDelivery(upsertFlowBlock(local, { delivery: 'pull-request' })), 'pull-request')
  assert.equal(readDelivery('no block here'), null)
})

test('rewriting drops retired Deploy and Process lines and keeps Delivery', () => {
  const old = `# Project\n\n${upsertFlowBlock('', { delivery: 'local' }).replace('Delivery: local', 'Delivery: local\nDeploy: vercel\nProcess: full')}\nAfter.\n`
  assert.match(old, /^Deploy: vercel$/mu)
  assert.match(old, /^Process: full$/mu)
  const rewritten = upsertFlowBlock(old)
  assert.doesNotMatch(rewritten, /^Deploy:/mu)
  assert.doesNotMatch(rewritten, /^Process:/mu)
  assert.equal(readDelivery(rewritten), 'local')
  assert.ok(rewritten.startsWith('# Project\n\n') && rewritten.endsWith('\nAfter.\n'))
  assert.equal(upsertFlowBlock(rewritten), rewritten)
})

test('malformed markers are refused', () => {
  assert.throws(() => upsertFlowBlock(`${BEGIN}\nhalf a block\n`), /Malformed/u)
  assert.throws(() => upsertFlowBlock(`${END}\n${BEGIN}\n`), /Malformed/u)
})

test('markers inside fenced code blocks are ignored', () => {
  const doc = `# Docs\n\n\`\`\`markdown\n${BEGIN}\nexample\n${END}\n\`\`\`\n\n~~~\n${BEGIN}\n~~~\n`
  const once = upsertFlowBlock(doc)
  assert.ok(once.startsWith(doc))
  const local = upsertFlowBlock(once, { delivery: 'local' })
  assert.ok(local.startsWith(doc))
  assert.equal(readDelivery(local), 'local')
})

test('CRLF files keep CRLF line endings', () => {
  const doc = '# Project\r\n\r\nKeep this.\r\n'
  const once = upsertFlowBlock(doc, { delivery: 'local' })
  assert.ok(once.startsWith(doc))
  assert.doesNotMatch(once.replaceAll('\r\n', ''), /\n/u)
  assert.equal(upsertFlowBlock(once), once)
  assert.equal(readDelivery(once), 'local')
})

test('Delivery is read case-insensitively and normalized', () => {
  const block = (line) => `${BEGIN}\n${line}\n${END}\n`
  assert.equal(readDelivery(block('delivery: LOCAL')), 'local')
  assert.equal(readDelivery(block('Delivery: Pull Request')), 'pull-request')
  assert.equal(readDelivery(block('DELIVERY: pull_request')), 'pull-request')
  assert.equal(readDelivery(block('Delivery: unset')), null)
  assert.match(upsertFlowBlock(block('delivery: Local')), /^Delivery: local$/mu)
})

test('writes AGENTS.md, or CLAUDE.md when it is the only instruction file', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-block-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  writeFileSync(join(dir, 'CLAUDE.md'), '# Claude\n')
  assert.equal(writeFlowBlock(dir).file, join(dir, 'CLAUDE.md'))
  assert.equal(writeFlowBlock(dir).changed, false)
  writeFileSync(join(dir, 'AGENTS.md'), '# Agents\n')
  const { file } = writeFlowBlock(dir, { delivery: 'pull-request' })
  assert.equal(file, join(dir, 'AGENTS.md'))
  assert.equal(readDelivery(readFileSync(file, 'utf8')), 'pull-request')
})

const git = (cwd, ...args) => {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
}

function repo(t, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'flow-block-git-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  git(dir, 'init', '-q')
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text)
  return dir
}

test('tracked AGENTS.md holds the block and CLAUDE.md is not created', (t) => {
  const dir = repo(t, { 'AGENTS.md': '# Agents\n' })
  git(dir, 'add', 'AGENTS.md')
  assert.equal(instructionFile(dir), join(dir, 'AGENTS.md'))
  writeFlowBlock(dir, { delivery: 'local' })
  assert.equal(ensureImport(dir).changed, false)
  assert.equal(existsSync(join(dir, 'CLAUDE.md')), false)
  assert.deepEqual(describeLayout(dir), { blockFile: 'AGENTS.md', tracked: true, imports: [] })
})

test('ignored AGENTS.md: the block goes in CLAUDE.md, which imports AGENTS.md and keeps adopter text', (t) => {
  const adopter = 'Append each prompt to prompts.txt.\n'
  const dir = repo(t, { '.gitignore': 'AGENTS.md\n', 'AGENTS.md': '# Generated\n', 'CLAUDE.md': adopter })
  assert.equal(instructionFile(dir), join(dir, 'CLAUDE.md'))
  const { file } = writeFlowBlock(dir, { delivery: 'local' })
  assert.equal(file, join(dir, 'CLAUDE.md'))
  assert.equal(readFileSync(join(dir, 'AGENTS.md'), 'utf8'), '# Generated\n')
  assert.equal(ensureImport(dir).changed, true)
  const text = readFileSync(file, 'utf8')
  assert.ok(text.startsWith(`@AGENTS.md\n${adopter}`))
  assert.equal(readDelivery(text), 'local')
  assert.equal(ensureImport(dir).changed, false)
  assert.equal(readFileSync(file, 'utf8'), text)
  assert.deepEqual(describeLayout(dir), { blockFile: 'CLAUDE.md', tracked: true, imports: ['@AGENTS.md'] })
})

test('an ignored AGENTS.md that is not generated yet still gets the import', (t) => {
  const dir = repo(t, { '.gitignore': 'AGENTS.md\n', 'CLAUDE.md': '# Claude\r\n' })
  assert.equal(ensureImport(dir).changed, true)
  assert.equal(readFileSync(join(dir, 'CLAUDE.md'), 'utf8'), '@AGENTS.md\r\n# Claude\r\n')
})

test('with no instruction file the block goes in a new CLAUDE.md', (t) => {
  const dir = repo(t)
  assert.equal(instructionFile(dir), join(dir, 'CLAUDE.md'))
  writeFlowBlock(dir, { delivery: 'pull-request' })
  assert.equal(ensureImport(dir).changed, false)
  assert.equal(existsSync(join(dir, 'AGENTS.md')), false)
  assert.deepEqual(describeLayout(dir), { blockFile: 'CLAUDE.md', tracked: true, imports: [] })
})

test('layout reports an ignored block file as untracked', (t) => {
  const dir = repo(t, { '.gitignore': 'CLAUDE.md\n', 'CLAUDE.md': '# Claude\n' })
  assert.equal(describeLayout(dir).tracked, false)
})

test('CLI writes the block when run through a symlinked skills directory', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-block-cli-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const project = join(dir, 'project')
  mkdirSync(project)
  symlinkSync(skillsRoot, join(dir, 'skills-link'))
  const run = spawnSync(process.execPath, [join(dir, 'skills-link', 'flow', 'lib', 'flow-block.mjs'), project, 'local'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  assert.match(run.stdout, /Wrote: .*CLAUDE\.md/u)
  assert.equal(readDelivery(readFileSync(join(project, 'CLAUDE.md'), 'utf8')), 'local')
})

test('CLI wires the import and prints the layout', (t) => {
  const dir = repo(t, { '.gitignore': 'AGENTS.md\n', 'CLAUDE.md': '# Claude\n' })
  const run = spawnSync(process.execPath, [join(skillsRoot, 'flow', 'lib', 'flow-block.mjs'), dir, 'local'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  assert.match(run.stdout, /Wrote: .*CLAUDE\.md/u)
  assert.match(run.stdout, /Imported: @AGENTS\.md/u)
  assert.match(run.stdout, /Layout: .*"blockFile":"CLAUDE\.md".*"tracked":true.*"@AGENTS\.md"/u)
})
