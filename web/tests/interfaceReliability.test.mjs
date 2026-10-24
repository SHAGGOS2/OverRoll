import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { createPlayerId } from '../src/playerIdentity.ts'

const read = (file) => fs.readFileSync(new URL('../src/' + file, import.meta.url), 'utf8')
const compile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.React } }).outputText
const walk = (node) => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : []

test('the entire App module initializes before and after a hero release without a temporal-dead-zone crash', () => {
  const source = compile(read('App.tsx').replaceAll('import.meta.env.BASE_URL', "'/'"))
  for (const [day, count] of [['2026-10-04', 53], ['2026-10-06', 54]]) {
    class Clock extends Date { static now() { return Date.parse(day + 'T12:00:00Z') } }
    const exports = {}
    const games = vm.runInNewContext(source + ';gameModules', { exports, Date: Clock, require(name) {
      if (name === 'react') return React
      if (name === './RosterModule') return { rosterGameDefinitions: [] }
      return {}
    } })
    assert.equal(typeof exports.default, 'function')
    assert.equal(games.find((game) => game.id === 'overwatch').catalogLabel, count + ' héroes')
  }
})

test('player IDs preserve secure UUIDs when randomUUID is unavailable and keep their version and uniqueness', () => {
  let calls = 0
  const random = { getRandomValues(bytes) { calls++; return crypto.getRandomValues(bytes) } }
  const ids = Array.from({ length: 1000 }, () => createPlayerId(random))
  assert(ids.every((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)))
  assert.equal(new Set(ids).size, 1000); assert.equal(calls, 1000)
  assert.equal(createPlayerId({ randomUUID: () => 'native-id', getRandomValues() { assert.fail('unneeded fallback') } }), 'native-id')
})

test('an interface error offers a non-destructive reload and requires confirmation before resetting local data', () => {
  const source = read('main.tsx'), tree = ts.createSourceFile('main.tsx', source, 99, true, 4)
  const boundary = tree.statements.find((node) => ts.isClassDeclaration(node) && node.name.text === 'AppErrorBoundary')
  let reloads = 0, cleared = 0, confirmations = 0, confirmed = false
  const Component = vm.runInNewContext(compile(boundary.getText(tree)) + ';AppErrorBoundary', {
    React, Component: React.Component, detectBrowserLocale: () => 'es-mx', translateUiText: (_locale, text) => text,
    clearOverRollStorage() { cleared++ }, window: { location: { reload() { reloads++ } }, confirm() { confirmations++; return confirmed } },
  })
  const view = new Component({ children: null }); view.state = { failed: true }
  const [reload, reset] = walk(view.render()).filter((node) => node.type === 'button')
  reload.props.onClick(); assert.equal(reloads, 1); assert.equal(cleared, 0); assert.equal(confirmations, 0)
  reset.props.onClick(); assert.equal(cleared, 0); assert.equal(reloads, 1)
  confirmed = true; reset.props.onClick(); assert.equal(cleared, 1); assert.equal(reloads, 2); assert.equal(confirmations, 2)
})

test('generation stays inside the toolbar on desktop and only portals above navigation on phones', () => {
  const source = compile(read('ViewportAction.tsx'))
  for (const mobile of [false, true]) {
    const exports = {}, cleanups = [], listeners = new Set(), body = {}
    const media = { matches: mobile, addEventListener(_type, fn) { listeners.add(fn) }, removeEventListener(_type, fn) { listeners.delete(fn) } }
    const react = { ...React, useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
      assert.equal(getServerSnapshot(), false); cleanups.push(subscribe()); return getSnapshot()
    } }
    vm.runInNewContext(source, { exports, React, window: { matchMedia: () => media }, document: { body }, require(name) {
      if (name === 'react') return react
      if (name === 'react-dom') return { createPortal: (element, target) => ({ element, target }) }
      if (name.endsWith('.css')) return {}
      throw Error(name)
    } })
    const button = React.createElement('button', null, 'Generar equipo')
    const result = exports.default({ children: button, style: { '--action-accent': '#f5bd55' } })
    const action = mobile ? result.element : result
    if (mobile) assert.equal(result.target, body)
    else assert.equal(result.type, 'div')
    assert.equal(action.props.children, button); assert.equal(action.props.style['--action-accent'], '#f5bd55')
    assert.equal(listeners.size, 1); cleanups.forEach((cleanup) => cleanup()); assert.equal(listeners.size, 0)
  }
})
