import assert from 'node:assert/strict'
import test from 'node:test'
import { bySkill, delivery, firstSuccess, ideaToProd, parseSession, percentile, summarize } from '../scripts/metrics.mjs'

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
    prompt('2026-10-29T00:07:00.000Z', [{ type: 'tool_result', content: 'Permission for this action was denied by the Claude Code auto mode classifier.' }], { isSidechain: true }),
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
    { number: 1, linked: true, minutes: 10, turns: 3, turnsAfterPhrase: 1, denialsAt: ['2026-10-29T00:03:00.000Z', '2026-10-29T00:07:00.000Z'], skills: [], cost: null, ciFailures: null, rework: 0 },
    { number: 2, linked: true, minutes: 30, turns: 1, turnsAfterPhrase: null, denialsAt: [], skills: [], cost: null, ciFailures: null, rework: 0 },
    { number: 3, linked: false, ciFailures: null, rework: 0 },
  ])
  assert.equal(result.unlinked, 1)
  assert.equal(result.linkRate, 2 / 3)
  assert.equal(result.denials, 2)
})

test('each change reports its skills, cost, CI failures, and rework, with unknown where the logs say nothing', () => {
  const log = (entries) => entries.map((entry) => JSON.stringify(entry)).join('\n')
  const at = (minute) => new Date(Date.UTC(2026, 9, 29, 0, minute)).toISOString()
  const prompt = (minute, content, branch) => ({ type: 'user', timestamp: at(minute), cwd: '/code/flow-skills', gitBranch: branch, message: { content } })
  const skill = (minute, name) => ({ type: 'assistant', timestamp: at(minute), message: { content: [{ type: 'tool_use', name: 'Skill', input: { skill: name } }] } })
  const cost = (total, extra = {}) => ({ type: 'cost-state', totalCostUSD: total, ...extra })
  // Alone on branch a, with two cumulative cost entries; the skill after the merge is not counted.
  const alone = parseSession(log([prompt(0, 'build it', 'a'), skill(1, 'build'), skill(2, 'build'), cost(1), cost(2.5), skill(30, 'retro')]))
  // One session across branches b and c: its total cannot be split, so both costs are unknown.
  const shared = parseSession(log([prompt(0, 'fix b', 'b'), skill(1, 'debug'), prompt(5, 'now c', 'c'), cost(4)]))
  // A model with unknown pricing makes the session's cost unknown, not partial.
  const unpriced = parseSession(log([prompt(0, 'tweak', 'd'), cost(3, { hasUnknownModelCost: true })]))
  assert.equal(alone.cost, 2.5)
  assert.equal(unpriced.cost, null)
  const prs = [
    { number: 1, headRefName: 'a', mergedAt: at(10), commits: [{ committedDate: at(3) }, { committedDate: at(8) }] },
    { number: 2, headRefName: 'b', mergedAt: at(10), commits: [] },
    { number: 3, headRefName: 'c', mergedAt: at(12), commits: [] },
    { number: 4, headRefName: 'd', mergedAt: at(12), commits: [{ committedDate: at(2) }, { committedDate: at(6) }], reviews: [{ submittedAt: at(5) }] },
  ]
  // Branch a fails once and its rerun of the same commit fails again before a fix commit goes green.
  const runs = [
    { headBranch: 'a', headSha: 's1', conclusion: 'failure', createdAt: at(4), updatedAt: at(5) },
    { headBranch: 'a', headSha: 's1', conclusion: 'failure', createdAt: at(6), updatedAt: at(7) },
    { headBranch: 'a', headSha: 's2', conclusion: 'success', createdAt: at(8), updatedAt: at(9) },
    { headBranch: 'b', headSha: 's3', conclusion: 'success', createdAt: at(8), updatedAt: at(9) },
  ]
  const { changes } = ideaToProd({ prs, sessions: [alone, shared, unpriced], repo: 'o/flow-skills', runs })
  const pick = ({ number, skills, cost: c, ciFailures, rework }) => ({ number, skills, cost: c, ciFailures, rework })
  assert.deepEqual(changes.map(pick), [
    { number: 1, skills: ['build'], cost: 2.5, ciFailures: 1, rework: 1 },
    { number: 2, skills: ['debug'], cost: null, ciFailures: 0, rework: 0 },
    { number: 3, skills: ['debug'], cost: null, ciFailures: null, rework: 0 },
    { number: 4, skills: [], cost: null, ciFailures: null, rework: 1 },
  ])
  assert.deepEqual(delivery({ headRefName: 'z', commits: [] }, runs), { ciFailures: null, rework: 0 })
  assert.deepEqual(bySkill([...changes, { number: 9, linked: false }]), [
    { skill: 'debug', changes: 2, medianMinutes: 10, medianTurns: 2 },
    { skill: 'build', changes: 1, medianMinutes: 10, medianTurns: 1 },
  ])
})

test('production time is the first success, filtered to the Vercel commit status when there is no deployment', () => {
  const statuses = [
    { context: 'Vercel', state: 'pending', created_at: '2026-10-29T21:05:00Z' },
    { context: 'Vercel', state: 'success', created_at: '2026-10-29T21:05:28Z' },
    { context: 'other', state: 'success', created_at: '2026-10-29T21:01:00Z' },
  ]
  assert.equal(firstSuccess(statuses, 'Vercel'), '2026-10-29T21:05:28Z')
  assert.equal(firstSuccess(statuses), '2026-10-29T21:01:00Z')
  assert.equal(firstSuccess([], 'Vercel'), undefined)
})
