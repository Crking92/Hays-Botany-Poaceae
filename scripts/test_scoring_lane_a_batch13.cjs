'use strict';
// Lane A Batch 13: tall grama taxonomic-source uncertainty, no speculative score admission.
// Run: node scripts/test_scoring_lane_a_batch13.cjs
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
assert.equal(species.reduce((n,s)=>n+s.photos.length,0),514);
const target=species.find(s=>s.id==='bouteloua-pectinata');
assert(target);
assert.deepEqual(target.traits,{head:['combs'],habit:['tuft'],ligule:['hairs'],awns:['none_obvious']});
assert(target.character_evidence.ligule.source.includes('Hagenbuch & Lemke'));
assert(target.character_evidence.ligule.source.includes('Flora of North America'));
assert(target.character_evidence.ligule.status.includes('SPECIMEN_PENDING'));
assert.equal(target.character_evidence.ligule.reported_states.length,2);
assert(target.character_evidence.awns.status.includes('DISSECTION_PENDING'));
assert.equal(target.character_evidence.awns.reported_states.length,2);
assert(target.field_rule.includes('NOT truly awnless'));
const html=read(dir+'index.html');
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert(script);
new vm.Script(script[1]);
const scope={state:{species,selected:{},range:'all',query:''}};
vm.createContext(scope);
vm.runInContext(script[1].slice(script[1].indexOf('function currentResults()'),script[1].indexOf('\nfunction renderTabs')),scope);
assert.equal(typeof scope.currentResults,'function');
function matches(picks,rows=species){
  scope.state.selected=picks;scope.state.species=rows;
  return Array.from(scope.currentResults(),r=>r.s.id);
}
const positive=[
 {head:'combs',habit:'tuft',ligule:'hairs',awns:'none_obvious'},
 {head:'combs',ligule:'hairs'},
 {head:'combs',habit:'tuft'}
];
for(const picks of positive)assert(matches(picks).includes(target.id),'tall grama lost: '+JSON.stringify(picks));
const unsupported=[{head:'foxtail'},{head:'whorls'},{habit:'rhizome'},{ligule:'absent'},{awns:'long'},{awns:'three'}];
for(const picks of unsupported)assert(!matches(picks).includes(target.id),'unsupported current tall grama state: '+JSON.stringify(picks));
const unknown={id:'unknown',scientific:'Unknown',common:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(matches({head:'combs',ligule:'hairs'},[unknown]),['unknown']);
console.log(JSON.stringify({pass:true,scored:112,provisional:57,inventory:169,scoredPhotoReferences:514,
 evidenceAudited:'bouteloua-pectinata',newScoringStates:0,positivePaths:positive.length,
 unsupportedPaths:unsupported.length,unknownNotHardExcluded:true,stillHeld:['tall grama true ligule','attached fertile-floret awns']},null,2));
