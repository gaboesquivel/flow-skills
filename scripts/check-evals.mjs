import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { EXPECTED_SKILL_NAMES } from './validate.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const scenariosPath = join(repoRoot, 'tests/evals/scenarios.json')

export const REQUIRED_SCENARIO_IDS = [
  'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15',
  'E16', 'E17', 'E18', 'E19', 'E20', 'E21', 'E22', 'E23', 'E24', 'E25', 'E26', 'E27', 'E28', 'E29', 'E30', 'E31', 'E32', 'E33', 'E34', 'E35', 'E36', 'E37', 'E38', 'E39',
  'E40', 'E41', 'E42', 'E43',
]

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u

// A retired scenario keeps its id, files, and recorded evidence as history.
// It must say what retired it and why, and may not gain evidence dated after retirement.
function retiredErrors(id, scenario) {
  const retired = scenario.retired
  if (retired === undefined) return []
  if (!retired || typeof retired !== 'object') return [`${id}: retired must be an object with by, reason, and date`]
  const errors = []
  for (const key of ['by', 'reason']) {
    if (typeof retired[key] !== 'string' || !retired[key].trim()) errors.push(`${id}: retired.${key} required`)
  }
  if (!ISO_DATE.test(retired.date ?? '')) errors.push(`${id}: retired.date must be YYYY-MM-DD`)
  else for (const obsKey of observationRequired.values()) {
    const date = scenario[obsKey]?.date
    if (date && date > retired.date) errors.push(`${id}: ${obsKey} dated after retirement`)
  }
  return errors
}

export const EVIDENCE_KEYS = [
  'structural_contract',
  'executable_fixture',
  'live_skill_execution',
  'independently_reviewed',
  'verified_second_host',
]

export const EVIDENCE_STATUSES = new Set(['passed', 'not_executed', 'failed'])

const observationRequired = new Map([
  ['live_skill_execution', 'liveObservation'],
  ['verified_second_host', 'secondHostObservation'],
  ['independently_reviewed', 'independentReview'],
])

export function validateEvalScenarios({ root = repoRoot, scenariosFile = scenariosPath } = {}) {
  const errors = []
  if (!existsSync(scenariosFile)) return [`Missing ${scenariosFile}`]

  let parsed
  try {
    parsed = JSON.parse(readFileSync(scenariosFile, 'utf8'))
  } catch (error) {
    return [`Invalid JSON in scenarios file: ${error.message}`]
  }

  if (!Array.isArray(parsed.scenarios)) return ['scenarios.json must have a scenarios array']

  const seen = new Set()
  for (const scenario of parsed.scenarios) {
    const id = scenario?.id
    if (!id) {
      errors.push('Scenario missing id')
      continue
    }
    if (seen.has(id)) errors.push(`${id}: duplicate scenario id`)
    seen.add(id)

    if (!REQUIRED_SCENARIO_IDS.includes(id)) errors.push(`${id}: unexpected scenario id`)
    errors.push(...retiredErrors(id, scenario))

    const skills = scenario.skills
    if (!Array.isArray(skills) || skills.length === 0) errors.push(`${id}: skills must be a non-empty array`)
    else for (const skill of skills) {
      if (skill !== 'all' && !EXPECTED_SKILL_NAMES.includes(skill)) errors.push(`${id}: unknown skill ${skill}`)
    }

    for (const rel of scenario.skillReferences ?? []) {
      if (!existsSync(join(root, rel))) errors.push(`${id}: missing skill reference ${rel}`)
    }
    for (const rel of scenario.fixtureReferences ?? []) {
      if (!existsSync(join(root, rel))) errors.push(`${id}: missing fixture reference ${rel}`)
    }

    if (scenario.taskFile && !existsSync(join(root, scenario.taskFile))) errors.push(`${id}: missing task file ${scenario.taskFile}`)
    if (scenario.rubricFile && !existsSync(join(root, scenario.rubricFile))) errors.push(`${id}: missing rubric file ${scenario.rubricFile}`)
    if (scenario.retired) for (const rel of [scenario.taskFile, scenario.rubricFile]) {
      if (rel && existsSync(join(root, rel)) && !readFileSync(join(root, rel), 'utf8').includes('Retired')) errors.push(`${id}: ${rel} needs a Retired note`)
    }

    const evidence = scenario.evidence
    if (!evidence || typeof evidence !== 'object') {
      errors.push(`${id}: evidence object required`)
      continue
    }

    for (const key of EVIDENCE_KEYS) {
      const status = evidence[key]
      if (!EVIDENCE_STATUSES.has(status)) errors.push(`${id}: evidence.${key} must be passed, not_executed, or failed`)
      const obsKey = observationRequired.get(key)
      if (obsKey && status === 'passed') {
        const obs = scenario[obsKey]
        if (!obs?.host || !obs?.date || !obs?.observation) errors.push(`${id}: ${obsKey} required when ${key} is passed`)
      }
    }

    if (evidence.live_skill_execution === 'passed' && evidence.structural_contract !== 'passed' && !scenario.liveObservation) {
      errors.push(`${id}: live_skill_execution cannot be passed without liveObservation metadata`)
    }

    if (scenario.claimsLiveRun === true && evidence.live_skill_execution !== 'passed') {
      errors.push(`${id}: claimsLiveRun contradicts evidence.live_skill_execution`)
    }
  }

  for (const required of REQUIRED_SCENARIO_IDS) {
    if (!seen.has(required)) errors.push(`Missing required scenario ${required}`)
  }

  return errors
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const errors = validateEvalScenarios()
  if (errors.length) {
    for (const error of errors) console.error(error)
    process.exit(1)
  }
  const retiredCount = JSON.parse(readFileSync(scenariosPath, 'utf8')).scenarios.filter((s) => s.retired).length
  console.log(`Validated ${REQUIRED_SCENARIO_IDS.length} evaluation scenarios (${retiredCount} retired).`)
}
