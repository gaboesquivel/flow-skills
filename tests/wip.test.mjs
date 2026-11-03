import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

// Feeds SessionStart JSON through hooks/wip.mjs as Claude Code would, and reads the report from stdout.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const wip = join(repoRoot, 'hooks', 'wip.mjs')

const tempDir = (t, prefix) => {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

const gitIn = (dir) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.email=t@example.com', '-c', 'user.name=t', ...args], { cwd: dir, encoding: 'utf8' })
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`)
  return r.stdout.trim()
}

// A repository on main with origin/HEAD -> main, a kept worktree on spec/1-x with two commits, and an unmerged branch.
const repoInFlight = (t, { origin } = {}) => {
  const dir = tempDir(t, 'flow-wip-repo-')
  const git = gitIn(dir)
  git('init', '-q', '-b', 'main')
  git('commit', '-q', '--allow-empty', '-m', 'init')
  git('update-ref', 'refs/remotes/origin/main', 'HEAD')
  git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main')
  if (origin) git('remote', 'add', 'origin', origin)
  git('branch', 'merged-already')
  git('switch', '-q', '-c', 'feature/unmerged')
  git('commit', '-q', '--allow-empty', '-m', 'wip')
  git('switch', '-q', 'main')
  git('worktree', 'add', '-q', '-b', 'spec/1-x', join(dir, '.worktrees', 'spec-1'))
  const wt = gitIn(join(dir, '.worktrees', 'spec-1'))
  wt('commit', '-q', '--allow-empty', '-m', 'one')
  wt('commit', '-q', '--allow-empty', '-m', 'two')
  return dir
}

// A PATH whose gh is a stub script; git and node stay reachable.
const fakeGh = (t, script) => {
  const bin = tempDir(t, 'flow-wip-bin-')
  writeFileSync(join(bin, 'gh'), `#!/bin/sh\n${script}\n`)
  chmodSync(join(bin, 'gh'), 0o755)
  return `${bin}${delimiter}${process.env.PATH}`
}

const snapshot = (dir) => readdirSync(dir, { recursive: true }).sort().map((p) => `${p}:${statSync(join(dir, p)).mtimeMs}`)

const runWip = (cwd, env = {}) => {
  const started = Date.now()
  const r = spawnSync(process.execPath, [wip], {
    input: JSON.stringify({ hook_event_name: 'SessionStart', source: 'startup', cwd }),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
  const elapsed = Date.now() - started
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stderr, '')
  assert.ok(elapsed < 3000, `took ${elapsed}ms`)
  return r.stdout
}

test('lists kept worktrees and unmerged branches, never the main worktree or merged branches', (t) => {
  const dir = repoInFlight(t)
  const before = snapshot(dir)
  const out = runWip(dir)
  assert.match(out, /^Kept worktrees:\n- \.worktrees\/spec-1 \(spec\/1-x\)$/mu)
  assert.match(out, /^- spec\/1-x: 2 commits not on origin\/main \(worktree \.worktrees\/spec-1\)$/mu)
  assert.match(out, /^- feature\/unmerged: 1 commit not on origin\/main$/mu)
  assert.doesNotMatch(out, /merged-already/u)
  assert.doesNotMatch(out, /Open pull requests/u)
  assert.deepEqual(snapshot(dir), before, 'the hook never writes')
})

test('marks the session\'s own worktree', (t) => {
  const dir = repoInFlight(t)
  assert.match(runWip(join(dir, '.worktrees', 'spec-1')), /^- \.worktrees\/spec-1 \(spec\/1-x, this session\)$/mu)
})

test('a failing gh is silent and the Git report still prints', (t) => {
  const dir = repoInFlight(t, { origin: 'https://github.com/example/repo.git' })
  const out = runWip(dir, { PATH: fakeGh(t, 'echo "not logged in" >&2; exit 1') })
  assert.match(out, /feature\/unmerged/u)
  assert.doesNotMatch(out, /Open pull requests|not logged in/u)
})

test('lists open pull requests when gh answers', (t) => {
  const dir = repoInFlight(t, { origin: 'git@github.com:example/repo.git' })
  const out = runWip(dir, { PATH: fakeGh(t, `echo '[{"number":7,"title":"Add thing","headRefName":"spec/1-x"}]'`) })
  assert.match(out, /^Open pull requests:\n- #7 Add thing \[spec\/1-x\]$/mu)
})

test('silent when nothing is in flight', (t) => {
  const dir = tempDir(t, 'flow-wip-clean-')
  const git = gitIn(dir)
  git('init', '-q', '-b', 'main')
  git('commit', '-q', '--allow-empty', '-m', 'init')
  assert.equal(runWip(dir), '')
})

test('silent outside a repository and on bad input', (t) => {
  const dir = tempDir(t, 'flow-wip-none-')
  mkdirSync(join(dir, 'sub'))
  assert.equal(runWip(join(dir, 'sub'), { GIT_CEILING_DIRECTORIES: dir }), '')
  const r = spawnSync(process.execPath, [wip], { input: 'not json', cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_CEILING_DIRECTORIES: dirname(dir) } })
  assert.equal(r.status, 0)
  assert.equal(r.stdout, '')
})
