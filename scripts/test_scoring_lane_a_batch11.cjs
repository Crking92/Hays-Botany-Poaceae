'use strict';
// Lane A Batch 11: self-contained actual-filter proof, independent of open Batch 10 tests.
// Run: node scripts/test_scoring_lane_a_batch11.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const dir = 'site/visual-key-lab/';
const shards = ['a','b','c1','c2','c3','d1','d2','d3','d4'];
const read = p=>fs.readFileSync(path.join(root,p),'utf8');
const files = Object.fromEntries(shards.map(n=>[n,JSON.parse(read(dir+'species-'+n+'.json'))]));
const species = shards.flatMap(n=>files[n]);
const candidates = JSON.parse(read(dir+'hays-candidates.json')).candidates;
assert.equal(species.length,112);
assert.equal(candidates.length,57);
assert.equal(new Set([...species,...candidates].map(s=>s.id)).size,169);
assert.equal(species.reduce((sum,s)=>sum+s.photos.length,0),514);
const id='andropogon-gerardi';
const target=species.find(s=>s.id===id);
assert(target);
assert.deepEqual(target.traits.ligule,['membrane','hairs']);
assert(target.character_evidence.ligule.source.includes('Hagenbuch & Lemke'));
assert(target.character_evidence.ligule.source.includes('GrassBase'));
assert(target.character_evidence.ligule.status.includes('SPECIMEN_PENDING'));
assert.equal(target.character_evidence.ligule.reported_states.length,2);
assert(target.field_rule.includes('TRUE ligule'));
const html=read(dir+'index.html');
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert(script,'production script missing');
new vm.Script(script[1]);
const scope={state:{species,selected:{},range:'all',query:''}};
vm.createContext(scope);
vm.runInContext(script[1].slice(script[1].indexOf('function currentResults()'),script[1].indexOf('\nfunction renderTabs')),scope);
assert.equal(typeof scope.currentResults,'function');
function resultIds(picks,rows=species){
 scope.state.selected=picks; scope.state.species=rows;
 return Array.from(scope.currentResults(),r=>r.s.id);
}
const before=structuredClone(species);
const old=before.find(s=>s.id===id);
old.traits.ligule=['membrane'];
const positive=[];
for(const habit of ['tuft','rhizome'])for(const awns of ['long','none_obvious'])positive.push({head:'fingers',habit,ligule:'hairs',awns});
for(const choices of positive){
 assert(!resultIds(choices,before).includes(id),'before state unexpectedly matched '+JSON.stringify(choices));
 assert(resultIds(choices).includes(id),'valid ciliate-membrane path excluded '+JSON.stringify(choices));
}
const negatives=[
 {head:'foxtail'},
 {head:'combs'},
 {habit:'mat'},
 {ligule:'absent'},
 {awns:'bristles'},
 {awns:'three'}
];
for(const choices of negatives)assert(!resultIds(choices).includes(id),'unsupported big-bluestem state admitted '+JSON.stringify(choices));
// Every preexisting completely specified route of all three exclusive Lane A shards remains eligible.
const own=shards.slice(0,3),ownIDs=new Set(own.flatMap(n=>files[n].map(s=>s.id)));
let historicalCombinations=0;
for(const oldRec of before.filter(s=>ownIDs.has(s.id))){
 const combinations=Object.entries(oldRec.traits);
 function walk(i,picks){
  if(i===combinations.length){
   assert(resultIds(picks).includes(oldRec.id),'previously valid route disappeared '+oldRec.id+' '+JSON.stringify(picks));
   historicalCombinations++;
   return;
  }
  const [key,values]=combinations[i];
  for(const value of values)walk(i+1,{...picks,[key]:value});
 }
 walk(0,{});
}
const unknown={id:'unknown',scientific:'Unknown',common:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(resultIds({head:'combs',ligule:'hairs'},[unknown]),['unknown']);
console.log(JSON.stringify({pass:true,scored:112,provisional:57,total:169,photoRefs:514,
 correctedSpecies:[id],addedStates:1,previouslyExcludedNowValid:positive.length,
 negativesRetained:negatives.length,earlierLaneACombinationsRetained:historicalCombinations,
 unknownStatesNotHardExcluded:true,specimenRightsGate:'not changed'},null,2));
