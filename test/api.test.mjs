/**
 * dsh-any-skills — host API smoke test: boots `apply()` against an in-process
 * fake webServer and exercises list / sources / import / uninstall over real
 * HTTP request/response objects (node:http streams).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { apply } from '../index.js'

/** Minimal in-process webServer + request/response plumbing. */
function createHost() {
  const routes = []
  return {
    host: {
      webServer: {
        register(route) {
          routes.push(route)
          return () => {
            const i = routes.indexOf(route)
            if (i >= 0) routes.splice(i, 1)
          }
        },
      },
      effect: (callback) => {
        // real Cordis runs the effect body immediately and registers cleanup
        return callback() ?? (() => undefined)
      },
      logger: { info: () => undefined, warn: () => undefined },
    },
    routes,
    async request(method, path, body) {
      const route = routes.find((r) => r.kind === 'prefix' && path.startsWith(r.path))
      assert.ok(route, `no route for ${path}`)
      const req = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))])
      req.method = method
      req.url = path
      req.headers = { origin: 'http://localhost:3080', host: 'localhost:3080' }
      const chunks = []
      const res = {
        writeHead(status, headers) {
          this.status = status
          this.headers = headers
        },
        end(payload) {
          this.payload = payload
          chunks.push(Buffer.from(payload))
        },
      }
      await route.handler(req, res)
      const raw = Buffer.concat(chunks).toString('utf8')
      return { status: res.status ?? 200, json: raw === '' ? null : JSON.parse(raw) }
    },
  }
}

test('host API: list / import / sources / uninstall round-trip', async () => {
  const { host, routes, request } = createHost()
  const root = await mkdtemp(join(tmpdir(), 'dsh-any-skills-api-'))
  try {
    const installDir = join(root, 'install')
    const sourceDir = join(root, 'source')
    await mkdir(join(sourceDir, 'alpha'), { recursive: true })
    await writeFile(join(sourceDir, 'alpha', 'SKILL.md'), '---\nname: alpha-skill\ndescription: First skill.\n---\nBody A\n')
    await writeFile(join(sourceDir, 'beta.md'), '---\nname: beta-skill\ndescription: Second skill.\n---\nBody B\n')

    apply(host, { installDir })
    assert.equal(routes.length, 1)
    assert.equal(routes[0].kind, 'prefix')
    assert.equal(routes[0].path, '/api/skills')

    // list (empty)
    let r = await request('GET', '/api/skills/list')
    assert.equal(r.json.ok, true)
    assert.deepEqual(r.json.skills, [])

    // import local
    r = await request('POST', '/api/skills/import', { type: 'local', path: sourceDir })
    assert.equal(r.json.ok, true)
    assert.equal(r.json.imported.length, 2)

    // list (2 skills)
    r = await request('GET', '/api/skills/list')
    assert.equal(r.json.skills.length, 2)
    assert.deepEqual(r.json.skills.map((s) => s.name).sort(), ['alpha-skill', 'beta-skill'])

    // sources: project-level detection via cwd
    await mkdir(join(root, 'project', '.git'), { recursive: true })
    await mkdir(join(root, 'project', '.claude', 'skills', 'proj-skill'), { recursive: true })
    await writeFile(join(root, 'project', '.claude', 'skills', 'proj-skill', 'SKILL.md'), '---\nname: proj-skill\ndescription: Project skill.\n---\nBody\n')
    r = await request('GET', `/api/skills/sources?cwd=${encodeURIComponent(join(root, 'project'))}`)
    assert.equal(r.json.ok, true)
    const claudeProject = r.json.sources.find((s) => s.id === 'claude-project')
    assert.ok(claudeProject)
    assert.equal(claudeProject.skills.length, 1)

    // import from the project-level claude group (skip the real user-level dir)
    r = await request('POST', '/api/skills/import', { type: 'claude', sourceId: 'claude-project', cwd: join(root, 'project') })
    assert.equal(r.json.ok, true)
    assert.equal(r.json.imported.length, 1)
    assert.equal(r.json.imported[0].name, 'proj-skill')

    // import again: skipped (already installed)
    r = await request('POST', '/api/skills/import', { type: 'claude', sourceId: 'claude-project', cwd: join(root, 'project') })
    assert.equal(r.json.ok, true)
    assert.equal(r.json.imported.length, 0)
    assert.deepEqual(r.json.skipped, ['proj-skill'])

    // single-skill import via names filter (second project skill, import only one)
    await mkdir(join(root, 'project', '.claude', 'skills', 'gamma'), { recursive: true })
    await writeFile(join(root, 'project', '.claude', 'skills', 'gamma', 'SKILL.md'), '---\nname: gamma-skill\ndescription: Third skill.\n---\nBody\n')
    r = await request('POST', '/api/skills/import', { type: 'claude', sourceId: 'claude-project', cwd: join(root, 'project'), names: ['gamma-skill'] })
    assert.equal(r.json.ok, true)
    assert.equal(r.json.imported.length, 1)
    assert.equal(r.json.imported[0].name, 'gamma-skill')
    r = await request('GET', '/api/skills/list')
    assert.deepEqual(r.json.skills.map((s) => s.name).sort(), ['alpha-skill', 'beta-skill', 'gamma-skill', 'proj-skill'])

    // uninstall returns the trash dir name
    r = await request('DELETE', '/api/skills/uninstall', { name: 'alpha-skill' })
    assert.equal(r.json.ok, true)
    assert.match(r.json.trash, /^\.trash-\d{14}-alpha-skill$/)
    const trashName = r.json.trash
    r = await request('GET', '/api/skills/list')
    assert.equal(r.json.skills.length, 3)
    assert.ok(!r.json.skills.some((s) => s.name === 'alpha-skill'))

    // restore from trash
    r = await request('POST', '/api/skills/restore', { name: 'alpha-skill', trash: trashName })
    assert.equal(r.json.ok, true)
    r = await request('GET', '/api/skills/list')
    assert.ok(r.json.skills.some((s) => s.name === 'alpha-skill'), 'alpha-skill restored')

    // restore rejects bad input
    r = await request('POST', '/api/skills/restore', { name: 'alpha-skill', trash: 'not-a-trash' })
    assert.equal(r.json.ok, false)
    r = await request('POST', '/api/skills/restore', { name: 'alpha-skill', trash: '.trash-20260101000000-other-skill' })
    assert.equal(r.json.ok, false)

    // uninstall unknown skill
    r = await request('DELETE', '/api/skills/uninstall', { name: 'nope' })
    assert.equal(r.json.ok, false)

    // untrusted origin rejected
    const route = routes.find((x) => x.path === '/api/skills')
    const req = Readable.from([Buffer.from('{}')])
    req.method = 'POST'
    req.url = '/api/skills/import'
    req.headers = { origin: 'https://evil.example', host: 'localhost:3080' }
    const chunks = []
    const res = { writeHead(s, h) { this.status = s }, end(p) { chunks.push(Buffer.from(p)) } }
    await route.handler(req, res)
    assert.equal(res.status, 403)
    void chunks
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('host API: install rejects invalid sources and validates bodies', async () => {
  const { host, request } = createHost()
  const root = await mkdtemp(join(tmpdir(), 'dsh-any-skills-api-'))
  try {
    apply(host, { installDir: join(root, 'install') })

    let r = await request('POST', '/api/skills/install', { sources: [{ type: 'bogus', value: 'x' }] })
    assert.equal(r.json.ok, true)
    assert.equal(r.json.results[0].ok, false)

    r = await request('POST', '/api/skills/install', { sources: [] })
    assert.equal(r.json.ok, false)

    r = await request('POST', '/api/skills/import', { type: 'local', path: '/nonexistent/path/xyz' })
    assert.equal(r.json.ok, false)

    r = await request('GET', '/api/skills/nope')
    assert.equal(r.json.ok, false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
