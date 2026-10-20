import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { sanitizePersonName } from '../src/personName.ts'
const source=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
const tree=ts.createSourceFile('App.tsx',source,99,true,4),functions=[]
const names=['classifyVisible','syncOtherProfile','assignOtherProfile']
function visit(node){if(ts.isFunctionDeclaration(node)&&names.includes(node.name?.text))functions.push(node.getText(tree));ts.forEachChild(node,visit)}visit(tree)
const code=ts.transpileModule(functions.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2023}}).outputText
function setup(globals){return vm.runInNewContext(`${code};({${names.join(',')}})`,globals)}
const plain=(value)=>JSON.parse(JSON.stringify(value))
test('bulk classification moves only visible heroes and preserves other profiles and buckets',()=>{
 let profiles=[{id:'a',heroes:{main:['hidden','shown'],played:['other'],practice:['visible2'],avoid:[]}},{id:'b',heroes:{main:['shown'],played:[],practice:[],avoid:[]}}]
 const helpers=setup({currentProfile:profiles[0],classifiedHeroes:[{key:'shown'},{key:'visible2'}],profileBuckets:['main','played','practice','avoid'],profileBulkBucket:'played',setProfiles(fn){profiles=fn(profiles)},playSound(){}})
 helpers.classifyVisible()
 assert.deepEqual(plain(profiles[0].heroes),{main:['hidden'],played:['other','shown','visible2'],practice:[],avoid:[]})
 assert.deepEqual(plain(profiles[1].heroes.main),['shown'])
})
test('profile renames and removal update every persisted non-OW/TF2 squad without dropping game configuration',()=>{
 const games=['rivals','valorant','deadlock','lastflag','thefinals','paladins','fragpunk','apex'],values=new Map();let updated
 const player={id:'p1',name:'Original',profileId:'a',roles:{support:true},blocked:['keep'],side:'plants'}
 for(const game of ['pvz',...games])values.set(`overroll.web.${game}.players`,[player])
 const helpers=setup({rosterGameDefinitions:games.map(id=>({id})),readStorage:(key,fallback)=>values.get(key)??fallback,sanitizePersonName,localStorage:{setItem(key,value){values.set(key,JSON.parse(value))}},setOtherProfilePlayers(value){updated=value}})
 helpers.syncOtherProfile('a','Javó<script>')
 for(const rows of values.values()){assert.equal(rows[0].name,'Javóscript');assert.deepEqual(rows[0].blocked,['keep']);assert.deepEqual(rows[0].roles,{support:true});assert.equal(rows[0].profileId,'a')}
 assert.equal(Object.keys(updated).length,9)
 helpers.syncOtherProfile('a')
 for(const rows of values.values())assert.equal(rows[0].profileId,'')
})
