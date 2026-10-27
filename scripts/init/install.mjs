import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { hash, prepareBootstrap } from './bootstrap.mjs'

export const SKILL_RENAMES = {
  grilling: 'grill',
  'code-review': 'review',
  'code-simplification': 'simplify',
  'security-and-hardening': 'security',
  'performance-optimization': 'performance',
  'systematic-debugging': 'debug',
  'verification-before-completion': 'verify',
}

export const RETIRED_SKILL_NAMES = ['handoff', 'setup-matt-pocock-skills']

export function filesIn(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not supported in managed content: ${path}`)
    if (entry.isDirectory()) return filesIn(path, base)
    if (!entry.isFile()) throw new Error(`Unsupported file type: ${path}`)
    return [relative(base, path).split(sep).join('/')]
  })
}

export function hashTree(dir) {
  return hash(JSON.stringify(filesIn(dir).map((file) => [file, hash(readFileSync(join(dir, file)))])))
}

export function assertSafePath(projectRoot, path) {
  const rel = relative(projectRoot, path)
  if (!rel || rel.startsWith(`..${sep}`) || rel === '..' || isAbsolute(rel)) throw new Error(`Path must be inside the project: ${path}`)
  let current = projectRoot
  for (const part of rel.split(sep)) {
    current = join(current, part)
    try {
      if (lstatSync(current).isSymbolicLink()) throw new Error(`Refusing to write through symbolic link: ${current}`)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
}

export function install({ projectRoot, distributionRoot, skillsDir, skipSkills = false }) {
  projectRoot = realpathSync(projectRoot)
  distributionRoot = realpathSync(distributionRoot)
  const manifestPath = join(projectRoot, '.flow-skills', 'manifest.json')
  const agentsPath = join(projectRoot, 'AGENTS.md')
  for (const path of [manifestPath, agentsPath]) assertSafePath(projectRoot, path)
  const prior = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null
  if (prior && prior.schemaVersion !== 1) throw new Error('Unsupported installation manifest. Preserve it and migrate explicitly before installing.')
  if (prior && (!prior.skills || typeof prior.skills !== 'object' || Array.isArray(prior.skills) ||
    Object.entries(prior.skills).some(([name, value]) => !/^[a-z][a-z0-9-]*$/u.test(name) || !/^[a-f0-9]{64}$/u.test(value)) ||
    (prior.skillsDirectory !== null && typeof prior.skillsDirectory !== 'string'))) {
    throw new Error('Invalid installation manifest; no files changed.')
  }
  const targetDir = skillsDir ?? prior?.skillsDirectory ?? '.agents/skills'
  if (isAbsolute(targetDir) || targetDir.split(/[\\/]/u).includes('..')) throw new Error('--skills-dir must be a project-relative path without parent traversal.')
  const target = resolve(projectRoot, targetDir)
  assertSafePath(projectRoot, target)
  if (['.flow-skills', '.git'].some((reserved) => target === join(projectRoot, reserved) || target.startsWith(join(projectRoot, reserved) + sep))) throw new Error('Skills cannot be installed into project metadata directories.')
  const packageInfo = JSON.parse(readFileSync(join(distributionRoot, 'package.json'), 'utf8'))
  const sourceRoot = join(distributionRoot, 'skills')
  // Refuse self-installation or overlap before any mutation.
  const sourceRelative = relative(sourceRoot, target)
  const targetRelative = relative(target, sourceRoot)
  const isWithin = (rel) => rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)
  if (!skipSkills && (isWithin(sourceRelative) || isWithin(targetRelative))) {
    throw new Error('Installation target must not overlap the distribution source.')
  }
  const bootstrap = prepareBootstrap(
    existsSync(agentsPath) ? readFileSync(agentsPath, 'utf8') : undefined,
    readFileSync(join(distributionRoot, 'bootstrap', 'AGENTS.snippet.md'), 'utf8'),
    prior?.bootstrapHash,
  )
  const hashes = {}
  const changes = []
  const removals = []
  if (!skipSkills) {
    for (const entry of readdirSync(sourceRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory() || !existsSync(join(sourceRoot, entry.name, 'SKILL.md'))) throw new Error(`Invalid skill directory: ${entry.name}`)
      const source = join(sourceRoot, entry.name)
      const destination = join(target, entry.name)
      assertSafePath(projectRoot, destination)
      hashes[entry.name] = hashTree(source)
      if (existsSync(destination)) {
        const current = hashTree(destination)
        if (current === hashes[entry.name]) continue
        if (prior?.skillsDirectory !== targetDir || prior.skills?.[entry.name] !== current) {
          throw new Error(`Existing skill has local changes or is unmanaged: ${entry.name}. Reconcile it before installing. No files changed.`)
        }
      }
      changes.push({ destination, source })
    }
    if (!Object.keys(hashes).length) throw new Error('Distribution contains no skills.')
    if (prior?.skills && prior.skillsDirectory === targetDir) {
      for (const oldName of [...Object.keys(SKILL_RENAMES), ...RETIRED_SKILL_NAMES]) {
        if (!(oldName in prior.skills)) continue
        const oldPath = join(target, oldName)
        if (!existsSync(oldPath) || hashTree(oldPath) !== prior.skills[oldName]) continue
        removals.push(oldPath)
      }
    }
  }
  const manifest = {
    schemaVersion: 1,
    package: packageInfo.name,
    mode: skipSkills ? 'bootstrap-only' : 'skills-and-bootstrap',
    flowSkillsVersion: skipSkills ? prior?.flowSkillsVersion ?? null : packageInfo.version,
    bootstrapVersion: packageInfo.version,
    bootstrapHash: bootstrap.hash,
    skillsDirectory: skipSkills ? prior?.skillsDirectory ?? null : targetDir,
    skills: skipSkills ? prior?.skills ?? {} : hashes,
    distributionHash: skipSkills ? prior?.distributionHash ?? null : hash(JSON.stringify(hashes)),
  }
  const manifestContent = JSON.stringify(manifest, null, 2) + '\n'
  changes.push({ destination: agentsPath, content: bootstrap.content })
  changes.push({ destination: manifestPath, content: manifestContent })
  // Stage every byte before replacing existing files. Roll back completed replacements on failure.
  const stage = mkdtempSync(join(projectRoot, '.flow-install-'))
  const applied = []
  let preserveStage = false
  const createdDirs = []
  function ensureParent(path) {
    const missing = []
    let parent = dirname(path)
    while (!existsSync(parent)) { missing.push(parent); parent = dirname(parent) }
    for (const dir of missing.reverse()) { mkdirSync(dir); createdDirs.push(dir) }
  }
  try {
    changes.forEach((change, index) => {
      change.staged = join(stage, `new-${index}`)
      change.backup = join(stage, `old-${index}`)
      if (change.source) cpSync(change.source, change.staged, { recursive: true })
      else writeFileSync(change.staged, change.content)
    })
    for (const change of changes) {
      assertSafePath(projectRoot, change.destination)
      ensureParent(change.destination)
      change.existed = existsSync(change.destination)
      if (change.existed) renameSync(change.destination, change.backup)
      applied.push(change)
      renameSync(change.staged, change.destination)
    }
    for (const [name, expected] of Object.entries(skipSkills ? {} : manifest.skills)) {
      if (hashTree(join(projectRoot, manifest.skillsDirectory, name)) !== expected) throw new Error(`Installed content verification failed: ${name}`)
    }
    if (readFileSync(agentsPath, 'utf8') !== bootstrap.content) throw new Error('Bootstrap verification failed.')
    if (readFileSync(manifestPath, 'utf8') !== manifestContent) throw new Error('Manifest verification failed.')
    for (const path of removals) rmSync(path, { recursive: true, force: true })
  } catch (error) {
    try {
      for (const change of applied.reverse()) {
        rmSync(change.destination, { recursive: true, force: true })
        if (change.existed) renameSync(change.backup, change.destination)
      }
      for (const dir of createdDirs.reverse()) {
        if (existsSync(dir) && readdirSync(dir).length === 0) rmSync(dir, { recursive: true })
      }
    } catch (rollbackError) {
      preserveStage = true
      throw new Error(`Installation failed (${error.message}) and rollback needs recovery (${rollbackError.message}). Backups retained at ${stage}.`)
    }
    throw error
  } finally {
    if (!preserveStage) rmSync(stage, { recursive: true, force: true })
  }
  const retired = Object.keys(prior?.skills ?? {}).filter((name) => !skipSkills && !(name in hashes))
  return { manifest, retired, migrated: removals.map((path) => path.split(sep).at(-1)) }
}
