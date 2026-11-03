import assert from 'node:assert/strict'
import test from 'node:test'
import { parseGithubRemote, readDelivery, route } from '../skills/ship/scripts/gh-route.mjs'

const err = (stderr, code) => () => { const e = new Error(stderr); e.stderr = stderr; if (code) e.code = code; throw e }
// Stub runner: keys are "cmd arg…" prefixes; the longest match wins; functions may throw.
const stub = (routes, calls = []) => (cmd, args) => {
  const line = [cmd, ...args].join(' ')
  calls.push(line)
  const key = Object.keys(routes).filter((p) => line.startsWith(p)).sort((a, b) => b.length - a.length)[0]
  if (!key) return err(`unexpected: ${line}`)()
  const v = routes[key]
  const out = typeof v === 'function' ? v(line) : v
  return typeof out === 'string' ? out : JSON.stringify(out)
}
const github = (over = {}) => ({
  'git remote get-url origin': 'https://github.com/o/r.git\n',
  'git symbolic-ref --short refs/remotes/origin/HEAD': 'origin/main\n',
  'gh pr list': '[]',
  'gh api repos/o/r': { default_branch: 'trunk' },
  'gh api repos/o/r/rules/branches/trunk': [],
  ...over,
})
const block = (line) => `# x\n<!-- BEGIN FLOW -->\n\n## Flow\n\n${line}\n\n<!-- END FLOW -->\n`
const check = (routes, opts = {}) => route({ repoDir: '/repo', run: stub(routes), readFile: () => '', ...opts })

test('GitHub origin infers GitHub mode on the gh route', () => {
  const r = check(github())
  assert.deepEqual({ mode: r.mode, route: r.route, owner: r.owner, repo: r.repo, defaultBranch: r.defaultBranch }, { mode: 'github', route: 'gh', owner: 'o', repo: 'r', defaultBranch: 'trunk' })
  assert.match(r.reason, /origin is a GitHub repository/u)
})

test('GraphQL refused falls back to REST through gh api', () => {
  const r = check(github({ 'gh pr list': err('GraphQL: Resource not accessible by integration (HTTP 403)') }))
  assert.equal(r.mode, 'github')
  assert.equal(r.route, 'rest')
  assert.match(r.reason, /GraphQL refused; REST through gh api works/u)
})

test('a proxied token gh calls invalid still routes through REST when REST works', () => {
  const r = check(github({ 'gh pr list': err('To get started with GitHub CLI, please run: gh auth login') }))
  assert.equal(r.route, 'rest')
})

test('no working route in GitHub mode reports none with the one hand-off, never local', () => {
  const r = check(github({ 'gh pr list': err('gh auth login'), 'gh api repos/o/r': err('HTTP 401: Bad credentials') }))
  assert.equal(r.mode, 'github')
  assert.equal(r.route, 'none')
  assert.equal(r.defaultBranch, 'main')
  assert.match(r.reason, /gh auth login/u)
})

test('gh not installed reports none without trying REST', () => {
  const calls = []
  const r = route({ repoDir: '/repo', readFile: () => '', run: stub(github({ 'gh pr list': err('spawn gh ENOENT', 'ENOENT') }), calls) })
  assert.equal(r.route, 'none')
  assert.match(r.reason, /gh not installed/u)
  assert.ok(!calls.some((c) => c.startsWith('gh api')))
})

test('non-GitHub origin infers local mode', () => {
  const r = check({ 'git remote get-url origin': 'git@gitlab.com:o/r.git', 'git symbolic-ref': err('no'), 'git rev-parse': 'abc' })
  assert.equal(r.mode, 'local')
  assert.equal(r.route, 'none')
  assert.equal(r.defaultBranch, 'main')
})

test('no remote infers local mode', () => {
  const r = check({ 'git remote get-url origin': err('No such remote'), 'git symbolic-ref': err('no'), 'git rev-parse': err('no') })
  assert.equal(r.mode, 'local')
  assert.match(r.reason, /no origin remote/u)
})

test('the Flow block Delivery line overrides the inferred mode', () => {
  const r = check(github(), { readFile: (p) => (p.endsWith('AGENTS.md') ? block('Delivery: local') : '') })
  assert.equal(r.mode, 'local')
  assert.equal(r.route, 'gh')
  assert.match(r.reason, /Flow block/u)
})

test('an explicit argument overrides the Flow block', () => {
  const r = check(github(), { mode: 'github', readFile: () => block('Delivery: local') })
  assert.equal(r.mode, 'github')
  assert.match(r.reason, /from the request/u)
})

test('a default branch that requires pull requests forces GitHub mode over a local override', () => {
  const r = check(github({ 'gh api repos/o/r/rules/branches/trunk': [{ type: 'pull_request' }] }), { mode: 'local' })
  assert.equal(r.mode, 'github')
  assert.match(r.reason, /requires pull requests/u)
})

test('readDelivery reads only inside the Flow block and accepts legacy values', () => {
  assert.equal(readDelivery(block('Delivery: pull-request')), 'github')
  assert.equal(readDelivery('Delivery: local\n'), null)
})

test('parseGithubRemote reads https, ssh, and scp-like remotes', () => {
  assert.deepEqual(parseGithubRemote('git@github.com:o/r.git'), { owner: 'o', repo: 'r' })
  assert.deepEqual(parseGithubRemote('ssh://git@github.com/o/r'), { owner: 'o', repo: 'r' })
  assert.equal(parseGithubRemote('https://gitlab.com/o/r.git'), null)
})
