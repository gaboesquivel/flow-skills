import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { runBootstrap, unsafeStagedPaths } from '../skills/start/lib/bootstrap.mjs'

const runner = join(dirname(fileURLToPath(import.meta.url)), '../skills/start/lib/bootstrap.mjs')

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim()

const templateCheckout = () => {
  const dir = mkdtempSync(join(tmpdir(), 'start-runner-'))
  git(dir, 'init', '-q')
  git(dir, 'config', 'user.email', 'start-runner@test.invalid')
  git(dir, 'config', 'user.name', 'Start Runner Test')
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'flow-next', portless: { name: 'flow-next' }, scripts: { qa: 'true' } }, null, 2))
  writeFileSync(join(dir, 'README.md'), '# flow-next\n')
  writeFileSync(join(dir, '.gitignore'), 'node_modules\n.next\n.env.local\n')
  git(dir, 'add', '-A')
  git(dir, 'commit', '-q', '-m', 'template')
  git(dir, 'remote', 'add', 'origin', 'https://github.com/gaboesquivel/flow-next.git')
  return dir
}

const scripts = (failing = []) => {
  const calls = []
  const run = ({ script, env }) => {
    calls.push({ script, env })
    return failing.includes(script) ? { status: 'failed', detail: `${script} failed` } : { status: 'passed', detail: '' }
  }
  return { calls, run }
}

test('runner initializes a template checkout in place and commits', async () => {
  const dir = templateCheckout()
  const { calls, run } = scripts()
  const result = await runBootstrap({ destinationPath: dir, projectName: 'Acme Notes', preset: 'minimal', run })
  assert.equal(result.ok, true, JSON.stringify(result.blockers))
  assert.equal(result.template, 'flow-next')
  assert.deepEqual(result.removedRemotes, ['origin'])
  assert.equal(git(dir, 'remote'), '')
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, 'acme-notes')
  assert.ok(existsSync(join(dir, 'PRODUCT.md')))
  assert.equal(git(dir, 'log', '-1', '--format=%s'), 'chore: initialize acme-notes')
  assert.equal(result.clean, true)
  assert.deepEqual(calls[0], { script: 'setup', env: { FLOW_PRESET: 'minimal' } })
  assert.ok(result.checks.every((check) => check.status === 'passed'))
  rmSync(dir, { recursive: true })
})

test('runner reports a failed check and makes no commit', async () => {
  const dir = templateCheckout()
  const { run } = scripts(['qa'])
  const result = await runBootstrap({ destinationPath: dir, projectName: 'acme-notes', run })
  assert.equal(result.ok, false)
  assert.match(result.blockers[0], /qa/u)
  assert.equal(git(dir, 'log', '-1', '--format=%s'), 'template')
  rmSync(dir, { recursive: true })
})

test('runner refuses a directory that is not a template', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'start-runner-'))
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'something-else' }))
  const result = await runBootstrap({ destinationPath: dir, projectName: 'acme', run: scripts().run })
  assert.equal(result.ok, false)
  rmSync(dir, { recursive: true })
})

test('runner refuses to commit secrets or build output that setup left unignored', async () => {
  const dir = templateCheckout()
  const run = ({ script, cwd }) => {
    if (script === 'setup') writeFileSync(join(cwd, '.env'), 'DATABASE_URL=postgres://secret\n')
    return { status: 'passed', detail: '' }
  }
  const result = await runBootstrap({ destinationPath: dir, projectName: 'acme-notes', run })
  assert.equal(result.ok, false)
  assert.match(result.blockers[0], /\.env/u)
  assert.equal(git(dir, 'log', '-1', '--format=%s'), 'template')
  assert.equal(git(dir, 'diff', '--cached', '--name-only'), '')
  assert.deepEqual(unsafeStagedPaths(['.env.example', 'apps/web/.env.local', 'src/index.ts', '.next/x']), ['apps/web/.env.local', '.next/x'])
  rmSync(dir, { recursive: true })
})

test('runner blocks when the Flow block file would be ignored', async () => {
  const dir = templateCheckout()
  writeFileSync(join(dir, '.gitignore'), 'node_modules\n.next\n.env.local\n/CLAUDE.md\n')
  git(dir, 'commit', '-qam', 'ignore claude')
  const result = await runBootstrap({ destinationPath: dir, projectName: 'acme-notes', run: scripts().run })
  assert.equal(result.ok, false)
  assert.match(result.blockers[0], /not tracked/u)
  rmSync(dir, { recursive: true })
})

test('runner CLI runs through a symlink and rejects an unknown preset', () => {
  const dir = templateCheckout()
  const link = join(mkdtempSync(join(tmpdir(), 'start-runner-link-')), 'bootstrap.mjs')
  symlinkSync(runner, link)
  let status = 0
  let stdout = ''
  try {
    execFileSync(process.execPath, [link, dir, 'acme-notes', '--preset'], { encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    status = error.status
    stdout = error.stdout
  }
  assert.equal(status, 1)
  assert.match(JSON.parse(stdout).blockers[0], /preset must be minimal or neon/u)
  rmSync(dir, { recursive: true })
  rmSync(dirname(link), { recursive: true })
})
