import assert from 'node:assert/strict'
import { existsSync, lstatSync, mkdtempSync, mkdirSync, readlinkSync, symlinkSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import test from 'node:test'
import { deriveProjectIdentity, inferTemplateFromRequest, isForbiddenInstructionPath } from '../skills/start/lib/identity.mjs'
import {
  assessDestination,
  detectTemplateCheckout,
  assertNoTemplateOrigin,
  copyTemplateInto,
  isTemplateRemoteUrl,
} from '../skills/start/lib/git-safety.mjs'
import {
  applyRenameToFile,
  applyTemplateRenamesToText,
  findStaleTemplateReferencesInText,
  renameAllowlistForTemplate,
  scanTreeForStaleIdentifiers,
} from '../skills/start/lib/rename.mjs'
import { buildBaselineDocs, baselineDocsRejectFlowIdentity, baselineDocsIncludeProjectName } from '../skills/start/lib/baseline-docs.mjs'
import { canCreateInitialCommit, formatInitialCommitMessage, ESSENTIAL_CHECK_IDS } from '../skills/start/lib/commit-gate.mjs'

const identity = deriveProjectIdentity({ projectName: 'Acme Radar' }).identity

test('deriveProjectIdentity normalizes slug and portless host', () => {
  const ok = deriveProjectIdentity({ projectName: 'Acme Radar' })
  assert.equal(ok.ok, true)
  assert.equal(ok.identity.slug, 'acme-radar')
  assert.equal(ok.identity.portlessHost, 'acme-radar.localhost')
  assert.equal(ok.identity.displayTitle, 'Acme Radar')
})

test('deriveProjectIdentity rejects empty and invalid names', () => {
  assert.equal(deriveProjectIdentity({ projectName: '   ' }).ok, false)
  assert.equal(deriveProjectIdentity({ projectName: '---' }).ok, false)
})

test('flow-next rename updates MCP and operator prompt', () => {
  const pkg = applyRenameToFile({
    template: 'flow-next',
    identity,
    relativePath: 'package.json',
    content: JSON.stringify({ name: 'flow-next', portless: { name: 'flow-next', script: 'dev:app' } }, null, 2),
  }).content
  assert.match(pkg, /"name": "acme-radar"/u)
  assert.match(pkg, /"script": "dev:app"/u)

  const layout = applyRenameToFile({
    template: 'flow-next',
    identity,
    relativePath: 'app/layout.tsx',
    content: 'title: "Flow Next"',
  }).content
  assert.match(layout, /Acme Radar/u)
  assert.doesNotMatch(layout, /Flow Next/u)

  const prompt = readFileSync(join(import.meta.dirname, 'fixtures/start-bootstrap/flow-next-operator-prompt.ts'), 'utf8')
  const renamed = applyTemplateRenamesToText({ template: 'flow-next', identity, text: prompt })
  assert.match(renamed, /Acme Radar deployment/u)
})

test('flow-mono rename updates portless host but preserves web package name', () => {
  const webPkg = applyRenameToFile({
    template: 'flow-mono',
    identity,
    relativePath: 'apps/web/package.json',
    content: JSON.stringify({ name: 'web', portless: { name: 'app' } }, null, 2),
  }).content
  assert.match(webPkg, /"name": "web"/u)
  assert.match(webPkg, /portless[\s\S]*"name": "acme-radar"/u)

  const next = applyRenameToFile({
    template: 'flow-mono',
    identity,
    relativePath: 'apps/web/next.config.ts',
    content: 'allowedDevOrigins: ["app.localhost"]',
  }).content
  assert.match(next, /acme-radar\.localhost/u)
})

test('stale scan skips INTEROP and flags leftover template ids', () => {
  const interop = readFileSync(join(import.meta.dirname, 'fixtures/start-bootstrap/flow-mono-interop.md'), 'utf8')
  assert.deepEqual(findStaleTemplateReferencesInText({ template: 'flow-mono', text: interop, relativePath: 'docs/INTEROP.md' }), [])

  const hits = findStaleTemplateReferencesInText({
    template: 'flow-next',
    text: 'Visit flow-next.localhost',
    relativePath: 'README.md',
  })
  assert.ok(hits.length > 0)
})

test('rename refuses instruction files', () => {
  const result = applyRenameToFile({
    template: 'flow-next',
    identity,
    relativePath: 'AGENTS.md',
    content: 'flow-next',
  })
  assert.equal(result.ok, false)
  assert.equal(isForbiddenInstructionPath('foo/AGENTS.md'), true)
})

test('git safety refuses nonempty destination and template remotes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'start-dest-'))
  writeFileSync(join(dir, 'file.txt'), 'x')
  assert.equal(assessDestination({ destinationPath: dir }).ok, false)
  assert.equal(isTemplateRemoteUrl('https://github.com/gaboesquivel/flow-next.git'), true)
  assert.equal(
    assertNoTemplateOrigin({ remotes: [{ name: 'origin', url: 'https://github.com/gaboesquivel/flow-mono.git' }] }).ok,
    false,
  )
  rmSync(dir, { recursive: true })
})

test('fresh git repo can drop template origin', () => {
  const dir = mkdtempSync(join(tmpdir(), 'start-git-'))
  execSync('git init', { cwd: dir })
  execSync('git config user.email "start-bootstrap@test.invalid"', { cwd: dir })
  execSync('git config user.name "Start Bootstrap Test"', { cwd: dir })
  writeFileSync(join(dir, 'README.md'), 'flow-next')
  execSync('git add README.md', { cwd: dir })
  execSync('git commit -m "template"', { cwd: dir })
  const remotes = execSync('git remote -v', { cwd: dir, encoding: 'utf8' })
  assert.doesNotMatch(remotes, /flow-next/u)
  assert.equal(assessDestination({ destinationPath: dir }).ok, false)
  rmSync(dir, { recursive: true })
})

test('a clean template checkout is initialized in place; a dirty one is refused', () => {
  const dir = mkdtempSync(join(tmpdir(), 'start-clone-'))
  execSync('git init', { cwd: dir })
  execSync('git config user.email "start-bootstrap@test.invalid"', { cwd: dir })
  execSync('git config user.name "Start Bootstrap Test"', { cwd: dir })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'flow-mono' }))
  execSync('git add package.json', { cwd: dir })
  execSync('git commit -m "template"', { cwd: dir })
  assert.equal(detectTemplateCheckout({ destinationPath: dir }), 'flow-mono')
  const result = assessDestination({ destinationPath: dir })
  assert.equal(result.ok, true)
  assert.equal(result.inPlace, true)
  assert.equal(result.template, 'flow-mono')
  writeFileSync(join(dir, 'notes.txt'), 'local work')
  assert.equal(detectTemplateCheckout({ destinationPath: dir }), null)
  assert.equal(assessDestination({ destinationPath: dir }).ok, false)
  rmSync(dir, { recursive: true })
})

test('baseline docs include project name and reject Flow identity', () => {
  const docs = buildBaselineDocs({
    projectName: 'Acme Radar',
    slug: 'acme-radar',
    template: 'flow-next',
    templateSha: 'abc123',
    portlessHost: 'acme-radar.localhost',
  })
  assert.equal(baselineDocsIncludeProjectName({ docs, projectName: 'Acme Radar' }), true)
  assert.equal(baselineDocsRejectFlowIdentity(docs).ok, true)
  assert.equal(baselineDocsRejectFlowIdentity({ ...docs, 'PRODUCT.md': 'From intent to verified software' }).ok, false)
})

test('commit gate blocks a failed check and missing checks', () => {
  const passed = ESSENTIAL_CHECK_IDS.map((id) => ({ id, status: 'passed' }))
  assert.equal(canCreateInitialCommit({ checkResults: passed }).ok, true)

  const failedQa = passed.map((c) => (c.id === 'qa' ? { ...c, status: 'failed' } : c))
  assert.equal(canCreateInitialCommit({ checkResults: failedQa }).ok, false)

  assert.equal(canCreateInitialCommit({ checkResults: [{ id: 'setup', status: 'passed' }] }).ok, false)
  assert.match(formatInitialCommitMessage({ slug: 'acme-radar' }), /chore: initialize acme-radar/u)
})

test('commit gate treats an unavailable check as not failed', () => {
  const results = [
    ...ESSENTIAL_CHECK_IDS.map((id) => ({ id, status: 'passed' })),
    { id: 'deployment', status: 'unavailable' },
  ]
  assert.equal(canCreateInitialCommit({ checkResults: results }).ok, true)
})

test('rename allowlists cover template entrypoints', () => {
  assert.ok(renameAllowlistForTemplate('flow-next').includes('lib/mcp/tool-catalog.ts'))
  assert.ok(renameAllowlistForTemplate('flow-mono').includes('apps/web/lib/mcp/tool-catalog.ts'))
})

test('inferTemplateFromRequest reads the template from the invocation', () => {
  assert.equal(inferTemplateFromRequest('flow nextjs app'), 'flow-next')
  assert.equal(inferTemplateFromRequest('use template https://github.com/gaboesquivel/flow-next'), 'flow-next')
  assert.equal(inferTemplateFromRequest('Next.js monorepo'), 'flow-mono')
  assert.equal(inferTemplateFromRequest('turborepo with shared ui'), 'flow-mono')
  assert.equal(inferTemplateFromRequest('new project'), undefined)
})

test('agent setup at the root counts as an empty destination', () => {
  const dir = mkdtempSync(join(tmpdir(), 'start-root-'))
  writeFileSync(join(dir, 'AGENTS.md'), '# Rules')
  writeFileSync(join(dir, 'CLAUDE.md'), '@AGENTS.md')
  writeFileSync(join(dir, 'skills-lock.json'), '{}')
  mkdirSync(join(dir, '.claude/skills/start'), { recursive: true })
  execSync('git init', { cwd: dir, stdio: 'ignore' })

  const ok = assessDestination({ destinationPath: dir })
  assert.equal(ok.ok, true)
  assert.deepEqual(ok.preserved.sort(), ['.claude', 'AGENTS.md', 'CLAUDE.md', 'skills-lock.json'])

  writeFileSync(join(dir, 'prompts.txt'), 'log')
  const refused = assessDestination({ destinationPath: dir })
  assert.equal(refused.ok, false)
  assert.deepEqual(refused.unexpected, ['prompts.txt'])
  assert.equal(assessDestination({ destinationPath: dir, preserve: ['prompts.txt'] }).ok, true)
  rmSync(dir, { recursive: true })
})

test('copyTemplateInto keeps adopter files and skips the template git dir', () => {
  const template = mkdtempSync(join(tmpdir(), 'start-tpl-'))
  const dest = mkdtempSync(join(tmpdir(), 'start-dest-'))
  mkdirSync(join(template, '.git'))
  writeFileSync(join(template, '.git/HEAD'), 'ref')
  writeFileSync(join(template, 'AGENTS.md'), 'template rules')
  mkdirSync(join(template, 'app'))
  writeFileSync(join(template, 'app/page.tsx'), 'export default 1')
  writeFileSync(join(dest, 'AGENTS.md'), 'adopter rules')

  const { copied, skipped } = copyTemplateInto({ templateDir: template, destinationPath: dest })
  assert.deepEqual(copied, ['app/page.tsx'])
  assert.deepEqual(skipped, ['AGENTS.md'])
  assert.equal(readFileSync(join(dest, 'AGENTS.md'), 'utf8'), 'adopter rules')
  assert.equal(existsSync(join(dest, '.git')), false)
  rmSync(template, { recursive: true })
  rmSync(dest, { recursive: true })
})

test('copyTemplateInto copies symlinks as links, including to directories and dangling ones', () => {
  const template = mkdtempSync(join(tmpdir(), 'start-tpl-'))
  const dest = mkdtempSync(join(tmpdir(), 'start-dest-'))
  mkdirSync(join(template, '.agents/.agents/skills/nextjs'), { recursive: true })
  writeFileSync(join(template, '.agents/.agents/skills/nextjs/SKILL.md'), 'skill')
  mkdirSync(join(template, '.agents/skills'), { recursive: true })
  symlinkSync('../.agents/skills/nextjs', join(template, '.agents/skills/nextjs'))
  symlinkSync('missing-target', join(template, 'dangling'))
  mkdirSync(join(dest, '.claude'))
  symlinkSync('elsewhere', join(dest, 'dangling'))

  const { copied, skipped } = copyTemplateInto({ templateDir: template, destinationPath: dest })
  assert.ok(copied.includes('.agents/skills/nextjs'))
  assert.ok(lstatSync(join(dest, '.agents/skills/nextjs')).isSymbolicLink())
  assert.equal(readlinkSync(join(dest, '.agents/skills/nextjs')), '../.agents/skills/nextjs')
  assert.equal(readFileSync(join(dest, '.agents/skills/nextjs/SKILL.md'), 'utf8'), 'skill')
  assert.deepEqual(skipped, ['dangling'])
  assert.equal(readlinkSync(join(dest, 'dangling')), 'elsewhere')
  rmSync(template, { recursive: true })
  rmSync(dest, { recursive: true })
})

test('stale scan ignores installed skills under .claude', () => {
  const dir = mkdtempSync(join(tmpdir(), 'start-scan-'))
  mkdirSync(join(dir, '.claude/skills/start'), { recursive: true })
  writeFileSync(join(dir, '.claude/skills/start/SKILL.md'), 'Initialize from flow-next')
  writeFileSync(join(dir, 'README.md'), 'Acme Radar')
  assert.deepEqual(scanTreeForStaleIdentifiers({ root: dir, template: 'flow-next' }), [])
  rmSync(dir, { recursive: true })
})
