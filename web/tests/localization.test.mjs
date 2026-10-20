import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { localizeUi, translateGameText, translateUiText } from '../src/uiLocalization.ts'
import { officialGameNames } from '../src/gameNames.ts'
import { uiMessages } from '../src/uiMessages.ts'
const locales=['es-mx','es-es','en-us','de-de','fr-fr','pt-br','ja-jp','ko-kr','zh-cn']

test('all UI message rows have nonempty translations for each advertised non-Spanish locale',()=>{
 const baseline=Object.keys(uiMessages['en-us'])
 for(const locale of locales.filter(l=>!l.startsWith('es-'))){assert.deepEqual(Object.keys(uiMessages[locale]),baseline);for(const value of Object.values(uiMessages[locale]))assert.equal(typeof value,'string')}
})
test('localization translates React text and accessible attributes without touching event handlers, IDs or personal names',()=>{
 const onClick=()=>{},source=React.createElement('div',null,React.createElement('button',{onClick,title:'Cerrar filtro','aria-label':'Cerrar filtro'},'Listo'),React.createElement('input',{value:'Apoyo',onChange(){},placeholder:'Buscar…'}),React.createElement('strong',{translate:'no'},'Apoyo'))
 const output=localizeUi('en-us',source,'overwatch'),html=renderToStaticMarkup(output)
 assert.match(html,/title="Close filter"/);assert.match(html,/aria-label="Close filter"/);assert.match(html,/placeholder="Search…"/);assert.match(html,/>Done</);assert.match(html,/>Apoyo</);assert.match(html,/value="Apoyo"/)
 assert.equal(output.props.children[0].props.onClick,onClick);assert.equal(source.props.children[0].props.title,'Cerrar filtro')
})
test('switching language renders from source and handles fragmented dynamic counts',()=>{
 const source=React.createElement('p',null,3,' jugadores')
 assert.match(renderToStaticMarkup(localizeUi('en-us',source)),/>3 players</)
 assert.match(renderToStaticMarkup(localizeUi('de-de',source)),/>3 Spieler</)
 assert.match(renderToStaticMarkup(localizeUi('es-mx',source)),/>3 jugadores</)
})
test('official terminology is specific to the game and Spanish region',()=>{
 assert.equal(translateGameText('overwatch','es-mx','Luchador'),'Matón')
 assert.equal(translateGameText('overwatch','es-es','Luchador'),'Fuerte')
 assert.equal(translateGameText('overwatch','es-mx','Vanguardia'),'Inquebrantable')
 assert.equal(translateGameText('overwatch','es-es','Vanguardia'),'Valeroso')
 assert.equal(translateGameText('overwatch','en-us','Vanguardia'),'Stalwart')
 assert.equal(translateGameText('valorant','de-de','Controlador'),'Taktiker')
 assert.equal(translateGameText('valorant','ko-kr','Duelista'),'타격대')
 assert.equal(translateGameText('rivals','ja-jp','Duelista'),'ファイター')
 assert.equal(translateGameText('valorant','ja-jp','Duelista'),'デュエリスト')
 assert.equal(translateGameText('paladins','es-mx','Frontline'),'Primera línea')
 assert.equal(translateGameText('overwatch','es-mx','Tanque · Luchador'),'Tanque · Matón')
})
test('localized publisher character lists cover every current OW/VALORANT name and never invent unsupported Chinese translations',()=>{
 for(const [game,count] of [['overwatch',54],['valorant',29]]){
  assert.equal(Object.keys(officialGameNames[game]).length,8)
  for(const names of Object.values(officialGameNames[game]))assert.equal(Object.keys(names).length,count)
 }
 assert.equal(translateGameText('valorant','ko-kr','Sage'),'세이지')
 assert.equal(translateGameText('overwatch','ja-jp','Wrecking Ball'),officialGameNames.overwatch['ja-jp']['wrecking-ball'])
 assert.equal(translateUiText('en-us','Buscar héroe…'),'Search heroes…')
})
