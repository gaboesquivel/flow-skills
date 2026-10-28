import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { ESSENTIAL_CHECK_IDS } from '../skills/start/lib/commit-gate.mjs'
import {
  collectAdapterErrors,
  collectBareFilenameErrors,
  collectCheckTableErrors,
  collectRecordNumberErrors,
} from '../scripts/validate.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const skillsRoot = join(repoRoot, 'skills')
const fixtures = join(repoRoot, 'tests', 'fixtures', 'validate-checks')
const read = (path) => readFileSync(path, 'utf8')
const skillNames = readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)

test('adapter check catches a drifted adapter', () => {
  const errors = collectAdapterErrors(read(join(fixtures, 'drifted-openai.yaml')))
  assert.ok(errors.some((error) => /missing display_name/u.test(error)), errors.join('\n'))
  assert.ok(errors.some((error) => /short_description is \d+ characters \(max 60\)/u.test(error)), errors.join('\n'))
  assert.ok(errors.some((error) => /must not end with a period/u.test(error)), errors.join('\n'))
  assert.deepEqual(collectAdapterErrors('interface:\n  display_name: "X"\n'), ['adapter missing short_description'])
})

test('every catalog adapter passes the adapter check', () => {
  for (const name of skillNames) assert.deepEqual(collectAdapterErrors(read(join(skillsRoot, name, 'agents', 'openai.yaml'))), [], name)
})

test('bare filename check catches a missing script and ignores project files', () => {
  const errors = collectBareFilenameErrors(read(join(fixtures, 'skills', 'demo', 'SKILL.md')), join(fixtures, 'skills'))
  assert.deepEqual(errors, ['bare filename `find-polluter.sh` not found in any skill directory'])
})

test('every catalog skill file passes the bare filename check', () => {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : entry.name.endsWith('.md') ? [join(dir, entry.name)] : [])
  for (const file of walk(skillsRoot)) {
    const text = read(file).replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gmu, '')
    assert.deepEqual(collectBareFilenameErrors(text, skillsRoot), [], file)
  }
})

test('record number check catches duplicate spec and decision numbers', () => {
  const errors = collectRecordNumberErrors(join(fixtures, 'docs'))
  assert.equal(errors.length, 2, errors.join('\n'))
  assert.match(errors.join('\n'), /docs\/decisions\/0003-b\.md: number 0003 already used by 0003-a\.md/u)
  assert.match(errors.join('\n'), /docs\/specs\/007-b\.md: number 007 already used by 007-a\.md/u)
  assert.deepEqual(collectRecordNumberErrors(join(repoRoot, 'docs')), [])
})

test('check-table check catches drift from ESSENTIAL_CHECK_IDS', () => {
  const errors = collectCheckTableErrors(read(join(fixtures, 'start-drifted.md')))
  assert.equal(errors.length, 2, errors.join('\n'))
  assert.match(errors[0], /missing ESSENTIAL_CHECK_IDS build, eval/u)
  assert.doesNotMatch(errors[0], /\bqa\b/u)
  assert.match(errors[1], /not in ESSENTIAL_CHECK_IDS lint/u)
  assert.match(collectCheckTableErrors('no table here')[0], /missing check table/u)
})

test("start's check table matches ESSENTIAL_CHECK_IDS", () => {
  assert.ok(ESSENTIAL_CHECK_IDS.length > 0)
  assert.deepEqual(collectCheckTableErrors(read(join(skillsRoot, 'start', 'SKILL.md'))), [])
})
