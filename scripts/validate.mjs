import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const EXPECTED_SKILL_NAMES = [
  'competitors',
  'explore',
  'grill',
  'implement',
  'interview',
  'jtbd',
  'retro',
  'review',
  'to-spec',
  'to-tickets',
  'tldr',
  'write-agents',
  'write-humans',
].sort()

export function validateSkills(root) {
  const errors = []
  const names = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  if (names.join(',') !== EXPECTED_SKILL_NAMES.join(',')) {
    const missing = EXPECTED_SKILL_NAMES.filter((name) => !names.includes(name))
    const extra = names.filter((name) => !EXPECTED_SKILL_NAMES.includes(name))
    if (missing.length) errors.push(`Missing skills: ${missing.join(', ')}`)
    if (extra.length) errors.push(`Unexpected skills: ${extra.join(', ')}`)
  }
  for (const name of names) {
    const folder = join(root, name)
    if (!/^[a-z][a-z0-9-]{0,63}$/u.test(name)) errors.push(`${name}: invalid directory name`)
    if (!existsSync(join(folder, 'SKILL.md'))) { errors.push(`${name}: missing SKILL.md`); continue }
    const skill = readFileSync(join(folder, 'SKILL.md'), 'utf8')
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(skill)
    const fields = {}
    if (!frontmatter) errors.push(`${name}: missing frontmatter`)
    else for (const line of frontmatter[1].split(/\r?\n/u)) {
      const match = /^([a-z][a-z-]*):\s*(.+)$/u.exec(line)
      if (!match) { errors.push(`${name}: frontmatter must use nonempty single-line fields`); continue }
      if (match[1] in fields) errors.push(`${name}: duplicate field ${match[1]}`)
      fields[match[1]] = match[2]
    }
    if (fields.name !== name) errors.push(`${name}: name mismatch`)
    if (!fields.description) errors.push(`${name}: missing description`)
    if (fields['disable-model-invocation'] !== 'true') errors.push(`${name}: explicit activation metadata required`)
    for (const key of Object.keys(fields)) if (!['name', 'description', 'disable-model-invocation'].includes(key)) errors.push(`${name}: unsupported frontmatter field ${key}`)
    const files = listMarkdownAndSupportFiles(folder)
    if (files.includes('ATTRIBUTION.md') && !files.includes('LICENSE')) errors.push(`${name}: attribution requires bundled license`)
    for (const file of files.filter((file) => file.endsWith('.md'))) {
      const path = join(folder, file)
      const text = readFileSync(path, 'utf8').replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gmu, '')
      const refs = [...text.matchAll(/\]\(([^)]+)\)/gu)].map((match) => match[1])
      refs.push(...[...text.matchAll(/`((?:\.\.?\/)[^`\n]+\.(?:md|sh|ts|mjs))`/gu)].map((match) => match[1]))
      for (let ref of refs) {
        if (/^(?:[a-z]+:|#)/iu.test(ref)) continue
        ref = ref.split('#')[0]
        const resolved = resolve(dirname(path), ref)
        const rel = relative(resolve(root), resolved)
        if (rel === '..' || rel.startsWith(`..${sep}`) || !existsSync(resolved)) errors.push(`${name}/${file}: missing or external local reference ${ref}`)
      }
      for (const forbidden of ['setup-matt-pocock-skills', 'using-superpowers', 'Skill tool', 'superpowers:', '/wayfinder', '/improve-codebase-architecture', 'upstreams.lock.json', 'sync-upstreams', 'flow-skills-init', 'scripts/init']) {
        if (text.includes(forbidden)) errors.push(`${name}/${file}: retired dependency ${forbidden}`)
      }
      if (/docs\/(?:adr|pdr|decision)\//u.test(text)) errors.push(`${name}/${file}: legacy decision path`)
    }
    const adapter = join(folder, 'agents', 'openai.yaml')
    if (!existsSync(adapter)) errors.push(`${name}: missing agents/openai.yaml`)
    else if (!/^\s+allow_implicit_invocation:\s*false\s*$/mu.test(readFileSync(adapter, 'utf8'))) errors.push(`${name}: adapter must express explicit activation`)
  }
  return errors
}

function listMarkdownAndSupportFiles(folder) {
  const out = []
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (entry.isFile()) out.push(entry.name)
    else if (entry.isDirectory() && entry.name !== 'agents') {
      for (const nested of readdirSync(join(folder, entry.name), { withFileTypes: true })) if (nested.isFile()) out.push(`${entry.name}/${nested.name}`)
    }
  }
  return out
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')
  const errors = validateSkills(root)
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log(`Validated ${EXPECTED_SKILL_NAMES.length} skills and their local references.`)
}
