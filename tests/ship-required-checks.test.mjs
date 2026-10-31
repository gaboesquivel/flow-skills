import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluate, ReadError } from '../skills/ship/scripts/required-checks.mjs'

// REST-shaped `gh api` responses by path prefix; a function value can throw to model a refused route.
const restApi = (routes) => (path) => {
  const key = Object.keys(routes).filter((prefix) => path.startsWith(prefix)).sort((a, b) => b.length - a.length)[0]
  if (!key) throw new Error(`HTTP 404 ${path}`)
  const value = routes[key]
  return typeof value === 'function' ? value(path) : value
}

const R = 'repos/o/r'
const HEAD = 'a'.repeat(40)
const ACTIONS = { id: 15368, slug: 'github-actions' }
const run = (name, conclusion, id, status = 'completed', app = ACTIONS) => ({ id, name, status, conclusion, head_sha: HEAD, app })
const wf = (name, conclusion, id, status = 'completed') => ({ id, name, path: `.github/workflows/${name}.yml`, status, conclusion })
const required = (...contexts) => [{ type: 'required_status_checks', parameters: { required_status_checks: contexts.map((context) => ({ context, integration_id: 15368 })) } }]
const pull = (over = {}) => ({ number: 9, state: 'open', draft: false, head: { sha: HEAD }, base: { ref: 'main' }, ...over })
const base = (over = {}) => ({
  [`${R}/pulls/9`]: pull(),
  [`${R}/rules/branches/main`]: required('validate (ubuntu-latest, 22)', 'pr-title'),
  [`${R}/branches/main`]: { protected: false, protection: { enabled: false, required_status_checks: { contexts: [], checks: [] } } },
  [`${R}/commits/${HEAD}/check-runs`]: { total_count: 2, check_runs: [run('validate (ubuntu-latest, 22)', 'success', 5), run('pr-title', 'success', 6)] },
  [`${R}/commits/${HEAD}/statuses`]: [],
  [`${R}/actions/runs`]: { total_count: 2, workflow_runs: [wf('ci', 'success', 50), wf('pr-title', 'success', 51)] },
  ...over,
})
const check = (over) => evaluate({ api: restApi(base(over)), repo: 'o/r', number: 9 })
const stateOf = (result, context) => result.checks.find((c) => c.context === context)?.state
const runs = (...items) => ({ total_count: items.length, check_runs: items })
const unprotected = { [`${R}/rules/branches/main`]: [] }

test('ready head with every required check passing is ready', () => {
  const result = check()
  assert.equal(result.ready, true)
  assert.equal(result.source, 'rulesets')
})

test('a draft is never ready, even when its checks report success', () => {
  const result = check({ [`${R}/pulls/9`]: pull({ draft: true }) })
  assert.equal(result.ready, false)
  assert.match(result.reasons.join(' '), /draft/u)
})

test('with protection, a required matrix check is missing while only the skipped draft job reported', () => {
  const result = check({ [`${R}/commits/${HEAD}/check-runs`]: runs(run('validate', 'skipped', 2), run('pr-title', 'skipped', 3)) })
  assert.equal(result.ready, false)
  assert.equal(stateOf(result, 'validate (ubuntu-latest, 22)'), 'missing')
  assert.equal(stateOf(result, 'pr-title'), 'skipped')
})

test('the latest run wins: a real run after the skipped draft run counts', () => {
  const result = check({ [`${R}/commits/${HEAD}/check-runs`]: runs(run('pr-title', 'skipped', 3), run('validate (ubuntu-latest, 22)', 'success', 5), run('pr-title', 'success', 6)) })
  assert.equal(result.ready, true)
})

test('pending, skipped, neutral, cancelled, and failing required checks stop it', () => {
  for (const [conclusion, status, expected] of [[null, 'in_progress', 'pending'], ['skipped', 'completed', 'skipped'], ['neutral', 'completed', 'neutral'], ['cancelled', 'completed', 'cancelled'], ['failure', 'completed', 'failure']]) {
    const result = check({ [`${R}/commits/${HEAD}/check-runs`]: runs(run('validate (ubuntu-latest, 22)', conclusion, 5, status), run('pr-title', 'success', 6)) })
    assert.equal(result.ready, false, expected)
    assert.equal(stateOf(result, 'validate (ubuntu-latest, 22)'), expected)
  }
})

test('a same-named check from another app does not satisfy a rule pinned to GitHub Actions', () => {
  const result = check({ [`${R}/commits/${HEAD}/check-runs`]: runs(run('validate (ubuntu-latest, 22)', 'success', 7, 'completed', { id: 1, slug: 'impostor' }), run('pr-title', 'success', 6)) })
  assert.equal(stateOf(result, 'validate (ubuntu-latest, 22)'), 'missing')
  assert.equal(result.ready, false)
})

test('classic protection adds its contexts; commit statuses count, newest first', () => {
  const result = check({
    [`${R}/branches/main`]: { protected: true, protection: { enabled: true, required_status_checks: { contexts: ['Vercel'], checks: [{ context: 'Vercel', app_id: null }] } } },
    [`${R}/commits/${HEAD}/statuses`]: [{ context: 'Vercel', state: 'failure' }, { context: 'Vercel', state: 'success' }],
  })
  assert.equal(result.source, 'rulesets+protection')
  assert.equal(stateOf(result, 'Vercel'), 'failure')
  assert.equal(result.ready, false)
})

test('no protection: each workflow\'s latest run on the head must succeed', () => {
  const ok = check(unprotected)
  assert.equal(ok.source, 'none')
  assert.equal(ok.ready, true)
  assert.match(ok.reasons.join(' '), /no active protection/u)
  const replaced = check({ ...unprotected, [`${R}/actions/runs`]: { total_count: 3, workflow_runs: [wf('ci', 'skipped', 40), wf('ci', 'success', 50), wf('pr-title', 'success', 51)] } })
  assert.equal(replaced.ready, true)
})

test('no protection: a workflow skipped on the draft, failed to start, or not yet finished is never ready', () => {
  for (const [conclusion, status] of [['skipped', 'completed'], ['startup_failure', 'completed'], [null, 'queued']]) {
    const result = check({ ...unprotected, [`${R}/actions/runs`]: { total_count: 2, workflow_runs: [wf('ci', conclusion, 50, status), wf('pr-title', 'success', 51)] } })
    assert.equal(result.ready, false, conclusion ?? status)
  }
  assert.equal(check({ ...unprotected, [`${R}/actions/runs`]: { total_count: 0, workflow_runs: [] }, [`${R}/commits/${HEAD}/check-runs`]: runs() }).ready, false)
})

test('no protection: other apps\' checks and statuses count too', () => {
  const result = check({ ...unprotected, [`${R}/commits/${HEAD}/statuses`]: [{ context: 'Vercel', state: 'pending' }] })
  assert.equal(stateOf(result, 'Vercel'), 'pending')
  assert.equal(result.ready, false)
})

test('a closed pull request, a partial list, or an unreadable route is refused', () => {
  assert.equal(check({ [`${R}/pulls/9`]: pull({ state: 'closed' }) }).ready, false)
  assert.throws(() => check({ [`${R}/commits/${HEAD}/check-runs`]: { total_count: 101, check_runs: [run('pr-title', 'success', 6)] } }), ReadError)
  assert.throws(() => check({ [`${R}/pulls/9`]: () => { throw new Error('HTTP 403') } }), ReadError)
  assert.throws(() => check({ [`${R}/rules/branches/main`]: () => { throw new Error('HTTP 403') } }), ReadError)
})
