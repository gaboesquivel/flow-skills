import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

// Feeds PreToolUse JSON through hooks/guard.mjs as Claude Code would, and reads the decision from stdout.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const guard = join(repoRoot, 'hooks', 'guard.mjs')

const tempDir = (t, prefix) => {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

// A git repository on `branch`, with origin/HEAD pointing at main; offline, no remote needed.
const gitRepo = (t, branch) => {
  const dir = tempDir(t, 'flow-guard-repo-')
  const git = (...args) => assert.equal(spawnSync('git', args, { cwd: dir, encoding: 'utf8' }).status, 0, `git ${args.join(' ')}`)
  git('init', '-q', '-b', 'main')
  git('-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'init')
  git('update-ref', 'refs/remotes/origin/main', 'HEAD')
  git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main')
  if (branch !== 'main') git('switch', '-q', '-c', branch)
  return dir
}

const runGuard = (command, { cwd = repoRoot, env = {} } = {}) => {
  const started = Date.now()
  const r = spawnSync(process.execPath, [guard], {
    input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', cwd, tool_input: { command } }),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
  const elapsed = Date.now() - started
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stderr, '')
  if (!r.stdout) return { decision: 'allow', elapsed }
  const out = JSON.parse(r.stdout).hookSpecificOutput
  assert.equal(out.hookEventName, 'PreToolUse')
  assert.equal(out.permissionDecision, 'deny')
  assert.match(out.permissionDecisionReason, /^Flow guard: .+; .+\.$/u, 'a deny names the rule and a safe alternative')
  return { decision: 'deny', reason: out.permissionDecisionReason, elapsed }
}

const expect = (t, command, decision, options) => {
  const result = runGuard(command, options)
  assert.equal(result.decision, decision, `${command} -> ${result.reason ?? 'allow'}`)
  assert.ok(result.elapsed < 2000, `${command} took ${result.elapsed}ms`)
  return result
}

test('spec table: denies and allows', (t) => {
  const cwd = gitRepo(t, 'spec/059-x')
  expect(t, 'git push --force origin spec/059-x', 'deny', { cwd })
  expect(t, 'git push origin HEAD:main', 'deny', { cwd })
  expect(t, 'git commit -m x --no-verify', 'deny', { cwd })
  expect(t, 'gh pr merge 12 --admin', 'deny', { cwd })
  expect(t, 'git push origin spec/059-x', 'allow', { cwd })
  expect(t, 'git commit -m "fix: --no-verify docs"', 'allow', { cwd })
  expect(t, "cat <<'EOF'\ngit push --force origin main\n", 'allow', { cwd })
})

test('force push in every form', (t) => {
  const cwd = gitRepo(t, 'feature')
  for (const command of [
    'git push -f origin feature',
    'git push -uf origin feature',
    'git push --force-with-lease origin feature',
    'git push --force-with-lease=feature:abc origin feature',
    'git push --force-if-includes origin feature',
    'git push origin +feature',
    'git push origin +HEAD:feature',
    'FOO=1 command git push --force origin feature',
    'cd . && git push --force',
    'bash -c "git push --force origin feature"',
  ]) expect(t, command, 'deny', { cwd })
  expect(t, 'git push -u origin feature', 'allow', { cwd })
})

test('push to the default branch', (t) => {
  const feature = gitRepo(t, 'feature')
  for (const command of ['git push origin main', 'git push origin refs/heads/main', 'git push origin feature:main', 'git -C . push origin HEAD:refs/heads/main', 'git push origin :main']) {
    expect(t, command, 'deny', { cwd: feature })
  }
  expect(t, 'git push', 'allow', { cwd: feature })
  expect(t, 'git push origin HEAD', 'allow', { cwd: feature })

  const onMain = gitRepo(t, 'main')
  expect(t, 'git push', 'deny', { cwd: onMain })
  expect(t, 'git push origin', 'deny', { cwd: onMain })
  expect(t, 'git push origin HEAD', 'deny', { cwd: onMain })
})

test('the default branch comes from origin/HEAD', (t) => {
  const cwd = gitRepo(t, 'feature')
  spawnSync('git', ['update-ref', 'refs/remotes/origin/trunk', 'HEAD'], { cwd })
  spawnSync('git', ['symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/trunk'], { cwd })
  expect(t, 'git push origin trunk', 'deny', { cwd })
  expect(t, 'git push origin main', 'allow', { cwd })
})

test('skipping hooks', (t) => {
  const cwd = gitRepo(t, 'feature')
  for (const command of ['git commit -n -m x', 'git commit -anm x', 'git push --no-verify origin feature', 'git merge --no-verify feature', 'git rebase --no-verify main', 'git commit -m "x" "--no-verify"']) {
    expect(t, command, 'deny', { cwd })
  }
  for (const command of ['git commit -m -n', 'git commit -am "skip -n here"', 'git commit -F - <<EOF\nmsg --no-verify\nEOF', 'git merge -n feature', 'echo "--no-verify"']) {
    expect(t, command, 'allow', { cwd })
  }
})

test('destructive commands outside the session directory', (t) => {
  const cwd = gitRepo(t, 'feature')
  const elsewhere = tempDir(t, 'flow-guard-elsewhere-')
  expect(t, `git -C ${elsewhere} reset --hard`, 'deny', { cwd })
  expect(t, 'git -C /tmp/elsewhere reset --hard', 'deny', { cwd })
  expect(t, `cd ${elsewhere} && git reset --hard HEAD`, 'deny', { cwd })
  expect(t, `git -C ${elsewhere} clean -fdx`, 'deny', { cwd })
  expect(t, 'git worktree remove ../other', 'deny', { cwd })
  expect(t, `git worktree remove --force ${elsewhere}`, 'deny', { cwd })

  mkdirSync(join(cwd, '.worktrees', 'mine'), { recursive: true })
  expect(t, 'git reset --hard', 'allow', { cwd })
  expect(t, 'git reset --hard origin/main', 'allow', { cwd })
  expect(t, 'git clean -fd', 'allow', { cwd })
  expect(t, 'git worktree remove .worktrees/mine', 'allow', { cwd })
  expect(t, `git -C ${elsewhere} status`, 'allow', { cwd })
})

test('merge gate runs required-checks and fails closed', (t) => {
  const cwd = gitRepo(t, 'feature')
  const dir = tempDir(t, 'flow-guard-stub-')
  const stub = (name, body) => { const path = join(dir, name); writeFileSync(path, body); return path }
  const green = stub('green.mjs', 'console.log(JSON.stringify({ ready: true, reasons: [] }))\n')
  const red = stub('red.mjs', "console.log(JSON.stringify({ ready: false, reasons: ['ci is failure on abc1234'] })); process.exitCode = 1\n")
  const unreachable = stub('unreachable.mjs', "console.log(JSON.stringify({ ready: false, reasons: ['cannot read repos/o/r/pulls/12'] })); process.exitCode = 2\n")

  expect(t, 'gh pr merge 12 -R o/r --squash', 'allow', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: green } })
  expect(t, 'gh pr merge https://github.com/o/r/pull/12 --squash', 'allow', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: green } })
  const failing = expect(t, 'gh pr merge 12 --repo o/r --squash --delete-branch', 'deny', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: red } })
  assert.match(failing.reason, /o\/r#12.*ci is failure on abc1234/u)
  const offline = expect(t, 'gh pr merge 12 -R o/r', 'deny', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: unreachable } })
  assert.match(offline.reason, /cannot read/u)
  expect(t, 'gh pr merge 12 -R o/r', 'deny', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: join(dir, 'missing.mjs') } })
  expect(t, 'gh pr merge 12 -R o/r --admin', 'deny', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: green } })
  expect(t, 'gh pr merge 12 -R o/r --disable-auto', 'allow', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: red } })
})

test('allows what it does not recognise or cannot parse', (t) => {
  const cwd = gitRepo(t, 'feature')
  for (const command of ['ls -la', 'npm test', 'echo "unbalanced', 'git status', 'gh pr view 12', 'git log --oneline | head', "echo 'git push --force origin main'"]) {
    expect(t, command, 'allow', { cwd })
  }
  const empty = spawnSync(process.execPath, [guard], { input: 'not json', encoding: 'utf8' })
  assert.equal(empty.status, 0)
  assert.equal(empty.stdout, '')
})
