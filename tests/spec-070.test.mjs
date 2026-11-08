// Spec 070: deterministic checks only. They pin the rules and the block migration, not what a host does with them;
// the live cases are E44 (tests/evals/tasks/E44-task.md), pending.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { skillDescriptions } from '../scripts/check-catalog-phrases.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const fixture = join(root, 'tests', 'fixtures', 'e44-signal')
const read = (skill) => readFileSync(join(root, 'skills', skill, 'SKILL.md'), 'utf8')

test('each phrase reaches the skill that owns it, and bare "sync" reaches none', () => {
  const d = skillDescriptions(root)
  for (const phrase of ['check alignment', 'are we building the right thing', 'did it land', 'measure our progress']) assert.ok(d.align.includes(`"${phrase}"`), `align lacks "${phrase}"`)
  for (const phrase of ['sync the docs', 'update the docs', 'set up flow here']) assert.ok(d['sync-docs'].includes(`"${phrase}"`), `sync-docs lacks "${phrase}"`)
  for (const phrase of ['research x', 'competitors for x']) assert.ok(d.research.includes(`"${phrase}"`), `research lacks "${phrase}"`)
  for (const [name, text] of Object.entries(d)) assert.doesNotMatch(text, /"sync"/u, `${name} claims bare "sync"`)
  assert.equal(d.flow, undefined)
  assert.equal(d.product, undefined)
})

test('explore weighs what exists and separates experiment from pivot, without interview choreography', () => {
  const explore = read('explore')
  assert.match(explore, /how people solve the problem today/iu)
  assert.match(explore, /separates an experiment from a pivot/iu)
  assert.match(explore, /stop, or build a differentiated slice/iu)
  assert.match(explore, /Discussion alone writes nothing/iu)
  for (const gone of [/next three answers/iu, /give your guess/iu, /re-ask/iu, /only when the comparison could change/iu]) assert.doesNotMatch(explore, gone)
})

test('research writes only on an explicit request and never adopts', () => {
  const research = read('research')
  assert.match(research, /"Should we research…\?"[^\n]*write nothing/u)
  assert.match(research, /"Just tell me here"[^\n]*chat/u)
  assert.match(research, /not found in <source>/u)
  assert.match(research, /never adopts a recommendation, edits `PRODUCT.md`/u)
  assert.match(research, /update a current note on the same question rather than duplicating/iu)
})

test('align stays read-only and sync-docs writes', () => {
  assert.match(read('align'), /Read-only: never edit/u)
  assert.match(read('align'), /"Shipped, impact unknown" is a valid answer/u)
  assert.match(read('sync-docs'), /this skill writes/u)
})

test('acceptance covers only the identified work and its linked, disclosed records', () => {
  const build = read('build')
  assert.doesNotMatch(build, /accepts any \*\*Proposed\*\*/u)
  assert.match(build, /unrelated proposal on the branch gets no approval/u)
  assert.match(build, /authorized change needs no second yes/u)
  assert.match(build, /With no spec, a change that reverses or narrows an accepted commitment/u, 'unspecced direction-change protection kept')
  assert.match(read('to-spec'), /other Proposed record on the branch stays Proposed/u)
  assert.match(read('ship'), /unrelated proposal on the branch is neither accepted nor blocking/u)
})

test('the spec template carries an Outcome sentence for initiatives only', () => {
  const toSpec = read('to-spec')
  assert.match(toSpec, /\*\*Outcome\*\* \(initiatives only, never a typo or cleanup\)/u)
  const spec = readFileSync(join(fixture, 'docs', 'specs', '004-match-suggestions-one-board.md'), 'utf8')
  assert.match(spec, /\*\*Outcome:\*\* We want .+; we'll look at .+, and it informs .+\./u)
})

test("the fixture's pre-0070 Flow block is refreshed by the helper, keeping Delivery and team text", () => {
  const dir = mkdtempSync(join(tmpdir(), 'e44-signal-'))
  copyFileSync(join(fixture, 'AGENTS.md'), join(dir, 'AGENTS.md'))
  const before = readFileSync(join(dir, 'AGENTS.md'), 'utf8')
  const helper = join(root, 'skills', 'sync-docs', 'lib', 'flow-block.mjs')
  const first = spawnSync(process.execPath, [helper, dir], { encoding: 'utf8' })
  assert.equal(first.status, 0, first.stderr)
  assert.match(first.stdout, /^Wrote:/mu)
  const after = readFileSync(join(dir, 'AGENTS.md'), 'utf8')
  assert.match(after, /`sync-docs` skill owns this block/u)
  assert.match(after, /^Delivery: local$/mu)
  const outside = (text) => text.replace(/<!-- BEGIN FLOW -->[\s\S]*<!-- END FLOW -->/u, '')
  assert.equal(outside(after), outside(before), 'text outside the block is unchanged')
  const second = spawnSync(process.execPath, [helper, dir], { encoding: 'utf8' })
  assert.match(second.stdout, /^Unchanged:/mu)
  rmSync(dir, { recursive: true, force: true })
})
