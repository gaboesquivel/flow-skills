import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import test from 'node:test'
import { deriveProjectIdentity, isForbiddenInstructionPath } from '../skills/start/lib/identity.mjs'
import { assessDestination, isTemplateRemoteUrl, assertNoTemplateOrigin } from '../skills/start/lib/git-safety.mjs'
import {
  applyRenameToFile,
  applyTemplateRenamesToText,
  findStaleTemplateReferencesInText,
  renameAllowlistForTemplate,
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
  writeFileSync(join(dir, 'README.md'), 'flow-next')
  execSync('git add README.md', { cwd: dir })
  execSync('git commit -m "template"', { cwd: dir })
  const remotes = execSync('git remote -v', { cwd: dir, encoding: 'utf8' })
  assert.doesNotMatch(remotes, /flow-next/u)
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

test('commit gate blocks failed startup and missing checks', () => {
  const passed = ESSENTIAL_CHECK_IDS.map((id) => ({ id, status: 'passed' }))
  assert.equal(canCreateInitialCommit({ checkResults: passed }).ok, true)

  const noStartup = passed.map((c) => (c.id === 'portless_startup' ? { ...c, status: 'failed' } : c))
  assert.equal(canCreateInitialCommit({ checkResults: noStartup }).ok, false)

  assert.equal(canCreateInitialCommit({ checkResults: [{ id: 'setup', status: 'passed' }] }).ok, false)
  assert.match(formatInitialCommitMessage({ slug: 'acme-radar' }), /chore: initialize acme-radar/u)
})

test('commit gate allows unavailable operator auth when fail-closed passed', () => {
  const results = ESSENTIAL_CHECK_IDS.map((id) => ({
    id,
    status: id === 'operator_authenticated' ? 'unavailable' : 'passed',
  }))
  assert.equal(canCreateInitialCommit({ checkResults: results }).ok, true)
})

test('rename allowlists cover template entrypoints', () => {
  assert.ok(renameAllowlistForTemplate('flow-next').includes('lib/mcp/tool-catalog.ts'))
  assert.ok(renameAllowlistForTemplate('flow-mono').includes('apps/web/lib/mcp/tool-catalog.ts'))
})
