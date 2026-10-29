import assert from 'node:assert/strict'
import test from 'node:test'
import { percentile, summarize } from '../scripts/metrics.mjs'

test('percentile picks the nearest rank and handles empty input', () => {
  assert.equal(percentile([], 50), null)
  assert.equal(percentile([5, 1, 3], 50), 3)
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90), 9)
})

test('summary counts only runs on merged branches and ignores cancelled runs', () => {
  const at = (minute) => new Date(Date.UTC(2026, 9, 29, 0, minute)).toISOString()
  const prs = [
    { headRefName: 'a', createdAt: at(5), mergedAt: at(10), commits: [{ committedDate: at(0) }] },
    { headRefName: 'b', createdAt: at(0), mergedAt: at(20), commits: [] },
  ]
  const runs = [
    { headBranch: 'a', conclusion: 'failure', createdAt: at(1), updatedAt: at(2) },
    { headBranch: 'a', conclusion: 'success', createdAt: at(3), updatedAt: at(4) },
    { headBranch: 'a', conclusion: 'cancelled', createdAt: at(3), updatedAt: at(3) },
    { headBranch: 'other', conclusion: 'failure', createdAt: at(1), updatedAt: at(2) },
  ]
  const s = summarize({ prs, runs })
  assert.deepEqual(s.closePrMinutes, { median: 10, p90: 20 })
  assert.equal(s.ciRuns, 2)
  assert.equal(s.ciFailureRate, 0.5)
  assert.equal(s.prsWithRedCi, 0.5)
  assert.deepEqual(s.ciWaitMinutes, { median: 1, p90: 1 })
})
