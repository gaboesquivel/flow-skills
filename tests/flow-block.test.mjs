import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { BEGIN, END, buildFlowBlock, readDelivery, upsertFlowBlock, writeFlowBlock } from '../skills/flow/lib/flow-block.mjs'

test('block has markers, a Delivery line, the flow pointer, and stays short', () => {
  const block = buildFlowBlock()
  assert.ok(block.startsWith(BEGIN) && block.endsWith(END))
  assert.match(block, /^Delivery: unset$/mu)
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

test('malformed markers are refused', () => {
  assert.throws(() => upsertFlowBlock(`${BEGIN}\nhalf a block\n`), /Malformed/u)
  assert.throws(() => upsertFlowBlock(`${END}\n${BEGIN}\n`), /Malformed/u)
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
