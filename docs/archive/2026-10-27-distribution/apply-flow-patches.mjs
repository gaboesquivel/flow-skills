import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

const skillsRoot = join(import.meta.dirname, "..", "skills")

const listFiles = (dir, base = dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return listFiles(full, base)
    if (entry.isFile()) return [relative(base, full)]
    return []
  })

const listSkillDirs = () =>
  readdirSync(skillsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(skillsRoot, d.name))

const ensureDisableInvocation = (content) => {
  if (content.includes("disable-model-invocation:")) return content
  const match = /^---\n([\s\S]*?)\n---/u.exec(content)
  if (!match) return content
  const body = `${match[1]}\ndisable-model-invocation: true`
  return content.replace(match[0], `---\n${body}\n---`)
}

const replaceAdrPaths = (content) =>
  content
    .replaceAll("docs/adr/", "docs/decisions/")
    .replaceAll("docs/adr", "docs/decisions")
    .replace(/\bADR\b/g, "decision record")
    .replace(/\bADRs\b/g, "decision records")
    .replace(/\badr\b/g, "decision")

for (const dir of listSkillDirs()) {
  const skillPath = join(dir, "SKILL.md")
  let content = readFileSync(skillPath, "utf-8")
  const name = dir.split("/").pop()
  content = ensureDisableInvocation(content)
    if (
    [
      "domain-modeling",
      "setup-matt-pocock-skills",
      "to-spec",
      "to-tickets",
      "tdd",
    ].includes(name)
  )
    content = replaceAdrPaths(content)

  if (name === "tdd") {
    content = content.replace(
      /call the Skill tool with "codebase-design"[\s\S]*?not a session to run\./u,
      "discuss trade-offs with the user and use `domain-modeling` if glossary or decision records need updating. Terms to align on: module, interface, depth, seam, adapter, leverage, locality.",
    )
  }

  if (name === "security-and-hardening") {
    content = content.replaceAll(
      "the `observability-and-instrumentation` skill makes the same point from the ops side",
      "document what you collect in `ARCHITECTURE.md` or a decision record when it affects users",
    )
    content = content.replaceAll(
      "run the postmortem with the `debugging-and-error-recovery` skill",
      "use `systematic-debugging` for evidence-first investigation before remediation",
    )
  }

  if (name === "systematic-debugging") {
    content = content.replaceAll(
      "superpowers:test-driven-development",
      "tdd",
    )
    content = content.replaceAll(
      "superpowers:verification-before-completion",
      "verification-before-completion",
    )
  }
  writeFileSync(skillPath, content, "utf-8")
}

const patchFile = (relativePath, transform) => {
  const path = join(skillsRoot, relativePath)
  writeFileSync(path, transform(readFileSync(path, "utf-8")), "utf-8")
}

patchFile("domain-modeling/ADR-FORMAT.md", (c) =>
  replaceAdrPaths(c)
    .replace("# ADR Format", "# Decision record format")
    .replace("ADR-FORMAT", "decision format"),
)

patchFile("setup-matt-pocock-skills/domain.md", replaceAdrPaths)

patchFile("grill-with-docs/SKILL.md", (c) =>
  c.replace(
    "description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.",
    "description: A relentless interview to sharpen a plan or design, which also creates glossary and decision records as you go.",
  ),
)

patchFile("setup-matt-pocock-skills/SKILL.md", (c) => {
  let next = replaceAdrPaths(c)
  next = next.replace(
    "Tell the user the setup is complete and which engineering skills will now read from these files.",
    "Tell the user the setup is complete. Curated Flow skills are installed via `npx skills add gaboesquivel/flow-skills` or `flow-skills-init`; this skill only configures issue tracker, labels, and domain doc layout—not a full upstream skill catalog.",
  )
  return next
})

patchFile("domain-modeling/SKILL.md", (c) =>
  replaceAdrPaths(c)
    .replace("Offer decision records sparingly", "Offer decision records sparingly")
    .replace(
      "[ADR-FORMAT.md](./ADR-FORMAT.md)",
      "[ADR-FORMAT.md](./ADR-FORMAT.md) (Flow: `docs/decisions/`)",
    ),
)

const lockPath = join(import.meta.dirname, "..", "upstreams.lock.json")
if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, "utf-8"))
  const mods = [
    "Unified decision records: docs/decisions/ instead of docs/adr/",
    "disable-model-invocation: true on curated skills",
    "Superpowers: tdd and verification-before-completion skill references",
    "setup-matt-pocock-skills: Flow curated install note",
  ]
  for (const [name, entry] of Object.entries(lock.skills ?? {})) {
    if (entry.flowOriginal) continue
    entry.flowModifications = mods
    const dir = join(skillsRoot, name)
    if (!existsSync(dir)) continue
    const hash = createHash("sha256")
    for (const file of listFiles(dir).sort()) {
      hash.update(file)
      hash.update(readFileSync(join(dir, file)))
    }
    entry.contentHash = hash.digest("hex")
  }
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf-8")
}

console.log("Flow patches applied.")
