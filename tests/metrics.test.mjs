import assert from 'node:assert/strict'
import test from 'node:test'
import { bySkill, byTag, closedIssues, delivery, fetchDelivery, firstSuccess, ideaToProd, labeledAt, parseSession, percentile, repoFromRemote, sessionLink, summarize, usageCost } from '../scripts/metrics.mjs'

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
    { number: 1, tag: 'local', linked: true, minutes: 10, turns: 3, turnsAfterPhrase: 1, denialsAt: ['2026-10-29T00:03:00.000Z', '2026-10-29T00:07:00.000Z'], skills: [], cost: null, ciFailures: null, rework: 0 },
    { number: 2, tag: 'local', linked: true, minutes: 30, turns: 1, turnsAfterPhrase: null, denialsAt: [], skills: [], cost: null, ciFailures: null, rework: 0 },
    { number: 3, tag: null, linked: false, ciFailures: null, rework: 0 },
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

// REST-shaped `gh api` responses, routed by path; records every path asked for.
const restApi = (routes) => {
  const calls = []
  const api = (path) => {
    calls.push(path)
    const [route, value] = Object.entries(routes).find(([prefix]) => path.startsWith(prefix)) ?? []
    if (!route) return []
    const page = Number(/[?&]page=(\d+)/u.exec(path)?.[1] ?? 1)
    return typeof value === 'function' ? value(page, path) : page === 1 ? value : []
  }
  return { api, calls }
}

test('fetchDelivery reads merged pull requests, commits, reviews, label events, and runs through REST', () => {
  const pull = (number, fields = {}) => ({ number, created_at: '2026-10-29T00:00:00Z', merged_at: null, head: { ref: `b${number}` }, merge_commit_sha: `m${number}`, body: null, ...fields })
  const { api, calls } = restApi({
    // Page 1 is full (100 closed, of which merged #1..#50); page 2 holds the rest.
    'repos/o/r/pulls?': (page) => page === 1
      ? Array.from({ length: 100 }, (_, i) => pull(i + 1, i < 50 ? { merged_at: `2026-10-29T01:${String(i).padStart(2, '0')}:00Z` } : {}))
      : [pull(200, { merged_at: '2026-10-30T00:00:00Z', body: 'Closes #7\nFixes #8\nSession: https://claude.ai/code/session_abc' })],
    'repos/o/r/pulls/200/commits': [{ commit: { committer: { date: '2026-10-29T23:00:00Z' } } }],
    'repos/o/r/pulls/200/reviews': [{ submitted_at: '2026-10-29T23:30:00Z' }],
    'repos/o/r/issues/7/events': [{ event: 'labeled', label: { name: 'bug' }, created_at: '2026-10-29T20:00:00Z' }],
    'repos/o/r/issues/8/events': [{ event: 'labeled', label: { name: 'build-it' }, created_at: '2026-10-29T22:00:00Z' }, { event: 'labeled', label: { name: 'build-it' }, created_at: '2026-10-29T22:30:00Z' }],
    'repos/o/r/actions/runs?': { total_count: 1, workflow_runs: [{ conclusion: 'success', head_branch: 'b200', head_sha: 's', created_at: 'c', updated_at: 'u', extra: 1 }] },
  })
  const { prs, runs } = fetchDelivery({ repo: 'o/r', limit: 51, api })
  assert.equal(prs.length, 51)
  assert.deepEqual(prs[0], {
    number: 200, createdAt: '2026-10-29T00:00:00Z', mergedAt: '2026-10-30T00:00:00Z', headRefName: 'b200', body: 'Closes #7\nFixes #8\nSession: https://claude.ai/code/session_abc',
    commits: [{ committedDate: '2026-10-29T23:00:00Z' }], reviews: [{ submittedAt: '2026-10-29T23:30:00Z' }], mergeCommit: { oid: 'm200' }, closes: [7, 8], labeledAt: '2026-10-29T22:00:00Z',
  })
  assert.equal(prs[1].labeledAt, undefined)
  assert.deepEqual(runs, [{ conclusion: 'success', headBranch: 'b200', headSha: 's', createdAt: 'c', updatedAt: 'u' }])
  assert.deepEqual(calls.filter((path) => path.startsWith('repos/o/r/pulls?')), [
    'repos/o/r/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=1',
    'repos/o/r/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=2',
  ])
  assert.ok(calls.includes('repos/o/r/actions/runs?event=pull_request&per_page=100&page=1'))
  assert.ok(calls.every((path) => !/graphql/u.test(path)))
  // Enough merged pull requests on the first page: no second page.
  const small = restApi({ 'repos/o/r/pulls?': (page) => page === 1 ? Array.from({ length: 100 }, (_, i) => pull(i + 1, { merged_at: '2026-10-29T00:00:00Z' })) : [] })
  assert.equal(fetchDelivery({ repo: 'o/r', limit: 5, api: small.api }).prs.length, 5)
  assert.equal(small.calls.filter((path) => path.startsWith('repos/o/r/pulls?')).length, 1)
})

test('body parsing: session link, closed issues, build-it label event, remote URL', () => {
  assert.equal(sessionLink('Built here.\nSession: https://claude.ai/code/session_01AB).'), 'https://claude.ai/code/session_01AB')
  assert.equal(sessionLink('no link'), null)
  assert.deepEqual(closedIssues('Closes #4, fixes #5 and Resolves #4; see #6'), [4, 5])
  assert.equal(labeledAt([{ event: 'unlabeled', label: { name: 'build-it' }, created_at: '1' }]), undefined)
  assert.equal(repoFromRemote('git@github.com:o/r.git'), 'o/r')
  assert.equal(repoFromRemote('https://github.com/o/r'), 'o/r')
  assert.equal(repoFromRemote('https://gitlab.com/o/r'), null)
})

test('changes are tagged local, issue, or cloud; issue starts at the label event, cloud falls back to the first commit', () => {
  const log = (entries) => entries.map((entry) => JSON.stringify(entry)).join('\n')
  const at = (minute) => new Date(Date.UTC(2026, 9, 29, 0, minute)).toISOString()
  const local = parseSession(log([{ type: 'user', timestamp: at(0), cwd: '/code/r', gitBranch: 'loc', message: { content: 'build it' } }, { type: 'cost-state', totalCostUSD: 1 }]))
  const prs = [
    { number: 1, headRefName: 'loc', mergedAt: at(10), body: '' },
    { number: 2, headRefName: 'iss', mergedAt: at(30), body: 'Closes #9\nSession: https://claude.ai/code/session_issue', labeledAt: at(5), commits: [{ committedDate: at(20) }] },
    { number: 3, headRefName: 'cld', mergedAt: at(40), body: 'Session: https://claude.ai/code/session_cloud', commits: [{ committedDate: at(25) }, { committedDate: at(15) }] },
    { number: 4, headRefName: 'shared1', mergedAt: at(40), body: 'Session: https://claude.ai/code/session_shared', createdAt: at(38) },
    { number: 5, headRefName: 'shared2', mergedAt: at(40), body: 'Session: https://claude.ai/code/session_shared', commits: [{ committedDate: at(30) }] },
    { number: 6, headRefName: 'nobody', mergedAt: at(40), body: 'Closes #3' },
  ]
  const usage = [
    { session: 'session_issue', costUsd: 2 },
    { session: 'https://claude.ai/code/session_cloud', costUsd: 1.25 },
    { session: 'session_cloud', costUsd: 0.25 },
    { session: 'session_shared', costUsd: 9 },
  ]
  const runs = [
    { headBranch: 'iss', headSha: 'a', conclusion: 'failure', createdAt: at(21), updatedAt: at(22) },
    { headBranch: 'iss', headSha: 'b', conclusion: 'success', createdAt: at(23), updatedAt: at(24) },
    { headBranch: 'cld', headSha: 'c', conclusion: 'success', createdAt: at(26), updatedAt: at(27) },
  ]
  const result = ideaToProd({ prs, sessions: [local], repo: 'o/r', runs, usage })
  const pick = ({ number, tag, minutes, fallback, cost, ciFailures }) => ({ number, tag, minutes, fallback, cost, ciFailures })
  assert.deepEqual(result.changes.map(pick), [
    { number: 1, tag: 'local', minutes: 10, fallback: undefined, cost: 1, ciFailures: null },
    { number: 2, tag: 'issue', minutes: 25, fallback: false, cost: 2, ciFailures: 1 },
    { number: 3, tag: 'cloud', minutes: 25, fallback: true, cost: 1.5, ciFailures: 0 },
    { number: 4, tag: 'cloud', minutes: 2, fallback: true, cost: null, ciFailures: null },
    { number: 5, tag: 'cloud', minutes: 10, fallback: true, cost: null, ciFailures: null },
    { number: 6, tag: null, minutes: undefined, fallback: undefined, cost: undefined, ciFailures: null },
  ])
  assert.equal(result.tagRate, 5 / 6)
  assert.equal(result.untagged, 1)
  assert.equal(result.linkRate, 1 / 6)
  assert.deepEqual(byTag(result.changes, prs, runs), [
    { tag: 'local', changes: 1, medianMinutes: 10, fallback: false, ciFailureRate: null, cost: 1 },
    { tag: 'issue', changes: 1, medianMinutes: 25, fallback: false, ciFailureRate: 0.5, cost: 2 },
    { tag: 'cloud', changes: 3, medianMinutes: 10, fallback: true, ciFailureRate: 0, cost: null },
    { tag: null, changes: 1, medianMinutes: null, fallback: false, ciFailureRate: null, cost: null },
  ])
  // Without a usage file, cloud and issue cost is unknown, never zero.
  assert.ok(ideaToProd({ prs, sessions: [], repo: 'o/r', runs }).changes.filter((c) => c.tag).every((c) => c.cost === null))
  assert.equal(usageCost([{ session: 'other', costUsd: 3 }], 'https://claude.ai/code/session_x'), null)
  assert.equal(usageCost([{ session: 'session_x', costUsd: 0 }], 'https://claude.ai/code/session_x'), 0)
})
