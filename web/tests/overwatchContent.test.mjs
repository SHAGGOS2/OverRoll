import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { perkTextKey, selectedPerkGroup, readPerkText, validatePerkCatalog } from '../src/overwatchText.ts'
const root=new URL('../public/data/',import.meta.url)
const heroes=JSON.parse(fs.readFileSync(new URL('heroes.json',root))).heroes
const groups=['minorPerks','majorPerks','stadiumPowers']
const entries=heroes.flatMap(hero=>groups.flatMap(group=>hero[group].map(perk=>({hero,group,perk,key:perkTextKey(hero.key,group,perk)}))))
const locales=['es-mx','es-es','en-us','de-de','fr-fr','pt-br','ja-jp','ko-kr','zh-cn']

test('all 612 perks and powers have complete names and descriptions in every advertised locale',()=>{
 assert.equal(entries.length,612);assert.equal(new Set(entries.map(entry=>entry.key)).size,612)
 for(const locale of locales){
  const catalog=validatePerkCatalog(JSON.parse(fs.readFileSync(new URL(`overwatch-texts/${locale}.json`,root))))
  assert.equal(Object.keys(catalog).length,612,locale)
  for(const {hero,group,perk,key} of entries){const text=readPerkText(catalog,locale,hero.key,group,perk);assert(text?.name&&text?.description,locale+': '+key);assert(!/[<>][a-z/]/i.test(text.description))}
 }
})
test('changing locale never changes canonical selection or falls back to Spanish while loading',()=>{
 const hero=heroes.find(hero=>hero.key==='ana'),perk=hero.minorPerks[0],before=JSON.stringify(hero)
 const english=JSON.parse(fs.readFileSync(new URL('overwatch-texts/en-us.json',root))),japanese=JSON.parse(fs.readFileSync(new URL('overwatch-texts/ja-jp.json',root)))
 assert.equal(readPerkText(undefined,'en-us',hero.key,'minorPerks',perk),null)
 assert.equal(readPerkText(undefined,'ja-jp',hero.key,'minorPerks',perk),null)
 assert.equal(readPerkText(english,'en-us',hero.key,'minorPerks',perk).name,english[perkTextKey(hero.key,'minorPerks',perk)].name)
 assert.equal(readPerkText(japanese,'ja-jp',hero.key,'minorPerks',perk).name,japanese[perkTextKey(hero.key,'minorPerks',perk)].name)
 assert.deepEqual(readPerkText(undefined,'es-mx',hero.key,'minorPerks',perk),{name:perk.name,description:perk.description})
 assert.equal(JSON.stringify(hero),before)
})
test('normal perks and Stadium powers sharing the same name/icon retain separate descriptions',()=>{
 const catalog=JSON.parse(fs.readFileSync(new URL('overwatch-texts/en-us.json',root)))
 const collisions=entries.filter(entry=>entries.some(other=>entry.hero.key===other.hero.key&&entry.perk.icon===other.perk.icon&&entry.group!==other.group))
 assert.equal(collisions.length,14)
 for(const entry of collisions){
  const group=selectedPerkGroup(entry.hero,entry.perk,entry.group==='stadiumPowers')
  assert.equal(group,entry.group)
  assert.equal(readPerkText(catalog,'en-us',entry.hero.key,group,entry.perk).description,catalog[entry.key].description)
 }
})
test('localized content rejects malformed, oversized or marked-up entries',()=>{
 for(const bad of [null,[],{},'bad',{'bad':{name:'name',description:'description'}},{'ana/minorPerks/assets/perks/a.webp':{name:'<script>x</script>',description:'x'}}])assert.throws(()=>validatePerkCatalog(bad))
})
