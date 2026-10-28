import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { EXPECTED_SKILL_NAMES, validateSkills } from '../scripts/validate.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const skillsRoot = join(root, 'skills')

// Smoke contracts pin safety rules only: the default branch, force-push and destructive Git,
// self-approval and protection bypass, the acceptance gate, check integrity, independence claims,
// explicit-yes gates for writes, and credentials. Ordinary wording is not pinned (decision 0029).
const contracts = [
  { skill: 'explore', file: 'SKILL.md', includes: ['Never write the brief before confirmation', 'explicit yes before any challenge', 'exact text before writing', 'authorizes no write', 'do not authorize implementation', 'declined brief is not spec-ready for writing specs'] },
  { skill: 'grill', file: 'SKILL.md', includes: ['does not itself authorize implementation'] },
  { skill: 'to-spec', file: 'SKILL.md', includes: ['reaching spec-ready, or a request to write a spec is not acceptance', 'Changing an accepted spec\'s scope or a decision it links returns the spec to `draft`', 'never the default branch', 'ask before overwriting'] },
  { skill: 'build', file: 'SKILL.md', includes: ['committing to, pushing, or merging the default branch', 'force-pushing', 'Exclude credentials', 'Do not amend or rewrite unrelated commits', 'preserve unrelated working-tree changes', 'reported as pending, never as passing', 'Never skip, disable, or weaken a check', 'never fall through to local mode', 'requires pull requests always uses pull-request mode', 'merging is `ship`\'s job', 'No push and no pull request', 'never let two workers edit the same files', 'drifts from its stated scope stops for the user\'s yes'] },
  { skill: 'review', file: 'SKILL.md', includes: ['single-agent', 'Never claim independence or model diversity without actual separate execution', 'never an approval'] },
  { skill: 'write-agents', file: 'SKILL.md', includes: ['Never claim independence'] },
  { skill: 'interview', file: 'SKILL.md', includes: ['explicit yes', 'does not authorize implementation'] },
  { skill: 'retro', file: 'SKILL.md', includes: ['do not modify', 'explicit user authorization'] },
  { skill: 'flow', file: 'SKILL.md', includes: ['Do not edit adopter', 'Never touch text outside the markers', 'only when the user asks or `start` finishes a confirmed bootstrap', 'ask once before writing'] },
  { skill: 'tldr', file: 'SKILL.md', includes: ['does not authorize'] },
  { skill: 'to-tasks', file: 'SKILL.md', includes: ['Do not start implementation', 'the report says the issues are public'] },
  { skill: 'handoff', file: 'SKILL.md', includes: ['does not authorize'] },
  { skill: 'ship', file: 'SKILL.md', includes: ['the gate is the `accepted` label on that issue', 'without the label does not pass', 'Its `Status:` must be `accepted`', 'no decision record it links may still be', 'suggest "accept the spec", and stop before building', 'or classification is uncertain', 'If the spec cannot be resolved, say so and stop', 'new product behavior, a data-shape or public API change, or a migration is a blocking finding', 'does not authorize destructive Git operations, force-pushing, rewriting remote branches', 'production promotion or rollback unless explicitly asked', 'label it single-agent on the pull request', 'never an approval', 'pending check is pending, never passing', 'Never hide, skip, disable, or weaken a failing check', 'checks are green, no findings are blocking, and branch protection is satisfied', "Never approve the agent's own pull request", 'never bypass protection \\(for example `gh pr merge --admin`\\)', 'When protection requires a human approval, stop', 'Merge only the reviewed and checked head SHA', '--match-head-commit', "including someone else's push, review and check the new head", 'Never force-push or rewrite remote branches', 'Delete a branch only after its work has merged', 'uncommitted or unpushed changes, or \\(local mode\\) the work sits on the default branch', 'After any push, wait for checks on the new head', 'ship never sets the `accepted` label itself', 'never fall back to the file status', "Only the user's own request naming the spec drops it", 'nothing else', 'No destructive reset'], description: '^Land accepted work.*"ship it"' },
  { skill: 'start', file: 'SKILL.md', includes: ['Do not push or deploy unless explicitly authorized', 'wait for an explicit yes', 'Anything else is not a yes', 'Never `reset`', 'do not substitute a destination the user did not confirm', 'only to write the Flow block'] },
]

test('catalog passes validator including required adapters', () => assert.deepEqual(validateSkills(skillsRoot), []))

test('glossary keeps Flow identity, product context, and human summary apart', () => {
  const glossary = readFileSync(join(root, 'GLOSSARY.md'), 'utf8')
  assert.match(glossary, /## Product context/u)
  assert.match(glossary, /## Human summary/u)
  assert.match(glossary, /## Leading word/u)
  assert.match(glossary, /no separate `human` skill/u)
  assert.match(glossary, /`flow start` is not a leading word/u)
})

test('smoke behavior contracts hold in skill text', () => {
  for (const { skill, file, includes = [], excludes = [], description } of contracts) {
    const text = readFileSync(join(skillsRoot, skill, file), 'utf8')
    if (description) assert.match(text.match(/^description: (.*)$/mu)?.[1] ?? '', new RegExp(description, 'iu'), `${skill} description missing ${description}`)
    for (const phrase of includes) assert.match(text, new RegExp(phrase, 'iu'), `${skill}/${file} missing ${phrase}`)
    for (const phrase of excludes) assert.doesNotMatch(text, new RegExp(phrase, 'iu'), `${skill}/${file} must not contain ${phrase}`)
  }
})

test('skills do not link to sibling SKILL.md paths (isolated install safe)', () => {
  for (const name of EXPECTED_SKILL_NAMES) {
    const text = readFileSync(join(skillsRoot, name, 'SKILL.md'), 'utf8')
    assert.doesNotMatch(text, /\]\(\.\.\/[^)]+\/SKILL\.md\)/u, `${name} must reference other skills by name, not relative SKILL.md links`)
  }
})

test('every shipped skill matches the expected catalog', () => {
  const names = readdirSync(skillsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
  assert.deepEqual(names, EXPECTED_SKILL_NAMES)
  for (const name of names) {
    const adapter = readFileSync(join(skillsRoot, name, 'agents/openai.yaml'), 'utf8')
    assert.match(adapter, /allow_implicit_invocation:\s*true/u, name)
  }
  assert.equal(names.length, 22)
})
