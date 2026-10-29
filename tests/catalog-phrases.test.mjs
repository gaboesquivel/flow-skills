import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { STALE_SHIP_PIPELINE_PHRASE, collectCatalogPhraseErrors } from '../scripts/check-catalog-phrases.mjs'
import { collectFixtureNestedGitErrors } from '../scripts/validate.mjs'

const repoRoot = join(import.meta.dirname, '..')

test('catalog surfaces pass the stale ship pipeline check', () => {
  assert.deepEqual(collectCatalogPhraseErrors(repoRoot), [])
})

test('catalog check flags stale ship pipeline copy', () => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-catalog-'))
  writeFileSync(join(dir, 'README.md'), `${STALE_SHIP_PIPELINE_PHRASE}\n`)
  const errors = collectCatalogPhraseErrors(dir)
  assert.equal(errors.length, 1)
  assert.match(errors[0], /README\.md/u)
})

test('validate rejects nested .git under tests/fixtures', () => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-fixture-'))
  mkdirSync(join(dir, 'tests', 'fixtures', 'demo'), { recursive: true })
  mkdirSync(join(dir, 'tests', 'fixtures', 'demo', '.git'))
  assert.deepEqual(collectFixtureNestedGitErrors(dir), [
    'tests/fixtures/demo/.git: remove nested .git; init in a throwaway clone per fixture README',
  ])
})
