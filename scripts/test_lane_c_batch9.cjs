'use strict';
// Scoring Lane C Batch 9 — source-backed long-narrow panicle states.
// Run: node scripts/test_lane_c_batch9.cjs (Node 22+)
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const folder=path.resolve(__dirname,'..','site/visual-key-lab');
const read=file=>fs.readFileSync(path.join(folder,file),'utf8');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const all=shards.flatMap(s=>JSON.parse(read('species-'+s+'.json')));
const provisional=JSON.parse(read('hays-candidates.json')).candidates;
assert.equal(all.length,112);
assert.equal(provisional.length,57);
assert.equal(new Set([...all,...provisional].map(s=>s.id)).size,169);
assert.equal(all.reduce((n,x)=>n+x.photos.length,0),514);
const html=read('index.html');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js,'production inline script missing');
new vm.Script(js);
const start=js.indexOf('function currentResults()');
const end=js.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'production filter boundary moved');
const ctx={state:{species:all,selected:{},range:'all',query:''}};
vm.createContext(ctx);
vm.runInContext(js.slice(start,end),ctx);
const ids=(answers,rows=all)=>{
 ctx.state.species=rows;ctx.state.selected=answers;ctx.state.range='all';ctx.state.query='';
 return Array.from(ctx.currentResults(),row=>row.s.id);
};
const d2=JSON.parse(read('species-d2.json'));
const before=JSON.parse(JSON.stringify(d2));
const corrected=[
 ['festuca-octoflora','head_narrow_contracted_fna_20261112'],
 ['eragrostis-secundiflora','head_narrow_contracted_fna_20261112']
];
for(const [id,key] of corrected){
 const current=d2.find(x=>x.id===id);
 const old=before.find(x=>x.id===id);
 assert(current&&old,'missing expected D2 species '+id);
 assert(current.traits.head.includes('long_narrow_panicle'),id+' narrow head still excluded');
 const remove=old.traits.head.indexOf('long_narrow_panicle');
 assert(remove>=0,id+' scoring value absent');
 old.traits.head.splice(remove,1);
 const ev=current.character_evidence[key];
 assert(ev&&ev.category==='reproductive'&&ev.source_url&&
  ev.status==='SOURCE_BACKED_ADDITIVE_NONEXCLUSION'&&
  ev.review_date==='2026-11-12',id+' lacks specific documented floral evidence');
 assert(current.field_rule.trim().endsWith('.'),id+' field instruction is truncated');
}
const positives=[
 ['festuca-octoflora',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['festuca-octoflora',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['eragrostis-secundiflora',{head:'long_narrow_panicle',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['eragrostis-secundiflora',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,answers] of positives){
 assert(!ids(answers,before).includes(id),'old false exclusion not reproduced '+id);
 assert(ids(answers,d2).includes(id),'candidate still excluded '+id);
}
const negatives=[
 ['festuca-octoflora',{head:'spike'}],
 ['festuca-octoflora',{head:'foxtail'}],
 ['festuca-octoflora',{habit:'rhizome'}],
 ['eragrostis-secundiflora',{head:'spike'}],
 ['eragrostis-secundiflora',{head:'one_sided'}],
 ['eragrostis-secundiflora',{awns:'long'}]
];
for(const [id,answers] of negatives)
 assert(!ids(answers,d2).includes(id),'false positive introduced '+id);
let oldCombinations=0;
for(const row of before){
 const entries=Object.entries(row.traits).filter(([,values])=>values.length>0);
 const visit=(i,answers={})=>{
  if(i===entries.length){
   assert(ids(answers,d2).includes(row.id),'previous valid complete path lost '+row.id);
   oldCombinations++;return;
  }
  const [trait,values]=entries[i];
  for(const val of values) visit(i+1,{...answers,[trait]:val});
 };
 visit(0);
}
// Later evidence-backed scores will increase this number; the traversal above
// must preserve EVERY currently supported pre-Batch9 combination.
assert(oldCombinations>=37,'fewer than 37 previously validated D2 character paths');
assert.equal(d2.reduce((n,x)=>n+x.photos.length,0),58,'D2 photo reference count changed');
const unknown={id:'unknown-state-test',scientific:'?',common:'?',range:'UNRESOLVED',traits:{}};
assert.deepEqual(ids({head:'long_narrow_panicle'},[unknown]),['unknown-state-test']);
const provisionalIds=new Set(provisional.map(x=>x.id));
assert(!ids({}).some(id=>provisionalIds.has(id)),'research candidate leaked into scoring');
console.log(JSON.stringify({
 pass:true,addedStates:2,correctedPaths:positives.length,negativeControls:negatives.length,
 oldCompleteD2PathsPreserved:oldCombinations,d2PhotoReferences:58,
 scored:all.length,provisional:provisional.length,scoredPhotoReferences:514,
 unknownStatesRetained:true
},null,2));
