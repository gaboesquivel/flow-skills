#!/usr/bin/env node
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { install } from './install.mjs'

const distributionRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const args = process.argv.slice(2)
try {
  let skillsDir
  let skipSkills = false
  let help = false
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--help' || arg === '-h') help = true
    else if (arg === '--skip-skills') skipSkills = true
    else if (arg === '--local') { /* Compatibility: all installs use bundled local source. */ }
    else if (arg === '--skills-dir') {
      skillsDir = args[++index]
      if (!skillsDir || skillsDir.startsWith('-')) throw new Error('--skills-dir requires a project-relative path.')
    } else throw new Error(`Unknown argument: ${arg}`)
  }
  if (help) {
    console.log('Usage: flow-skills-init [--skills-dir <relative-path>] [--skip-skills]\n\nCopies bundled skills offline (default .agents/skills) and merges AGENTS.md.\nExisting customizations cause a diagnostic before writes. --skip-skills updates bootstrap only.\n--local is accepted for compatibility; no installation performs network requests.')
  } else {
    const { manifest, retired } = install({ projectRoot: process.cwd(), distributionRoot, skillsDir, skipSkills })
    console.log(skipSkills ? 'Bootstrap verified; no skills installed.' : `Verified ${Object.keys(manifest.skills).length} bundled skills (${manifest.flowSkillsVersion}) in ${manifest.skillsDirectory}.`)
    if (retired.length) console.log(`Preserved retired skill directories for explicit review: ${retired.join(', ')}`)
  }
} catch (error) {
  console.error(`Flow init failed: ${error.message}`)
  process.exitCode = 1
}
