/** Expected Verify section phrases for E34 rubric checks (decision 0040). */
export function verifyReportFromMock({
  commitSha,
  checksGreen = true,
  deploymentUrl = '',
  httpStatus = null,
  deploymentSeen = true,
  deploymentSucceeded = true,
}) {
  const checks = checksGreen ? 'green' : 'failed'
  if (!deploymentSeen) {
    return {
      overall: 'unverified',
      deploymentLine: 'deployment unverified',
      body: `Verification\nCommit: ${commitSha}\nChecks: ${checks}\nDeployment: deployment unverified`,
    }
  }
  if (!deploymentSucceeded) {
    return {
      overall: 'failed',
      deploymentLine: 'deployment failed',
      body: `Verification\nCommit: ${commitSha}\nChecks: ${checks}\nDeployment: failed\nResult: shipped, verification failed`,
    }
  }
  if (httpStatus !== null && (httpStatus < 200 || httpStatus > 299)) {
    return {
      overall: 'failed',
      deploymentLine: deploymentUrl || 'https://demo.example.com',
      body: `Verification\nCommit: ${commitSha}\nChecks: ${checks}\nDeployment: ${deploymentUrl}\nResponse: ${httpStatus}\nResult: shipped, verification failed`,
    }
  }
  return {
    overall: 'live',
    deploymentLine: deploymentUrl,
    body: `Verification\nCommit: ${commitSha}\nChecks: ${checks}\nDeployment: ${deploymentUrl}\nResponse: ${httpStatus ?? 200}\nResult: live`,
  }
}
