import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { collectRecordNumberErrors, collectSkillsLinkErrors } from '../scripts/validate.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

test('repository has no duplicate decision or spec numbers', () => assert.deepEqual(collectRecordNumberErrors(join(repoRoot, 'docs')), []))

test('duplicate record numbers are reported with the fix', () => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-records-test-'))
  try {
    mkdirSync(join(dir, 'decisions'))
    mkdirSync(join(dir, 'specs'))
    writeFileSync(join(dir, 'decisions', '0019-a.md'), '')
    writeFileSync(join(dir, 'decisions', '0019-b.md'), '')
    writeFileSync(join(dir, 'specs', '009-a.md'), '')
    writeFileSync(join(dir, 'specs', 'README.md'), '')
    const errors = collectRecordNumberErrors(dir)
    assert.equal(errors.length, 1)
    assert.match(errors[0], /0019-b\.md: number 0019 already used by 0019-a\.md; renumber/u)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('.claude/skills links to the skill source', () => assert.deepEqual(collectSkillsLinkErrors(repoRoot), []))

test('missing or misdirected .claude/skills link is reported', () => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-link-test-'))
  try {
    mkdirSync(join(dir, 'skills'))
    mkdirSync(join(dir, 'other'))
    assert.equal(collectSkillsLinkErrors(dir).length, 1)
    mkdirSync(join(dir, '.claude'))
    symlinkSync('../other', join(dir, '.claude', 'skills'))
    assert.equal(collectSkillsLinkErrors(dir).length, 1)
    rmSync(join(dir, '.claude', 'skills'))
    symlinkSync('../skills', join(dir, '.claude', 'skills'))
    assert.deepEqual(collectSkillsLinkErrors(dir), [])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
