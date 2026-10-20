import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { gameCredits } from '../src/gameCredits.ts'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { translateUiText } from '../src/uiLocalization.ts'

const source = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const tree = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let functionSource
function visit(node) { if (ts.isFunctionDeclaration(node) && node.name?.text === 'renderMore') functionSource = node.getText(tree); ts.forEachChild(node, visit) }
visit(tree)
const code = ts.transpileModule(functionSource, { compilerOptions: { target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.React } }).outputText
function render(tab, overrides = {}) {
  const changes = { sounds: [] }
  const context = { gameCredits, React, Icon: () => null, CardDesignOptions: () => null, overwatchCardDesign: 'classic', setOverwatchCardDesign: (value) => { changes.design = value }, t: (key) => key, settingsTab: tab,
    animationsEnabled: true, compactPerks: false, mobileCompactMode: true, lowPowerMode: false,
    soundEnabled: true, soundVolume: .42, hoverSounds: false, localePreference: 'auto',
    browserLocale: 'es-MX', activeLocale: 'es-MX', activeGame: 'deadlock',
    localeName: (locale) => locale, localeChoices: [{ id: 'es-MX', name: 'Español' }, { id: 'en-US', name: 'English' }],
    gameModules: [{ id: 'deadlock', name: 'Deadlock', catalogLabel: '43 héroes', icon: 'assets/game-icons/deadlock.png', available: true }],
    asset: (path) => path, creditsSongUrl: () => 'https://example.com', playSound(kind) { changes.sounds.push(kind) }, toggleRuleSound(next) { changes.sounds.push(next ? 'toggleOn' : 'toggleOff') }, notify() {}, playConfirmTone() {},
    restoreRecommendedSettings() { changes.reset = true }, resetLocalData() { changes.clear = true },
    setSettingsTab: (value) => { changes.tab = value }, setLocalePreference: (value) => { changes.locale = value }, setSoundVolume: (value) => { changes.volume = value },
    toggleSounds: () => { changes.sound = true }, activateGame: (value) => { changes.game = value }, navigate: (value) => { changes.view = value },
    ...Object.fromEntries(['AnimationsEnabled', 'CompactPerks', 'MobileCompactMode', 'LowPowerMode', 'HoverSounds'].map((key) => ['set' + key, (value) => { changes[key] = value }])), ...overrides }
  return { element: vm.runInNewContext(`${code};renderMore()`, context), changes }
}
function elements(element) {
  if (!React.isValidElement(element)) return []
  return [element, ...React.Children.toArray(element.props.children).flatMap(elements)]
}

test('new general settings retain working toggles and explicit reset actions', () => {
  const { element, changes } = render('general'), rows = elements(element)
  const switches = rows.filter((el) => el.type === 'input' && el.props.type === 'checkbox')
  assert.equal(switches.length, 4)
  switches.forEach((el) => el.props.onChange({ target: { checked: !el.props.checked } }))
  const { sounds, ...values } = changes
  assert.deepEqual(values, { AnimationsEnabled: false, CompactPerks: true, MobileCompactMode: false, LowPowerMode: true })
  assert.equal(sounds.length, 4)
  const buttons = rows.filter((el) => el.type === 'button')
  buttons.find((el) => React.Children.toArray(el.props.children).includes('Restablecer ajustes')).props.onClick()
  buttons.find((el) => React.Children.toArray(el.props.children).includes('Borrar datos guardados')).props.onClick()
  assert.equal(changes.reset, true); assert.equal(changes.clear, true)
  const html = renderToStaticMarkup(element)
  assert(!html.includes('settings-active-overview'))
  assert(!html.includes('Configuración independiente por módulo'))
})

test('card design selection is scoped to Overwatch, retains the chosen value and plays option feedback', () => {
  const Design = () => null
  const { element, changes } = render('card-design', { CardDesignOptions: Design, overwatchCardDesign: 'bars' })
  const picker = elements(element).find((el) => el.type === Design)
  assert.equal(picker.props.value, 'bars')
  picker.props.onChange('classic')
  assert.equal(changes.design, 'classic'); assert.deepEqual(changes.sounds, ['click'])
})

test('audio controls preserve master sound behavior, volume and disabled states', () => {
  const { element, changes } = render('audio'), controls = elements(element).filter((el) => el.type === 'input')
  controls.find((el) => el.props.type === 'checkbox').props.onChange({ target: { checked: false } })
  controls.find((el) => el.props.type === 'range').props.onChange({ target: { value: '.75' } })
  assert.equal(changes.sound, true); assert.equal(changes.volume, .75)
  const muted = elements(render('audio', { soundEnabled: false }).element).filter((el) => el.type === 'input')
  assert.equal(muted[0].props.disabled, false)
  assert(muted.slice(1).every((el) => el.props.disabled))
})

test('settings tabs support keyboard navigation and language/game actions remain connected', () => {
  const { element, changes } = render('general'), tabs = elements(element).filter((el) => el.props.role === 'tab')
  assert.equal(tabs.length, 6); assert.equal(tabs.filter((el) => el.props.tabIndex === 0).length, 1)
  let focused = -1
  const event = { key: 'End', preventDefault() {}, currentTarget: { parentElement: { querySelectorAll() { return tabs.map((_, i) => ({ focus() { focused = i } })) } } } }
  tabs[0].props.onKeyDown(event)
  assert.equal(changes.tab, 'credits'); assert.equal(focused, 5)
  const language = render('language'), select = elements(language.element).find((el) => el.type === 'select')
  select.props.onChange({ target: { value: 'en-US' } }); assert.equal(language.changes.locale, 'en-US')
  const games = render('catalogs'), gameButton = elements(games.element).find((el) => el.type === 'button' && el.props.className === 'selected')
  gameButton.props.onClick(); assert.equal(games.changes.game, 'deadlock')
  for (const tab of ['general', 'audio', 'language', 'catalogs', 'credits']) assert(renderToStaticMarkup(render(tab).element).length > 0)
})

test('each general setting, keyboard tab and volume commit provides sound feedback', () => {
  const general = render('general')
  const switches = elements(general.element).filter((element) => element.type === 'input' && element.props.type === 'checkbox')
  assert.equal(switches.length, 4)
  for (const control of switches) control.props.onChange({ target: { checked: !control.props.checked } })
  assert.equal(general.changes.sounds.length, 4)
  const tabs = elements(general.element).filter((element) => element.props.role === 'tab')
  tabs[0].props.onKeyDown({ key: 'ArrowDown', preventDefault() {}, currentTarget: { parentElement: { querySelectorAll() { return tabs.map(() => ({ focus() {} })) } } } })
  assert.equal(general.changes.sounds.at(-1), 'nav')
  const audio = render('audio'), volume = elements(audio.element).find((element) => element.type === 'input' && element.props.type === 'range')
  volume.props.onPointerUp(); volume.props.onKeyUp({ key: 'ArrowRight' })
  assert.deepEqual(audio.changes.sounds, ['click', 'click'])
})

test('shared game configuration tabs translate and retain keyboard focus when changing sections', () => {
  const sidebar = fs.readFileSync(new URL('../src/GameSidebar.tsx', import.meta.url), 'utf8')
  const source = sidebar.slice(sidebar.indexOf('export default function')).replace('export default ', '')
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.React } }).outputText
  const Sidebar = vm.runInNewContext(`${code};GameSidebar`, { React, useId: () => 'configuration', translateUiText })
  const selected = []
  const element = Sidebar({ className: 'sidebar', locale: 'en-us', open: true, activeTab: 'squad', onToggle() {}, onTabChange: (tab) => selected.push(tab), children: null })
  const html = renderToStaticMarkup(element)
  assert.match(html, />Squad</); assert.match(html, />Rules</)
  const tabs = elements(element).filter((element) => element.props.role === 'tab')
  let focused
  tabs[0].props.onKeyDown({ key: 'ArrowRight', preventDefault() {}, currentTarget: { parentElement: { querySelector: (selector) => ({ focus() { focused = selector } }) } } })
  assert.equal(selected.at(-1), 'rules')
  assert.equal(focused, '[data-tab="rules"]')
  assert.equal(tabs[0].props.tabIndex, 0); assert.equal(tabs[1].props.tabIndex, -1)
})
