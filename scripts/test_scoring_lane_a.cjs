'use strict';
// Lane A botanical scoring regressions; run: node scripts/test_scoring_lane_a.cjs [baseline-ref]
// With full Git history, pass fdc05ad1f5dfd37dc78c27c7de4f876e27533b8c for before/after and metadata checks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const lab = 'site/visual-key-lab/';
const shards = ['a','b','c1','c2','c3','d1','d2','d3','d4'];
const filePath = n => lab + 'species-' + n + '.json';
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const currentFiles = Object.fromEntries(shards.map(n => [n,JSON.parse(read(filePath(n)))]));
const species = shards.flatMap(n => currentFiles[n]);
const specimenMap = new Map(species.map(s=>[s.id,s]));
assert.equal(species.length,112,'scored inventory must remain 112');
assert.equal(specimenMap.size,112,'scored ids must be unique');
const candidates = JSON.parse(read(lab+'hays-candidates.json')).candidates;
assert.equal(candidates.length,57);
assert.equal(new Set([...species,...candidates].map(s=>s.id)).size,169);
const html=read(lab+'index.html');
const source=html.match(/<script>([\s\S]*?)<\/script>/);
assert(source,'production scoring script must exist');
new vm.Script(source[1]);
const scope={state:{species,selected:{},range:'all',query:''}};
vm.createContext(scope);
vm.runInContext(source[1].slice(source[1].indexOf('function currentResults()'),source[1].indexOf('\nfunction renderTabs')),scope);
assert.equal(typeof scope.currentResults,'function');
const opts={};
vm.createContext(opts);
vm.runInContext(source[1].slice(source[1].indexOf('const qs='),source[1].indexOf('const state='))+';globalThis.questions=qs;',opts);
const allowed=Object.fromEntries(opts.questions.map(q=>[q.id,q.options.map(o=>o[0])]));
for(const s of species) for(const [key,values] of Object.entries(s.traits)) for(const value of values) assert(allowed[key].includes(value),s.id+': unexpected '+key+'='+value);
const results=(picks,rows=species)=>{
 scope.state.selected=picks;
 scope.state.species=rows;
 return Array.from(scope.currentResults(),o=>o.s.id);
};
const newlyValid=[
 ['chasmanthium-latifolium',{head:'flat_oats',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['chasmanthium-latifolium',{head:'flat_oats',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['andropogon-gerardi',{head:'fingers',habit:'rhizome',ligule:'membrane',awns:'long'}],
 ['andropogon-gerardi',{head:'fingers',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['hilaria-belangeri',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['aristida-oligantha',{head:'airy',habit:'tuft',ligule:'membrane',awns:'three'}],
 ['arundo-donax',{head:'reed_plume',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['arundo-donax',{head:'reed_plume',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['arundo-donax',{head:'reed_plume',habit:'tuft',ligule:'membrane',awns:'none_obvious'}]
];
const incompatible=[
 ['chasmanthium-latifolium',{head:'fingers'}],
 ['andropogon-gerardi',{head:'burrs'}],
 ['hilaria-belangeri',{habit:'rhizome'}],
 ['aristida-oligantha',{head:'foxtail'}],
 ['arundo-donax',{habit:'mat'}],
 ['arundo-donax',{awns:'long'}]
];
for(const [id,picks] of newlyValid) assert(results(picks).includes(id),'false exclusion remains: '+id+' '+JSON.stringify(picks));
for(const [id,picks] of incompatible) assert(!results(picks).includes(id),'negative control leaked: '+id);
const unknown={id:'unknown',common:'Unknown',scientific:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(results({head:'flat_oats',ligule:'hairs'},[unknown]),['unknown'],'missing states must not become negative evidence');
const expectedAdditions={
 'chasmanthium-latifolium':{habit:['tuft'],ligule:['hairs']},
 'andropogon-gerardi':{habit:['rhizome']},
 'hilaria-belangeri':{habit:['tuft']},
 'aristida-oligantha':{ligule:['membrane']},
 'arundo-donax':{habit:['tuft'],ligule:['hairs']}
};
for(const [id,expected] of Object.entries(expectedAdditions)){
 const s=specimenMap.get(id);
 assert(s,id+' absent');
 for(const key of Object.keys(expected)){
  assert(s.character_evidence[key]?.source.includes('Hagenbuch & Lemke'),id+': missing authority for '+key);
  assert(s.character_evidence[key]?.status.includes('SPECIMEN_PENDING'),id+': uncertainty not retained for '+key);
 }
 for(const [key,states] of Object.entries(expected)) for(const state of states) assert(s.traits[key].includes(state));
}
let historicalCombinations=0, photoReferencesPreserved=null, baselineChecked=false;
if(process.argv[2]){
 const baselineRef=process.argv[2];
 const prior=shards.flatMap(n=>JSON.parse(cp.execFileSync('git',['show',baselineRef+':'+filePath(n)],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024})));
 baselineChecked=true;
 assert.equal(prior.length,112);
 const priorById=new Map(prior.map(s=>[s.id,s]));
 let photoReferences=0;
 for(const old of prior){
  const updated=specimenMap.get(old.id);
  assert(updated,'missing prior scored id: '+old.id);
  for(const field of ['photos','photo_character_audit','scientific','range','hero_i'])assert.deepEqual(updated[field],old[field],old.id+': unexpected '+field+' modification');
  photoReferences += old.photos.length;
  if(expectedAdditions[old.id]){
   for(const [key,values]of Object.entries(old.traits)){
    assert.deepEqual(updated.traits[key],[...values,...(expectedAdditions[old.id][key]||[])],old.id+': nonadditive scoring edit '+key);
   }
  }
  const visits=(pairs,picks={})=>{
   if(pairs.length===0){assert(results(picks).includes(old.id),'lost old route for '+old.id);historicalCombinations++;return;}
   const [[key,values],...rest]=pairs;
   for(const v of values)visits(rest,{...picks,[key]:v});
  };
  visits(Object.entries(old.traits).filter(([,values])=>values.length));
 }
 photoReferencesPreserved=photoReferences;
 assert.equal(photoReferences,514);
 for(const [id,picks] of newlyValid)assert(!results(picks,prior).includes(id),'before-state unexpectedly passed: '+id);
}
console.log(JSON.stringify({
 pass:true,scored:112,totalLearner:169,provisional:57,
 correctedSpecies:Object.keys(expectedAdditions),scoringStatesAdded:7,
 regressions: newlyValid.length,negativeControls:incompatible.length,unknownRetained:true,
 baselineChecked,historicalCombinationsRetained:historicalCombinations,
 photoReferencesPreserved
},null,2));
