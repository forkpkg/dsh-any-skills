/**
 * dsh-any-skills - remote install from GitHub and npm.
 *
 * GitHub: accepts `owner/repo`, HTTPS URL, SSH URL (`git@github.com:o/r.git`)
 * and `ssh://` forms; resolves to the codeload tarball, extracts it and
 * copies every skill it contains into the install dir (mirrors the
 * dsh-skill-market approach: tarball download + extract, no git binary).
 *
 * npm: resolves the package tarball through the registry API
 * (registry.npmjs.org), extracts it and copies contained skills.
 *
 * Both only ever talk to the well-known hosts above; callers additionally
 * guard the HTTP endpoints with a same-origin check.
 */
import { execFile } from 'node:child_process'
import { mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { normalizeSkillName, installBundleDir, installFlatFile, readSkillDoc, SkillSummary } from './skills.js'

const execFileAsync = promisify(execFile)

const GH_API = 'https://api.github.com'
const CODELOAD = 'https://codeload.github.com'
const NPM_REGISTRY = 'https://registry.npmjs.org'
const USER_AGENT = 'dsh-any-skills/0.1.0'

export interface RepoRef {
  owner: string
  repo: string
  ref?: string
}

const REPO_NAME_RE = /^[A-Za-z0-9_.-]+$/

/**
 * Parse a GitHub repository reference: `owner/repo`, a full https URL
 * (optionally with `#ref`), an SSH scp-like `git@github.com:owner/repo.git`,
 * or an `ssh://git@github.com/owner/repo.git` URL.
 */
export function parseRepoInput(input: string): RepoRef | undefined {
  const raw = String(input ?? '').trim()
  if (raw === '') return undefined
  // strip a trailing #ref / ?ref= and .git suffix
  let ref: string | undefined
  let body = raw
  const hashIndex = body.indexOf('#')
  if (hashIndex >= 0) {
    ref = body.slice(hashIndex + 1) || undefined
    body = body.slice(0, hashIndex)
  }
  body = body.replace(/\.git$/, '')

  // ssh://git@github.com/owner/repo
  if (/^ssh:\/\//i.test(body)) {
    try {
      const url = new URL(body)
      if (url.hostname !== 'github.com') return undefined
      const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
      if (parts.length < 2) return undefined
      const [owner, repo] = parts
      if (!REPO_NAME_RE.test(owner) || !REPO_NAME_RE.test(repo)) return undefined
      return ref !== undefined ? { owner, repo, ref } : { owner, repo }
    } catch {
      return undefined
    }
  }

  // scp-like: git@github.com:owner/repo
  const scp = /^[^/@\s]+@([^:/\s]+):(.+)$/.exec(body)
  if (scp !== null) {
    if (scp[1] !== 'github.com') return undefined
    const parts = scp[2].split('/').filter(Boolean)
    if (parts.length < 2) return undefined
    const [owner, repo] = parts
    if (!REPO_NAME_RE.test(owner) || !REPO_NAME_RE.test(repo)) return undefined
    return ref !== undefined ? { owner, repo, ref } : { owner, repo }
  }

  // full URL: https://github.com/owner/repo/...
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(body)) {
    try {
      const url = new URL(body)
      if (!/^https?:$/.test(url.protocol)) return undefined
      if (url.hostname !== 'github.com') return undefined
      const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
      if (parts.length < 2) return undefined
      const [owner, repo] = parts
      if (!REPO_NAME_RE.test(owner) || !REPO_NAME_RE.test(repo)) return undefined
      return ref !== undefined ? { owner, repo, ref } : { owner, repo }
    } catch {
      return undefined
    }
  }

  // bare owner/repo (possibly owner/repo#ref)
  const parts = body.split('/').filter(Boolean)
  if (parts.length < 2) return undefined
  const [owner, repo] = parts
  if (!REPO_NAME_RE.test(owner) || !REPO_NAME_RE.test(repo)) return undefined
  return ref !== undefined ? { owner, repo, ref } : { owner, repo }
}

interface RepoMeta {
  defaultBranch: string
  description: string
}

/** Fetch the default branch (and description) of a GitHub repo. */
export async function inspectRepo(owner: string, repo: string, token?: string): Promise<RepoMeta> {
  const headers: Record<string, string> = { 'User-Agent': USER_AGENT, Accept: 'application/vnd.github+json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${GH_API}/repos/${owner}/${repo}`, { headers, signal: AbortSignal.timeout(20000) })
  if (!res.ok) {
    if (res.status === 404) throw new Error(`GitHub repository not found: ${owner}/${repo}`)
    throw new Error(`GitHub API ${res.status} (repository may not exist or is rate limited)`)
  }
  const data = (await res.json()) as { default_branch?: string; description?: string }
  return {
    defaultBranch: data.default_branch ?? 'main',
    description: data.description ?? '',
  }
}

/** Download a tarball and extract it into a fresh temp dir; returns its root. */
async function downloadAndExtract(url: string, label: string): Promise<{ root: string; cleanup: () => Promise<void> }> {
  const tmp = await mkdtemp(join(tmpdir(), 'dsh-any-skills-'))
  const tarballPath = join(tmp, 'src.tar.gz')
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(120000) })
    if (!res.ok) throw new Error(`Failed to download ${label}: HTTP ${res.status}`)
    await writeFile(tarballPath, Buffer.from(await res.arrayBuffer()))
    await execFileAsync('tar', ['-xzf', tarballPath, '-C', tmp], {
      stdio: 'ignore',
      timeout: 120000,
    } as Parameters<typeof execFileAsync>[2])
    const entries = (await readdir(tmp)).filter((n) => n !== 'src.tar.gz')
    const root = entries.length === 1 ? join(tmp, entries[0]) : tmp
    return {
      root,
      cleanup: () => rm(tmp, { recursive: true, force: true }),
    }
  } catch (error) {
    await rm(tmp, { recursive: true, force: true })
    throw error
  }
}

/**
 * Find every skill inside an extracted tree and install it:
 *   1. <root>/SKILL.md            -> the whole repo as one skill (name = defaultName)
 *   2. collection dirs: <root>/skills, <root>/.agents/skills, <root>/.claude/skills, <root>/.codex/skills
 *   3. any <root>/<name>/SKILL.md dir bundle or <root>/<name>.md flat file
 */
export async function installSkillsFromTree(root: string, installDir: string, defaultName: string): Promise<SkillSummary[]> {
  const installed: SkillSummary[] = []
  const seen = new Set<string>()
  const seenDirectories = new Set<string>()

  const push = async (skillPath: string, kind: 'bundle' | 'flat', name?: string): Promise<void> => {
    if (kind === 'bundle') {
      const canonical = skillPath
      if (seenDirectories.has(canonical)) return
      // a directory only counts as a skill bundle when it carries SKILL.md
      if ((await readSkillDoc(join(canonical, 'SKILL.md'))) === undefined) return
      const summary = await installBundleDir(canonical, installDir)
      seenDirectories.add(canonical)
      seen.add(summary.name)
      installed.push(summary)
    } else {
      const parsed = await readSkillDoc(skillPath)
      if (parsed === undefined) return
      const targetName = name ?? parsed.name
      if (seen.has(targetName)) return
      seen.add(targetName)
      installed.push(await installFlatFile(skillPath, installDir, targetName))
    }
  }

  // 1) single-skill repo
  const rootSkill = join(root, 'SKILL.md')
  if (await existsFile(rootSkill)) {
    const parsed = await readSkillDoc(rootSkill)
    if (parsed !== undefined) {
      // Whole tree as one skill (excludes git metadata via installBundleDir).
      await push(root, 'bundle', defaultName)
      return installed
    }
  }

  // 2) collection dirs
  const pushCollection = async (dir: string): Promise<void> => {
    if (!(await existsDirectory(dir))) return
    for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.')) continue
      const entryPath = join(dir, entry.name)
      if (entry.isDirectory()) await push(entryPath, 'bundle')
      else if (entry.isFile() && entry.name.endsWith('.md')) await push(entryPath, 'flat')
    }
  }
  for (const dir of ['skills', '.agents/skills', '.claude/skills', '.codex/skills']) {
    await pushCollection(join(root, dir))
  }

  // 3) top-level dir bundles / flat files (multi-skill repos without skills/)
  for (const entry of (await readdir(root, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.') || entry.name === 'skills') continue
    const entryPath = join(root, entry.name)
    if (entry.isDirectory()) {
      await push(entryPath, 'bundle')
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      await push(entryPath, 'flat')
    }
  }

  return installed
}

/** Install every skill from a GitHub repository into installDir. */
export async function installFromGitHub(input: string, installDir: string, token?: string): Promise<{ repo: string; branch: string; installed: SkillSummary[] }> {
  const parsed = parseRepoInput(input)
  if (parsed === undefined) {
    throw new Error('Invalid GitHub repository address (supports owner/repo, HTTPS URL, SSH URL, or Git URL)')
  }
  const meta = await inspectRepo(parsed.owner, parsed.repo, token)
  const branch = parsed.ref ?? meta.defaultBranch
  const tarballUrl = `${CODELOAD}/${parsed.owner}/${parsed.repo}/tar.gz/${encodeURIComponent(branch)}`
  const { root, cleanup } = await downloadAndExtract(tarballUrl, `${parsed.owner}/${parsed.repo}`)
  try {
    const installed = await installSkillsFromTree(root, installDir, normalizeSkillName(parsed.repo))
    if (installed.length === 0) {
      throw new Error('No SKILL.md found in this repository; seems not a skill repository')
    }
    return { repo: `${parsed.owner}/${parsed.repo}`, branch, installed }
  } finally {
    await cleanup()
  }
}

/** Parse an npm spec: `name`, `name@version`, `@scope/name`, `@scope/name@version`. */
export function parseNpmSpec(spec: string): { name: string; version?: string } | undefined {
  const raw = String(spec ?? '').trim()
  if (raw === '') return undefined
  let name: string
  let version: string | undefined
  if (raw.startsWith('@')) {
    const at = raw.indexOf('@', 1)
    if (at < 0) {
      name = raw
    } else {
      name = raw.slice(0, at)
      version = raw.slice(at + 1)
    }
  } else {
    const at = raw.indexOf('@')
    if (at < 0) {
      name = raw
    } else {
      name = raw.slice(0, at)
      version = raw.slice(at + 1)
    }
  }
  if (name === '' || !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)) return undefined
  return version !== undefined && version !== '' ? { name, version } : { name }
}

async function npmTarball(name: string, version: string | undefined): Promise<{ url: string; resolvedVersion: string; description: string }> {
  const encoded = name.startsWith('@') ? name.replace('/', '%2F') : name
  const url = `${NPM_REGISTRY}/${encoded}`
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.npm.install-v1+json', 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`npm package not found: ${name} (HTTP ${res.status})`)
  const data = (await res.json()) as {
    'dist-tags'?: Record<string, string>
    versions?: Record<string, { dist?: { tarball?: string }; description?: string }>
    dist?: { tarball?: string }
    description?: string
  }
  // abbreviated manifests carry dist.tarball per version, full manifests also at top level
  const resolvedVersion = version ?? data['dist-tags']?.latest
  const entry = resolvedVersion !== undefined ? data.versions?.[resolvedVersion] : undefined
  const tarball = entry?.dist?.tarball ?? data.dist?.tarball
  if (typeof tarball !== 'string' || tarball === '') {
    throw new Error(`npm package has no downloadable tarball: ${name}${version !== undefined ? `@${version}` : ''}`)
  }
  return {
    url: tarball,
    resolvedVersion: resolvedVersion ?? 'latest',
    description: entry?.description ?? data.description ?? '',
  }
}

/** Install every skill from an npm package into installDir. */
export async function installFromNpm(spec: string, installDir: string): Promise<{ package: string; version: string; installed: SkillSummary[] }> {
  const parsed = parseNpmSpec(spec)
  if (parsed === undefined) throw new Error(`Invalid npm package name: ${spec}`)
  const { url, resolvedVersion } = await npmTarball(parsed.name, parsed.version)
  const { root, cleanup } = await downloadAndExtract(url, `npm:${parsed.name}`)
  try {
    const installed = await installSkillsFromTree(root, installDir, normalizeSkillName(parsed.name))
    if (installed.length === 0) {
      throw new Error(`No SKILL.md found in npm package ${parsed.name}; seems not a skill package`)
    }
    return { package: parsed.name, version: resolvedVersion, installed }
  } finally {
    await cleanup()
  }
}

async function existsFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

async function existsDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}
