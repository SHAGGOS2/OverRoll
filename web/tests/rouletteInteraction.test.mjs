import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as model from '../src/rouletteModel.ts'
import * as ui from '../src/uiLocalization.ts'
import { fragpunkPortraitFrames } from '../src/portraitFrames.ts'
import { tf2Artwork } from '../src/tf2Artwork.ts'
import { pvzArtwork } from '../src/pvzArtwork.ts'

const source = fs.readFileSync(new URL('../src/SharedRoulette.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2023 } }).outputText
const items = [{ key: 'a', name: 'Alpha', role: 'tank', portrait: 'a.png' }, { key: 'b', name: 'Bravo', role: 'support', portrait: 'b.png' }, { key: 'c', name: 'Charlie', role: 'support', portrait: 'c.png' }]
const roles = [{ id: 'tank', label: 'Tanque', color: '#4fc9ff' }, { id: 'support', label: 'Apoyo', color: '#55e4ad' }]
function nodes(node) { return React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(nodes)] : [] }
function content(node) { if (typeof node === 'string' || typeof node === 'number') return String(node); return React.isValidElement(node) ? React.Children.toArray(node.props.children).map(content).join('') : '' }

function harness(options = {}) {
  let cursor = 0, tree, ticket = options.ticket ?? 0, spins = 0, wins = 0, writes = 0, serial = 0
  const sounds = []
  const cells = [], effects = [], frames = new Map(), activeAnimations = [], store = new Map()
  if (options.saved) store.set('test.wheel', JSON.stringify(options.saved))
  const react = { ...React,
    useRef(value) { const index = cursor++; return cells[index] ??= { current: value } },
    useState(value) { const index = cursor++; if (!(index in cells)) cells[index] = typeof value === 'function' ? value() : value; return [cells[index], (next) => { cells[index] = typeof next === 'function' ? next(cells[index]) : next }] },
    useMemo(fn) { cursor++; return fn() }, useId() { cursor++; return 'test-wheel' },
    useEffect(fn, deps) {
      const index = cursor++, previous = cells[index]
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) effects.push(() => { previous?.cleanup?.(); cells[index] = { deps, cleanup: fn() } })
    },
  }
  const window = { matchMedia: () => ({ matches: Boolean(options.reduced) }), requestAnimationFrame(fn) { const id = ++serial; frames.set(id, fn); return id }, cancelAnimationFrame(id) { frames.delete(id) } }
  const rotor = { style: {}, animate(keyframes, settings) {
    let resolve, reject, settled = false
    const running = { keyframes, settings, progress: 0, cancelled: false, effect: { getComputedTiming: () => ({ progress: running.progress }) },
      finished: new Promise((ok, bad) => { resolve = ok; reject = bad }), finish() { settled = true; resolve() }, cancel() { running.cancelled = true; if (!settled) reject(new Error('Cancelled')) } }
    activeAnimations.push(running); return running
  } }
  const dependencies = { react, './uiLocalization': ui, './imageExport': { safeAssetUrl: (path) => '/' + path },
    './rouletteModel': { ...model, randomTicket: () => ticket }, './portraitFrames': { fragpunkPortraitFrames }, './tf2Artwork': { tf2Artwork }, './pvzArtwork': { pvzArtwork },
    './rouletteAudio': { createRouletteAudio: () => Object.fromEntries(['configure','start','tick','win','select','stop','dispose'].map((name) => [name, (...args) => sounds.push({ name, args })])) } }
  const exports = {}
  vm.runInNewContext(compiled, { exports, React, window, localStorage: { getItem: (key) => store.get(key) ?? null, setItem(key, value) { writes++; store.set(key, value) } }, Intl,
    require(name) { assert(name in dependencies, name); return dependencies[name] } })
  let props = { gameId: 'overwatch', title: 'Overwatch', items, roles, storagePrefix: 'test', baseUrl: '/', locale: 'en-us', animationsEnabled: true, soundEnabled: true, soundVolume: .35, notify() {}, onSpin() { spins++ }, onWin() { wins++ }, ...options.props }
  const render = (next = {}) => {
    props = { ...props, ...next }
    for (let i = 0; i < 2; i++) {
      cursor = 0; tree = exports.default(props)
      nodes(tree).find((node) => node.props.className === 'wheel-rotor').props.ref.current = rotor
      effects.splice(0).forEach((run) => run())
    }
  }
  render()
  const byClass = (name) => nodes(tree).find((node) => typeof node.props.className === 'string' && node.props.className.split(' ').includes(name))
  const button = (label) => nodes(tree).find((node) => node.type === 'button' && content(node) === label)
  return { render, byClass, button, store, rotor, sounds, get tree() { return tree }, get state() { return tree.props['data-state'] }, get writes() { return writes }, get spins() { return spins }, get wins() { return wins }, get frames() { return frames.size }, get animation() { return activeAnimations.at(-1) },
    setTicket(value) { ticket = value }, html() { return renderToStaticMarkup(tree) },
    frame(progress, now) { activeAnimations.at(-1).progress = progress; const pending = [...frames.values()]; frames.clear(); pending.forEach((fn) => fn(now)); render() },
    unmount() { cells.forEach((cell) => cell?.cleanup?.()) } }
}

test('a spin freezes configuration, previews the actual pointer, announces only the phase and reveals one matching winner', async () => {
  const h = harness({ saved: { selected: ['a', 'b', 'c'], catalog: ['a', 'b', 'c'], weights: { a: 1, b: 3, c: 2 } }, ticket: 2 })
  h.byClass('wheel-spin').props.onClick(); h.render()
  assert.equal(h.state, 'spinning'); assert.equal(h.spins, 1); assert.equal(h.wins, 0)
  assert.deepEqual(h.sounds.filter((cue) => cue.name === 'start').map((cue) => cue.args), [[3.6]])
  assert.equal(nodes(h.tree).find((node) => node.type === 'fieldset').props.disabled, true)
  const before = h.store.get('test.wheel')
  h.button('Remove visible').props.onClick(); h.byClass('wheel-spin').props.onClick(); h.render()
  assert.equal(h.store.get('test.wheel'), before); assert.equal(h.spins, 1)
  const target = Number(h.animation.keyframes[1].transform.match(/rotate\((.+)deg\)/)[1])
  const segments = model.weightedSegments([{ key: 'a', weight: 1 }, { key: 'b', weight: 3 }, { key: 'c', weight: 2 }])
  for (const [index, progress] of [.15, .55, .9].entries()) {
    h.frame(progress, 100 + index * 100)
    const expected = items[model.segmentAtRotation(segments, target * progress)]
    assert(content(h.byClass('wheel-winner-copy')).includes(expected.name))
    assert.equal(content(h.byClass('wheel-announcement')), 'Spinning…')
  }
  const clicks = h.sounds.filter((cue) => cue.name === 'tick').length
  h.frame(.9, 500)
  assert.equal(h.sounds.filter((cue) => cue.name === 'tick').length, clicks)
  assert(clicks > 0)
  h.animation.finish(); await Promise.resolve(); await Promise.resolve(); h.render()
  assert.equal(h.state, 'winner'); assert.equal(h.wins, 1); assert.equal(h.frames, 0)
  assert.equal(content(h.byClass('wheel-announcement')), 'Winner: Bravo')
  assert(content(h.byClass('wheel-winner-odds')).includes('50%'))
  assert.equal(model.segmentAtRotation(segments, Number(h.rotor.style.transform.match(/rotate\((.+)deg\)/)[1])), 1)
  assert.equal(nodes(h.tree).filter((node) => node.props.className === 'wheel-sector is-winner').length, 1)
  assert.equal(h.sounds.filter((cue) => cue.name === 'win').length, 1)
  h.render({ soundEnabled: false, soundVolume: 0 })
  assert.deepEqual(h.sounds.filter((cue) => cue.name === 'configure').at(-1).args, [false, 0])
  h.unmount()
  assert.equal(h.sounds.at(-1).name, 'dispose')
})

test('role and search filters affect bulk selection without removing hidden participants; chances remain correct and optional', () => {
  const h = harness()
  assert(!h.byClass('wheel-weight'))
  h.button('Support2').props.onClick(); h.render()
  h.button('Remove visible').props.onClick(); h.render()
  assert.deepEqual(JSON.parse(h.store.get('test.wheel')).selected, ['a'])
  h.button('Add visible').props.onClick(); h.render()
  assert.equal(JSON.parse(h.store.get('test.wheel')).selected.length, 3)
  h.byClass('wheel-probability-toggle').props.onClick(); h.render()
  assert(h.byClass('wheel-weight'))
  nodes(h.tree).find((node) => node.props['aria-label'] === 'Increase weight: Bravo').props.onClick(); h.render()
  assert(h.html().includes('50%'))
  h.byClass('wheel-probability-toggle').props.onClick(); h.render(); assert(!h.byClass('wheel-weight'))
  h.byClass('wheel-probability-toggle').props.onClick(); h.render()
  h.button('Equal weights').props.onClick(); h.render()
  assert.equal(JSON.stringify(JSON.parse(h.store.get('test.wheel')).weights), '{}'); assert.equal(h.rotor.style.transform, 'rotate(0deg)')
  nodes(h.tree).find((node) => node.type === 'input').props.onChange({ target: { value: 'Nobody' } }); h.render()
  assert(h.byClass('wheel-empty')); assert.equal(JSON.parse(h.store.get('test.wheel')).selected.length, 3)
  h.unmount()
})

test('late catalogs preserve saved selections, including intentional empty pools, without overwriting storage while loading', () => {
  for (const selected of [[], ['b']]) {
    const h = harness({ saved: { selected, catalog: ['a', 'b', 'c'], weights: { b: 3 } }, props: { items: [] } })
    assert.equal(h.writes, 0)
    h.render({ items })
    assert.deepEqual(JSON.parse(h.store.get('test.wheel')).selected, selected)
    assert(!h.html().includes('NaN')); assert(!h.html().includes('Infinity'))
    if (!selected.length) { assert.equal(h.state, 'empty'); assert(h.byClass('wheel-spin').props.disabled) }
    h.unmount()
  }
})

test('reduced motion and disabled animations finish immediately and keep the five most recent named results', () => {
  for (const options of [{ reduced: true }, { props: { animationsEnabled: false } }]) {
    const h = harness(options)
    for (let i = 0; i < 7; i++) { h.setTicket(i % 3); h.byClass('wheel-spin').props.onClick(); h.render() }
    assert.equal(h.wins, 7); assert.equal(h.animation, undefined); assert.equal(h.frames, 0)
    assert.equal(nodes(h.byClass('wheel-history')).filter((node) => node.type === 'li').length, 5)
    assert(content(h.byClass('wheel-history')).includes('Alpha'))
    h.unmount()
  }
})

test('GW2, TF2 and FragPunk winners retain their transparent artwork and exact frame', () => {
  for (const [gameId, catalog] of [['pvzgw2', pvzArtwork], ['tf2', tf2Artwork], ['fragpunk', fragpunkPortraitFrames]]) {
    const [key, value] = Object.entries(catalog)[0], portrait = value.portrait ?? 'original.png', frame = value.frame ?? value
    const h = harness({ props: { gameId, items: [{ key, name: 'Winner', role: 'tank', portrait }], animationsEnabled: false } })
    h.byClass('wheel-spin').props.onClick(); h.render()
    const art = nodes(h.byClass('wheel-winner-art')).find((node) => node.type === 'svg' && node.props.className === 'wheel-art')
    assert.equal(art.props.viewBox, `${frame.x} ${frame.y} ${frame.width} ${frame.height}`)
    assert.equal(nodes(art).find((node) => node.type === 'image').props.href, '/' + portrait)
    h.unmount()
  }
})

test('unmounting a moving wheel cancels the animation and preview without publishing a winner', async () => {
  const h = harness()
  h.byClass('wheel-spin').props.onClick(); h.render(); assert(h.frames > 0)
  h.unmount(); await Promise.resolve(); await Promise.resolve()
  assert.equal(h.wins, 0); assert.equal(h.frames, 0); assert(h.animation.cancelled)
})
