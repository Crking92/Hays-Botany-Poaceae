'use strict';
// Lane C Batch 7, Issue #70. Run: node scripts/test_lane_c_batch7.cjs
// Self-contained production currentResults() test; original states reconstructed in memory.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'site/visual-key-lab');
const read=n=>fs.readFileSync(path.join(lab,n),'utf8');
const shardNames=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const species=shardNames.flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const candidates=JSON.parse(read('hays-candidates.json')).candidates;
assert.equal(species.length,112);assert.equal(candidates.length,57);
assert.equal(new Set([...species,...candidates].map(x=>x.id)).size,169);
assert.equal(species.reduce((n,x)=>n+x.photos.length,0),514);
const source=read('index.html'),inline=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(inline,'production inline script missing');
new vm.Script(inline);
const start=inline.indexOf('function currentResults()'),end=inline.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start);
const ctx={state:{species,selected:{},range:'all',query:''}};
vm.createContext(ctx);vm.runInContext(inline.slice(start,end),ctx);
const resultIds=(picks,rows=species)=>{
 ctx.state.species=rows;ctx.state.selected=picks;ctx.state.range='all';ctx.state.query='';
 return Array.from(ctx.currentResults(),x=>x.s.id);
};
const scoped=['d2','d3'].flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const prior=JSON.parse(JSON.stringify(scoped));
const corrections=[
 ['festuca-versuta','head','airy','branched_oat','head_open_mature_fescue'],
 ['muhlenbergia-schreberi','ligule','hairs','membrane','ligule_ciliate_membrane_visual_choice'],
 ['paspalum-setaceum','head','paired_spikes','one_sided','head_paired_racemes_williamson']
];
for(const [id,trait,added,retained,evidence] of corrections){
 const row=scoped.find(x=>x.id===id),old=prior.find(x=>x.id===id);
 assert(row&&old,id+' missing');
 assert(row.traits[trait].includes(added)&&row.traits[trait].includes(retained),id+' scored state missing');
 const index=old.traits[trait].indexOf(added);assert(index>=0,id+' new state missing in old fixture');
 old.traits[trait].splice(index,1);
 assert(row.character_evidence[evidence]?.source_url&&
 row.character_evidence[evidence]?.status==='SOURCE_BACKED_ADDITIVE_NONEXCLUSION'&&
 row.character_evidence[evidence]?.review_date==='2026-11-12',id+' supporting source missing');
 assert(row.field_rule.trim().endsWith('.'),id+' incomplete crew field instruction');
}
const positives=[
 ['festuca-versuta',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['muhlenbergia-schreberi',{head:'long_narrow_panicle',habit:'mat',ligule:'hairs',awns:'none_obvious'}],
 ['muhlenbergia-schreberi',{head:'long_narrow_panicle',habit:'tuft',ligule:'hairs',awns:'long'}],
 ['paspalum-setaceum',{head:'paired_spikes',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['paspalum-setaceum',{head:'paired_spikes',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,picks] of positives){
 assert(!resultIds(picks,prior).includes(id),'prior false exclusion not reproduced for '+id);
 assert(resultIds(picks,scoped).includes(id),'still falsely excludes '+id);
}
const negatives=[
 ['festuca-versuta',{head:'foxtail'}],
 ['festuca-versuta',{awns:'long'}],
 ['muhlenbergia-schreberi',{ligule:'absent'}],
 ['muhlenbergia-schreberi',{habit:'rhizome'}],
 ['paspalum-setaceum',{head:'spike'}],
 ['paspalum-setaceum',{head:'many_one_sided'}]
];
for(const [id,picks]of negatives)
 assert(!resultIds(picks,scoped).includes(id),'false inclusion for '+id);
let priorCombinations=0;
for(const row of prior){
 const entries=Object.entries(row.traits).filter(([,v])=>v.length);
 const walk=(i,choices={})=>{
  if(i===entries.length){
   assert(resultIds(choices,scoped).includes(row.id),'old valid choice lost '+row.id+'/'+JSON.stringify(choices));
   priorCombinations++;return;
  }
  const [trait,values]=entries[i];for(const val of values)walk(i+1,{...choices,[trait]:val});
 };
 walk(0);
}
// Other valid Lane C states may be added in later batches. Check every current
// pre-Batch7 combination above; retain the original verified minimum, not a frozen total.
assert(priorCombinations>=67,'fewer than 67 previously validated D2–D3 character paths');
assert.equal(scoped.reduce((n,x)=>n+x.photos.length,0),137,'photo count modified');
const unknown={id:'unknown-test',scientific:'Unknown',common:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(resultIds({head:'paired_spikes',ligule:'hairs'},[unknown]),['unknown-test']);
assert(!resultIds({}).some(id=>candidates.some(c=>c.id===id)),'provisional scored prematurely');
console.log(JSON.stringify({pass:true,newScoreStates:3,positives:positives.length,
 negatives:negatives.length,priorCombosPreserved:priorCombinations,
 D2D3PhotosPreserved:137,allScoredPhotos:514,scored:112,provisional:57},null,2));
