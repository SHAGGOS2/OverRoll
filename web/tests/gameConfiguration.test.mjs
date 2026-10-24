import { createPlayerId } from '../src/playerIdentity.ts'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { repairOverRollStorage } from '../src/storageGuard.ts'
const source = fs.readFileSync(new URL('../src/RosterModule.tsx', import.meta.url), 'utf8')
const tree = ts.createSourceFile('RosterModule.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const names = ['makePlayer', 'minimumPlayers', 'normalizeRosterPlayers', 'buildRolePlan', 'candidatePool', 'toggleRosterRole', 'changePlayerCount', 'chooseDeadlockCandidates']
const declarations = []
function visit(n) {
  if (ts.isFunctionDeclaration(n) && names.includes(n.name?.text)) declarations.push(n.getText(tree))
  if (ts.isVariableDeclaration(n) && n.name.getText(tree) === 'rosterGameDefinitions') declarations.push(`const rosterGameDefinitions = ${n.initializer.getText(tree)}`)
  ts.forEachChild(n, visit)
}
visit(tree)
const compiled = ts.transpileModule(declarations.join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2023 } }).outputText
function setup(globals = {}) { return vm.runInNewContext(`${compiled};({ rosterGameDefinitions, ${names.join(',')} })`, { createPlayerId, crypto: { randomUUID: () => 'test' }, sanitizePersonName: (x) => String(x ?? '').replace(/[^a-z0-9]/gi, ''), shuffled: (x) => [...x].reverse(), ...globals }) }
const plain = (x) => JSON.parse(JSON.stringify(x))
const { rosterGameDefinitions: games } = setup()

test('each multi-role game references local icons; Last Flag is five players with no invented classes', () => {
  const flag = games.find((game) => game.id === 'lastflag')
  assert.equal(flag.defaultPlayers, 5); assert.equal(flag.maxPlayers, 5); assert.equal(flag.roles.length, 1)
  for (const game of games) {
    const data = JSON.parse(fs.readFileSync(new URL(`../public/assets/games/${game.id}/catalog.json`, import.meta.url)))
    assert(data.heroes.every((hero) => game.roles.some((role) => role.id === hero.role)))
    if (game.roles.length > 1) for (const role of game.roles) assert(fs.existsSync(new URL(`../public/${role.icon}`, import.meta.url)))
  }
})

test('role permissions survive restoration and malformed/all-disabled selections recover safely', () => {
  const helpers = setup(), game = games.find((g) => g.id === 'valorant')
  const roles = Object.fromEntries(game.roles.map((r) => [r.id, r.id === 'sentinel']))
  assert.deepEqual(plain(helpers.normalizeRosterPlayers([{ name: 'Javo', roles }], game)[0].roles), roles)
  for (const raw of [null, 'bad', Object.fromEntries(game.roles.map((r) => [r.id, false]))]) assert(Object.values(helpers.normalizeRosterPlayers([{ roles: raw }], game)[0].roles).every(Boolean))
})

test('composition planner respects a feasible set of player restrictions', () => {
  const helpers = setup(), game = games.find((g) => g.id === 'valorant')
  const requested = ['sentinel', 'initiator', 'duelist', 'controller', 'duelist']
  const players = requested.map((wanted) => ({ roles: Object.fromEntries(game.roles.map((r) => [r.id, r.id === wanted])) }))
  assert.deepEqual(plain(helpers.buildRolePlan(game, players)), requested)
})

test('per-player role controls preserve one active role and generation obeys filters', () => {
  const game = games.find((g) => g.id === 'valorant')
  let players = [{ roles: { sentinel: true, controller: true, initiator: false, duelist: false }, blocked: ['excluded'] }]
  const catalog = [{ key: 'excluded', role: 'sentinel' }, { key: 'allowed', role: 'sentinel' }, { key: 'wrong', role: 'duelist' }]
  const helpers = setup({ game, players, catalog, avoidRepeated: true, setPlayers(fn) { players = fn(players) }, playModuleSound() {}, notify() {} })
  helpers.toggleRosterRole(0, 'controller')
  assert.equal(players[0].roles.controller, false)
  assert.deepEqual(plain(helpers.candidatePool(players[0], 'duelist', new Set())), [{ key: 'allowed', role: 'sentinel' }])
  const lastOnly = setup({ game, players, setPlayers(fn) { players = fn(players) }, playModuleSound() {}, notify() {} })
  lastOnly.toggleRosterRole(0, 'sentinel'); assert.equal(players[0].roles.sentinel, true)
})

test('startup keeps all game selections and repairs malformed roster roulettes', (t) => {
  const previousWindow = globalThis.window
  const values = new Map(), storage = { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: (k) => values.delete(k) }
  globalThis.window = { localStorage: storage }
  t.after(() => { globalThis.window = previousWindow })
  for (const game of games) {
    values.set('overroll.web.activeGame', JSON.stringify(game.id))
    values.set(`overroll.web.${game.id}.rouletteSelected`, '"broken"')
    values.set(`overroll.web.${game.id}.rouletteWeights`, '[]')
    repairOverRollStorage()
    assert.equal(JSON.parse(values.get('overroll.web.activeGame')), game.id)
    assert.equal(values.has(`overroll.web.${game.id}.rouletteSelected`), false)
    assert.equal(values.has(`overroll.web.${game.id}.rouletteWeights`), false)
  }
})

test('legacy full Last Flag squads expand to five without losing existing names', (t) => {
  const previousWindow = globalThis.window, values = new Map([
    ['overroll.web.schemaVersion', '3'], ['overroll.web.lastflag.players', JSON.stringify([{name:'A1'},{name:'B2'},{name:'C3'}])],
  ])
  globalThis.window = { localStorage: { getItem: (k) => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: (k) => values.delete(k) } }
  t.after(() => { globalThis.window = previousWindow })
  repairOverRollStorage()
  assert.deepEqual(JSON.parse(values.get('overroll.web.lastflag.players')).map((p) => p.name), ['A1','B2','C3','Jugador4','Jugador5'])
})

test('all TF2 HUD class icons are packaged using the class key suffix', () => {
  const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const keys = [...app.matchAll(/key: '(tf2-[a-z]+)', name:/g)].map((match) => match[1])
  assert.equal(keys.length, 9)
  for (const key of keys) assert(fs.existsSync(new URL(`../public/assets/tf2/icons/${key.replace(/^tf2-/, '')}.png`, import.meta.url)))
})

test('Apex class variety can select every class; uniqueness takes priority when a preferred pool is exhausted', () => {
  let rotation = 0
  const helpers = setup({ shuffled: (values) => { const n = rotation++ % values.length; return [...values.slice(n), ...values.slice(0, n)] } })
  const game = games.find((g) => g.id === 'apex'), players = Array.from({ length: 3 }, () => ({ roles: Object.fromEntries(game.roles.map((r) => [r.id, true])) }))
  const seen = new Set()
  for (let i = 0; i < 20; i++) helpers.buildRolePlan(game, players).forEach((role) => seen.add(role))
  assert.deepEqual([...seen].sort(), plain(game.roles.map((role) => role.id).sort()))
  const catalog = [{ key: 'used', role: 'support' }, { key: 'fresh', role: 'recon' }]
  const picker = setup({ game, catalog, avoidRepeated: true })
  assert.deepEqual(plain(picker.candidatePool({ roles: { support: true, recon: true }, blocked: [] }, 'support', new Set(['used']))), [{ key: 'fresh', role: 'recon' }])
})


test('Deadlock supports one player without changing the three distinct candidates per player', () => {
  const game = games.find((g) => g.id === 'deadlock')
  let players = [{ name: 'Solo', roles: { hero: true }, blocked: [] }], picks = [{ hero: null, locked: false }]
  const catalog = Array.from({ length: 8 }, (_, i) => ({ key: 'hero' + i, role: 'hero' }))
  const helpers = setup({ game, players, catalog, avoidRepeated: true, randomItem: (items) => items[0], setPlayers: (change) => { players = change(players) }, setPicks: (change) => { picks = change(picks) }, setFilterIndex() {}, setDetailsIndex() {}, setStatus() {}, playModuleSound() {} })
  assert.equal(helpers.minimumPlayers(game), 1)
  assert.equal(helpers.normalizeRosterPlayers(players, game).length, 1)
  helpers.changePlayerCount(-1); assert.equal(players.length, 1)
  const candidates = helpers.chooseDeadlockCandidates(players[0], new Set())
  assert.equal(candidates.length, 3); assert.equal(new Set(candidates.map((hero) => hero.key)).size, 3)
  helpers.changePlayerCount(1); assert.equal(players.length, 2); assert.equal(picks.length, 2)
})
