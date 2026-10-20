import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { translate } from '../src/localization.ts'
import { translateUiText } from '../src/uiLocalization.ts'
import { safeAssetUrl } from '../src/imageExport.ts'

const source = fs.readFileSync(new URL('../src/GamePicker.tsx', import.meta.url), 'utf8')
const tree = ts.createSourceFile('GamePicker.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const declarations = tree.statements.filter(ts.isFunctionDeclaration).map((statement) => statement.getText(tree).replace(/^export (default )?/, '')).join('\n')
const code = ts.transpileModule(declarations, { compilerOptions: { target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.React } }).outputText
function setup() {
  let state = false
  const actions = { games: [], menu: [], portals: [] }
  const scope = { React, translate, translateUiText, useId: () => 'game-selector', useState: () => [state, (value) => { state = value }], AnimatedLayer: 'animated-layer', document: { body: { marker: 'body' } }, createPortal: (element, target) => { actions.portals.push(target); return element } }
  const components = vm.runInNewContext(`${code};({GamePicker,GameCatalog})`, scope)
  const games = [
    { id: 'overwatch', name: 'Overwatch', icon: 'assets/game-icons/overwatch.png', accent: '#f5a623', available: true },
    { id: 'pvzgw2', name: 'PVZ GW2', icon: 'assets/game-icons/pvzgw2.png', accent: '#79dc72', available: true },
    { id: 'unavailable', name: 'Unavailable', icon: '', accent: '#fff', available: false },
  ]
  const props = { games, activeGame: 'overwatch', locale: 'en-us', asset: (path) => safeAssetUrl(path, '/', 'https://over-roll.com'), animationsEnabled: false, onGameChange: (game) => actions.games.push(game), onMenuToggle: (value) => actions.menu.push(value), onHover() {} }
  return { ...components, actions, props, body: scope.document.body, render: () => components.GamePicker(props) }
}
function nodes(element) {
  if (!React.isValidElement(element)) return []
  return [element, ...React.Children.toArray(element.props.children).flatMap(nodes)]
}
function variableCode(file, names) {
  const tree = ts.createSourceFile(file, fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), parts = []
  function visit(node) { if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(tree))) parts.push(`const ${node.name.getText(tree)}=${node.initializer.getText(tree)}`); ts.forEachChild(node, visit) }
  visit(tree)
  return ts.transpileModule(parts.join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2023 } }).outputText
}

test('custom game catalog presents every real game with its icon, localized heading and selected state', () => {
  const { GameCatalog, props } = setup()
  const definitions = vm.runInNewContext(`${variableCode('RosterModule.tsx', ['rosterGameDefinitions'])};rosterGameDefinitions`)
  const games = vm.runInNewContext(`${variableCode('App.tsx', ['gameModuleIcons', 'gameModules'])};gameModules`, { rosterGameDefinitions: definitions, doctrineUnlocked: () => true })
  assert.equal(games.length, 11)
  for (const locale of ['es-mx', 'es-es', 'en-us', 'de-de', 'fr-fr', 'pt-br', 'ja-jp', 'ko-kr', 'zh-cn']) {
    const catalog = GameCatalog({ ...props, games, locale, id: 'catalog', onChoose() {}, onClose() {} }), rows = nodes(catalog), html = renderToStaticMarkup(catalog)
    assert(html.includes(translate(locale, 'tab_games')))
    assert(html.includes(translateUiText(locale, 'Cerrar')))
    assert.equal(catalog.props.role, 'dialog'); assert.match(html, /aria-modal="true"/)
    const options = rows.filter((element) => element.props['data-game-id'])
    assert.equal(options.length, 11)
    assert.equal(options.filter((element) => element.props['aria-pressed']).length, 1)
    assert.equal(options.find((element) => element.props['aria-pressed']).props['data-initial-focus'], true)
    for (const game of games) { assert(html.includes(game.name)); assert(fs.existsSync(new URL(`../public/${game.icon}`, import.meta.url))) }
  }
})

test('game picker opens outside the header, closes through the modal handler, and validates selection without duplicate game actions', () => {
  const picker = setup()
  let rows = nodes(picker.render())
  const trigger = rows.find((element) => element.props.className === 'topbar-game-picker')
  assert.equal(trigger.props['aria-haspopup'], 'dialog'); assert.equal(trigger.props['aria-expanded'], false)
  trigger.props.onClick()
  rows = nodes(picker.render())
  assert.equal(rows.find((element) => element.props.className === 'topbar-game-picker').props['aria-expanded'], true)
  const layer = rows.find((element) => element.type === 'animated-layer')
  assert.equal(layer.props.enabled, false)
  assert(picker.actions.portals.every((target) => target === picker.body))
  const catalog = rows.find((element) => element.type === picker.GameCatalog)
  catalog.props.onChoose('unknown'); catalog.props.onChoose('unavailable')
  assert.equal(nodes(picker.render()).find((element) => element.type === 'animated-layer').props.open, true)
  catalog.props.onChoose('pvzgw2')
  assert.deepEqual(picker.actions.games, ['pvzgw2'])
  assert.equal(nodes(picker.render()).find((element) => element.type === 'animated-layer').props.open, false)
  trigger.props.onClick(); layer.props.onClose()
  assert.equal(picker.actions.menu.at(-1), false)
  trigger.props.onClick(); catalog.props.onChoose('overwatch')
  assert.deepEqual(picker.actions.games, ['pvzgw2'])
  assert.equal(picker.actions.menu.at(-1), false)
})

test('catalog keyboard navigation skips unavailable games and supports both directions and Home/End', () => {
  const picker = setup(), selected = []
  const catalog = picker.GameCatalog({ ...picker.props, id: 'catalog', onChoose: (id) => selected.push(id), onClose() {} })
  const buttons = nodes(catalog).filter((element) => element.props['data-game-id'])
  const focused = []
  const targets = ['overwatch', 'pvzgw2'].map((id) => ({ focus: () => focused.push(id) }))
  function key(value, index = 0) { targets[index].parentElement = { querySelectorAll: () => targets }; buttons[index].props.onKeyDown({ key: value, preventDefault() {}, currentTarget: targets[index] }) }
  key('End'); key('ArrowLeft'); key('ArrowRight', 1); key('Home', 1)
  assert.deepEqual(focused, ['pvzgw2', 'pvzgw2', 'overwatch', 'overwatch'])
  buttons[2].props.onClick(); buttons[1].props.onClick()
  assert.deepEqual(selected, ['pvzgw2'])
})
