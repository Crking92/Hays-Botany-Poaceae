// Lane B regression suite. Run: node scripts/test_grass_sprint_lane_b.cjs
// These assertions intentionally expose two false exclusions on pre-fix main.
// Source: Hagenbuch & Lemke (2015), pp. 59 and 64 (printed), species accounts
// for Poa arachnifera and Sporobolus compositus.
// Do not merge with failing assertions. See Issue #70 for shard ownership.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const lab = path.join(root,'site','visual-key-lab');
const shards = ['a','b','c1','c2','c3','d1','d2','d3','d4'];
const scored = shards.flatMap(shard=>JSON.parse(fs.readFileSync(path.join(lab,'species-'+shard+'.json'),'utf8')));
const byId = id => {
  const record = scored.find(s=>s.id===id);
  assert(record, 'Missing species: '+id);
  return record;
};
assert.equal(scored.length,112);
assert.equal(new Set(scored.map(s=>s.id)).size,112);
const provisional = JSON.parse(fs.readFileSync(path.join(lab,'hays-candidates.json'),'utf8')).candidates;
assert.equal(provisional.length,57);
assert.equal(new Set([...scored,...provisional].map(s=>s.id)).size,169);
const html = fs.readFileSync(path.join(lab,'index.html'),'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script,'Missing inline scorer');
new vm.Script(script);
const start=script.indexOf('function currentResults()');
const end=script.indexOf('\nfunction renderTabs',start);
assert(start>=0 && end>start,'Production filter was not located');
const context={state:{species:scored,selected:{},range:'all',query:''}};
vm.createContext(context);
vm.runInContext(script.slice(start,end),context);
const results = picks => {
  context.state.selected=picks;
  return context.currentResults().map(item=>item.s.id);
};
const mustKeep = [
 ['Texas bluegrass: tufted above slender rhizomes',
  {head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'},'poa-arachnifera'],
 ['Texas bluegrass: exposed underground stem',
  {head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane'},'poa-arachnifera'],
 ['Composite dropseed: scaly rhizomes present',
  {head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},'sporobolus-compositus'],
 ['Composite dropseed: solitary or small clump',
  {head:'compact',habit:'tuft',ligule:'hairs',awns:'none_obvious'},'sporobolus-compositus'],
 ['Two Poa species overlap in tufted compact flowering form',
  {head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'},'poa-annua'],
];
for(const [label,picks,id] of mustKeep){
  assert(results(picks).includes(id),label+' falsely excludes '+id);
}
assert(!results({habit:'rhizome'}).includes('poa-annua'),
 'Annual bluegrass must not be inferred rhizomatous from its tuft');
assert(!results({habit:'rhizome'}).includes('phalaris-caroliniana'),
 'Annual Carolina canarygrass is not rhizomatous');
assert(!results({awns:'three'}).includes('sporobolus-compositus'),
 'Dropseed lacks the three long awns of Aristida');
assert(!results({head:'burrs'}).includes('poa-arachnifera'),
 'Texas bluegrass has panicles, not sandbur-type burs');
const unknown={id:'fixture-unknown',scientific:'Unknown',common:'Unknown',range:'UNRESOLVED',traits:{}};
context.state.species=[unknown];
assert.deepEqual(Array.from(results({habit:'rhizome',ligule:'membrane',head:'airy'})),['fixture-unknown'],
 'Missing data cannot be treated as anatomical absence');
context.state.species=scored;
// Source-conflict/unknown documentation must stay attached rather than be erased.
assert(byId('poa-arachnifera').character_evidence,'Retain bluegrass evidence');
assert(byId('sporobolus-compositus').character_evidence || byId('sporobolus-compositus').broad_group_screened,
 'Retain dropseed evidence');
console.log(JSON.stringify({pass:true,scored:112,inventory:169,provisional:57,
 positivePaths:mustKeep.length,negativePaths:4,unknownRetention:true},null,2));
