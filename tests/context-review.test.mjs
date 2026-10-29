import assert from 'node:assert/strict'
import test from 'node:test'
import { buildContextReviewPrompt, gateContextReview, isOutage } from '../scripts/run-context-review.mjs'

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

test('only network failures, timeouts, 408, 429, and 5xx count as an outage', () => {
  const http = (status) => Object.assign(new Error(`LLM HTTP ${status}`), { outage: status === 408 || status === 429 || status >= 500 })
  assert.equal(isOutage(new TypeError('fetch failed')), true)
  assert.equal(isOutage(Object.assign(new Error('timed out'), { name: 'TimeoutError' })), true)
  assert.equal(isOutage(http(503)), true)
  assert.equal(isOutage(http(429)), true)
  assert.equal(isOutage(http(400)), false, 'a content filter is an answer')
  assert.equal(isOutage(http(401)), false, 'a bad key must not pass silently')
  assert.equal(isOutage(new SyntaxError('bad json')), false)
})
