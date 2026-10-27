import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const fixture = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/prototype-smoke')

test('prototype smoke fixture runs a CLI-sized experiment', () => {
  const run = spawnSync(process.execPath, [join(fixture, 'health-probe.mjs')], { encoding: 'utf8' })
  assert.equal(run.status, 0)
  assert.match(run.stdout, /suggestedBody/u)
})
