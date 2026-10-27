import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { TEMPLATE_GITHUB } from './constants.mjs'

const templateRemotePatterns = Object.values(TEMPLATE_GITHUB).flatMap((repo) => [
  `https://github.com/${repo}.git`,
  `https://github.com/${repo}`,
  `git@github.com:${repo}.git`,
])

export const isTemplateRemoteUrl = (url) => {
  const normalized = url.trim().replace(/\/$/u, '')
  return templateRemotePatterns.some((pattern) => normalized === pattern.replace(/\/$/u, ''))
}

export const assessDestination = ({ destinationPath, allowNonempty = false }) => {
  if (!destinationPath?.trim()) return { ok: false, reason: 'Destination path is required.' }

  if (!existsSync(destinationPath)) return { ok: true }

  const entries = readdirSync(destinationPath)
  if (entries.length > 0 && !allowNonempty)
    return { ok: false, reason: 'Destination is not empty. Obtain explicit authorization before overwriting.' }

  const gitDir = join(destinationPath, '.git')
  if (!existsSync(gitDir)) return { ok: true }

  try {
    const count = execSync('git rev-list --count HEAD', { cwd: destinationPath, encoding: 'utf8' }).trim()
    if (Number(count) > 0)
      return { ok: false, reason: 'Destination already has Git history. Never reset or delete an existing project.' }
  } catch {
    return { ok: true }
  }

  return { ok: true }
}

export const assertNoTemplateOrigin = ({ remotes }) => {
  const violations = (remotes ?? []).filter((remote) => isTemplateRemoteUrl(remote.url))
  if (violations.length === 0) return { ok: true }
  return {
    ok: false,
    reason: `Remote must not point at a template repository: ${violations.map((r) => r.name).join(', ')}`,
  }
}
