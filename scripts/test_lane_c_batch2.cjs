// Lane C Batch 2: real-filter false-exclusion regression suite.
// Run: node scripts/test_lane_c_batch2.cjs [baseline-main-commit]
const assert=require('node:assert/strict');
const fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),lab='site/visual-key-lab/';
const baselineCommit=process.argv[2]||'01b8b1cb837a5047c8c6d0ecf4d88de2f6c40a26';
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n');
const old=p=>cp.execFileSync('git',['show',baselineCommit+':'+p],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replaceAll('\r\n','\n');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const species=shards.flatMap(s=>JSON.parse(read(lab+'species-'+s+'.json')));
const focus=['d2','d3','d4'];
const baseline=focus.flatMap(s=>JSON.parse(old(lab+'species-'+s+'.json')));
const current=focus.flatMap(s=>JSON.parse(read(lab+'species-'+s+'.json')));
const source=read(lab+'index.html').match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(source);
const ctx={state:{species,selected:{},range:'all',query:''}};
vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('function currentResults()'),source.indexOf('\nfunction renderTabs')),ctx);
const optionsCtx={};vm.createContext(optionsCtx);
vm.runInContext(source.slice(source.indexOf('const qs='),source.indexOf('const state='))+';globalThis.questions=qs;',optionsCtx);
const allowed=Object.fromEntries(optionsCtx.questions.map(q=>[q.id,q.options.map(o=>o[0])]));
const resultIds=(selected,rows=species)=>{
 ctx.state.species=rows;ctx.state.selected=selected;ctx.state.query='';ctx.state.range='all';
 return Array.from(ctx.currentResults(),row=>row.s.id);
};
const additions={
 'leersia-oryzoides':{habit:['tuft']},
 'phragmites-australis':{habit:['tuft'],ligule:['hairs']},
 'zizaniopsis-miliacea':{habit:['tuft']},
 'urochloa-fusca':{ligule:['membrane']}
};
let originalPaths=0,photoRefs=0;const changed=[];
for(const before of baseline){
 const after=current.find(x=>x.id===before.id);
 assert(after,'species missing '+before.id);
 for(const key of ['id','scientific','common','range','photos','photo_character_audit','source_blob_sha'])
  assert.deepEqual(after[key],before[key],'protected metadata changed for '+before.id+'/'+key);
 photoRefs+=(after.photos||[]).length;
 if(JSON.stringify(after)!==JSON.stringify(before)) changed.push(before.id);
 for(const [trait,values]of Object.entries(after.traits)){
   const extra=additions[before.id]?.[trait]||[];
   assert.deepEqual(values,[...(before.traits[trait]||[]),...extra],before.id+'/'+trait+' unexpected scoring change');
   for(const value of values)assert(allowed[trait]?.includes(value),'invalid state '+before.id+'/'+trait+'/'+value);
 }
 const walk=(entries,picks={})=>{
   if(!entries.length){
     assert(resultIds(picks,current).includes(before.id),'excluded former valid path '+before.id+'/'+JSON.stringify(picks));
     originalPaths++;return;
   }
   const [[key,values],...rest]=entries;
   for(const val of values)walk(rest,{...picks,[key]:val});
 };
 walk(Object.entries(before.traits).filter(([,values])=>values.length));
}
assert.deepEqual(new Set(changed),new Set([...Object.keys(additions),'hopia-obtusa']));
const hopia=current.find(x=>x.id==='hopia-obtusa'),hopiaOld=baseline.find(x=>x.id==='hopia-obtusa');
assert.deepEqual(hopia.traits,hopiaOld.traits,'Hopia conflicting states must remain intact');
assert.equal(hopia.character_evidence?.habit_regional_conflict?.status,'SOURCE_CONFLICT_REQUIRES_SPECIMEN');
for(const id of Object.keys(additions)){
 const row=current.find(x=>x.id===id);
 assert(Object.values(row.character_evidence).some(e=>e.source_url?.includes('2015Phytoneuron')&&e.review_date==='2026-11-12'),id+' lacks dated regional-source evidence');
}
const fixed=[
 ['leersia-oryzoides',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['phragmites-australis',{head:'reed_plume',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['phragmites-australis',{head:'reed_plume',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['phragmites-australis',{head:'reed_plume',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['zizaniopsis-miliacea',{head:'aquatic_mixed',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['zizaniopsis-miliacea',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['urochloa-fusca',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['urochloa-fusca',{head:'one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,picks]of fixed){
 assert(!resultIds(picks,baseline).includes(id),'scenario did not fail before: '+id+'/'+JSON.stringify(picks));
 assert(resultIds(picks,current).includes(id),'scenario still excluded: '+id+'/'+JSON.stringify(picks));
}
// Important negative controls: no false claims of absent ligule or long-awn spikelets.
assert(!resultIds({head:'reed_plume',ligule:'absent'},current).includes('phragmites-australis'));
assert(!resultIds({head:'one_sided',ligule:'absent'},current).includes('urochloa-fusca'));
assert(!resultIds({head:'aquatic_mixed',awns:'long'},current).includes('zizaniopsis-miliacea'));
// Old conflicting Hopia options are still available without reinterpreting stolons as rhizomes.
assert(resultIds({habit:'mat',head:'long_narrow_panicle'},current).includes('hopia-obtusa'));
assert(resultIds({habit:'rhizome',head:'long_narrow_panicle'},current).includes('hopia-obtusa'));
const unknown={id:'unknown-test',scientific:'Unknown',common:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(resultIds({head:'airy',habit:'rhizome',ligule:'membrane'},[unknown]),['unknown-test']);
const provisional=JSON.parse(read(lab+'hays-candidates.json')).candidates;
assert.equal(species.length,112);assert.equal(new Set(species.map(s=>s.id)).size,112);
assert.equal(provisional.length,57);
assert.equal(new Set([...species,...provisional].map(s=>s.id)).size,169);
console.log(JSON.stringify({pass:true,changedRecords:changed,additiveStates:5,regressionScenarios:fixed.length,negativeControls:3,priorCombinationsRetained:originalPaths,photoRefsPreserved:photoRefs,unknownStateRetention:true,scored:112,provisional:57,configured:169},null,2));
