// Run: node scripts/test_botanical_batch7.cjs [optional untouched baseline root]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const lab = 'site/visual-key-lab';
const shards = ['a','b','c1','c2','c3','d1','d2','d3','d4'];
const read = (base,file) => fs.readFileSync(path.join(base,file),'utf8');
const speciesAt = base => shards.flatMap(s=>JSON.parse(read(base,`${lab}/species-${s}.json`)));
const species = speciesAt(root);
const html = read(root,`${lab}/index.html`);
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
// Execute the production filter itself, not a reimplementation of its decisions.
const start = script.indexOf('function currentResults()');
const end = script.indexOf('\nfunction renderTabs', start);
assert(start>=0 && end>start);
const context = {state:{species,selected:{},range:'all',query:''}};
vm.createContext(context);
vm.runInContext(script.slice(start,end),context);
const qsStart = script.indexOf('const qs=');
const qsEnd = script.indexOf('const state=',qsStart);
const optionsContext = {};
vm.createContext(optionsContext);
vm.runInContext(script.slice(qsStart,qsEnd)+';globalThis.questions=qs;',optionsContext);
const choices = Object.fromEntries(optionsContext.questions.map(q=>[q.id,new Set(q.options.map(o=>o[0]))]));
assert.equal(species.length,112);
assert.equal(new Set(species.map(s=>s.id)).size,112);
const results = picks => {context.state.selected=picks;return context.currentResults().map(r=>r.s.id);};
for(const s of species) for(const [trait,values] of Object.entries(s.traits)) {
 assert(choices[trait],trait);
 for(const v of values)assert(choices[trait].has(v),`${s.id}: invalid ${trait}=${v}`);
}
const scenarios = [
 ['visible awn on narrow Lindheimer head',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},['muhlenbergia-lindheimeri']],
 ['visible awn on open Lindheimer head',{head:'airy',habit:'tuft',ligule:'membrane',awns:'long'},['muhlenbergia-lindheimeri','muhlenbergia-reverchonii']],
 ['small cluster of nimblewill',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},['muhlenbergia-schreberi']],
 ['small clump of aparejo',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['muhlenbergia-utilis']],
 ['nimblewill surface rooting retained',{habit:'mat',ligule:'membrane',awns:'long'},['muhlenbergia-schreberi']],
 ['aparejo rhizome retained',{habit:'rhizome',ligule:'membrane'},['muhlenbergia-utilis']],
 ['vegetative red and sand lovegrass remain ambiguous',{habit:'tuft',ligule:'hairs'},['eragrostis-secundiflora','eragrostis-trichodes']],
 ['compact red lovegrass retained',{head:'compact',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['eragrostis-secundiflora']],
 ['open-looking lovegrasses retained',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['eragrostis-secundiflora','eragrostis-trichodes']],
 ['open Canyon head retained',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['muhlenbergia-x-involuta']],
];
for(const [label,picks,ids] of scenarios)for(const id of ids)assert(results(picks).includes(id),`${label}: excluded ${id}`);
assert(!results({awns:'three'}).includes('muhlenbergia-lindheimeri'),'single awn is not three awns');
assert(!results({head:'burrs'}).includes('eragrostis-trichodes'),'lovegrass is not a bur');
const unknown={id:'unknown-fixture',common:'Unknown',scientific:'Unknown',range:'UNRESOLVED',traits:{}};
context.state.species=[unknown];
assert.deepEqual(Array.from(results({head:'airy',ligule:'membrane'})),['unknown-fixture']);
context.state.species=species;
let baselineChecks = null;
if(process.argv[2]) {
 const baseline=path.resolve(process.argv[2]);
 const old=speciesAt(baseline);
 const expected=new Set(['eragrostis-trichodes','eragrostis-secundiflora','muhlenbergia-lindheimeri','muhlenbergia-schreberi','muhlenbergia-utilis','muhlenbergia-x-involuta']);
 const changes=[];let combinations=0;
 for(const s of old) {
  const next=species.find(r=>r.id===s.id);assert(next);
  assert.deepEqual(next.photos,s.photos,`${s.id}: photo mutation`);
  assert.deepEqual(next.photo_character_audit,s.photo_character_audit,`${s.id}: photo QA mutation`);
  if(JSON.stringify(s)!==JSON.stringify(next))changes.push(s.id);
  const cartesian=(entries,picks={})=>{
   if(!entries.length){assert(results(picks).includes(s.id),`${s.id}: previous path lost`);combinations++;return;}
   const [[key,vals],...rest]=entries;
   for(const val of vals)cartesian(rest,{...picks,[key]:val});
  };
  cartesian(Object.entries(s.traits).filter(([,v])=>v.length));
 }
 assert.deepEqual(new Set(changes),expected);
 for(const f of ['site/app.js',`${lab}/hays-candidates.json`,`${lab}/index.html`,'site/data/poaceae-index.json'])assert(read(root,f).replaceAll('\r\n','\n')===read(baseline,f).replaceAll('\r\n','\n'),`${f}: protected content changed`);
 baselineChecks={changedRecords:changes.length,priorCombinationsRetained:combinations,photosPreserved:old.reduce((n,s)=>n+s.photos.length,0)};
}
const candidates=JSON.parse(read(root,`${lab}/hays-candidates.json`));
assert.equal(candidates.candidates.length,57);
assert.equal(new Set([...species,...candidates.candidates].map(s=>s.id)).size,169);
console.log(JSON.stringify({pass:true,scored:species.length,inventory:169,provisional:57,positiveScenarios:scenarios.length,negativeScenarios:2,unknownRetention:true,baselineChecks,expansionPhotoReferences:candidates.candidates.reduce((n,s)=>n+(s.approved_gallery||[]).length,0),expansionTaxaWithReferences:candidates.candidates.filter(s=>s.approved_gallery?.length).length},null,2));
