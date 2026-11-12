'use strict';
// Lane C Batch 11, final audit of 29 not-yet-repaired scored profiles.
// Run: node scripts/test_lane_c_batch11.cjs. Self-contained production filter test.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const lab=path.resolve(__dirname,'..','site/visual-key-lab');
const read=p=>fs.readFileSync(path.join(lab,p),'utf8');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored=shards.flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const provisional=JSON.parse(read('hays-candidates.json')).candidates;
assert.equal(scored.length,112);assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(x=>x.id)).size,169);
assert.equal(scored.reduce((sum,x)=>sum+x.photos.length,0),514);
const js=read('index.html').match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js,'production JS not found');new vm.Script(js);
const start=js.indexOf('function currentResults()'),end=js.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'production filter boundary changed');
const ctx={state:{species:scored,selected:{},range:'all',query:''}};
vm.createContext(ctx);vm.runInContext(js.slice(start,end),ctx);
const results=(picks,rows=scored)=>{
 ctx.state.species=rows;ctx.state.selected=picks;ctx.state.range='all';ctx.state.query='';
 return Array.from(ctx.currentResults(),r=>r.s.id);
};
const focus=['d1','d3'].flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const prior=JSON.parse(JSON.stringify(focus));
const additions=[
 ['chloris-andropogonoides','head','one_sided','head_unilateral_regional_20261112'],
 ['chloris-andropogonoides','head','many_one_sided','head_seven_unilateral_regional_20261112'],
 ['chloris-andropogonoides','ligule','hairs','ligule_sparse_cilia_hill_country_20261112'],
 ['chloris-x-subdolichostachya','head','one_sided','head_hybrid_unilateral_kew_20261112'],
 ['chloris-x-subdolichostachya','head','many_one_sided','head_hybrid_7plus_unilateral_kew_20261112'],
 ['chloris-x-subdolichostachya','ligule','hairs','ligule_hybrid_ciliate_membrane_kew_20261112'],
 ['paspalum-floridanum','head','paired_spikes','head_paired_racemes_kew_synonym_20261112']
];
for(const [id,trait,value,evidenceKey]of additions){
 const s=focus.find(s=>s.id===id),old=prior.find(s=>s.id===id);
 assert(s&&old,'missing scored record '+id);
 const oldIdx=old.traits[trait].indexOf(value);
 assert(oldIdx!==-1,'new choice missing in '+id+':'+trait+'='+value);
 old.traits[trait].splice(oldIdx,1); // reconstruct immediately preceding batch
 const e=s.character_evidence[evidenceKey];
 assert(e&&e.status==='SOURCE_BACKED_CONDITIONAL_FIELD_OBSERVATION'&&
   e.review_date==='2026-11-12'&&e.source_url&&e.category,
   'missing direct source for '+id+':'+trait+'='+value);
 assert(s.field_rule.trim().endsWith('.'),'incomplete field instructions '+id);
}
const positives=[
 ['chloris-andropogonoides',{head:'one_sided',habit:'tuft',ligule:'membrane'}],
 ['chloris-andropogonoides',{head:'many_one_sided',habit:'mat',ligule:'membrane'}],
 ['chloris-andropogonoides',{head:'many_one_sided',habit:'tuft',ligule:'hairs'}],
 ['chloris-andropogonoides',{head:'fingers',habit:'tuft',ligule:'hairs'}],
 ['chloris-x-subdolichostachya',{head:'one_sided',habit:'tuft',ligule:'hairs'}],
 ['chloris-x-subdolichostachya',{head:'many_one_sided',habit:'mat',ligule:'membrane'}],
 ['chloris-x-subdolichostachya',{head:'fingers',habit:'tuft',ligule:'hairs'}],
 ['paspalum-floridanum',{head:'paired_spikes',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['paspalum-floridanum',{head:'paired_spikes',habit:'tuft',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,picks]of positives){
 assert(!results(picks,prior).includes(id),'baseline false exclusion not reproduced '+id);
 assert(results(picks,focus).includes(id),'new choice still excludes '+id);
}
const negatives=[
 ['chloris-andropogonoides',{head:'spike'}],
 ['chloris-andropogonoides',{habit:'rhizome'}],
 ['chloris-andropogonoides',{ligule:'absent'}],
 ['chloris-x-subdolichostachya',{head:'foxtail'}],
 ['chloris-x-subdolichostachya',{head:'spike'}],
 ['paspalum-floridanum',{head:'many_one_sided'}],
 ['paspalum-floridanum',{ligule:'hairs'}],
 ['paspalum-floridanum',{head:'spike'}]
];
for(const [id,picks] of negatives)
 assert(!results(picks,focus).includes(id),'incorrect positive match '+id+'/'+JSON.stringify(picks));
// The hybrid's awn state is still UNKNOWN. Never use an awn-negative
// control on a record with []: unknown values must not hard-exclude.
const hybrid=focus.find(x=>x.id==='chloris-x-subdolichostachya');
assert.deepEqual(hybrid.traits.awns,[]);
assert(results({awns:'burs'},focus).includes(hybrid.id),
 'unknown hybrid awn character was incorrectly excluded');
let full=0;
for(const row of prior){
 const entries=Object.entries(row.traits).filter(([,v])=>v.length>0);
 const visit=(i,picks={})=>{
  if(i===entries.length){
   assert(results(picks,focus).includes(row.id),'previous valid path lost: '+row.id);
   full++;return;
  }
  const [key,values]=entries[i];for(const v of values)visit(i+1,{...picks,[key]:v});
 };visit(0);
}
assert(full>=67,'fewer than 67 original D1+D3 valid full paths');
assert.equal(focus.reduce((n,x)=>n+x.photos.length,0),143,'D1+D3 photo refs unexpectedly changed');
const slim=focus.find(x=>x.id==='chloris-andropogonoides');
assert(!slim.traits.habit.includes('rhizome'),'disputed extra-regional rhizome scored');
assert.equal(slim.character_evidence.habit_regional_vs_mexican_conflict_20261112?.status,
 'SOURCE_CONFLICT_LOCAL_RHIZOME_NOT_SCORED');
assert(hybrid.character_evidence.habit?.status.includes('UNVERIFIED_HYBRID'),
 'hybrid identity caveat lost');
const unknown={id:'unknown-fixture',common:'?',scientific:'?',range:'UNRESOLVED',traits:{}};
assert.deepEqual(results({head:'many_one_sided',ligule:'hairs'},[unknown]),['unknown-fixture']);
assert(!results({}).some(id=>provisional.some(p=>p.id===id)),'provisional candidate leaked into key');
console.log(JSON.stringify({pass:true,addedStates:additions.length,positivePaths:positives.length,
 negatives:negatives.length,previousFullPathsPreserved:full,originalPhotos:514,
 scored:112,provisional:57,unknownAwnPreserved:true,localRootstockConflictHeld:true},null,2));
