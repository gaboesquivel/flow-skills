import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourceFixture = join(root, 'tests/fixtures/example-project')
const preamble = '# Example project\n\nPre-existing agent instructions must survive Flow init.\n'

test('example-project fixture keeps preamble through bootstrap-only init', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-example-project-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  cpSync(sourceFixture, dir, { recursive: true })
  const run = () =>
    spawnSync(process.execPath, [join(root, 'scripts/init/cli.mjs'), '--skip-skills'], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 10000,
      env: { ...process.env, PATH: '' },
    })
  const first = run()
  assert.equal(first.status, 0, first.stderr)
  const agents = readFileSync(join(dir, 'AGENTS.md'), 'utf8')
  assert.ok(agents.startsWith(preamble))
  assert.equal(run().status, 0)
  assert.equal(readFileSync(join(dir, 'AGENTS.md'), 'utf8'), agents)
})
