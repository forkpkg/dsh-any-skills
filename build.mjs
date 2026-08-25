/**
 * dsh-any-skills - build script.
 *
 * Host half (index.js): plain Node ESM, externalizing @deepseek-ai/dsh-* and
 * cordis (provided by the DSH installation / profile node_modules).
 *
 * Client half (client.js): a single CJS bundle wrapped in the ModuleLoader
 * handshake - the web shell serves exactly one file per plugin
 * (/plugins/dsh-any-skills/client.js) and REQUIRES the bundle to register
 * itself via `window.__ModuleLoader__.load({ id, factory })`. Without this the
 * shell fails the whole boot with:
 *   "loaded without registering 'dsh-any-skills' via __ModuleLoader__.load"
 * react stays external and is provided by the app's module system.
 */
import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('lib-tmp', { recursive: true })

const dshExternal = ['@deepseek-ai/cordis', '@deepseek-ai/dsh-*']

// ---- Host half: plain Node ESM -------------------------------------------
await build({
  entryPoints: ['index.ts'],
  outfile: 'index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  external: [...dshExternal, 'yaml'],
  logLevel: 'info',
})

// ---- Client half: CJS bundle wrapped in the ModuleLoader handshake --------
await build({
  entryPoints: ['client.ts'],
  outfile: 'lib-tmp/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  external: [...dshExternal, 'react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'scheduler'],
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-any-skills', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})

// The web shell reads exports["./client"] -> ./client.js and serves it as a
// classic script; keep the on-disk name in sync with the manifest.
import { copyFileSync } from 'node:fs'
copyFileSync('lib-tmp/client.js', 'client.js')

// Minimal host type declaration (the profile only needs the runtime entry).
writeFileSync(
  'index.d.ts',
  [
    'export const name: string',
    'export const inject: string[]',
    'export interface Config {',
    '  /** Directory where imported/installed skills land. Defaults to ~/.dsh/skills. */',
    '  installDir?: string',
    '  /** Optional GitHub token to lift API rate limits (used for repo inspection). */',
    '  githubToken?: string',
    '  /** Optional path to a file containing a GitHub token. */',
    '  githubTokenFile?: string',
    '}',
    'export function apply(ctx: any, config?: Config): void',
    '',
  ].join('\n'),
)

console.log('build complete: index.js (ESM host), client.js (CJS + __ModuleLoader__ handshake)')
