import assert from 'node:assert/strict'
import test from 'node:test'
import { ideaToProd, parseSession, percentile, summarize } from '../scripts/metrics.mjs'

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

test('idea → prod links sessions to merged pull requests and counts turns after the delivery phrase and permission denials', () => {
  const log = (entries) => entries.map((entry) => JSON.stringify(entry)).join('\n')
  const prompt = (timestamp, content, extra = {}) => ({ type: 'user', timestamp, cwd: '/code/flow-skills', gitBranch: 'feat', message: { content }, ...extra })
  const linked = parseSession(log([
    prompt('2026-10-29T00:00:00.000Z', 'add a button'),
    prompt('2026-10-29T00:01:00.000Z', [{ type: 'tool_result', content: 'ok' }]),
    prompt('2026-10-29T00:03:00.000Z', [{ type: 'tool_result', content: "The user doesn't want to proceed with this tool use. The tool use was rejected" }]),
    prompt('2026-10-29T00:02:00.000Z', 'ignored', { isMeta: true }),
    prompt('2026-10-29T00:05:00.000Z', 'ship it'),
    prompt('2026-10-29T00:06:00.000Z', 'thanks'),
    prompt('2026-10-29T02:00:00.000Z', 'after the merge'),
    prompt('2026-10-29T02:01:00.000Z', [{ type: 'tool_result', content: [{ type: 'text', text: "The user doesn't want to proceed with this tool use." }] }]),
  ]))
  const viaLink = parseSession(log([
    { type: 'pr-link', prRepository: 'o/flow-skills', prNumber: 2, timestamp: '2026-10-29T00:00:00.000Z' },
    { ...prompt('2026-10-29T00:00:00.000Z', 'fix it'), gitBranch: 'other', cwd: '/elsewhere' },
  ]))
  const prs = [
    { number: 1, headRefName: 'feat', mergedAt: '2026-10-29T00:10:00.000Z' },
    { number: 2, headRefName: 'x', mergedAt: '2026-10-29T00:20:00.000Z', liveAt: '2026-10-29T00:30:00.000Z' },
    { number: 3, headRefName: 'nobody', mergedAt: '2026-10-29T00:20:00.000Z' },
  ]
  const result = ideaToProd({ prs, sessions: [linked, viaLink], repo: 'o/flow-skills' })
  assert.deepEqual(result.changes, [
    { number: 1, linked: true, minutes: 10, turnsAfterPhrase: 1, denials: 1 },
    { number: 2, linked: true, minutes: 30, turnsAfterPhrase: null, denials: 0 },
    { number: 3, linked: false },
  ])
  assert.equal(result.unlinked, 1)
  assert.equal(result.linkRate, 2 / 3)
  assert.equal(result.denials, 1)
})
