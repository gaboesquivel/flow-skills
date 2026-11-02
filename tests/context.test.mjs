import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { frontMatter, measure } from '../skills/retro/context.mjs'

const fixture = new URL('fixtures/context-report/', import.meta.url).pathname
const m = measure(fixture)

test('instruction files follow @ imports and count each file once', () => {
  assert.deepEqual(m.alwaysLoaded.instructions.map((f) => f.path), ['CLAUDE.md', 'AGENTS.md', 'docs/guide.md'])
})

test('the skill listing leaves out skills the model cannot start', () => {
  assert.equal(m.alwaysLoaded.listedSkills, 3)
})

test('the Flow block is measured on its own', () => {
  assert.ok(m.onDemand.flowBlockTokens > 0)
})

test('install drift against the lock is reported both ways', () => {
  assert.deepEqual(m.hygiene.notInLock, ['alpha-extra', 'gamma'])
  assert.deepEqual(m.hygiene.lockedNotInstalled, ['delta'])
})

test('description, trigger, and name problems are reported', () => {
  assert.deepEqual(m.hygiene.longDescriptions.map((d) => d.name), ['alpha-extra'])
  assert.deepEqual(m.hygiene.noTrigger, ['beta'])
  assert.deepEqual(m.hygiene.badNames, ['gamma'])
})

test('names that extend another skill are a possible overlap', () => {
  assert.deepEqual(m.hygiene.overlaps.map((p) => p.skills), [['alpha', 'alpha-extra']])
})

test('a skill a document calls user-invoked but the model can start is reported', () => {
  assert.deepEqual(m.hygiene.userInvokedButListed, ['beta'])
})

test('folded descriptions parse to one line', () => {
  assert.equal(frontMatter('---\nname: x\ndescription: >-\n  one\n  two\n---\n').description, 'one two')
})

test('AGENTS.md without CLAUDE.md is information, not a budget breach', () => {
  const dir = mkdtempSync(join(tmpdir(), 'context-'))
  writeFileSync(join(dir, 'AGENTS.md'), '# Agents\n')
  const bare = measure(dir)
  assert.equal(bare.hygiene.agentsWithoutClaude, true)
  assert.equal(bare.over.alwaysLoaded, false)
  assert.deepEqual(bare.alwaysLoaded.instructions.map((f) => f.path), ['AGENTS.md'])
})
