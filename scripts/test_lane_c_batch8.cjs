'use strict';
// Lane C Batch 8 (Issue #70): production grass filter, preserved states, held FNA conflict.
// Run from repo root: node scripts/test_lane_c_batch8.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const lab=path.resolve(__dirname,'..','site/visual-key-lab');
const read=name=>fs.readFileSync(path.join(lab,name),'utf8');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const all=shards.flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const candidates=JSON.parse(read('hays-candidates.json')).candidates;
assert.equal(all.length,112);assert.equal(candidates.length,57);
assert.equal(new Set([...all,...candidates].map(x=>x.id)).size,169);
assert.equal(all.reduce((sum,x)=>sum+x.photos.length,0),514,'original 514 scored photo refs changed');
const html=read('index.html'),body=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(body,'production inline JS missing');
new vm.Script(body);
const start=body.indexOf('function currentResults()'),end=body.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'production filter changed location');
const ctx={state:{species:all,selected:{},range:'all',query:''}};
vm.createContext(ctx);vm.runInContext(body.slice(start,end),ctx);
const matches=(picks,records=all)=>{
  ctx.state.species=records;ctx.state.selected=picks;ctx.state.range='all';ctx.state.query='';
  return Array.from(ctx.currentResults(),r=>r.s.id);
};
const scoped=['d1','d4'].flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const old=JSON.parse(JSON.stringify(scoped));
const additions=[
  ['bromus-texensis','head','airy','head_open_panicle_regional'],
  ['sorghastrum-elliottii','head','airy','head_open_arching_flora'],
  ['sporobolus-clandestinus','ligule','membrane','ligule_minute_ciliate_base_hill_country']
];
for(const [id,trait,value,evidenceKey] of additions){
  const now=scoped.find(x=>x.id===id),prior=old.find(x=>x.id===id);
  assert(now&&prior,'missing scored target '+id);
  const index=prior.traits[trait].indexOf(value);
  assert(index>=0,'added score not present '+id+' '+trait+'='+value);
  prior.traits[trait].splice(index,1);  // reconstruct old state without git history
  assert(now.traits[trait].length===prior.traits[trait].length+1,'unexpected score variants for '+id);
  const evidence=now.character_evidence[evidenceKey];
  assert(evidence?.source_url&&evidence.category&&evidence.status==='SOURCE_BACKED_ADDITIVE_NONEXCLUSION'&&
    evidence.review_date==='2026-11-12','source-backed character audit incomplete '+id);
  assert(now.field_rule.endsWith('.'),'truncated crew instruction '+id);
}
const positives=[
  ['bromus-texensis',{head:'airy',habit:'tuft',ligule:'membrane',awns:'long'}],
  ['sorghastrum-elliottii',{head:'airy',habit:'tuft',ligule:'membrane',awns:'long'}],
  ['sporobolus-clandestinus',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
  ['sporobolus-clandestinus',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,answers] of positives){
  assert(!matches(answers,old).includes(id),'before state did not exclude '+id);
  assert(matches(answers,scoped).includes(id),'after state still excludes '+id);
}
const negatives=[
  ['bromus-texensis',{head:'spike'}],
  ['bromus-texensis',{awns:'none_obvious'}],
  ['sorghastrum-elliottii',{head:'foxtail'}],
  ['sorghastrum-elliottii',{ligule:'absent'}],
  ['sporobolus-clandestinus',{head:'airy'}],
  ['sporobolus-clandestinus',{awns:'long'}]
];
for(const [id,answers] of negatives){
  assert(!matches(answers,scoped).includes(id),'unjustified match '+id+'/'+JSON.stringify(answers));
}
let olderFullCombinations=0;
for(const x of old){
  const options=Object.entries(x.traits).filter(([,v])=>v.length>0);
  const recur=(i,answers={})=>{
    if(i===options.length){
      assert(matches(answers,scoped).includes(x.id),'valid historical path excluded '+x.id+'/'+JSON.stringify(answers));
      olderFullCombinations++;return;
    }
    const [trait,values]=options[i];
    for(const v of values)recur(i+1,{...answers,[trait]:v});
  };recur(0);
}
assert.equal(olderFullCombinations,82,'unexpected D1/D4 original fully specified state count');
assert.equal(scoped.reduce((sum,s)=>sum+s.photos.length,0),124,'D1/D4 photos modified');
const hidden=scoped.find(x=>x.id==='sporobolus-clandestinus');
assert.deepEqual(hidden.traits.habit,['tuft'],'FNA/regional rhizome conflict must remain unresolved');
const conflict=hidden.character_evidence.habit_hill_country_vs_fna_20261112;
assert.equal(conflict?.status,'SOURCE_CONFLICT_NEEDS_HAYS_SPECIMEN_NOT_SCORED');
assert(conflict.source_url.includes('phytoneuron.net')&&conflict.secondary_source_url.includes('biorepo.neonscience.org'));
const unknown={id:'unknown-trait-probe',common:'Unknown',scientific:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(matches({head:'airy',ligule:'membrane'},[unknown]),['unknown-trait-probe']);
const provisionalIds=new Set(candidates.map(x=>x.id));
assert(!matches({}).some(id=>provisionalIds.has(id)),'provisional candidate scored');
console.log(JSON.stringify({pass:true,scored:112,provisional:57,addedStates:3,
  formerlyExcludedPathsCorrected:positives.length,negativeControls:negatives.length,
  previousFullCharacterCombinationsRetained:olderFullCombinations,photoRefsPreserved:514,
  uncertainRhizomeExcludedFromScoring:true},null,2));
