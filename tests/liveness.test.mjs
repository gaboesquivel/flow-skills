import assert from 'node:assert/strict'
import test from 'node:test'
import { liveness, parseArgs, STATES } from '../skills/ship/scripts/liveness.mjs'

const SHA = 'a'.repeat(40)
const LATER = 'b'.repeat(40)
const R = 'repos/o/r'

// A stub runner: keys are "cmd arg arg…" prefixes; values are stdout strings, objects (JSON), or functions that may throw.
const stub = (routes) => (cmd, args) => {
  const line = [cmd, ...args].join(' ')
  const key = Object.keys(routes).filter((prefix) => line.startsWith(prefix)).sort((a, b) => b.length - a.length)[0]
  if (!key) { const e = new Error(`unexpected: ${line}`); e.stderr = `unexpected: ${line}`; throw e }
  const value = routes[key]
  const out = typeof value === 'function' ? value(line) : value
  return typeof out === 'string' ? out : JSON.stringify(out)
}
const fail = (msg) => () => { const e = new Error(msg); e.stderr = msg; throw e }

const git = (over = {}) => ({
  'git remote get-url origin': 'git@github.com:o/r.git\n',
  'git symbolic-ref --short refs/remotes/origin/HEAD': 'origin/main\n',
  'git rev-parse --verify': `${SHA}\n`,
  'git symbolic-ref --short HEAD': 'main\n',
  'git ls-remote origin refs/heads/main': `${SHA}\trefs/heads/main\n`,
  ...over,
})
const deployment = (id, sha = SHA, environment = 'Production') => ({ id, sha, environment, production_environment: environment === 'Production' })
const ok = async () => ({ status: 200, finalUrl: 'https://app.example.com/', redirected: false })
const check = (routes, opts = {}) => liveness({ repoDir: '/repo', waitSeconds: 0, run: stub(routes), get: ok, sleep: async () => {}, ...opts })

test('every state the script can report is one of the five', () => {
  assert.deepEqual(STATES, ['live', 'pushed, no deployment reported', 'reachable, commit unconfirmed', 'not live', 'unverified'])
})

test('live: deployment for the commit is ready and its URL answers 2xx', async () => {
  const r = await check(git({
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }))
  assert.equal(r.state, 'live')
  assert.equal(r.sha, SHA)
  assert.equal(r.url, 'https://app.example.com')
})

test('live via a later commit on the branch that contains this one', async () => {
  const r = await check(git({
    'git ls-remote origin refs/heads/main': `${LATER}\trefs/heads/main\n`,
    'git merge-base --is-ancestor': '',
    [`gh api ${R}/deployments?sha=${SHA}`]: [],
    [`gh api ${R}/deployments?ref=main`]: [deployment(9, LATER)],
    [`gh api ${R}/deployments/9/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }))
  assert.equal(r.state, 'live')
  assert.match(r.detail, /later commit bbbbbbb/u)
})

test('live via a later deployment when the commit\'s own deployment is inactive (superseded)', async () => {
  const r = await check(git({
    'git merge-base --is-ancestor': '',
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: [{ state: 'inactive' }],
    [`gh api ${R}/deployments?environment=Production`]: [deployment(11, LATER), deployment(7)],
    [`gh api ${R}/deployments/11/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }))
  assert.equal(r.state, 'live')
  assert.equal(r.url, 'https://app.example.com')
  assert.match(r.detail, /deployment 11 \(via later commit bbbbbbb; deployment 7 was superseded\)/u)
})

test('live via a newer successful redeploy of the same commit when its own deployment is inactive', async () => {
  const r = await check(git({
    'git merge-base --is-ancestor': fail('must not be needed for the same commit'),
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: [{ state: 'inactive' }],
    [`gh api ${R}/deployments?environment=Production`]: [deployment(12), deployment(7)],
    [`gh api ${R}/deployments/12/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }))
  assert.equal(r.state, 'live')
  assert.match(r.detail, /deployment 12 \(redeploy of aaaaaaa; deployment 7 was superseded\)/u)
})

test('not live: inactive with no later successful deployment containing the commit', async () => {
  const r = await check(git({
    'git merge-base --is-ancestor': fail('not an ancestor'),
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: [{ state: 'inactive' }],
    [`gh api ${R}/deployments?environment=Production`]: [deployment(11, LATER), deployment(7)],
    [`gh api ${R}/deployments/11/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }))
  assert.equal(r.state, 'not live')
  assert.match(r.detail, /inactive \(superseded\)/u)
})

test('pushed, no deployment reported: on the remote, host reports nothing', async () => {
  const r = await check(git({ [`gh api ${R}/deployments`]: [] }))
  assert.equal(r.state, 'pushed, no deployment reported')
})

test('pushed, no deployment reported: non-GitHub remote', async () => {
  const r = await check(git({ 'git remote get-url origin': 'ssh://git@example.org/o/r.git\n' }))
  assert.equal(r.state, 'pushed, no deployment reported')
})

test('reachable, commit unconfirmed: a deployment on the branch that cannot be matched to the commit', async () => {
  const r = await check(git({
    'git merge-base --is-ancestor': fail('not an ancestor'),
    [`gh api ${R}/deployments?sha=${SHA}`]: [],
    [`gh api ${R}/deployments?ref=main`]: [deployment(4, LATER)],
    [`gh api ${R}/deployments/4/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }))
  assert.equal(r.state, 'reachable, commit unconfirmed')
  assert.equal(r.url, 'https://app.example.com')
})

test('not live: the remote branch does not contain the commit', async () => {
  const r = await check(git({
    'git ls-remote origin refs/heads/main': `${LATER}\trefs/heads/main\n`,
    'git merge-base --is-ancestor': fail('no'),
    'git fetch': '',
  }))
  assert.equal(r.state, 'not live')
  assert.match(r.detail, /does not contain/u)
})

test('not live: the deployment URL answers 5xx', async () => {
  const r = await check(git({
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }), { get: async () => ({ status: 503, finalUrl: 'https://app.example.com/', redirected: false }) })
  assert.equal(r.state, 'not live')
  assert.match(r.detail, /503/u)
})

test('not live: the deployment failed', async () => {
  const r = await check(git({
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: [{ state: 'failure' }],
  }))
  assert.equal(r.state, 'not live')
})

test('unverified: GitHub cannot be read', async () => {
  const r = await check(git({ 'gh api': fail('HTTP 403') }))
  assert.equal(r.state, 'unverified')
})

test('unverified: the deployment stays pending past the bounded wait', async () => {
  let reads = 0
  const r = await check(git({
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: () => { reads++; return [{ state: 'in_progress' }] },
  }), { waitSeconds: 20 })
  assert.equal(r.state, 'unverified')
  assert.equal(reads, 3)
})

test('unverified: the URL redirects to a host sign-in', async () => {
  const r = await check(git({
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }), { get: async () => ({ status: 200, finalUrl: 'https://vercel.com/login?next=x', redirected: true }) })
  assert.equal(r.state, 'unverified')
  assert.match(r.detail, /sign-in/u)
})

test('unverified: no remote means nothing was published', async () => {
  const r = await check(git({ 'git remote get-url origin': fail('No such remote') }))
  assert.equal(r.state, 'unverified')
})

test('a merged pull request checks its merge commit on the base branch', async () => {
  const MERGE = 'c'.repeat(40)
  const r = await check(git({
    [`gh api ${R}/pulls/12`]: { merged_at: '2026-11-03T00:00:00Z', merge_commit_sha: MERGE, base: { ref: 'main' }, head: { sha: SHA, ref: 'spec/x' } },
    'git ls-remote origin refs/heads/main': `${MERGE}\trefs/heads/main\n`,
    [`gh api ${R}/deployments`]: [],
  }), { pr: 12 })
  assert.equal(r.sha, MERGE)
  assert.equal(r.ref, 'main')
  assert.equal(r.state, 'pushed, no deployment reported')
})

test('the health route must answer 2xx too', async () => {
  const seen = []
  const r = await check(git({
    [`gh api ${R}/deployments?sha=${SHA}`]: [deployment(7)],
    [`gh api ${R}/deployments/7/statuses`]: [{ state: 'success', environment_url: 'https://app.example.com' }],
  }), { health: '/api/health', get: async (u) => { seen.push(u); return { status: u.endsWith('/api/health') ? 500 : 200, redirected: false } } })
  assert.deepEqual(seen, ['https://app.example.com', 'https://app.example.com/api/health'])
  assert.equal(r.state, 'not live')
})

test('parseArgs reads positional repo, ref, pr and flags; rejects bad numbers', () => {
  assert.deepEqual(parseArgs(['.', 'main', '#5', '--wait', '0']).pr, 5)
  assert.equal(parseArgs(['.', 'main', 'x']), null)
})
