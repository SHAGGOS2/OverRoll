import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { localizeUi, translateGameText, isDefaultPlayerName, localizedPlayerName } from '../src/uiLocalization.ts'
import { barPortraitFit, TELEPORT_DURATION_MS, TELEPORT_SWAP_MS } from '../src/cardDesign.ts'
import { fragpunkPortraitFrames } from '../src/portraitFrames.ts'
import { pvzCharacters, pvzSideColors, pvzSideSingular } from '../src/pvzCatalog.ts'

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../public/${path}`, import.meta.url)))
function ast(file) { return ts.createSourceFile(file, fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX) }
const compile = (source) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.React } }).outputText
function declarations(file, names) {
  const tree = ast(file), found = []
  function visit(n) {
    if (ts.isFunctionDeclaration(n) && names.includes(n.name?.text)) found.push(n.getText(tree))
    if (ts.isVariableDeclaration(n) && names.includes(n.name.getText(tree))) found.push(`const ${n.name.getText(tree)} = ${n.initializer.getText(tree)}`)
    ts.forEachChild(n, visit)
  }
  visit(tree); return compile(found.join('\n'))
}
const componentCode = ts.transpileModule(fs.readFileSync(new URL('../src/BarCard.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.React } }).outputText
const componentExports = {}
vm.runInNewContext(componentCode, { exports: componentExports, React, require: (name) => name === 'react' ? React : { TELEPORT_DURATION_MS, TELEPORT_SWAP_MS } })
const BarCard = componentExports.default
function branch(file, owner) {
  const tree = ast(file); let found
  function visit(n, current = '') {
    if (ts.isFunctionDeclaration(n)) current = n.name?.text ?? current
    if (ts.isIfStatement(n) && current === owner && n.expression.getText(tree) === "cardDesign === 'bars'") found = n.getText(tree)
    ts.forEachChild(n, (child) => visit(child, current))
  }
  visit(tree); assert(found, `${file}/${owner}`)
  return compile(`function renderBar() { ${found}; return null }`)
}
const controls = ['reroll', 'rerollTf2', 'toggleLock', 'toggleTf2Lock', 'openFilter', 'openTf2Filter', 'openDetails', 'setPlayerSide', 'setFilterIndex', 'setFilterSearch', 'setFilterRole', 'setDetailsIndex', 'playModuleSound']
function render(file, owner, globals) {
  const actions = [], context = {
    React, BarCard, localizeUi, translateGameText, isDefaultPlayerName, localizedPlayerName, barPortraitFit, fragpunkPortraitFrames,
    cardDesign: 'bars', barMotion: false, locale: 'en-us', activeLocale: 'en-us', index: 0,
    player: { id: 'p1', name: 'Javo', blocked: ['blocked'], side: 'plants' }, pick: { locked: false, perks: [] },
    assignedProfile: { name: 'Main' }, profile: { name: 'Main' }, generationRevision: 1, tf2GenerationRevision: 1,
    rolesOnly: false, generating: false, tf2Generating: false, rerollingIndex: null, tf2RerollingIndex: null,
    asset: (path) => '/' + path, baseUrl: '/', Icon: () => null, PvzIcon: () => null, RosterIcon: () => null,
    ...Object.fromEntries(controls.map((name) => [name, (...args) => actions.push([name, ...args])])), ...globals,
  }
  const helpers = declarations(file, file === 'App.tsx' ? ['roleLabels', 'tf2GroupLabels', 'tf2GroupColors'] : file === 'RosterModule.tsx' ? ['finalsIcon', 'slugifyFinalsItem', 'renderFinalsCardLoadout'] : [])
  const element = vm.runInNewContext(`${helpers}\n${branch(file, owner)};renderBar()`, context)
  return { element, html: renderToStaticMarkup(element), actions }
}
function buttons(node) { return React.isValidElement(node) ? [...(node.type === 'button' ? [node] : []), ...React.Children.toArray(node.props.children).flatMap(buttons)] : [] }
function assertLocalResources(html) {
  for (const [, path] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) assert(fs.existsSync(new URL(`../public${path}`, import.meta.url)), path)
}

test('Overwatch, TF2 and GW2 bar adapters retain localized content and their distinct working controls', () => {
  const hero = read('data/heroes.json').heroes.find((item) => item.key === 'mercy')
  const ow = render('App.tsx', 'renderPrincipal', { hero, visibleRole: hero.role, stadium: false, pick: { hero, locked: false, perks: hero.minorPerks.slice(0, 1) }, perkText: () => ({ name: 'Angelic Resurrection', description: 'Healing' }) })
  assert(ow.html.includes('Angelic Resurrection')); assert.equal(buttons(ow.element.props.actions).length, 4)
  buttons(ow.element.props.actions)[0].props.onClick(); assert.equal(ow.actions[0][0], 'reroll')
  const tf2 = render('App.tsx', 'renderTf2Principal', { mercenary: { key: 'tf2-medic', name: 'Medic', group: 'support', portrait: 'assets/tf2/classes/medic.jpg' } })
  assert.equal(tf2.element.props.fit, 'contain'); assert(tf2.html.includes('/assets/tf2/icons/medic.png')); assert.equal(buttons(tf2.element.props.actions).length, 3)
  buttons(tf2.element.props.actions)[0].props.onClick(); assert.equal(tf2.actions[0][0], 'rerollTf2')
  const character = pvzCharacters.find((item) => item.isVariant)
  const pvz = render('PvzModule.tsx', 'renderPrincipal', { character, pvzSideColors, pvzSideSingular, sideSwitchEnabled: true })
  assert.equal(pvz.element.props.fit, 'contain'); assert.equal(pvz.element.props.roleIcon, undefined)
  assert(pvz.html.includes(character.baseName)); assert.equal(buttons(pvz.element.props.actions).length, 4)
  buttons(pvz.element.props.actions)[2].props.onClick(); assert.deepEqual(pvz.actions[0], ['setPlayerSide', 0, 'zombies'])
  for (const row of [ow, tf2, pvz]) { assert(row.html.includes('Main')); assertLocalResources(row.html) }
})

test('all eight roster bar adapters preserve the correct icons, artwork, candidates, Team-Ups and builds', () => {
  const definitions = vm.runInNewContext(`${declarations('RosterModule.tsx', ['rosterGameDefinitions'])};rosterGameDefinitions`)
  for (const game of definitions) {
    const catalog = read(`assets/games/${game.id}/catalog.json`).heroes.map((hero) => ({ ...hero, portrait: `assets/games/${game.id}/${hero.portrait.split('/').pop()}` }))
    const hero = catalog[0], role = game.roles.find((role) => role.id === hero.role), partner = catalog[1]
    const pick = { hero, locked: false, teamupKey: 'pair' }
    if (game.supportsLoadouts) {
      const items = read('assets/games/thefinals/loadouts.json')[hero.role]
      pick.loadout = { specialization: items.specializations[0], weapon: items.weapons[0], gadgets: items.gadgets.slice(0, 3) }
    }
    const row = render('RosterModule.tsx', 'renderPrincipal', {
      game, gameId: game.id, hero, role, pick, selectedTeamup: game.supportsTeamups ? { key: 'pair', name: 'Team-Up', complete: true } : undefined,
      deadlockCandidates: catalog.slice(0, 3), heroByKey: () => partner, teamupPartnerKey: () => partner.key, teamupPartnerName: () => partner.name, teamupAnchorKey: () => partner.key,
    })
    assert.equal(row.element.props.fit, barPortraitFit(game.id)); assertLocalResources(row.html)
    assert.equal(buttons(row.element.props.actions).length, 4)
    buttons(row.element.props.actions)[0].props.onClick(); assert.equal(row.actions[0][0], 'reroll')
    if (game.roles.length > 1) assert(row.element.props.roleIcon)
    else assert.equal(row.element.props.roleIcon, undefined)
    if (game.id === 'deadlock') { assert.equal(row.element.props.candidates.length, 3); assert.equal((row.html.match(/class="bar-card-candidate"/g) ?? []).length, 3); for (const candidate of catalog.slice(0, 3)) assert(row.html.includes(candidate.name)) }
    if (game.id === 'fragpunk') { assert(row.element.props.frame); assert(row.html.includes(`viewBox="${fragpunkPortraitFrames[hero.key].x}`)) }
    if (game.supportsTeamups) { assert(row.html.includes('bar-card-teamup complete')); assert(row.html.includes(partner.name)) }
    if (game.supportsLoadouts) { assert.equal(row.element.props.perks.length, 1); for (const gadget of pick.loadout.gadgets) assert(row.html.includes(gadget)); assert.notEqual(row.element.props.portrait, '/' + hero.portrait) }
  }
})
