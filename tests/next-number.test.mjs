import assert from 'node:assert/strict'
import test from 'node:test'
import { nextNumbers } from '../scripts/next-number.mjs'

test('next number skips numbers claimed on any branch', () => {
  const names = ['docs/specs/033-a.md', 'docs/specs/033-b.md', 'docs/specs/034-c.md', 'docs/specs/README.md', 'docs/decisions/0046-x.md', 'docs/decisions/0045-y.md']
  assert.deepEqual(nextNumbers(names), { specs: '035', decisions: '0047' })
})
