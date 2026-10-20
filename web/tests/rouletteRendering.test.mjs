import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { localizeUi, translateGameText } from '../src/uiLocalization.ts'
import { restoreRouletteState, normalizeWeight, randomTicket, rotationForSegment, sectorPath, weightedSegments, winnerForTicket } from '../src/rouletteModel.ts'
import { fragpunkPortraitFrames } from '../src/portraitFrames.ts'
import { pvzCharacters, pvzSideColors, pvzSideLabels } from '../src/pvzCatalog.ts'
const root=new URL('../src/',import.meta.url)
function declarations(file,variables){const tree=ts.createSourceFile(file,fs.readFileSync(new URL(file,root),'utf8'),99,true,4),out=[];function visit(n){if(ts.isVariableDeclaration(n)&&variables.includes(n.name.getText(tree)))out.push('const '+n.getText(tree));ts.forEachChild(n,visit)}visit(tree);return vm.runInNewContext(ts.transpileModule(out.join('\n')+`;({${variables.join(',')}})`,{compilerOptions:{target:ts.ScriptTarget.ES2023}}).outputText)}
let source=fs.readFileSync(new URL('SharedRoulette.tsx',root),'utf8').replace(/^import .*$/gm,'').replace(/^export type .*$/gm,'').replace('export default function','function')
const component=vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2023}}).outputText+';SharedRoulette',{React,...React,localizeUi,translateGameText,restoreRouletteState,normalizeWeight,randomTicket,rotationForSegment,sectorPath,weightedSegments,winnerForTicket,fragpunkPortraitFrames,localStorage:{getItem(){return null}},safeAssetUrl:path=>path,useImageExport:()=>[false,()=>{}],Intl})
const {rosterGameDefinitions}=declarations('RosterModule.tsx',['rosterGameDefinitions']),{tf2Classes,tf2Groups,tf2GroupLabels,tf2GroupColors}=declarations('App.tsx',['tf2Classes','tf2Groups','tf2GroupLabels','tf2GroupColors'])
const read=path=>JSON.parse(fs.readFileSync(new URL('../public/'+path,import.meta.url),'utf8'))
const games=[{id:'overwatch',items:read('data/heroes.json').heroes,roles:[{id:'tank',label:'Tanque',color:'#4fc9ff'},{id:'damage',label:'Daño',color:'#ff5578'},{id:'support',label:'Apoyo',color:'#55e4ad'}]},{id:'tf2',items:tf2Classes.map(item=>({...item,role:item.group})),roles:tf2Groups.map(id=>({id,label:tf2GroupLabels[id],color:tf2GroupColors[id]}))},{id:'pvzgw2',items:pvzCharacters.map(item=>({...item,role:item.side})),roles:['plants','zombies'].map(id=>({id,label:pvzSideLabels[id],color:pvzSideColors[id]}))},...rosterGameDefinitions.map(game=>({...game,items:read(`assets/games/${game.id}/catalog.json`).heroes}))]

test('one shared roulette renders complete catalogs for all eleven games and all nine locales',()=>{
 for(const game of games)for(const locale of ['es-mx','es-es','en-us','de-de','fr-fr','pt-br','ja-jp','ko-kr','zh-cn']){
  const html=renderToStaticMarkup(React.createElement(component,{gameId:game.id,title:game.name??game.id,items:game.items,roles:game.roles,storagePrefix:`test.${game.id}`,baseUrl:'/',locale,animationsEnabled:true,notify(){}}))
  assert.equal((html.match(/class="wheel-candidate selected"/g)??[]).length,game.items.length,game.id+locale)
  assert.match(html,/<button class="wheel-spin primary">/)
  assert.match(html,/<svg viewBox="0 0 400 400" role="img"/)
  assert(!html.includes('NaN')&&!html.includes('undefined'),game.id+locale)
  if(game.id==='fragpunk')assert.match(html,/class="wheel-art" viewBox="/)
 }
})
