import assert from 'node:assert/strict'
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { countTasks, deriveBoard, parseStatus, readSnapshot, renderHtml, startServer } from '../skills/board/scripts/board.mjs'

const script = join(import.meta.dirname, '../skills/board/scripts/board.mjs')

const spec = (title, status, rest = '') => `# ${title}\n\n${status === null ? '' : `Status: ${status} (2026-10-28).\n`}\n## Problem\n\nText.\n${rest}`
const snapshot = (specs, branches = []) => ({ defaultBranch: 'main', branches, specs: Object.entries(specs).map(([file, content]) => ({ file, content, source: 'main' })) })
const stageOf = (board, number) => board.columns.find((column) => column.cards.some((card) => card.number === number))?.id
const cardOf = (board, number) => board.columns.flatMap((column) => column.cards).find((card) => card.number === number)

test('board has five columns in stage order', () => {
  const board = deriveBoard(snapshot({}))
  assert.deepEqual(board.columns.map((column) => column.title), ['Candidate', 'Specced', 'Ready', 'Building', 'Shipped'])
})

test('status implemented is Shipped', () => {
  assert.equal(stageOf(deriveBoard(snapshot({ '001-a.md': spec('001: A', 'implemented') })), '001'), 'shipped')
})

test('draft without tasks is Specced, without marker', () => {
  const board = deriveBoard(snapshot({ '002-b.md': spec('002: B', 'draft') }))
  assert.equal(stageOf(board, '002'), 'specced')
  assert.equal(cardOf(board, '002').marker, null)
  assert.equal(cardOf(board, '002').title, 'B')
})

test('candidate status is Candidate, not swallowed by Specced', () => {
  assert.equal(stageOf(deriveBoard(snapshot({ '003-c.md': spec('003: C', 'candidate') })), '003'), 'candidate')
})

test('missing or unknown status is Specced with a marker', () => {
  const board = deriveBoard(snapshot({ '004-d.md': spec('004: D', null), '005-e.md': spec('005: E', 'proposed') }))
  assert.equal(stageOf(board, '004'), 'specced')
  assert.equal(cardOf(board, '004').marker, 'no status line')
  assert.equal(stageOf(board, '005'), 'specced')
  assert.match(cardOf(board, '005').marker, /unknown status "proposed"/u)
})

test('bold status lines parse; task status lines below the header do not', () => {
  assert.equal(parseStatus('# 1: X\n\n**Status:** Implemented\n'), 'implemented')
  assert.equal(parseStatus('# 1: X\n\n## Tasks\n\n**Status:** done\n'), null)
})

test('tasks with none done is Ready; one done is Building', () => {
  const ready = spec('006: F', 'draft', '\n## Tasks\n\n- [ ] one\n- [ ] two\n')
  const started = spec('007: G', 'draft', '\n## Tasks\n\n- [x] one\n- [ ] two\n')
  const board = deriveBoard(snapshot({ '006-f.md': ready, '007-g.md': started }))
  assert.equal(stageOf(board, '006'), 'ready')
  assert.equal(stageOf(board, '007'), 'building')
  assert.deepEqual(cardOf(board, '007').tasks, { done: 1, total: 2 })
})

test('task counting: checkboxes, or ### headings with Status done or all boxes checked', () => {
  assert.deepEqual(countTasks('# X\n\n## Tasks\n\n- [x] a\n- [X] b\n- [ ] c\n\n## Notes\n\n- [ ] not a task\n'), { done: 2, total: 3 })
  const headed = [
    '## Tasks', '',
    '### 01: One', '**Status:** done in #12', '- [ ] stale box', '',
    '### 02: Two', '**Status:** planned', '- [x] a', '- [x] b', '',
    '### 03: Three', '**Status:** planned', '- [x] a', '- [ ] b', '',
  ].join('\n')
  assert.deepEqual(countTasks(headed), { done: 2, total: 3 })
  assert.deepEqual(countTasks('# X\n\nno tasks\n'), { done: 0, total: 0 })
})

test('unmerged branch whose last segment contains the slug is Building', () => {
  const branches = [{ name: 'feat/progress-board', remote: false, merged: false }, { name: 'feat/other', remote: false, merged: false }]
  const board = deriveBoard(snapshot({ '012-progress-board.md': spec('012: Progress board', 'draft') }, branches))
  assert.equal(stageOf(board, '012'), 'building')
  assert.equal(cardOf(board, '012').branch, 'feat/progress-board')
})

test('merged spec branch is Shipped even when status is draft', () => {
  const branches = [{ name: 'origin/spec/009-flow-mode', remote: true, merged: true, implementation: true }]
  const board = deriveBoard(snapshot({ '009-flow-mode.md': spec('009: Flow mode', 'draft') }, branches))
  assert.equal(stageOf(board, '009'), 'shipped')
})

test('renderHtml escapes text', () => {
  const html = renderHtml(deriveBoard(snapshot({ '001-x.md': spec('001: <script>alert(1)</script>', 'draft') })))
  assert.doesNotMatch(html, /<script>/u)
  assert.match(html, /&lt;script&gt;/u)
})

function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'board-git-'))
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  git('init', '--quiet', '--initial-branch=main')
  git('config', 'user.email', 'board@test.invalid')
  git('config', 'user.name', 'Board Test')
  git('config', 'commit.gpgsign', 'false')
  const write = (file, content) => { mkdirSync(join(dir, 'docs/specs'), { recursive: true }); writeFileSync(join(dir, 'docs/specs', file), content) }
  const commit = (message) => { git('add', '-A'); git('commit', '--quiet', '-m', message) }
  return { dir, git, write, commit }
}

test('readSnapshot and --once render a fixture repository', () => {
  const { dir, git, write, commit } = makeRepo()
  try {
    write('README.md', '# Specs\n')
    write('001-shipped.md', spec('001: Shipped thing', 'implemented'))
    write('002-idea.md', spec('002: Idea', 'candidate'))
    write('003-plain.md', spec('003: Plain draft', 'draft'))
    write('004-planned.md', spec('004: Planned', 'draft', '\n## Tasks\n\n- [ ] one\n'))
    write('005-merged-work.md', spec('005: Merged work', 'draft'))
    write('006-active.md', spec('006: Active', 'draft'))
    commit('specs')
    git('switch', '--quiet', '-c', 'feat/merged-work')
    writeFileSync(join(dir, 'work.txt'), 'done\n')
    commit('work')
    git('switch', '--quiet', 'main')
    git('merge', '--quiet', '--no-ff', '-m', 'merge', 'feat/merged-work')
    git('branch', 'feat/active')
    git('switch', '--quiet', 'feat/active')
    writeFileSync(join(dir, 'active.txt'), 'wip\n')
    write('007-branch-only.md', spec('007: Branch only', 'draft'))
    commit('wip')
    git('switch', '--quiet', 'main')

    const snap = readSnapshot(dir)
    assert.equal(snap.defaultBranch, 'main')
    assert.equal(snap.specs.some((s) => s.file === 'README.md'), false)
    const board = deriveBoard(snap)
    assert.equal(stageOf(board, '001'), 'shipped')
    assert.equal(stageOf(board, '002'), 'candidate')
    assert.equal(stageOf(board, '003'), 'specced')
    assert.equal(stageOf(board, '004'), 'ready')
    assert.equal(stageOf(board, '005'), 'shipped')
    assert.equal(stageOf(board, '006'), 'building')
    assert.equal(cardOf(board, '007').source, 'feat/active')

    const out = join(dir, 'out', 'board.html')
    const run = spawnSync(process.execPath, [script, '--once', '--out', out], { cwd: join(dir, 'docs'), encoding: 'utf8' })
    assert.equal(run.status, 0, run.stderr)
    assert.equal(run.stdout.trim(), out)
    const html = readFileSync(out, 'utf8')
    for (const title of ['Candidate', 'Specced', 'Ready', 'Building', 'Shipped']) assert.match(html, new RegExp(`<h2>${title} `, 'u'))
    for (const title of ['Shipped thing', 'Idea', 'Plain draft', 'Planned', 'Merged work', 'Active']) assert.match(html, new RegExp(title, 'u'))
    assert.doesNotMatch(html, /https?:\/\//u)

    const defaultRun = spawnSync(process.execPath, [script, '--once', '--repo', dir], { encoding: 'utf8' })
    assert.equal(defaultRun.status, 0, defaultRun.stderr)
    assert.match(defaultRun.stdout.trim(), /\.git[/\\]flow[/\\]board\.html$/u)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('CLI without a mode prints usage', () => {
  const run = spawnSync(process.execPath, [script], { encoding: 'utf8' })
  assert.equal(run.status, 2)
  assert.match(run.stderr, /--once/u)
})

function withRepo(fn) {
  const repo = makeRepo()
  try { return fn(repo) } finally { rmSync(repo.dir, { recursive: true, force: true }) }
}

const touch = (dir, file) => writeFileSync(join(dir, file), `${file}\n`)

test('branch match uses slug token boundaries, not substrings', () => withRepo(({ dir, git, write, commit }) => {
  write('001-board.md', spec('001: Board', 'draft'))
  write('002-auth.md', spec('002: Auth', 'draft'))
  write('003-api.md', spec('003: Api', 'draft'))
  write('004-live.md', spec('004: Live', 'draft'))
  commit('specs')
  for (const branch of ['feat/dashboard', 'fix/oauth-token', 'feat/rapid-fix', 'feat/004-live-page']) {
    git('switch', '--quiet', '-c', branch, 'main')
    touch(dir, branch.replace('/', '-'))
    commit(branch)
  }
  git('switch', '--quiet', 'main')
  const board = deriveBoard(readSnapshot(dir))
  for (const number of ['001', '002', '003']) {
    assert.equal(stageOf(board, number), 'specced', number)
    assert.equal(cardOf(board, number).branch, null, number)
  }
  assert.equal(stageOf(board, '004'), 'building')
  assert.equal(cardOf(board, '004').branch, 'feat/004-live-page')
}))

test('empty branch cut from an older default commit is not merged', () => withRepo(({ dir, git, write, commit }) => {
  write('001-old-branch.md', spec('001: Old branch', 'draft'))
  commit('specs')
  git('branch', 'feat/old-branch')
  touch(dir, 'later.txt')
  commit('main moves on')
  const snap = readSnapshot(dir)
  assert.equal(snap.branches.find((b) => b.name === 'feat/old-branch').merged, false)
  assert.equal(stageOf(deriveBoard(snap), '001'), 'building')
}))

test('merged branch ships only when tasks are done; card branch is the one the rule used', () => withRepo(({ dir, git, write, commit }) => {
  touch(dir, 'README.md')
  commit('init')
  git('switch', '--quiet', '-c', 'feat/tasked')
  write('001-tasked.md', spec('001: Tasked', 'draft', '\n## Tasks\n\n- [ ] a\n- [ ] b\n- [ ] c\n'))
  commit('spec only')
  git('switch', '--quiet', 'main')
  git('merge', '--quiet', '--no-ff', '-m', 'merge tasked', 'feat/tasked')
  git('switch', '--quiet', '-c', 'feat/finished')
  write('002-finished.md', spec('002: Finished', 'draft', '\n## Tasks\n\n- [x] a\n- [x] b\n'))
  touch(dir, 'feature.js')
  commit('finished')
  git('switch', '--quiet', 'main')
  git('merge', '--quiet', '--no-ff', '-m', 'merge finished', 'feat/finished')
  git('switch', '--quiet', '-c', 'feat/finished-followup')
  touch(dir, 'followup.txt')
  commit('followup')
  git('switch', '--quiet', 'main')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'ready')
  assert.deepEqual(cardOf(board, '001').tasks, { done: 0, total: 3 })
  assert.equal(stageOf(board, '002'), 'shipped')
  assert.equal(cardOf(board, '002').reason, 'branch feat/finished merged')
  assert.equal(cardOf(board, '002').branch, 'feat/finished')
}))

test('squash-merged branch counts as merged', () => withRepo(({ dir, git, write, commit }) => {
  write('001-squashed.md', spec('001: Squashed', 'draft'))
  commit('specs')
  git('switch', '--quiet', '-c', 'feat/squashed')
  touch(dir, 'a.txt')
  commit('a')
  touch(dir, 'b.txt')
  commit('b')
  git('switch', '--quiet', 'main')
  git('merge', '--quiet', '--squash', 'feat/squashed')
  commit('squash')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'shipped')
  assert.equal(cardOf(board, '001').branch, 'feat/squashed')
}))

test('branch-only specs cap at Building, dedupe by number, prefer local refs', () => withRepo(({ dir, git, write, commit }) => {
  write('002-alpha.md', spec('002: Alpha', 'draft'))
  commit('main spec')
  git('switch', '--quiet', '-c', 'feat/side')
  write('001-side.md', spec('001: Side', 'implemented'))
  write('002-beta.md', spec('002: Beta', 'draft'))
  commit('side specs')
  git('switch', '--quiet', '-c', 'feat/zeta', 'main')
  write('003-shared.md', spec('003: Shared local', 'draft'))
  commit('zeta')
  git('switch', '--quiet', '-c', 'tmp', 'main')
  write('003-shared.md', spec('003: Shared remote', 'draft'))
  commit('remote copy')
  git('update-ref', 'refs/remotes/origin/feat/aaa', 'HEAD')
  git('switch', '--quiet', 'main')
  git('branch', '-D', 'tmp')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'building')
  assert.match(cardOf(board, '001').marker, /on branch feat\/side/u)
  assert.equal(cardOf(board, '001').branch, 'feat/side')
  assert.equal(cardOf(board, '002').slug, 'alpha')
  assert.match(cardOf(board, '002').marker, /number 002 also used by 002-beta\.md on feat\/side/u)
  assert.equal(cardOf(board, '003').title, 'Shared local')
  assert.equal(cardOf(board, '003').source, 'feat/zeta')
}))

test('full refnames and -z listing: a tag named main and non-ASCII names do not break reads', () => withRepo(({ dir, git, write, commit }) => {
  touch(dir, 'README.md')
  commit('init')
  git('tag', 'main')
  write('001-café.md', spec('001: Café', 'implemented'))
  commit('specs')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(cardOf(board, '001').title, 'Café')
  assert.equal(stageOf(board, '001'), 'shipped')
}))

test('default branch falls back to init.defaultBranch, else exits 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'board-nodefault-'))
  const env = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }
  const run = (...args) => execFileSync('git', args, { cwd: dir, env, stdio: ['ignore', 'pipe', 'pipe'] })
  try {
    run('init', '--quiet', '--initial-branch=trunk')
    run('config', 'user.email', 'board@test.invalid')
    run('config', 'user.name', 'Board Test')
    run('config', 'commit.gpgsign', 'false')
    touch(dir, 'README.md')
    run('add', '-A')
    run('commit', '--quiet', '-m', 'init')
    const missing = spawnSync(process.execPath, [script, '--json', '--repo', dir], { encoding: 'utf8', env })
    assert.equal(missing.status, 1)
    assert.match(missing.stderr, /No default branch/u)
    run('config', 'init.defaultBranch', 'trunk')
    const found = spawnSync(process.execPath, [script, '--json', '--repo', dir], { encoding: 'utf8', env })
    assert.equal(found.status, 0, found.stderr)
    assert.equal(JSON.parse(found.stdout).defaultBranch, 'trunk')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('merging a candidate spec branch does not ship it', () => withRepo(({ dir, git, write, commit }) => {
  touch(dir, 'README.md')
  commit('init')
  git('switch', '--quiet', '-c', 'explore/payments-flow')
  write('001-payments-flow.md', spec('001: Payments flow', 'candidate'))
  touch(dir, 'notes.js')
  commit('explore')
  git('switch', '--quiet', 'main')
  git('merge', '--quiet', '--no-ff', '-m', 'merge explore', 'explore/payments-flow')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'candidate')
  assert.equal(cardOf(board, '001').branch, null)
}))

test('docs-only squash merge of a draft without tasks is not shipped', () => withRepo(({ dir, git, write, commit }) => {
  touch(dir, 'README.md')
  commit('init')
  git('switch', '--quiet', '-c', 'docs/006-search')
  write('006-search.md', spec('006: Search', 'draft'))
  commit('spec')
  git('switch', '--quiet', 'main')
  git('merge', '--quiet', '--squash', 'docs/006-search')
  commit('squash spec')
  const snap = readSnapshot(dir)
  const branch = snap.branches.find((b) => b.name === 'docs/006-search')
  assert.equal(branch.merged, true)
  assert.equal(branch.implementation, false)
  assert.equal(stageOf(deriveBoard(snap), '006'), 'specced')
}))

test('add-then-revert branch is not implementation work', () => withRepo(({ dir, git, write, commit }) => {
  write('001-revert.md', spec('001: Revert', 'draft'))
  commit('specs')
  git('switch', '--quiet', '-c', 'feat/revert')
  touch(dir, 'code.js')
  commit('add')
  git('rm', '--quiet', 'code.js')
  commit('revert')
  git('switch', '--quiet', 'main')
  git('merge', '--quiet', '--no-ff', '-m', 'merge revert', 'feat/revert')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'specced')
}))

test('status rule cards carry no fallback branch; implemented with open tasks is marked', () => {
  const branches = [{ name: 'origin/feat/explore-redesign', remote: true, merged: true, implementation: true }]
  const content = spec('010: Explore redesign', 'implemented', '\n## Tasks\n\n- [x] a\n- [ ] b\n')
  const board = deriveBoard(snapshot({ '010-explore-redesign.md': content }, branches))
  assert.equal(stageOf(board, '010'), 'shipped')
  assert.equal(cardOf(board, '010').branch, null)
  assert.equal(cardOf(board, '010').marker, 'status implemented, 1 task open')
})

test('repository without commits says so', () => {
  const dir = mkdtempSync(join(tmpdir(), 'board-unborn-'))
  try {
    execFileSync('git', ['init', '--quiet'], { cwd: dir })
    const run = spawnSync(process.execPath, [script, '--json', '--repo', dir], { encoding: 'utf8' })
    assert.equal(run.status, 1)
    assert.match(run.stderr, /No commits yet/u)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('--repo or --out without a value prints usage and exits 2', () => {
  for (const args of [['--once', '--repo'], ['--once', '--out'], ['--once', '--out', '--json']]) {
    const run = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' })
    assert.equal(run.status, 2, args.join(' '))
    assert.match(run.stderr, /Usage/u)
  }
})

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))
const MEMO_WINDOW = 1100

function statusWithHost(url, host) {
  return new Promise((done, fail) => {
    http.get(url, { headers: { host } }, (res) => { res.resume(); res.on('end', () => done(res.statusCode)) }).on('error', fail)
  })
}

test('live server: /state JSON, page, memo window, new commits, git failure, host check', async () => {
  const { dir, write, commit } = makeRepo()
  write('001-first.md', spec('001: First', 'draft'))
  commit('first')
  const live = await startServer({ repoRoot: dir, port: 0 })
  try {
    assert.equal(live.server.address().address, '127.0.0.1')
    assert.match(live.url, /^http:\/\/127\.0\.0\.1:\d+\/$/u)

    const res = await fetch(new URL('state', live.url))
    assert.equal(res.status, 200)
    assert.match(res.headers.get('content-type'), /application\/json/u)
    const board = await res.json()
    assert.deepEqual(board.columns.map((column) => column.id), ['candidate', 'specced', 'ready', 'building', 'shipped'])
    assert.equal(board.defaultBranch, 'main')
    assert.deepEqual(Object.keys(cardOf(board, '001')).sort(), ['branch', 'marker', 'number', 'reason', 'slug', 'source', 'status', 'tasks', 'title'])

    const html = await (await fetch(live.url)).text()
    assert.match(html, /<h2>Specced <span class="count">1<\/span>/u)
    assert.match(html, /fetch\('state'/u)
    assert.match(html, /id="banner"/u)
    assert.doesNotMatch(html, /https?:\/\//u)
    assert.doesNotMatch(html, /innerHTML/u)

    write('002-second.md', spec('002: Second', 'candidate'))
    commit('second')
    const memoized = await (await fetch(new URL('state', live.url))).json()
    assert.equal(memoized.generatedAt, board.generatedAt, 'recomputed inside the memo window')
    await sleep(MEMO_WINDOW)
    const fresh = await (await fetch(new URL('state', live.url))).json()
    assert.equal(stageOf(fresh, '002'), 'candidate')

    renameSync(join(dir, '.git'), join(dir, '.git-off'))
    await sleep(MEMO_WINDOW)
    const failed = await fetch(new URL('state', live.url))
    assert.equal(failed.status, 500)
    assert.equal(typeof (await failed.json()).error, 'string')
    assert.match(await (await fetch(live.url)).text(), /Second/u, 'page keeps the last good board')
    renameSync(join(dir, '.git-off'), join(dir, '.git'))

    assert.equal(await statusWithHost(live.url, 'evil.example'), 403)
    assert.equal((await fetch(new URL('nope', live.url))).status, 404)
  } finally {
    await live.close()
    rmSync(dir, { recursive: true, force: true })
  }
  assert.equal(live.server.listening, false)
})

test('--serve prints the URL and exits 0 on SIGTERM', async () => {
  const { dir, write, commit } = makeRepo()
  write('001-served.md', spec('001: Served', 'draft'))
  commit('specs')
  const child = spawn(process.execPath, [script, '--serve', '--port', '0', '--repo', dir], { stdio: ['ignore', 'pipe', 'pipe'] })
  const exited = new Promise((done) => child.on('exit', (code, signal) => done({ code, signal })))
  try {
    let out = ''
    const url = await new Promise((done, fail) => {
      child.stdout.on('data', (chunk) => { out += chunk; const match = /http:\/\/127\.0\.0\.1:\d+\//u.exec(out); if (match) done(match[0]) })
      child.on('exit', () => fail(new Error(`server exited early: ${out}`)))
    })
    const board = await (await fetch(new URL('state', url))).json()
    assert.equal(cardOf(board, '001').title, 'Served')
    child.kill('SIGTERM')
    assert.deepEqual(await exited, { code: 0, signal: null })
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    rmSync(dir, { recursive: true, force: true })
  }
})

test('--serve rejects bad ports and mixed modes', () => {
  for (const args of [['--serve', '--port', 'x'], ['--serve', '--port', '70000'], ['--serve', '--once']]) {
    const run = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' })
    assert.equal(run.status, 2, args.join(' '))
  }
})
