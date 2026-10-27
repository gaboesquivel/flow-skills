import { createHash } from "node:crypto"
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, relative } from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const manifestPath = join(repoRoot, "upstreams.manifest.json")
const lockPath = join(repoRoot, "upstreams.lock.json")
const skillsRoot = join(repoRoot, "skills")
const cacheRoot = join(repoRoot, ".cache", "upstream-repos")

type Manifest = {
  repositories: Record<
    string,
    { license: string; defaultRef: string; pin?: string }
  >
  skills: Array<
    | { name: string; flowOriginal: true }
    | {
        name: string
        flowOriginal: false
        repository: string
        upstreamPath: string
      }
  >
}

const args = new Set(process.argv.slice(2))
const reportOnly = args.has("--report")

const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as Manifest

const resolveCommit = (repository: string, ref: string) => {
  const url = `https://api.github.com/repos/${repository}/commits/${ref}`
  const json = JSON.parse(
    execSync(`curl -sL "${url}"`, { encoding: "utf-8" }),
  ) as { sha?: string }
  if (!json.sha) throw new Error(`Could not resolve commit for ${repository}@${ref}`)
  return json.sha
}

const listFiles = (dir: string, base = dir): string[] => {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return listFiles(full, base)
    if (entry.isFile()) return [relative(base, full)]
    return []
  })
}

const hashDir = (dir: string) => {
  const hash = createHash("sha256")
  for (const file of listFiles(dir).sort()) {
    hash.update(file)
    hash.update(readFileSync(join(dir, file)))
  }
  return hash.digest("hex")
}

const ensureRepoCheckout = ({
  repository,
  commit,
}: {
  repository: string
  commit: string
}) => {
  const local = join(cacheRoot, repository.replace("/", "__"), commit)
  if (existsSync(join(local, ".git"))) return local

  rmSync(local, { recursive: true, force: true })
  mkdirSync(local, { recursive: true })
  execSync(
    `git clone --depth 1 https://github.com/${repository}.git "${local}"`,
    { stdio: "inherit" },
  )
  execSync(`git -C "${local}" fetch --depth 1 origin ${commit}`, {
    stdio: "inherit",
  })
  execSync(`git -C "${local}" checkout ${commit}`, { stdio: "inherit" })
  return local
}

const copySkillTree = ({
  sourceDir,
  targetDir,
  upstreamMeta,
}: {
  sourceDir: string
  targetDir: string
  upstreamMeta: {
    repository: string
    upstreamPath: string
    commit: string
    license: string
  }
}) => {
  rmSync(targetDir, { recursive: true, force: true })
  mkdirSync(targetDir, { recursive: true })
  cpSync(sourceDir, targetDir, { recursive: true })

  const upstreamMd = `# Upstream provenance

- Repository: https://github.com/${upstreamMeta.repository}
- Path: \`${upstreamMeta.upstreamPath}\`
- Commit: \`${upstreamMeta.commit}\`
- License: ${upstreamMeta.license}

Flow may apply curated modifications; see \`upstreams.lock.json\` → \`flowModifications\`.
`
  writeFileSync(join(targetDir, "UPSTREAM.md"), upstreamMd, "utf-8")
}

const lock = existsSync(lockPath)
  ? (JSON.parse(readFileSync(lockPath, "utf-8")) as {
      version: number
      repositories: Record<string, { commit: string; license: string }>
      skills: Record<
        string,
        {
          flowOriginal?: boolean
          repository?: string
          upstreamPath?: string
          commit?: string
          license?: string
          importedFiles?: string[]
          contentHash?: string
          flowModifications?: string[]
        }
      >
    })
  : { version: 1, repositories: {}, skills: {} }

lock.version = 1
const reportLines: string[] = []

for (const [repository, meta] of Object.entries(manifest.repositories)) {
  const ref = meta.pin ?? meta.defaultRef
  const commit = resolveCommit(repository, ref)
  lock.repositories[repository] = { commit, license: meta.license }
  if (!reportOnly) ensureRepoCheckout({ repository, commit })
}

mkdirSync(skillsRoot, { recursive: true })

for (const skill of manifest.skills) {
  if (skill.flowOriginal) {
    lock.skills[skill.name] = {
      flowOriginal: true,
      flowModifications: ["Authored for Flow Skills distribution"],
    }
    continue
  }

  const repoMeta = manifest.repositories[skill.repository]
  const commit = lock.repositories[skill.repository]?.commit
  if (!commit) throw new Error(`Missing commit for ${skill.repository}`)

  const checkout = join(
    cacheRoot,
    skill.repository.replace("/", "__"),
    commit,
  )
  const sourceDir = join(checkout, skill.upstreamPath)
  const targetDir = join(skillsRoot, skill.name)

  if (!reportOnly) {
    if (!existsSync(sourceDir)) {
      throw new Error(`Missing upstream path ${skill.upstreamPath} at ${commit}`)
    }
    copySkillTree({
      sourceDir,
      targetDir,
      upstreamMeta: {
        repository: skill.repository,
        upstreamPath: skill.upstreamPath,
        commit,
        license: repoMeta.license,
      },
    })
  }

  const prior = lock.skills[skill.name]
  const contentHash = existsSync(targetDir) ? hashDir(targetDir) : prior?.contentHash

  lock.skills[skill.name] = {
    repository: skill.repository,
    upstreamPath: skill.upstreamPath,
    commit,
    license: repoMeta.license,
    importedFiles: existsSync(targetDir) ? listFiles(targetDir).sort() : prior?.importedFiles,
    contentHash,
    flowModifications: prior?.flowModifications ?? [],
  }

  if (prior?.contentHash && contentHash && prior.contentHash !== contentHash) {
    reportLines.push(
      `- **${skill.name}**: content hash changed (${prior.contentHash.slice(0, 8)} → ${contentHash.slice(0, 8)})`,
    )
  }
}

writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf-8")

const reportPath = join(repoRoot, "docs", "upstream-sync-report.md")
const reportBody = `# Upstream sync report

Generated: ${new Date().toISOString().slice(0, 10)}

## Repository pins

${Object.entries(lock.repositories)
  .map(([repo, { commit }]) => `- \`${repo}\` @ \`${commit}\``)
  .join("\n")}

## Skill changes

${reportLines.length ? reportLines.join("\n") : "_No hash changes detected since last lock._"}

`
writeFileSync(reportPath, reportBody, "utf-8")
if (!reportOnly) {
  execSync("node scripts/apply-flow-patches.mjs", {
    cwd: repoRoot,
    stdio: "inherit",
  })
}

console.log(reportOnly ? "Report updated (no copy)." : "Sync complete.")
console.log(`Lock: ${lockPath}`)
