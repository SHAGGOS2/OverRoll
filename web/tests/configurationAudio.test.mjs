import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
const source=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8'),tree=ts.createSourceFile('App.tsx',source,99,true,4),parts=[]
function visit(n){if(ts.isFunctionDeclaration(n)&&['playSound','toggleRuleSound'].includes(n.name?.text))parts.push(n.getText(tree));ts.forEachChild(n,visit)}visit(tree)
const code=ts.transpileModule(parts.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2023}}).outputText
function setup(enabled,volume){const played=[],audioRef={current:Object.fromEntries(['click','toggleOn','toggleOff','nav'].map(kind=>[kind,{currentTime:4,volume:0,pause(){},play(){played.push(kind);return Promise.resolve()}}]))};return {...vm.runInNewContext(`${code};({playSound,toggleRuleSound})`,{audioRef,soundEnabled:enabled,soundVolume:volume}),played,audioRef}}
test('option feedback respects mute and zero volume, and resets playable cues at the chosen volume',()=>{
 for(const [enabled,volume] of [[false,.5],[true,0]]){const audio=setup(enabled,volume);audio.playSound('click');audio.toggleRuleSound(true);assert.equal(audio.played.length,0)}
 const audio=setup(true,.35);audio.playSound('click');audio.toggleRuleSound(true);audio.toggleRuleSound(false)
 assert.deepEqual(audio.played,['click','toggleOn','toggleOff'])
 for(const kind of audio.played){assert.equal(audio.audioRef.current[kind].currentTime,0);assert.equal(audio.audioRef.current[kind].volume,.35)}
})
