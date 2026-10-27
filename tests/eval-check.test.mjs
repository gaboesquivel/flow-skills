import assert from 'node:assert/strict'
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { validateEvalScenarios, REQUIRED_SCENARIO_IDS } from '../scripts/check-evals.mjs'

test('canonical scenarios.json passes eval check', () => {
  assert.deepEqual(validateEvalScenarios(), [])
})

test('eval check rejects duplicate ids and false live claims', () => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-eval-'))
  const scenariosFile = join(dir, 'scenarios.json')
  const payload = {
    scenarios: [
      {
        id: 'E01',
        skills: ['implement'],
        behavior: 'x',
        skillReferences: ['skills/implement/SKILL.md'],
        fixtureReferences: [],
        evidence: {
          structural_contract: 'passed',
          executable_fixture: 'not_executed',
          live_skill_execution: 'passed',
          independently_reviewed: 'not_executed',
          verified_second_host: 'not_executed',
        },
        claimsLiveRun: false,
      },
      {
        id: 'E01',
        skills: ['implement'],
        behavior: 'dup',
        skillReferences: [],
        evidence: {
          structural_contract: 'passed',
          executable_fixture: 'not_executed',
          live_skill_execution: 'not_executed',
          independently_reviewed: 'not_executed',
          verified_second_host: 'not_executed',
        },
      },
    ],
  }
  writeFileSync(scenariosFile, JSON.stringify(payload))
  const errors = validateEvalScenarios({ root: join(import.meta.dirname, '..'), scenariosFile })
  assert.ok(errors.some((e) => /duplicate/i.test(e)))
  assert.ok(errors.some((e) => /liveObservation/i.test(e)))
  rmSync(dir, { recursive: true })
})

test('eval check requires full scenario id set', () => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-eval-'))
  const scenariosFile = join(dir, 'scenarios.json')
  writeFileSync(scenariosFile, JSON.stringify({ scenarios: [] }))
  const errors = validateEvalScenarios({ root: join(import.meta.dirname, '..'), scenariosFile })
  for (const id of REQUIRED_SCENARIO_IDS) assert.ok(errors.some((e) => e.includes(id)))
  rmSync(dir, { recursive: true })
})
