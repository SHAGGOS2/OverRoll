import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeWeight, randomTicket, weightedSegments, winnerForTicket, rotationForSegment, sectorPath, sectorArtworkBounds, segmentAtRotation, restoreRouletteState } from '../src/rouletteModel.ts'

test('weights remain finite and bounded after malformed saved values', () => {
 for (const value of [NaN, Infinity, {}, null, [], 'bad']) assert.equal(normalizeWeight(value), 1)
 assert.equal(normalizeWeight(1e99), 64); assert.equal(normalizeWeight(-10), 1); assert.equal(normalizeWeight(2.6), 3)
})
test('all weighted tickets map exactly to displayed sector proportions', () => {
 const items = [{ key:'a',weight:1 },{ key:'b',weight:3 },{ key:'c',weight:2 }]
 const segments = weightedSegments(items), counts = [0,0,0]
 for(let ticket=0;ticket<6;ticket++) counts[winnerForTicket(items,ticket)]++
 assert.deepEqual(counts,[1,3,2]); assert.equal(segments[1].start,60);assert.equal(segments[1].end,240)
 assert.deepEqual(segments.map(s=>s.probability),[1/6,3/6,2/6]);assert.throws(()=>winnerForTicket(items,6),RangeError)
})
test('complete catalogs over 64 characters and a single participant work without truncation', () => {
 const items=Array.from({length:121},(_,i)=>({key:String(i),weight:1}))
 assert.equal(weightedSegments(items).length,121); assert.equal(weightedSegments(items).at(-1).end,360)
 assert.equal(winnerForTicket(items,120),120)
 assert.equal(winnerForTicket([{key:'solo',weight:1}],0),0)
 assert.match(sectorPath(0,360),/A 184 184 0 1 1/)
 assert.equal(rotationForSegment(0,360,77)%360,0)
})
test('the pointer lands at the selected sector after repeated spins and unequal weights', () => {
 for (const segment of weightedSegments([{key:'a',weight:1},{key:'b',weight:64},{key:'c',weight:3}])) {
  for (const start of [0,70,800,9021]) {
   const target=rotationForSegment(segment.start,segment.end,start)
   const pointer=(-target%360+360)%360
   assert(Math.abs(pointer-(segment.start+segment.end)/2)<1e-9)
   assert(target-start>=6*360)
  }
 }
})
test('the live portrait follows the real pointer and agrees with the winner for narrow and weighted sectors', () => {
 for (const items of [[{key:'solo',weight:1}],Array.from({length:121},(_,i)=>({key:String(i),weight:i%3?1:64}))]) {
  const segments=weightedSegments(items)
  segments.forEach((segment,index)=>{
   for(const start of [0,77,800,9021]){
    const target=rotationForSegment(segment.start,segment.end,start)
    assert.equal(segmentAtRotation(segments,target),index)
   }
  })
  for(let degrees=-720;degrees<720;degrees+=1.7){
   const index=segmentAtRotation(segments,degrees),angle=((-degrees%360)+360)%360
   assert(index>=0&&index<segments.length)
   assert(angle>=segments[index].start&&angle<segments[index].end)
  }
 }
 assert.equal(segmentAtRotation([],0),-1)
 assert.equal(segmentAtRotation([{start:0,end:360}],NaN),-1)
})
test('portrait bounds cover every visible point of narrow, wide and full-circle sectors', () => {
 for(const span of [360/121,6,30,60,120,180,270,359.9,360]) {
  const box=sectorArtworkBounds(73,73+span)
  assert(box.width>0&&box.height>0)
  for(let i=0;i<=100;i++)for(const radius of [82,134,184]) {
   const angle=(-span/2+span*i/100-90)*Math.PI/180
   const x=200+radius*Math.cos(angle),y=200+radius*Math.sin(angle)
   assert(x>=box.x-1e-8&&x<=box.x+box.width+1e-8,`width at ${span}`)
   assert(y>=box.y-1e-8&&y<=box.y+box.height+1e-8,`height at ${span}`)
  }
 }
})
test('storage migration preserves custom subsets, empty selection, weights and full-roster additions', () => {
 const items=[{key:'a'},{key:'b'},{key:'new'}]
 assert.deepEqual(restoreRouletteState(items,null,['a'],{a:2,b:1}).selected,['a'])
 assert.deepEqual(restoreRouletteState(items,null,[],{a:2,b:1}).selected,[])
 assert.deepEqual(restoreRouletteState(items,null,['a','b'],{a:2,b:1}).selected,['a','b','new'])
 const restored=restoreRouletteState(items,{selected:['a','a','evil',42],weights:{a:Infinity},catalog:['a','b']},null,{})
 assert.deepEqual(restored.selected,['a']);assert.equal(restored.weights.a,1)
 for(const bad of ['bad',42,null]) assert.equal(restoreRouletteState(items,bad,bad,bad).selected.length,3)
})
test('crypto rejection avoids modulo bias and invalid ticket counts fail early', () => {
 const previous=globalThis.crypto;let calls=0
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:{getRandomValues(values){values[0]=calls++===0?0xffffffff:7;return values}}})
 try {assert.equal(randomTicket(3),1);assert.equal(calls,2);assert.throws(()=>randomTicket(0),RangeError)}finally{Object.defineProperty(globalThis,'crypto',{configurable:true,value:previous})}
})
test('legacy role and faction exclusions survive the shared roulette migration',()=>{
 const items=[{key:'a',role:'tank'},{key:'b',role:'support'}]
 assert.deepEqual(restoreRouletteState(items,null,['a','b'],{a:1,b:1},{tank:true,support:false}).selected,['a'])
 assert.deepEqual(restoreRouletteState(items,{selected:['a','b'],catalog:['a','b']},null,{}, {support:false}).selected,['a','b'])
})
