import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as order from '../src/squadOrder.ts'
import * as text from '../src/squadText.ts'
import * as ui from '../src/uiLocalization.ts'
import * as design from '../src/cardDesign.ts'

function load(file, react = React, globals = {}, extra = {}) {
  const source = fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2023 } }).outputText
  const exports = {}, deps = { react, './squadOrder': order, './squadText': text, './uiLocalization': ui, './cardDesign': design, ...extra }
  vm.runInNewContext(code, { exports, React, ...globals, require(name) { assert(name in deps, name); return deps[name] } })
  return exports
}
const members = (n) => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Amigo${i}`, profileId: `profile${i}`, blocked: [`excluded${i}`], roles: { support: i % 2 === 0 }, side: i % 2 ? 'zombies' : 'plants' }))
const results = (n) => Array.from({ length: n }, (_, i) => ({ hero: { key: `hero${i}` }, character: { key: `variant${i}` }, locked: true, perks: [`perk${i}`], candidates: [`candidate${i}`], loadout: { gadgets: [`gadget${i}`] }, teamupKey: `pair${i}` }))

test('moving a complete card preserves player identity, restrictions, locks, perks, candidates and loadouts without mutation', () => {
  for (const count of [2, 5, 6, 8, 12]) for (const [from, to] of [[0, count - 1], [count - 1, 0]]) {
    const players = members(count), picks = results(count), snapshot = JSON.stringify({ players, picks })
    const next = order.reorderSquad(players, picks, players[from].id, players[to].id, () => ({ hero: null }))
    assert(next.changed)
    assert.equal(next.players[to], players[from]); assert.equal(next.picks[to], picks[from])
    for (let i = 0; i < count; i++) assert.equal(next.picks[i], picks[players.indexOf(next.players[i])])
    assert.equal(JSON.stringify({ players, picks }), snapshot)
  }
  const players = members(3), picks = results(1)
  const next = order.reorderSquad(players, picks, 'p2', 'p0', () => ({ hero: null, locked: false }))
  assert.equal(next.picks[1], picks[0]); assert.equal(next.picks[0].hero, null)
  for (const [from, to] of [['p0', 'p0'], ['missing', 'p0'], ['p0', 'missing']]) assert.equal(order.reorderSquad(players, picks, from, to, () => ({})).players, players)
  const duplicate = [{ id: 'same' }, { id: 'same' }, { id: 'other' }]
  assert.equal(order.reorderSquad(duplicate, [], 'same', 'other', () => ({})).changed, false)
})

const rects = (count, columns = count) => Array.from({ length: count }, (_, i) => ({ left: i % columns * 200, right: i % columns * 200 + 180, top: Math.floor(i / columns) * 240, bottom: Math.floor(i / columns) * 240 + 220 }))
test('pointer and keyboard destinations respect rows, gaps, boundaries and single-column layouts', () => {
  const rows = rects(6, 3)
  assert.equal(order.dropTarget(rows, 280, 300), 4)
  assert.equal(order.dropTarget(rows, 190, 80), 0)
  for (const [x, y] of [[-1, 80], [600, 80], [40, -2], [40, 500], [NaN, 2]]) assert.equal(order.dropTarget(rows, x, y), null)
  assert.equal(order.dropTarget([], 1, 1), null)
  assert.equal(order.keyboardTarget(rows, 1, 'ArrowDown'), 4)
  assert.equal(order.keyboardTarget(rows, 4, 'ArrowUp'), 1)
  assert.equal(order.keyboardTarget(rows, 0, 'ArrowLeft'), 0)
  assert.equal(order.keyboardTarget(rows, 5, 'ArrowRight'), 5)
  assert.equal(order.keyboardTarget(rows, 3, 'Home'), 0)
  assert.equal(order.keyboardTarget(rows, 0, 'End'), 5)
  assert.equal(order.keyboardTarget(rects(6, 1), 2, 'ArrowDown'), 3)
  assert.equal(order.keyboardTarget(rows, 2, 'Enter'), null)
})

test('showcase fits the whole squad without upscaling or changing the card proportions', () => {
  for (const [width, height, availableWidth, availableHeight] of [[1580, 610, 1380, 540], [1760, 1200, 1860, 890], [420, 700, 1200, 520], [520, 360, 1900, 900]]) {
    const scale = order.showcaseScale(width, height, availableWidth, availableHeight)
    assert(scale > 0 && scale <= 1); assert(width * scale <= availableWidth + .001); assert(height * scale <= availableHeight + .001)
  }
  assert.equal(order.showcaseScale(0, 200, 500, 500), 1)
  assert.equal(order.showcaseScale(Infinity, 200, 500, 500), 1)
})

test('the five card styles expose translated handles, hide them for showcase or one player, and disable them during generation', () => {
  const grid = load('SquadGrid.tsx'), Bar = load('BarCard.tsx', React, {}, { './SquadGrid': grid }).default
  for (const locale of ['es-mx', 'es-es', 'en-us', 'pt-br', 'fr-fr', 'de-de', 'ja-jp', 'ko-kr', 'zh-cn']) for (const style of ['classic', 'bars', 'horizontal', 'hex', 'orbit']) {
    for (const variant of [{}, { disabled: true }, { showcase: true }, { single: true }]) {
      const players = members(variant.single ? 1 : 2)
      const cards = players.map((player, index) => style === 'classic' ? React.createElement('article', { key: player.id }, React.createElement(grid.ReorderHandle, { index })) : React.createElement(Bar, { key: player.id, index, player: player.name, name: 'Hero', role: 'Support', portrait: '', rolesOnly: false, locked: true, blocked: 0, perks: [], actions: null, revision: 0, motion: false, locale, design: style }))
      const html = renderToStaticMarkup(React.createElement(grid.default, { players, locale, className: 'team-grid', motion: false, onReorder() {}, ...variant }, cards))
      const expected = variant.showcase || variant.single ? 0 : players.length
      assert.equal((html.match(/class="squad-grip"/g) ?? []).length, expected)
      if (expected) { assert(html.includes(text.squadText(locale, 'move', { player: players[0].name }))); assert(html.includes('aria-describedby=')); if (variant.disabled) assert(html.includes('disabled=""')) }
    }
  }
})

// Execute the production hooks and event handlers against measured card rectangles.
// This checks state/gesture behavior without substituting a browser layout engine.
function hookRuntime() {
  let cursor = 0, context, id = 0
  const cells = [], pending = [], frames = new Map(), timers = new Map(), listeners = new Map()
  const effect = (fn, deps) => {
    const index = cursor++, previous = cells[index]
    if (!previous || !deps || deps.some((value, i) => !Object.is(value, previous.deps?.[i]))) {
      pending.push(() => { previous?.cleanup?.(); cells[index] = { deps, cleanup: fn() } })
    }
  }
  const react = { ...React, useRef(value) { const i = cursor++; return cells[i] ??= { current: value } },
    useState(value) { const i = cursor++; if (!(i in cells)) cells[i] = typeof value === 'function' ? value() : value; return [cells[i], (next) => { cells[i] = typeof next === 'function' ? next(cells[i]) : next }] },
    useId() { const i = cursor++; return cells[i] ??= `hint${i}` }, useContext() { return context }, useEffect: effect, useLayoutEffect: effect }
  const window = { innerWidth: 1200, innerHeight: 900, scrollX: 12, scrollY: 180,
    requestAnimationFrame(fn) { const key = ++id; frames.set(key, fn); return key }, cancelAnimationFrame(key) { frames.delete(key) },
    setTimeout(fn) { const key = ++id; timers.set(key, fn); return key }, clearTimeout(key) { timers.delete(key) },
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn) }, removeEventListener(type, fn) { listeners.get(type)?.delete(fn) },
    matchMedia: () => ({ matches: true }), getComputedStyle: () => ({ transform: 'none', overflowX: 'visible', overflowY: 'visible' }),
    scrollTo(x, y) { this.scrollX = x; this.scrollY = y },
  }
  return { react, window, render(fn) { cursor = 0; const output = fn(); return output }, effects() { const run = pending.splice(0); run.forEach((fn) => fn()) },
    context(value) { context = value }, frame() { const run = [...frames.values()]; frames.clear(); run.forEach((fn) => fn()) },
    dispatch(type, event) { listeners.get(type)?.forEach((fn) => fn({ preventDefault() {}, stopPropagation() {}, ...event })) },
    unmount() { cells.forEach((cell) => cell?.cleanup?.()) }, get frames() { return frames.size }, get timers() { return timers.size } }
}

class Element {
  constructor(rect = {}) {
    this.rect = rect; this.children = []; this.parentElement = null; this.isConnected = true; this.scrollLeft = this.scrollTop = 0
    this.offsetWidth = this.clientWidth = this.scrollWidth = 580; this.offsetHeight = this.clientHeight = this.scrollHeight = 460
    this.styles = new Map(); this.classes = new Set(); this.focused = 0
    this.style = { setProperty: (k, v) => this.styles.set(k, v), removeProperty: (k) => this.styles.delete(k) }
    this.classList = { add: (k) => this.classes.add(k), remove: (...keys) => keys.forEach((k) => this.classes.delete(k)), toggle: (k, on) => on ? this.classes.add(k) : this.classes.delete(k) }
  }
  getBoundingClientRect() { const x = this.classes.has('squad-drag-source') ? parseFloat(this.styles.get('--squad-drag-x')) || 0 : 0, y = this.classes.has('squad-drag-source') ? parseFloat(this.styles.get('--squad-drag-y')) || 0 : 0; return { ...this.rect, left: this.rect.left + x, right: this.rect.right + x, top: this.rect.top + y, bottom: this.rect.bottom + y, width: this.rect.right - this.rect.left, height: this.rect.bottom - this.rect.top } }
  focus() { this.focused++ }
  setPointerCapture(id) { this.pointer = id }
  hasPointerCapture(id) { return this.pointer === id }
  releasePointerCapture() { this.pointer = null }
  animate() { return { cancel() {} } }
}

function gridHarness(count = 6, columns = 3) {
  const runtime = hookRuntime(), stage = new Element({ left: 0, right: 580, top: 0, bottom: 460 }), gridElement = new Element(stage.rect)
  gridElement.parentElement = stage
  const module = load('SquadGrid.tsx', runtime.react, { window: runtime.window, document: { scrollingElement: stage }, HTMLElement: Element })
  let players = members(count), picks = results(count), moves = 0, props = {}, tree, output
  const elements = new Map(players.map((player) => [player.id, new Element()]))
  const render = (next = {}) => {
    props = { ...props, ...next }
    for (let pass = 0; pass < 2; pass++) {
      gridElement.children = players.map((player, i) => { const element = elements.get(player.id); element.rect = rects(count, columns)[i]; return element })
      output = runtime.render(() => module.default({ players, locale: 'en-us', className: 'team-grid', motion: true, ...props, onReorder(from, to) { const next = order.reorderSquad(players, picks, from, to, () => ({})); players = next.players; picks = next.picks; moves++ }, children: null }))
      runtime.context(output.props.value)
      tree = React.Children.toArray(output.props.children)[0]
      tree.props.ref.current = gridElement
      runtime.effects()
    }
  }
  render()
  const handle = (index) => module.ReorderHandle({ index })
  const pointer = (x, y, index = 0, extra = {}) => ({ button: 0, isPrimary: true, pointerId: 42, currentTarget: elements.get(players[index].id), clientX: x, clientY: y, preventDefault() {}, ...extra })
  return { render, runtime, handle, pointer, get grid() { return tree }, get moves() { return moves }, get players() { return players }, get picks() { return picks }, elements,
    get dragging() { return gridElement.children.some((element) => element.classes.has('squad-drag-source')) } }
}

test('mouse and touch drags commit once on release; Escape, capture loss and outside drops leave the squad intact', () => {
  for (const pointerType of ['mouse', 'touch']) {
    const h = gridHarness(), original = h.picks[0]
    h.handle(0).props.onPointerDown(h.pointer(80, 80, 0, { pointerType }))
    h.grid.props.onPointerMove(h.pointer(480, 320, 0, { pointerType })); assert(h.dragging); assert.equal(h.moves, 0)
    h.grid.props.onPointerUp(h.pointer(480, 320, 0, { pointerType })); h.render()
    assert.equal(h.moves, 1); assert.equal(h.players[5].id, 'p0'); assert.equal(h.picks[5], original); assert.equal(h.dragging, false)
    h.runtime.unmount(); assert.equal(h.runtime.frames, 0); assert.equal(h.runtime.timers, 0)
  }
  for (const finish of ['escape', 'outside', 'cancel', 'capture', 'disabled']) {
    const h = gridHarness(), original = JSON.stringify(h.players)
    h.handle(0).props.onPointerDown(h.pointer(80, 80)); h.grid.props.onPointerMove(h.pointer(480, 320)); h.render()
    if (finish === 'escape') h.runtime.dispatch('keydown', { key: 'Escape' })
    if (finish === 'outside') h.grid.props.onPointerUp(h.pointer(-100, -100))
    if (finish === 'cancel') h.grid.props.onPointerCancel()
    if (finish === 'capture') h.grid.props.onLostPointerCapture()
    if (finish === 'disabled') h.render({ disabled: true })
    h.grid.props.onPointerUp(h.pointer(480, 320)); h.render()
    assert.equal(h.moves, 0, finish); assert.equal(JSON.stringify(h.players), original); assert.equal(h.dragging, false)
    h.runtime.unmount()
  }
})

test('click-to-destination and keyboard movement work without dragging, including a vertical touch layout', () => {
  const h = gridHarness(6, 1)
  h.handle(0).props.onClick(); h.render(); assert.equal(h.handle(0).props['aria-pressed'], true)
  h.handle(4).props.onClick(); h.render(); assert.equal(h.players[4].id, 'p0')
  h.handle(4).props.onKeyDown({ key: 'Home', preventDefault() {} }); h.render(); assert.equal(h.players[0].id, 'p0')
  h.handle(0).props.onKeyDown({ key: 'ArrowDown', preventDefault() {} }); h.render(); assert.equal(h.players[1].id, 'p0')
  h.handle(1).props.onKeyDown({ key: 'End', preventDefault() {} }); h.render(); assert.equal(h.players[5].id, 'p0')
  h.runtime.unmount()
})

test('showcase exits with Escape or navigation, restoring focus, scroll positions and the previous body overflow', () => {
  for (const finish of ['Escape', 'button', 'game', 'view']) {
    const runtime = hookRuntime(), entry = new Element(), exit = new Element(), panel = new Element()
    panel.scrollTop = 320; panel.scrollLeft = 48
    const document = { activeElement: entry, body: { style: { overflow: 'auto' } }, querySelectorAll: () => [panel] }
    const module = load('Showcase.tsx', runtime.react, { window: runtime.window, document, HTMLElement: Element })
    let state, game = 'overwatch', view = 'principal'
    const render = () => { for (let i = 0; i < 3; i++) { state = runtime.render(() => module.useShowcase(view, game)); state.exitRef.current = exit; runtime.effects() } }
    render(); state.enter(); render(); runtime.frame()
    assert(state.enabled); assert.equal(document.body.style.overflow, 'hidden'); assert.equal(exit.focused, 1)
    panel.scrollTop = 0; panel.scrollLeft = 0; runtime.window.scrollTo(0, 0)
    if (finish === 'Escape') runtime.dispatch('keydown', { key: 'Escape' })
    if (finish === 'button') state.exit()
    if (finish === 'game') game = 'tf2'
    if (finish === 'view') view = 'more'
    render(); assert.equal(state.enabled, false); assert.equal(entry.focused, 1); assert.equal(document.body.style.overflow, 'auto')
    assert.equal(panel.scrollTop, 320); assert.equal(panel.scrollLeft, 48); assert.equal(runtime.window.scrollY, 180)
    runtime.unmount(); assert.equal(runtime.frames, 0)
  }
})

test('numbered defaults keep their identity and language after being moved; custom names remain untouched', () => {
  for (const locale of ['es-mx', 'es-es', 'en-us', 'pt-br', 'fr-fr', 'de-de', 'ja-jp', 'ko-kr', 'zh-cn']) {
    assert.equal(ui.displayPlayerName(locale, 'Jugador6', 1), ui.localizedPlayerName(locale, 6))
    assert.equal(ui.displayPlayerName(locale, 'Player 2', 5), ui.localizedPlayerName(locale, 2))
    assert.equal(ui.displayPlayerName(locale, 'Ana María 42', 1), 'Ana María 42')
    assert.equal(ui.displayPlayerName(locale, '', 3), ui.localizedPlayerName(locale, 3))
  }
})

function functions(file, names, globals) {
  const source = fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), parts = []
  function visit(node) { if (ts.isFunctionDeclaration(node) && names.includes(node.name?.text)) parts.push(node.getText(tree)); ts.forEachChild(node, visit) }
  visit(tree); assert.equal(parts.length, names.length)
  const code = ts.transpileModule(parts.join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2023 } }).outputText
  return vm.runInNewContext(`${code};({${names.join(',')}})`, { reorderSquad: order.reorderSquad, ...globals })
}

test('each game entry point moves results with players and refuses to reorder during a roll', () => {
  for (const [file, name, tf2] of [['App.tsx', 'reorderPlayers', false], ['App.tsx', 'reorderTf2Players', true], ['PvzModule.tsx', 'reorderPlayers', false], ['RosterModule.tsx', 'reorderPlayers', false]]) {
    for (const blocked of ['none', 'generating', 'rerolling']) {
      let players = members(6), picks = results(6), sounds = 0
      const originalPlayers = players, originalPicks = picks
      const setPlayers = (next) => { players = next }, setPicks = (next) => { picks = next }
      const handlers = functions(file, [name], { data: {}, catalog: [{}], players, picks, tf2Players: players, tf2Picks: picks,
        generating: blocked === 'generating', tf2Generating: blocked === 'generating', rerollingIndex: blocked === 'rerolling' ? 0 : null, tf2RerollingIndex: blocked === 'rerolling' ? 0 : null,
        setPlayers, setPicks, setTf2Players: setPlayers, setTf2Picks: setPicks, setDetailsIndex() {}, setFilterIndex() {}, setTf2FilterIndex() {}, playSound() { sounds++ }, playModuleSound() { sounds++ } })
      handlers[name]('p5', 'p0')
      if (blocked !== 'none') { assert.equal(players, originalPlayers); assert.equal(picks, originalPicks); assert.equal(sounds, 0) }
      else { assert.equal(players[0], originalPlayers[5]); assert.equal(picks[0], originalPicks[5]); assert.equal(picks[0].locked, true); assert.equal(sounds, 1) }
    }
  }
})

test('shrinking and expanding a reordered squad creates unique IDs in OW, TF2 and GW2', () => {
  for (const [file, fn, make, tf2] of [['App.tsx', 'changePlayerCount', 'makePlayer', false], ['App.tsx', 'tf2ChangePlayerCount', 'makeTf2Player', true], ['PvzModule.tsx', 'changePlayerCount', 'makePlayer', false]]) {
    const factory = functions(file, [make], {}), initial = Array.from({ length: 6 }, (_, index) => factory[make](index))
    let players = [initial[5], ...initial.slice(0, 5)], picks = results(6), serial = 0
    const setPlayers = (fn) => { players = fn(players) }, setPicks = (fn) => { picks = fn(picks) }
    function call(delta) {
      const handlers = functions(file, [fn, make], { players, tf2Players: players, crypto: { randomUUID: () => `new${++serial}` },
        setPlayers, setPicks, setTf2Players: setPlayers, setTf2Picks: setPicks, setDetailsIndex() {}, setFilterIndex() {}, setTf2FilterIndex() {}, setStatus() {}, setTf2Status() {}, notify() {}, playSound() {} })
      handlers[fn](delta)
    }
    call(-1); call(1)
    assert.equal(players.length, 6); assert.equal(new Set(players.map((player) => player.id)).size, 6, file + tf2)
    assert.equal(players[0].id, initial[5].id); assert.equal(players[5].id, 'new1')
  }
})
