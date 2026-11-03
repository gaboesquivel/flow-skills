import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { collectLeadingPhraseErrors, skillDescriptions } from '../scripts/check-catalog-phrases.mjs'
import { LEADING_PHRASES } from '../skills/flow/lib/flow-block.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('every leading phrase the Flow block names is in some skill description', () => {
  assert.ok(LEADING_PHRASES.length > 0)
  assert.deepEqual(collectLeadingPhraseErrors(root), [])
})

test('a phrase no description carries is reported', () => {
  assert.deepEqual(collectLeadingPhraseErrors(root, ['frobnicate it']), ['Flow block phrase "frobnicate it" is in no skill description'])
})

test('merged skills still answer the phrases of the skills they absorbed', () => {
  const all = Object.values(skillDescriptions(root)).join('\n')
  for (const phrase of ['interview me', 'grill this', 'are we building the right thing', 'measure our progress', 'push it']) {
    assert.ok(all.includes(`"${phrase}"`), `"${phrase}" is in no skill description`)
  }
})
