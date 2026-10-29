import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = join(import.meta.dirname, '..')

const runFixtureTests = ({ relDir }) => {
  const cwd = join(repoRoot, relDir)
  const result = spawnSync('pnpm', ['test'], { cwd, encoding: 'utf8', shell: false })
  assert.equal(
    result.status,
    0,
    `${relDir}: pnpm test failed\n${result.stdout}\n${result.stderr}`,
  )
}

test('e34-ship-verify fixture tests pass', () =>
  runFixtureTests({ relDir: 'tests/fixtures/e34-ship-verify' }))

test('e37-build-outcomes fixture tests pass', () =>
  runFixtureTests({ relDir: 'tests/fixtures/e37-build-outcomes' }))
