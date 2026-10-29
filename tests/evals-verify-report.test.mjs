import assert from 'node:assert/strict'
import test from 'node:test'
import { verifyReportFromMock } from './evals/lib/verify-report.mjs'

const sha = 'abc1234'

test('E34 (a) live deployment report', () => {
  const report = verifyReportFromMock({
    commitSha: sha,
    deploymentUrl: 'https://demo.example.com',
    httpStatus: 200,
  })
  assert.match(report.body, /Verification/u)
  assert.match(report.body, /200/u)
  assert.equal(report.overall, 'live')
})

test('E34 (b) deployment unverified report', () => {
  const report = verifyReportFromMock({ commitSha: sha, deploymentSeen: false })
  assert.match(report.body, /deployment unverified/u)
  assert.equal(report.overall, 'unverified')
})

test('E34 (c) shipped verification failed on 503', () => {
  const report = verifyReportFromMock({
    commitSha: sha,
    deploymentUrl: 'https://demo.example.com',
    httpStatus: 503,
  })
  assert.match(report.body, /shipped, verification failed/u)
  assert.match(report.body, /503/u)
  assert.equal(report.overall, 'failed')
})
