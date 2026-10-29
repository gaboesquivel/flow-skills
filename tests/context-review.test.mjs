import assert from 'node:assert/strict'
import test from 'node:test'
import { buildContextReviewPrompt, gateContextReview } from '../scripts/run-context-review.mjs'

test('missing verdict blocks context review', () => {
  const gate = gateContextReview({ verdict: undefined, findings: [] })
  assert.equal(gate.blocking, true)
  assert.equal(gate.verdict, 'fail')
})

test('pass with no findings does not block context review', () => {
  const gate = gateContextReview({ verdict: 'pass', findings: [] })
  assert.equal(gate.blocking, false)
})

test('blocking finding fails a pass verdict', () => {
  const gate = gateContextReview({ verdict: 'pass', findings: [{ severity: 'blocking', message: 'drift' }] })
  assert.equal(gate.blocking, true)
})

test('context review prompt includes title, body, and labels', () => {
  const prompt = buildContextReviewPrompt({
    contract: 'contract',
    names: 'PRODUCT.md',
    diff: 'diff',
    title: 'Align roots',
    body: 'Fixes the glossary.',
    labels: ['docs'],
  })
  assert.match(prompt, /Title: Align roots/)
  assert.match(prompt, /Labels: docs/)
  assert.match(prompt, /Fixes the glossary./)
})
