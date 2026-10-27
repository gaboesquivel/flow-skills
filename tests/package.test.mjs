import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { validateSkills } from '../scripts/validate.mjs'
import { hashTree } from '../scripts/init/install.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
test('packed release installs its exact source offline and carries notices and references', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-package-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const pack = spawnSync('npm', ['pack', '--ignore-scripts', '--offline', '--json', '--pack-destination', dir, '--cache', join(dir, 'cache')], { cwd: root, encoding: 'utf8', timeout: 20000 })
  assert.equal(pack.status, 0, pack.stderr)
  const [metadata] = JSON.parse(pack.stdout)
  assert.ok(metadata.files.every(({ path }) => !path.startsWith('docs/archive') && !path.includes('upstreams.') && !path.includes('sync-upstreams')))
  assert.ok(metadata.files.some(({ path }) => path === 'ATTRIBUTION.md'))
  const unpack = spawnSync('tar', ['-xzf', join(dir, metadata.filename), '-C', dir], { encoding: 'utf8', timeout: 10000 })
  assert.equal(unpack.status, 0, unpack.stderr)
  const bundled = join(dir, 'package')
  assert.deepEqual(validateSkills(join(bundled, 'skills')), [])
  assert.ok(existsSync(join(bundled, 'skills/tdd/LICENSE')))
  const project = join(dir, 'consumer')
  mkdirSync(project)
  const run = spawnSync(process.execPath, [join(bundled, 'scripts/init/cli.mjs')], { cwd: project, encoding: 'utf8', timeout: 10000, env: { ...process.env, PATH: '' } })
  assert.equal(run.status, 0, run.stderr)
  const manifest = JSON.parse(readFileSync(join(project, '.flow-skills/manifest.json')))
  assert.equal(manifest.flowSkillsVersion, JSON.parse(readFileSync(join(bundled, 'package.json'))).version)
  for (const [name, expected] of Object.entries(manifest.skills)) {
    assert.equal(hashTree(join(bundled, 'skills', name)), expected)
    assert.equal(hashTree(join(project, '.agents/skills', name)), expected)
  }
})
