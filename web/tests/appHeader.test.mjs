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

const source = fs.readFileSync(new URL('../src/AppHeader.tsx', import.meta.url), 'utf8')
const tree = ts.createSourceFile('AppHeader.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const fn = tree.statements.find((statement) => ts.isFunctionDeclaration(statement)).getText(tree).replace('export default ', '')
const code = ts.transpileModule(fn, { compilerOptions: { target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.React } }).outputText
const pickerSource = fs.readFileSync(new URL('../src/GamePicker.tsx', import.meta.url), 'utf8')
const pickerTree = ts.createSourceFile('GamePicker.tsx', pickerSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const pickerFunctions = pickerTree.statements.filter(ts.isFunctionDeclaration).map((statement) => statement.getText(pickerTree).replace(/^export (default )?/, '')).join('\n')
const pickerCode = ts.transpileModule(pickerFunctions, { compilerOptions: { target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.React } }).outputText
const GamePicker = vm.runInNewContext(`${pickerCode};GamePicker`, { React, useId: React.useId, useState: React.useState, translate, translateUiText })
const Header = vm.runInNewContext(`${code};AppHeader`, { React, GamePicker, translate })
const games = [
  { id: 'overwatch', name: 'Overwatch', icon: 'assets/game-icons/overwatch.png', accent: '#f5a623', available: true },
  { id: 'pvzgw2', name: 'PVZ GW2', icon: 'assets/game-icons/pvzgw2.png', accent: '#79dc72', available: true },
  { id: 'unavailable', name: 'Unavailable', icon: '', accent: '#fff', available: false },
]
function nodes(element) {
  if (!React.isValidElement(element)) return []
  return [element, ...React.Children.toArray(element.props.children).flatMap(nodes)]
}
const props = { games, activeGame: 'overwatch', activeView: 'roulette', locale: 'en-us', animationsEnabled: true, onMenuToggle() {}, logoSrc: '/preview/app_icon.png', asset: (path) => safeAssetUrl(path, '/preview/', 'https://over-roll.com'), onNavigate() {}, onGameChange() {}, onHover() {} }

test('header preserves a usable logo, translated navigation and a labelled game switcher across nine locales', () => {
  for (const locale of ['es-mx', 'es-es', 'en-us', 'de-de', 'fr-fr', 'pt-br', 'ja-jp', 'ko-kr', 'zh-cn']) {
    const header = Header({ ...props, locale }), children = nodes(header), html = renderToStaticMarkup(header)
    assert(html.includes(translate(locale, 'nav_roulette')))
    assert(html.includes('src="/preview/app_icon.png"'))
    assert(html.includes('https://over-roll.com/preview/assets/game-icons/overwatch.png'))
    assert(html.includes('aria-haspopup="dialog"'))
    assert(html.includes('aria-expanded="false"'))
    const picker = children.find((element) => element.type === GamePicker)
    assert.equal(picker.props.activeGame, 'overwatch')
    assert.equal(picker.props.locale, locale)
    const current = children.filter((element) => element.props['aria-current'] === 'page')
    assert.equal(current.length, 1)
    assert.equal(current[0].props.children[1].props.children, translate(locale, 'nav_roulette'))
    assert.equal(children.find((element) => element.props.className === 'brand-copy').props.children.props.children, 'OverRoll')
  }
})

test('header routes navigation and forwards game selection through existing actions', () => {
  const navigated = [], selected = []
  let hovered = 0
  const header = Header({ ...props, onNavigate: (view) => navigated.push(view), onGameChange: (game) => selected.push(game), onHover: () => hovered++ })
  const children = nodes(header)
  for (const button of children.filter((element) => element.type === 'button')) {
    button.props.onMouseEnter(); button.props.onClick()
  }
  assert.deepEqual(navigated, ['principal', 'principal', 'roulette', 'profiles', 'more'])
  assert.equal(hovered, 5)
  const picker = children.find((element) => element.type === GamePicker)
  picker.props.onGameChange('pvzgw2')
  assert.deepEqual(selected, ['pvzgw2'])
})
