import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyGovernance,
  REPO_SETTINGS,
  RULESET_NAME,
  rulesetBody,
  verifyEffectiveRules,
  WORKFLOW_PERMISSIONS,
} from '../skills/start/lib/github-governance.mjs'

// An in-memory GitHub that applies writes, so a second run sees the first run's state.
const fakeGitHub = ({ visibility = 'private', admin = true, rulesetError, prTitleWorkflow = true } = {}) => {
  const state = {
    repo: { default_branch: 'main', visibility, permissions: { admin }, allow_merge_commit: true, security_and_analysis: {} },
    workflow: { default_workflow_permissions: 'write', can_approve_pull_request_reviews: true },
    alerts: false,
    pvr: false,
    rulesets: [],
    writes: [],
  }
  const ok = (json = null) => ({ ok: true, status: 200, json })
  const gh = (path, { method = 'GET', body } = {}) => {
    if (method !== 'GET') state.writes.push(`${method} ${path}`)
    if (path === 'repos/o/r' && method === 'GET') return ok(state.repo)
    if (path === 'repos/o/r' && method === 'PATCH') {
      const { security_and_analysis: sa, ...rest } = body
      Object.assign(state.repo, rest)
      if (sa) Object.assign(state.repo.security_and_analysis, sa)
      return ok(state.repo)
    }
    if (path.endsWith('/actions/permissions/workflow'))
      return method === 'PUT' ? (Object.assign(state.workflow, body), ok()) : ok(state.workflow)
    if (path.endsWith('/vulnerability-alerts'))
      return method === 'PUT' ? ((state.alerts = true), ok()) : state.alerts ? ok() : { ok: false, status: 404, error: 'Not Found (HTTP 404)' }
    if (path.endsWith('/private-vulnerability-reporting'))
      return method === 'PUT' ? ((state.pvr = true), ok()) : ok({ enabled: state.pvr })
    if (path === 'repos/o/r/rulesets' && method === 'GET')
      return rulesetError ?? ok(state.rulesets.map(({ id, name }) => ({ id, name })))
    if (path === 'repos/o/r/rulesets' && method === 'POST') {
      if (rulesetError) return rulesetError
      state.rulesets.push({ ...body, id: 7, current_user_can_bypass: 'never' })
      return ok()
    }
    if (path === 'repos/o/r/rulesets/7')
      return method === 'PUT' ? (Object.assign(state.rulesets[0], body), ok()) : ok(state.rulesets[0])
    if (path === 'repos/o/r/rules/branches/main')
      return rulesetError ?? ok(state.rulesets.flatMap((ruleset) => ruleset.rules))
    if (path.startsWith('repos/o/r/contents/.github/workflows/pr-title.yml'))
      return prTitleWorkflow ? ok({ name: 'pr-title.yml' }) : { ok: false, status: 404, error: 'Not Found (HTTP 404)' }
    if (path.includes('/check-runs')) return ok({ check_runs: [{ name: 'verify' }] })
    if (path.includes('/statuses')) return ok([])
    return { ok: false, status: 404, error: `unexpected ${method} ${path} (HTTP 404)` }
  }
  return { gh, state }
}

test('applies and verifies the preset on a private repository', () => {
  const { gh, state } = fakeGitHub()
  const report = applyGovernance({ repo: 'o/r', gh })
  assert.equal(report.ok, true)
  assert.deepEqual(report.unsupported, [])
  assert.ok(report.settings.every((s) => s.status === 'verified'), JSON.stringify(report.settings))
  assert.equal(state.repo.allow_merge_commit, REPO_SETTINGS.allow_merge_commit)
  assert.deepEqual(state.workflow, WORKFLOW_PERMISSIONS)
  assert.ok(!report.settings.some((s) => s.id === 'private-vulnerability-reporting'))
})

test('a second run updates the same ruleset instead of adding one', () => {
  const { gh, state } = fakeGitHub({ visibility: 'public' })
  applyGovernance({ repo: 'o/r', gh })
  const second = applyGovernance({ repo: 'o/r', gh })
  assert.equal(second.ok, true)
  assert.equal(state.rulesets.length, 1)
  assert.ok(state.writes.includes('PUT repos/o/r/rulesets/7'))
})

test('reports a plan that cannot protect the branch as unsupported', () => {
  const { gh } = fakeGitHub({
    rulesetError: { ok: false, status: 403, error: 'Upgrade to GitHub Pro or make this repository public to enable this feature. (HTTP 403)' },
  })
  const report = applyGovernance({ repo: 'o/r', gh })
  assert.equal(report.ok, false)
  assert.deepEqual(report.unsupported, ['ruleset'])
})

test('stops without admin rights and writes nothing', () => {
  const { gh, state } = fakeGitHub({ admin: false })
  const report = applyGovernance({ repo: 'o/r', gh })
  assert.equal(report.ok, false)
  assert.deepEqual(report.missingPermissions, ['repository'])
  assert.deepEqual(state.writes, [])
})

test('verify-only writes nothing and reports drift', () => {
  const { gh, state } = fakeGitHub()
  const report = applyGovernance({ repo: 'o/r', gh, verifyOnly: true })
  assert.equal(report.ok, false)
  assert.deepEqual(state.writes, [])
  assert.equal(report.settings.find((s) => s.id === 'merge-policy').status, 'differs')
})

test('the ruleset has no bypass actors, needs no approvals, and allows only squash', () => {
  const body = rulesetBody({ checks: ['verify', 'Vercel'] })
  assert.equal(body.name, RULESET_NAME)
  assert.deepEqual(body.bypass_actors, [])
  const pr = body.rules.find((rule) => rule.type === 'pull_request').parameters
  assert.equal(pr.required_approving_review_count, 0)
  assert.deepEqual(pr.allowed_merge_methods, ['squash'])
  const checks = body.rules.find((rule) => rule.type === 'required_status_checks').parameters.required_status_checks
  assert.deepEqual(checks, [
    { context: 'verify', integration_id: 15368 },
    { context: 'Vercel', integration_id: 8329 },
  ])
})

test('effective rules fail when another ruleset still allows merge commits', () => {
  const rules = [...rulesetBody({ checks: ['verify'] }).rules, { type: 'pull_request', parameters: { allowed_merge_methods: ['merge', 'squash'] } }]
  assert.match(verifyEffectiveRules({ rules, checks: ['verify'] }).join(), /still allows merge, squash/u)
})

const requiredChecks = (state) =>
  state.rulesets[0].rules.find((rule) => rule.type === 'required_status_checks').parameters.required_status_checks.map((c) => c.context)

test('a rerun without checks keeps the checks the ruleset already requires', () => {
  const { gh, state } = fakeGitHub({ visibility: 'public' })
  applyGovernance({ repo: 'o/r', gh, checks: ['validate', 'pr-title'] })
  const rerun = applyGovernance({ repo: 'o/r', gh })
  assert.equal(rerun.ok, true)
  assert.deepEqual(rerun.checks, ['validate', 'pr-title'])
  assert.deepEqual(requiredChecks(state), ['validate', 'pr-title'])
})

test('pr-title is not required where its workflow is missing', () => {
  const { gh, state } = fakeGitHub({ prTitleWorkflow: false })
  const report = applyGovernance({ repo: 'o/r', gh })
  assert.deepEqual(requiredChecks(state), ['verify'])
  assert.equal(report.settings.find((s) => s.id === 'pr-title-workflow').status, 'failed')
})

test('verify-only names plan limits as unsupported, not drift', () => {
  const { gh } = fakeGitHub({
    rulesetError: { ok: false, status: 403, error: 'Upgrade to GitHub Pro or make this repository public to enable this feature. (HTTP 403)' },
  })
  const report = applyGovernance({ repo: 'o/r', gh, verifyOnly: true })
  assert.deepEqual(report.unsupported.sort(), ['ruleset', 'secret-scanning'])
})
