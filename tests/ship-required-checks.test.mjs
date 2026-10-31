import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluate, ReadError } from '../skills/ship/scripts/required-checks.mjs'

// REST-shaped `gh api` responses by path prefix; a function value can throw to model a 404 or a refused route.
const restApi = (routes) => (path) => {
  const key = Object.keys(routes).filter((prefix) => path.startsWith(prefix)).sort((a, b) => b.length - a.length)[0]
  if (!key) throw new Error(`HTTP 404 ${path}`)
  const value = routes[key]
  return typeof value === 'function' ? value(path) : value
}

const R = 'repos/o/r'
const HEAD = 'a'.repeat(40)
const run = (name, conclusion, id, status = 'completed') => ({ id, name, status, conclusion, head_sha: HEAD })
const base = (over = {}) => ({
  [`${R}/pulls/9`]: { number: 9, state: 'open', draft: false, head: { sha: HEAD }, base: { ref: 'main' } },
  [`${R}/rules/branches/main`]: [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'validate' }, { context: 'pr-title' }] } }],
  [`${R}/branches/main/protection/required_status_checks`]: () => { throw new Error('HTTP 404 Branch not protected') },
  [`${R}/commits/${HEAD}/check-runs`]: { check_runs: [run('validate', 'success', 2), run('pr-title', 'success', 3)] },
  [`${R}/commits/${HEAD}/status`]: { statuses: [] },
  ...over,
})
const check = (over) => evaluate({ api: restApi(base(over)), repo: 'o/r', number: 9 })
const stateOf = (result, context) => result.checks.find((c) => c.context === context)?.state

test('ready head with every required check passing is ready', () => {
  const result = check()
  assert.equal(result.ready, true)
  assert.equal(result.source, 'rulesets')
  assert.deepEqual(result.required, ['validate', 'pr-title'])
})

test('a draft is never ready, even when its checks report success', () => {
  const result = check({ [`${R}/pulls/9`]: { number: 9, state: 'open', draft: true, head: { sha: HEAD }, base: { ref: 'main' } } })
  assert.equal(result.ready, false)
  assert.match(result.reasons.join(' '), /draft/u)
})

test('a check skipped while the pull request was a draft does not count once it is ready', () => {
  const result = check({ [`${R}/commits/${HEAD}/check-runs`]: { check_runs: [run('validate', 'skipped', 2), run('pr-title', 'success', 3)] } })
  assert.equal(result.ready, false)
  assert.equal(stateOf(result, 'validate'), 'skipped')
})

test('the latest run wins: a real run after the skipped draft run counts', () => {
  const result = check({ [`${R}/commits/${HEAD}/check-runs`]: { check_runs: [run('validate', 'skipped', 2), run('validate', 'success', 5), run('pr-title', 'success', 3)] } })
  assert.equal(result.ready, true)
})

test('pending, neutral, cancelled, and failing checks stop it', () => {
  for (const [conclusion, status, expected] of [[null, 'in_progress', 'pending'], ['neutral', 'completed', 'neutral'], ['cancelled', 'completed', 'cancelled'], ['failure', 'completed', 'failure']]) {
    const result = check({ [`${R}/commits/${HEAD}/check-runs`]: { check_runs: [run('validate', conclusion, 2, status), run('pr-title', 'success', 3)] } })
    assert.equal(result.ready, false, expected)
    assert.equal(stateOf(result, 'validate'), expected)
  }
})

test('a required check reported only for another head is missing on this one', () => {
  const stale = { ...run('validate', 'success', 2), head_sha: 'b'.repeat(40) }
  const result = check({ [`${R}/commits/${HEAD}/check-runs`]: { check_runs: [stale, run('pr-title', 'success', 3)] } })
  assert.equal(result.ready, false)
  assert.equal(stateOf(result, 'validate'), 'missing')
})

test('commit statuses count by context; classic protection adds its contexts', () => {
  const result = check({
    [`${R}/branches/main/protection/required_status_checks`]: { contexts: ['Vercel'], checks: [{ context: 'Vercel' }] },
    [`${R}/commits/${HEAD}/status`]: { statuses: [{ context: 'Vercel', state: 'failure' }] },
  })
  assert.equal(result.source, 'rulesets+protection')
  assert.equal(stateOf(result, 'Vercel'), 'failure')
  assert.equal(result.ready, false)
})

test('no active protection: every check on the head is required, and none at all is not ready', () => {
  const unprotected = { [`${R}/rules/branches/main`]: [] }
  const some = check(unprotected)
  assert.equal(some.source, 'none')
  assert.equal(some.ready, true)
  assert.match(some.reasons.join(' '), /no active protection/u)
  const none = check({ ...unprotected, [`${R}/commits/${HEAD}/check-runs`]: { check_runs: [] } })
  assert.equal(none.ready, false)
})

test('no active protection: a skipped draft-time job (matrix not expanded) does not block the ready run that replaced it', () => {
  const result = check({
    [`${R}/rules/branches/main`]: [],
    [`${R}/commits/${HEAD}/check-runs`]: { check_runs: [run('validate', 'skipped', 2), run('pr-title', 'skipped', 3), run('validate (ubuntu-latest, 22)', 'success', 5), run('pr-title', 'success', 6)] },
  })
  assert.equal(result.ready, true)
  assert.deepEqual(result.required, ['pr-title', 'validate (ubuntu-latest, 22)'])
})

test('with protection, a required matrix check is missing while only the skipped draft job reported', () => {
  const result = check({
    [`${R}/rules/branches/main`]: [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'validate (ubuntu-latest, 22)' }] } }],
    [`${R}/commits/${HEAD}/check-runs`]: { check_runs: [run('validate', 'skipped', 2)] },
  })
  assert.equal(result.ready, false)
  assert.equal(stateOf(result, 'validate (ubuntu-latest, 22)'), 'missing')
})

test('a closed pull request or an unreadable route is refused', () => {
  assert.equal(check({ [`${R}/pulls/9`]: { number: 9, state: 'closed', draft: false, head: { sha: HEAD }, base: { ref: 'main' } } }).ready, false)
  assert.throws(() => check({ [`${R}/pulls/9`]: () => { throw new Error('HTTP 403') } }), ReadError)
  assert.throws(() => check({ [`${R}/rules/branches/main`]: () => { throw new Error('HTTP 403') } }), ReadError)
})
