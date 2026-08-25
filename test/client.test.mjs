/**
 * dsh-any-skills — client bundle handshake test.
 *
 * Loads the built lib client.js in a Node vm sandbox with a stub
 * `window.__ModuleLoader__`, invokes the factory with a fake `require("react")`,
 * then runs `apply(ctx)` against a fake slots registry to verify both Slot
 * contributions (composer picker + settings section) register cleanly.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

/** Minimal react stub: createElement returns a plain descriptor. */
function createElementStub(type, props, ...children) {
  return { type, props: props ?? null, children: children.length === 1 ? children[0] : children }
}

function loadClientBundle(extraSandbox = {}) {
  const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  let captured = null
  const sandbox = {
    window: {
      __ModuleLoader__: {
        load(definition) {
          captured = definition
        },
      },
    },
    console,
    ...extraSandbox,
  }
  sandbox.window.window = sandbox.window
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox)
  assert.ok(captured, 'client bundle must call window.__ModuleLoader__.load')
  assert.equal(captured.id, 'dsh-any-skills')

  const factoryResult = captured.factory((specifier) => {
    if (specifier === 'react') {
      return {
        createElement: createElementStub,
        useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => undefined],
        useCallback: (fn) => fn,
        useEffect: () => undefined,
        useRef: (initial) => ({ current: initial ?? null }),
      }
    }
    throw new Error(`unexpected require: ${specifier}`)
  })
  return factoryResult
}

test('client bundle: registers composer picker + settings section', () => {
  const { inject, apply } = loadClientBundle()
  // the array comes from the vm realm; compare element-wise
  assert.deepEqual([...inject], ['slots'], 'inject slots only')

  const registrations = []
  const fakeSlots = {
    inject(key, callback) {
      registrations.push({ key, callback })
      return () => undefined
    },
    register(opts, component) {
      return { opts, component }
    },
  }
  const ctx = {
    slots: fakeSlots,
    get() {
      return undefined // no workspaces service — the settings page must not depend on it
    },
    effect(callback) {
      // real Cordis runs the effect body immediately
      return callback() ?? (() => undefined)
    },
  }

  apply(ctx)
  const keys = registrations.map((r) => r.key)
  assert.ok(keys.includes('conversation.input.right'), 'composer slot registered')
  assert.ok(keys.includes('settings.section'), 'settings slot registered')

  const composer = registrations.find((r) => r.key === 'conversation.input.right')
  const rendered = composer.callback()
  assert.equal(rendered.opts.name, 'conversation.input.right')
  assert.equal(rendered.opts.id, 'any-skills-picker')
  assert.equal(typeof rendered.component, 'function')

  const settings = registrations.find((r) => r.key === 'settings.section')
  const settingsRendered = settings.callback()
  assert.equal(settingsRendered.opts.id, 'skills')
  assert.equal(settingsRendered.opts.label, 'Skill Management')
  // no directory-picker inject anymore (scheme A: no native picker entry)
  assert.equal(settingsRendered.opts.inject, undefined)

  // the composer component renders without throwing (open=false)
  const tree = rendered.component({ session: { sessionId: 's1' }, input: { draft: 'hello' }, inputActions: { setDraft: () => undefined } })
  assert.ok(tree !== null && typeof tree === 'object')
})

test('client bundle: picker respects the show-picker preference', () => {
  // default (no localStorage): picker renders
  const enabled = loadClientBundle()
  const { inject, apply } = enabled
  const registrations = []
  const ctx = {
    slots: {
      inject(key, callback) {
        registrations.push({ key, callback })
        return () => undefined
      },
      register(opts, component) {
        return { opts, component }
      },
    },
    effect(callback) {
      return callback() ?? (() => undefined)
    },
  }
  apply(ctx)
  const composer = registrations.find((r) => r.key === 'conversation.input.right').callback()
  assert.ok(composer.component({}) !== null, 'picker renders by default')

  // localStorage says '0' (disabled): picker renders null
  const disabled = loadClientBundle({
    localStorage: { getItem: () => '0', setItem: () => undefined },
  })
  const registrations2 = []
  const ctx2 = {
    slots: {
      inject(key, callback) {
        registrations2.push({ key, callback })
        return () => undefined
      },
      register(opts, component) {
        return { opts, component }
      },
    },
    effect(callback) {
      return callback() ?? (() => undefined)
    },
  }
  disabled.apply(ctx2)
  const composer2 = registrations2.find((r) => r.key === 'conversation.input.right').callback()
  assert.equal(composer2.component({}), null, 'picker hidden when disabled')
})

test('client bundle: buildInsertedDraft appends at end when no caret range', () => {
  const { buildInsertedDraft } = loadClientBundle()
  // vm realm object prototype differs, strict deepEqual not usable, field-by-field assertion
  assert.deepEqual({ ...buildInsertedDraft('hello', 'git') }, { text: 'hello /git ', caret: 11 })
  assert.deepEqual({ ...buildInsertedDraft('', 'git') }, { text: '/git ', caret: 5 })
  assert.deepEqual({ ...buildInsertedDraft('hello ', 'git') }, { text: 'hello /git ', caret: 11 })
  assert.deepEqual({ ...buildInsertedDraft('hello\n', 'git') }, { text: 'hello\n/git ', caret: 11 })
})

test('client bundle: buildInsertedDraft inserts at the caret position', () => {
  const { buildInsertedDraft } = loadClientBundle()
  assert.deepEqual({ ...buildInsertedDraft('hello world', 'git', { start: 5, end: 5 }) }, { text: 'hello /git world', caret: 10 })
  assert.deepEqual({ ...buildInsertedDraft('hello', 'git', { start: 0, end: 0 }) }, { text: '/git hello', caret: 5 })
  assert.deepEqual({ ...buildInsertedDraft('a\nb', 'git', { start: 2, end: 2 }) }, { text: 'a\n/git b', caret: 7 })
})

test('client bundle: buildInsertedDraft replaces the selected range', () => {
  const { buildInsertedDraft } = loadClientBundle()
  assert.deepEqual({ ...buildInsertedDraft('hello world', 'git', { start: 6, end: 11 }) }, { text: 'hello /git ', caret: 11 })
})

test('client bundle: apply tolerates missing slots', () => {
  const { apply } = loadClientBundle()
  assert.doesNotThrow(() => apply({ slots: undefined, get: () => undefined }))
})
