import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { BEGIN, END, buildFlowBlock, normalizeDeploy, normalizeProcess, readDelivery, readDeploy, readProcess, upsertFlowBlock, writeFlowBlock } from '../skills/flow/lib/flow-block.mjs'

const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')

test('block has markers, a Delivery line, the flow pointer, and stays short', () => {
  const block = buildFlowBlock()
  assert.ok(block.startsWith(BEGIN) && block.endsWith(END))
  assert.match(block, /^Delivery: unset\nDeploy: unset\nProcess: unset$/mu)
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

test('re-running keeps a recorded deploy target unless overridden', () => {
  const vercel = upsertFlowBlock('', { deploy: 'Vercel' })
  assert.match(vercel, /^Deploy: vercel$/mu)
  assert.equal(readDeploy(upsertFlowBlock(vercel, { delivery: 'local' })), 'vercel')
  assert.equal(readDeploy(upsertFlowBlock(vercel, { deploy: 'none' })), 'none')
  assert.equal(readDeploy(upsertFlowBlock('')), null)
  assert.equal(readDeploy('no block here'), null)
})

test('invalid deploy targets are ignored', () => {
  for (const bad of ['', 'unset', 'my host', '-x', '../etc']) assert.equal(normalizeDeploy(bad), null)
  assert.equal(normalizeDeploy(' Fly '), 'fly')
  const vercel = upsertFlowBlock('', { deploy: 'vercel' })
  assert.equal(readDeploy(upsertFlowBlock(vercel, { deploy: 'my host' })), 'vercel')
})

test('re-running keeps a recorded process depth unless overridden', () => {
  const full = upsertFlowBlock('', { process: 'Full' })
  assert.match(full, /^Process: full$/mu)
  assert.equal(readProcess(upsertFlowBlock(full, { delivery: 'local', deploy: 'vercel' })), 'full')
  assert.equal(readProcess(upsertFlowBlock(full, { process: 'lite' })), 'lite')
  assert.equal(readProcess(upsertFlowBlock(full, { process: 'heavy' })), 'full')
  assert.equal(readProcess(upsertFlowBlock('')), null)
  assert.equal(readProcess('no block here'), null)
  for (const bad of ['', 'unset', 'heavy', 'lite full']) assert.equal(normalizeProcess(bad), null)
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

test('warns when CLAUDE.md does not import AGENTS.md', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-block-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  writeFileSync(join(dir, 'AGENTS.md'), '# Agents\n')
  writeFileSync(join(dir, 'CLAUDE.md'), '# Claude\n')
  assert.match(writeFlowBlock(dir).warning, /@AGENTS\.md/u)
  writeFileSync(join(dir, 'CLAUDE.md'), '@AGENTS.md\n')
  assert.equal(writeFlowBlock(dir).warning, null)
})

test('CLI writes the block when run through a symlinked skills directory', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-block-cli-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const project = join(dir, 'project')
  mkdirSync(project)
  symlinkSync(skillsRoot, join(dir, 'skills-link'))
  const run = spawnSync(process.execPath, [join(dir, 'skills-link', 'flow', 'lib', 'flow-block.mjs'), project, 'local'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  assert.match(run.stdout, /Wrote: .*AGENTS\.md/u)
  assert.equal(readDelivery(readFileSync(join(project, 'AGENTS.md'), 'utf8')), 'local')
})

test('CLI records --deploy and rejects an invalid target', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-block-cli-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const cli = join(skillsRoot, 'flow', 'lib', 'flow-block.mjs')
  const run = spawnSync(process.execPath, [cli, dir, '--deploy', 'netlify', 'local'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  const text = readFileSync(join(dir, 'AGENTS.md'), 'utf8')
  assert.equal(readDeploy(text), 'netlify')
  assert.equal(readDelivery(text), 'local')
  const bad = spawnSync(process.execPath, [cli, dir, '--deploy', 'my host'], { encoding: 'utf8' })
  assert.equal(bad.status, 1)
  assert.match(bad.stderr, /Deploy must be/u)
  assert.equal(spawnSync(process.execPath, [cli, dir, '--deploy'], { encoding: 'utf8' }).status, 1)
})

test('CLI records --process and rejects an invalid depth', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-block-cli-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const cli = join(skillsRoot, 'flow', 'lib', 'flow-block.mjs')
  const run = spawnSync(process.execPath, [cli, dir, '--process', 'full', '--deploy', 'none', 'pull-request'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  const text = readFileSync(join(dir, 'AGENTS.md'), 'utf8')
  assert.equal(readProcess(text), 'full')
  assert.equal(readDeploy(text), 'none')
  assert.equal(readDelivery(text), 'pull-request')
  const bad = spawnSync(process.execPath, [cli, dir, '--process', 'heavy'], { encoding: 'utf8' })
  assert.equal(bad.status, 1)
  assert.match(bad.stderr, /Process must be/u)
})
