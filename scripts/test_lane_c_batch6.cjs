'use strict';
// Lane C Batch 6: real Hays Grass ID Lab filter regressions.
// Execute from repo root: node scripts/test_lane_c_batch6.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const lab=path.resolve(__dirname,'..','site/visual-key-lab');
const load=f=>fs.readFileSync(path.join(lab,f),'utf8');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const species=shards.flatMap(id=>JSON.parse(load('species-'+id+'.json')));
const candidates=JSON.parse(load('hays-candidates.json')).candidates;
assert.equal(species.length,112);
assert.equal(candidates.length,57);
assert.equal(new Set([...species,...candidates].map(s=>s.id)).size,169);
assert.equal(species.reduce((sum,x)=>sum+x.photos.length,0),514,'scored photos unexpectedly changed');
const html=load('index.html'),inline=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(inline,'cannot find production script');
new vm.Script(inline);
const a=inline.indexOf('function currentResults()'),b=inline.indexOf('\nfunction renderTabs',a);
assert(a>=0&&b>a);
const ctx={state:{species,selected:{},range:'all',query:''}};
vm.createContext(ctx);vm.runInContext(inline.slice(a,b),ctx);
const ids=(picks,rows=species)=>{
 ctx.state.species=rows;ctx.state.selected=picks;ctx.state.range='all';ctx.state.query='';
 return Array.from(ctx.currentResults(),v=>v.s.id);
};
const focus=['d1','d4'].flatMap(id=>JSON.parse(load('species-'+id+'.json')));
const old=JSON.parse(JSON.stringify(focus));
const expected=[
 ['bromus-lanceolatus','head','compact','head_immature_contracted_fna'],
 ['tridens-albescens','habit','rhizome','habit_short_knotted_regional'],
 ['tridens-albescens','ligule','membrane','ligule_ciliate_minute_membrane_regional'],
 ['tridens-flavus','habit','rhizome','habit_short_knotted_regional']
];
for(const [id,trait,value,evidenceKey] of expected){
 const newer=focus.find(x=>x.id===id),before=old.find(x=>x.id===id);
 assert(newer&&before,id+' missing');
 assert(newer.traits[trait].includes(value),id+' missing '+trait+':'+value);
 const at=before.traits[trait].indexOf(value);
 assert(at>=0);before.traits[trait].splice(at,1);
 const e=newer.character_evidence[evidenceKey];
 assert(e&&e.source_url&&e.review_date==='2026-11-12'&&
  e.status.includes('NONEXCLUSION'),id+' source audit missing');
}
const positives=[
 ['bromus-lanceolatus',{head:'compact',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['tridens-albescens',{head:'compact',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['tridens-albescens',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['tridens-albescens',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['tridens-flavus',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['tridens-flavus',{head:'airy',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}]
];
for(const [id,picks]of positives){
 assert(!ids(picks,old).includes(id),'old exclusion was not reproduced: '+id);
 assert(ids(picks,focus).includes(id),'new path fails: '+id);
}
const negatives=[
 ['bromus-lanceolatus',{head:'foxtail'}],
 ['tridens-albescens',{habit:'mat'}],
 ['tridens-albescens',{ligule:'absent'}],
 ['tridens-flavus',{habit:'mat'}],
 ['tridentopsis-mutica',{head:'long_narrow_panicle',habit:'mat'}]
];
for(const [id,picks]of negatives)assert(!ids(picks,focus).includes(id),'false inclusion: '+id);
let paths=0;
for(const s of old){
 const entries=Object.entries(s.traits).filter(([,v])=>v.length);
 const visit=(j,picks={})=>{
  if(j===entries.length){assert(ids(picks,focus).includes(s.id),'original valid combination excluded: '+s.id);paths++;return;}
  const [trait,values]=entries[j];
  for(const v of values)visit(j+1,{...picks,[trait]:v});
 };visit(0);
}
const slim=focus.find(x=>x.id==='tridentopsis-mutica');
assert.deepEqual(slim.traits.habit,['tuft'],'slim tridens source conflict must not silently change score');
const conflict=slim.character_evidence.habit_source_conflict_20261112;
assert.equal(conflict.status,'SOURCE_CONFLICT_NEEDS_HAYS_SPECIMEN_NOT_SCORED');
assert(conflict.source_url.includes('phytoneuron.net')&&conflict.secondary_source_url.includes('biorepo.neonscience.org'));
const unknown={id:'unknown-probe',common:'Unknown',scientific:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(ids({habit:'rhizome'},[unknown]),['unknown-probe']);
console.log(JSON.stringify({pass:true,addedOptions:4,scored:112,provisional:57,
 newPositivePaths:positives.length,rejectedNegativePaths:negatives.length,
 priorCompleteLaneCPathsRetained:paths,sourceConflictsFlagged:1,photosPreserved:514},null,2));
