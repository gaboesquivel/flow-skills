import assert from 'node:assert/strict'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { STALE_SHIP_PIPELINE_PHRASE, collectCatalogPhraseErrors } from '../scripts/check-catalog-phrases.mjs'
import { REQUIRED_SCENARIO_IDS, validateEvalScenarios } from '../scripts/check-evals.mjs'
import {
  collectAdapterErrors,
  collectBareFilenameErrors,
  collectCheckTableErrors,
  collectFixtureNestedGitErrors,
  collectRecordErrors,
  collectSkillsLinkErrors,
  stripFencedCode,
  validateSkills,
} from '../scripts/validate.mjs'

// Negative cases only: `pnpm validate` already checks the real repository.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const skillsRoot = join(repoRoot, 'skills')
const fixtures = join(repoRoot, 'tests', 'fixtures', 'validate-checks')
const read = (path) => readFileSync(path, 'utf8')
const tempDir = (t, prefix) => {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

test('adapter check catches a drifted adapter', () => {
  const errors = collectAdapterErrors(read(join(fixtures, 'drifted-openai.yaml')))
  assert.ok(errors.some((error) => /missing display_name/u.test(error)), errors.join('\n'))
  assert.ok(errors.some((error) => /short_description is \d+ characters \(max 60\)/u.test(error)), errors.join('\n'))
  assert.ok(errors.some((error) => /must not end with a period/u.test(error)), errors.join('\n'))
  assert.deepEqual(collectAdapterErrors('interface:\n  display_name: "X"\n'), ['adapter missing short_description'])
})

test('bare filename check resolves against the citing skill only and ignores project files and fences', () => {
  const demo = join(fixtures, 'skills', 'demo')
  const errors = collectBareFilenameErrors(stripFencedCode(read(join(demo, 'SKILL.md'))), demo)
  assert.deepEqual(errors, [
    "bare filename `find-polluter.sh` not found in this skill's directory",
    "bare filename `shared.sh` not found in this skill's directory",
  ])
})

test('record check catches duplicate spec and decision numbers', () => {
  const errors = collectRecordErrors(join(fixtures, 'docs'))
  assert.equal(errors.length, 2, errors.join('\n'))
  assert.match(errors.join('\n'), /docs\/decisions\/0003-b\.md: number 0003 already used by 0003-a\.md/u)
  assert.match(errors.join('\n'), /docs\/specs\/007-b\.md: number 007 already used by 007-a\.md/u)
})

test('record check catches misnamed and unindexed records', (t) => {
  const dir = tempDir(t, 'flow-records-')
  mkdirSync(join(dir, 'specs'))
  writeFileSync(join(dir, 'specs', 'README.md'), '- [001](001-listed.md)\n')
  for (const file of ['001-listed.md', '002-unlisted.md', 'notes.md']) writeFileSync(join(dir, 'specs', file), '')
  assert.deepEqual(collectRecordErrors(dir), [
    'docs/specs/002-unlisted.md: link it from docs/specs/README.md',
    'docs/specs/notes.md: name must match NNN-short-name.md',
  ])
})

test('check-table check catches drift from ESSENTIAL_CHECK_IDS', () => {
  const errors = collectCheckTableErrors(read(join(fixtures, 'start-drifted.md')))
  assert.equal(errors.length, 2, errors.join('\n'))
  assert.match(errors[0], /missing ESSENTIAL_CHECK_IDS identity_scan, gitignore_artifacts/u)
  assert.doesNotMatch(errors[0], /\bqa\b/u)
  assert.match(errors[1], /not in ESSENTIAL_CHECK_IDS lint/u)
  assert.match(collectCheckTableErrors('no table here')[0], /missing check table/u)
})

test('missing or misdirected .claude/skills link is reported', (t) => {
  const dir = tempDir(t, 'flow-link-test-')
  mkdirSync(join(dir, 'skills'))
  mkdirSync(join(dir, 'other'))
  assert.equal(collectSkillsLinkErrors(dir).length, 1)
  mkdirSync(join(dir, '.claude'))
  symlinkSync('../other', join(dir, '.claude', 'skills'))
  assert.equal(collectSkillsLinkErrors(dir).length, 1)
  rmSync(join(dir, '.claude', 'skills'))
  symlinkSync('../skills', join(dir, '.claude', 'skills'))
  assert.deepEqual(collectSkillsLinkErrors(dir), [])
})

test('validator catches missing supporting-file links and escaped dependency closure', (t) => {
  const dir = tempDir(t, 'flow-reference-test-')
  cpSync(join(skillsRoot, 'write-agents'), join(dir, 'write-agents'), { recursive: true })
  const path = join(dir, 'write-agents/SKILL-MECHANICS.md')
  writeFileSync(path, read(path) + '\n[Missing](missing.md)\n[Outside](../../outside.md)\n')
  const errors = validateSkills(dir)
  assert.ok(errors.some((error) => error.includes('SKILL-MECHANICS.md') && error.includes('missing.md')))
  assert.ok(errors.some((error) => error.includes('outside.md')))
})

test('validator rejects conflicting adapter activation and duplicate metadata', (t) => {
  const dir = tempDir(t, 'flow-metadata-test-')
  cpSync(join(skillsRoot, 'write-agents'), join(dir, 'write-agents'), { recursive: true })
  const adapter = join(dir, 'write-agents/agents/openai.yaml')
  writeFileSync(adapter, read(adapter).replace('allow_implicit_invocation: true', 'allow_implicit_invocation: false'))
  const path = join(dir, 'write-agents/SKILL.md')
  writeFileSync(path, read(path).replace('name: write-agents', 'name: write-agents\nname: wrong'))
  const errors = validateSkills(dir)
  assert.ok(errors.some((error) => error.includes('adapter')))
  assert.ok(errors.some((error) => error.includes('duplicate')))
})

test('catalog check flags stale ship pipeline copy', (t) => {
  const dir = tempDir(t, 'flow-catalog-')
  writeFileSync(join(dir, 'README.md'), `${STALE_SHIP_PIPELINE_PHRASE}\n`)
  const errors = collectCatalogPhraseErrors(dir)
  assert.equal(errors.length, 1)
  assert.match(errors[0], /README\.md/u)
})

test('nested .git under tests/fixtures is rejected', (t) => {
  const dir = tempDir(t, 'flow-fixture-')
  mkdirSync(join(dir, 'tests', 'fixtures', 'demo', '.git'), { recursive: true })
  assert.deepEqual(collectFixtureNestedGitErrors(dir), [
    'tests/fixtures/demo/.git: remove nested .git; init in a throwaway clone per fixture README',
  ])
})

test('eval check rejects duplicate ids, false live claims, retirement without a reason, and missing ids',(t) => {
  const dir = tempDir(t, 'flow-eval-')
  const scenariosFile = join(dir, 'scenarios.json')
  const evidence = (live) => ({
    structural_contract: 'passed',
    executable_fixture: 'not_executed',
    live_skill_execution: live,
    independently_reviewed: 'not_executed',
    verified_second_host: 'not_executed',
  })
  writeFileSync(scenariosFile, JSON.stringify({
    scenarios: [
      { id: 'E01', skills: ['build'], behavior: 'x', skillReferences: ['skills/build/SKILL.md'], fixtureReferences: [], evidence: evidence('passed'), claimsLiveRun: false },
      { id: 'E01', skills: ['build'], behavior: 'dup', skillReferences: [], evidence: evidence('not_executed') },
    ],
  }))
  const errors = validateEvalScenarios({ root: repoRoot, scenariosFile })
  assert.ok(errors.some((e) => /duplicate/i.test(e)))
  assert.ok(errors.some((e) => /liveObservation/i.test(e)))
  writeFileSync(scenariosFile, JSON.stringify({
    scenarios: [
      { id: 'E02', skills: ['flow'], behavior: 'x', evidence: evidence('not_executed'), retired: { by: 'docs/decisions/0044-fast-delivery.md', date: '2026-10-29' } },
    ],
  }))
  const retired = validateEvalScenarios({ root: repoRoot, scenariosFile })
  assert.ok(retired.some((e) => /E02: retired\.reason required/u.test(e)))
  writeFileSync(scenariosFile, JSON.stringify({ scenarios: [] }))
  const missing = validateEvalScenarios({ root: repoRoot, scenariosFile })
  for (const id of REQUIRED_SCENARIO_IDS) assert.ok(missing.some((e) => e.includes(id)))
})
