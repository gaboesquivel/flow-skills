import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { frontMatter, measure } from '../scripts/context.mjs'

const script = new URL('../scripts/context.mjs', import.meta.url).pathname
const scratch = () => mkdtempSync(join(tmpdir(), 'context-'))

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

test('total SKILL.md words are summed across installed skills against the budget', () => {
  assert.equal(m.onDemand.skillWords, m.onDemand.skills.reduce((sum, s) => sum + s.words, 0))
  assert.ok(m.onDemand.skillWords > 0)
  assert.equal(m.over.skillWords, false)
  const repo = measure(new URL('..', import.meta.url).pathname)
  assert.ok(repo.onDemand.skillWords <= 10_000, `catalog has ${repo.onDemand.skillWords} SKILL.md words`)
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

test('front matter survives a byte-order mark, wrapped plain text, and wrapped quotes', () => {
  assert.equal(frontMatter('\uFEFF---\nname: x\n---\n').name, 'x')
  assert.equal(frontMatter('---\ndescription: first line\n  continues here\nname: x\n---\n').description, 'first line continues here')
  assert.equal(frontMatter('---\ndescription: "quoted that\n  wraps"\n---\n').description, 'quoted that wraps')
})

test('imports inside code blocks and code spans are not loaded', () => {
  const dir = scratch()
  mkdirSync(join(dir, 'sub'))
  writeFileSync(join(dir, 'CLAUDE.md'), '@sub/a.md\n')
  writeFileSync(join(dir, 'sub', 'a.md'), 'See `@b.md` and\n```\n@c.md\n```\n@d.md\n')
  for (const f of ['b.md', 'c.md', 'd.md']) writeFileSync(join(dir, 'sub', f), 'x\n')
  assert.deepEqual(measure(dir).alwaysLoaded.instructions.map((f) => f.path), ['CLAUDE.md', join('sub', 'a.md'), join('sub', 'd.md')])
})

test('an unreadable or array-shaped lock does not throw or invent drift', () => {
  const dir = scratch()
  mkdirSync(join(dir, '.agents', 'skills', 'x'), { recursive: true })
  writeFileSync(join(dir, '.agents', 'skills', 'x', 'SKILL.md'), '---\nname: x\ndescription: Does x. Use when asked.\ndisable-model-invocation: True\n---\n')
  writeFileSync(join(dir, 'skills-lock.json'), '{bad')
  const bad = measure(dir)
  assert.equal(bad.hygiene.lockUnreadable, true)
  assert.deepEqual(bad.hygiene.notInLock, [])
  assert.equal(bad.alwaysLoaded.listedSkills, 0)
  writeFileSync(join(dir, 'skills-lock.json'), '{"skills":[{"name":"x"}]}')
  assert.deepEqual(measure(dir).hygiene.notInLock, [])
})

test('the script runs through a linked folder and without a --repo value', () => {
  const dir = scratch()
  symlinkSync(join(script, '..'), join(dir, 'linked'))
  const out = execFileSync(process.execPath, [join(dir, 'linked', 'context.mjs'), '--repo'], { cwd: fixture, encoding: 'utf8' })
  assert.match(out, /Always loaded/u)
})
