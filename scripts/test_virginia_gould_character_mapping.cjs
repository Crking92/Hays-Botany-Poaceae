"use strict";
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../site/visual-key-lab');
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(script);
const species=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(k=>read('species-'+k+'.json'));
const base=read('optional-refinement-evidence.json'),pack=read('gould-virginia-character-supplement.json');
const refs={};for(const row of base.evidence)(refs[row.id]??=[]).push(row);
const state={species,selected:{head:null,habit:null,ligule:null,awns:null},range:'all',query:'',refineCharacters:base.characters,refineEvidenceMap:refs,refineSelected:{}};
const context={state,structuredClone};vm.createContext(context);
vm.runInContext(script.slice(script.indexOf('function refinementEvidence('),script.indexOf('function renderOptionalCharacters(){'))+
 script.slice(script.indexOf('function currentResults(){'),script.indexOf('function renderTabs(){'))+
 script.slice(script.indexOf('function applyVirginiaGouldSupplement('),script.indexOf('async function boot(){')),context);
const virginia=species.find(s=>s.id===pack.species_id),photos=JSON.stringify(species.map(s=>s.photos));
context.pack=pack;vm.runInContext('applyVirginiaGouldSupplement(pack)',context);
state.refineEvidenceOptionKeys=new Set(Object.values(state.refineEvidenceMap).flatMap(rows=>rows.flatMap(e=>e.states.map(v=>e.character+':'+v))));
assert.equal(state.refineCharacters.length,24);assert.equal(state.refineCharacters.reduce((n,c)=>n+c.options.length,0),124);
assert.equal(JSON.stringify(species.map(s=>s.photos)),photos);
assert.equal(state.refineEvidenceMap['elymus-virginicus'].find(e=>e.character==='culm_posture').states.includes('geniculate'),true);
const run=()=>vm.runInContext('progressiveResultGroups(currentResults())',context);
for(const addition of pack.option_additions){
 const c=state.refineCharacters.find(x=>x.id===addition.character);
 assert.equal(c.options.filter(o=>o.id===addition.option.id).length,1);
 if(c.subgroups)assert.equal(c.subgroups.flatMap(s=>s.options).filter(v=>v===addition.option.id).length,1);
 state.refineSelected={[addition.character]:[addition.option.id]};
 const result=run();assert(result.confirmed.some(r=>r.s.id===virginia.id),addition.option.id+' must support Virginia');
 assert.equal(result.excluded.length,0,'new options must never exclude unrecorded grasses');
 assert.equal(result.confirmed.length+result.unresolved.length,112);
}
state.selected={head:'spike',habit:'tuft',ligule:'membrane',awns:'long'};
state.refineSelected={blade_shape:'flat',culm_posture:'erect',true_lemma_awn:['long'],lemma_texture:['smooth']};
assert(run().confirmed.some(r=>r.s.id===virginia.id),'original hairless-lemma failure must be fixed');
state.refineSelected.lemma_texture=['sparsely_hairy'];
assert(run().confirmed.some(r=>r.s.id===virginia.id),'sparse hairs must be positively supported');
state.refineSelected.glume_marks=['bowed_nerveless_base','hardened_yellowish','strongly_veined'];
state.refineSelected.spikelet_position=['erect_spike','sheath_enclosed_spike'];
let result=run();assert.deepEqual(Array.from(result.confirmed,r=>r.s.id),[virginia.id]);
assert(result.unresolved.some(r=>r.s.id==='elymus-canadensis'),'missing Canada evidence must stay possible');
assert.equal(vm.runInContext('refinementMatches(state.species.find(s=>s.id==="elymus-virginicus")).filter(r=>r.character==="glume_marks").length',context),1,'multiple glume details award at most one group point');
// Book page supplies ranges/variants, not simultaneous observations of one plant.
for(const width of ['narrow','medium','broad']){state.refineSelected={blade_width:width};assert(!run().excluded.some(r=>r.s.id===virginia.id),'5-mm overlap / 5–15-mm width false exclusion');}
const before=JSON.stringify([state.refineCharacters,state.refineEvidenceMap]);
context.pack={...pack,evidence:pack.evidence.map((row,i)=>i?row:{...row,id:'elymus-canadensis'})};
assert.throws(()=>vm.runInContext('applyVirginiaGouldSupplement(pack)',context));
assert.equal(JSON.stringify([state.refineCharacters,state.refineEvidenceMap]),before,'malformed supplement must be atomic');
assert(html.indexOf('applyVirginiaGouldSupplement(await response.json())')>html.indexOf('Original exact-species callus source missing'),'historical evidence validators must run before extension');
console.log('PASS: 13 new positive-only options, 10 Gould groups; smooth/sparse lemmas supported; Virginia documented with bowed glumes; Canada remains possible; photos and old evidence preserved; malformed supplement is atomic.');
