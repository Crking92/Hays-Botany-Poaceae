// Lane B Batch 3 — broad field head states must retain valid grasses.
// Run: node scripts/test_grass_sprint_lane_b_batch3.cjs
// Primary reproductive reference: Diggs et al. (1999), printed pp. 1302, 1322.
// Supplementary Panicum source: Grelen & Duvall (1966), USDA FS SO-23 p.14.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site','visual-key-lab');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=shards.flatMap(id=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+id+'.json'),'utf8')));
const candidate=JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(scored.length,112);
assert.equal(candidate.length,57);
assert.equal(new Set([...scored,...candidate].map(x=>x.id)).size,169);
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(code,'missing production scorer');
new vm.Script(code);
const start=code.indexOf('function currentResults()');
const stop=code.indexOf('\nfunction renderTabs',start);
assert(start>=0 && stop>start,'currentResults source missing');
const ctx={state:{species:scored,selected:{},range:'all',query:''}};
vm.createContext(ctx);
vm.runInContext(code.slice(start,stop),ctx);
function find(picks){ctx.state.selected=picks;return new Set(ctx.currentResults().map(r=>r.s.id))}
const included=[
 ['Indiangrass: yellow plume',{head:'golden_plume',habit:'tuft',ligule:'membrane',awns:'long'},'sorghastrum-nutans'],
 ['Indiangrass: loosely contracted long panicle',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'long'},'sorghastrum-nutans'],
 ['Indiangrass: narrow head and tuft',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},'sorghastrum-nutans'],
 ['Switchgrass: usual open head',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},'panicum-virgatum'],
 ['Switchgrass: occasional contracted large head',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},'panicum-virgatum'],
 ['Switchgrass: contracted with hair-like ligule appearance',{head:'long_narrow_panicle',habit:'tuft',ligule:'hairs',awns:'none_obvious'},'panicum-virgatum']
];
for(const [name,picks,id] of included)assert(find(picks).has(id),name+': false exclusion of '+id);
const excluded=[
 ['Switchgrass does not bear obvious awns',{head:'long_narrow_panicle',awns:'long'},'panicum-virgatum'],
 ['Indiangrass awns are not Setaria bristles',{awns:'bristles'},'sorghastrum-nutans'],
 ['Poa annua not an elongated contracted plume',{head:'long_narrow_panicle'},'poa-annua'],
 ['Dichanthelium oligosanthes has short open heads',{head:'long_narrow_panicle'},'dichanthelium-oligosanthes']
];
for(const [name,picks,id] of excluded)assert(!find(picks).has(id),name+': unsupported over-admission '+id);
const unknown={id:'unknown-test',scientific:'Unknown',common:'Unknown',range:'UNRESOLVED',traits:{}};
ctx.state.species=[unknown];
assert.deepEqual(Array.from(find({head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'long'})),['unknown-test']);
for(const id of ['sorghastrum-nutans','panicum-virgatum']){
 const rec=scored.find(s=>s.id===id);assert(rec);
 assert(rec.traits.head.includes('long_narrow_panicle'));
 assert(rec.character_evidence?.head?.source || rec.character_evidence?.head?.primary_source);
 assert(rec.photos.length,'original photos retained');
}
console.log(JSON.stringify({pass:true,scored:112,provisional:57,inventory:169,
 positiveScenarios:included.length,negativeControls:excluded.length,unknownRetention:true},null,2));
