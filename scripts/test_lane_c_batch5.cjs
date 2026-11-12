'use strict';
// Lane C Batch 5. Self-contained: no git history or network needed.
// Run: node scripts/test_lane_c_batch5.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site/visual-key-lab');
const read=name=>fs.readFileSync(path.join(lab,name),'utf8');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=shards.flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const provisional=JSON.parse(read('hays-candidates.json')).candidates;
assert.equal(scored.length,112);assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(s=>s.id)).size,169);
assert.equal(scored.reduce((n,s)=>n+s.photos.length,0),514);
const html=read('index.html');
const body=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(body);
new vm.Script(body);
const start=body.indexOf('function currentResults()'),end=body.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start);
const ctx={state:{species:scored,selected:{},range:'all',query:''}};vm.createContext(ctx);
vm.runInContext(body.slice(start,end),ctx);
const results=(picks,rows=scored)=>{
 ctx.state.species=rows;ctx.state.selected=picks;ctx.state.range='all';ctx.state.query='';
 return Array.from(ctx.currentResults(),r=>r.s.id);
};
const expectedBefore={
 'eriochloa-sericea':['one_sided','long_narrow_panicle'],
 'hopia-obtusa':['long_narrow_panicle'],
 'polypogon-monspeliensis':['compact']
};
const newStates={
 'eriochloa-sericea':'many_one_sided',
 'hopia-obtusa':'one_sided',
 'polypogon-monspeliensis':'long_narrow_panicle'
};
const originalFixture=JSON.parse(JSON.stringify(scored));
for(const [id,oldHeads] of Object.entries(expectedBefore)){
 const s=scored.find(x=>x.id===id);assert(s,id+' missing');
 assert.deepEqual(s.traits.head,[...oldHeads,newStates[id]],'incorrect head states for '+id);
 const old=originalFixture.find(x=>x.id===id);
 old.traits.head=[...oldHeads];
 const evidence=Object.values(s.character_evidence||{});
 assert(evidence.some(e=>e.review_date==='2026-11-12'&&
   e.status==='SOURCE_BACKED_ADDITIVE_NONEXCLUSION'&&e.category==='reproductive'&&e.source_url),
   id+' lacks species-relevant source evidence');
}
const positives=[
 ['eriochloa-sericea',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['hopia-obtusa',{head:'one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
 ['hopia-obtusa',{head:'one_sided',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['polypogon-monspeliensis',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'}]
];
for(const [id,picks]of positives){
 assert(!results(picks,originalFixture).includes(id),'old exclusion not reproduced for '+id);
 assert(results(picks).includes(id),'new state still excludes '+id);
}
const negatives=[
 ['eriochloa-sericea',{head:'fingers'}],
 ['hopia-obtusa',{head:'fingers'}],
 ['hopia-obtusa',{head:'spike'}],
 ['polypogon-monspeliensis',{head:'spike'}],
 ['polypogon-monspeliensis',{awns:'bristles'}]
];
for(const [id,picks]of negatives)
 assert(!results(picks).includes(id),'unjustified inclusion '+id+'/'+JSON.stringify(picks));
let preserved=0;
for(const old of originalFixture){
 if(!Object.hasOwn(expectedBefore,old.id))continue;
 const pairs=Object.entries(old.traits).filter(([,values])=>values.length);
 const walk=(i,picks={})=>{
  if(i===pairs.length){assert(results(picks).includes(old.id),'old valid combination lost: '+old.id);preserved++;return;}
  const [key,values]=pairs[i];for(const value of values)walk(i+1,{...picks,[key]:value});
 };walk(0);
}
const hopia=scored.find(x=>x.id==='hopia-obtusa');
assert.equal(hopia.character_evidence.habit_regional_conflict?.status,
 'SOURCE_CONFLICT_REQUIRES_SPECIMEN','old rhizome conflict must remain unresolved');
const unknown={id:'unknown-fixture',common:'Unknown',scientific:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(results({head:'one_sided'},[unknown]),['unknown-fixture']);
console.log(JSON.stringify({pass:true,addedHeadStates:3,positiveRegressions:positives.length,
 negativeControls:negatives.length,baselineTargetCombinationsRetained:preserved,
 rightsAndPhotosUnaffected:514,scored:112,provisional:57},null,2));
