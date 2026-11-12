'use strict';
// Integration QA for the Hays Grass ID Lab. Executes production currentResults().
// Keep provisional literature records OUT of scoring until admission is approved.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const lab = path.join(root, 'site/visual-key-lab');
const read = f => fs.readFileSync(path.join(lab, f), 'utf8');
const shards = ['a','b','c1','c2','c3','d1','d2','d3','d4'];
const species = shards.flatMap(s => JSON.parse(read('species-' + s + '.json')));
const candidates = JSON.parse(read('hays-candidates.json')).candidates;
const allIds = [...species, ...candidates].map(s => s.id);
assert.equal(species.length, 112, 'scored inventory changes require an evidence-backed admission and test update');
assert.equal(candidates.length, 57, 'provisional inventory changed without reconciliation');
assert.equal(new Set(allIds).size, 169, 'duplicate IDs / unexpected inventory total');
assert(candidates.every(c => c.status === 'RESEARCH_CANDIDATE_NOT_RELEASED'), 'unreviewed candidate released');
const originalPhotos = species.reduce((sum, s) => sum + s.photos.length, 0);
assert.equal(originalPhotos, 514, 'first-pass scored photo reference inventory unexpectedly changed');

const html = read('index.html');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, 'production inline script not located');
const script = scriptMatch[1];
new vm.Script(script); // production syntax
const functionStart = script.indexOf('function currentResults()');
const functionEnd = script.indexOf('\nfunction renderTabs', functionStart);
assert(functionStart >= 0 && functionEnd > functionStart, 'production filter boundary changed');
const ctx = {state:{species, selected:{}, range:'all', query:''}};
vm.createContext(ctx);
vm.runInContext(script.slice(functionStart,functionEnd), ctx);
const start = script.indexOf('const qs=');
const end = script.indexOf('const state=',start);
assert(start >= 0 && end > start, 'question mapping boundary changed');
const opts = {};
vm.createContext(opts);
vm.runInContext(script.slice(start,end) + ';globalThis.questions=qs;',opts);
const allowed = Object.fromEntries(opts.questions.map(q => [q.id,new Set(q.options.map(o=>o[0]))]));
for (const s of species) for (const [trait,values] of Object.entries(s.traits)) {
  assert(allowed[trait], s.id + ': unknown trait ' + trait);
  for (const v of values) assert(allowed[trait].has(v), s.id + ': invalid ' + trait + '=' + v);
}
const results = (picks, rows=species) => {
  ctx.state.species = rows;
  ctx.state.selected = picks;
  return Array.from(ctx.currentResults(), r => r.s.id);
};
// All already-supported complete character combinations must still find the plant.
let coveredCombinations=0;
for(const s of species) {
  const visit=(entries,picks={})=>{
    if(!entries.length){
      assert(results(picks).includes(s.id), s.id + ': original-supported combination excluded');
      coveredCombinations++;
      return;
    }
    const [[trait,values],...rest]=entries;
    for(const v of values) visit(rest,{...picks,[trait]:v});
  };
  visit(Object.entries(s.traits).filter(([,v]) => v.length > 0));
}
const positives = [
  ['Lindheimer visible awn narrow',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},['muhlenbergia-lindheimeri']],
  ['Lindheimer visible awn airy',{head:'airy',habit:'tuft',ligule:'membrane',awns:'long'},['muhlenbergia-lindheimeri','muhlenbergia-reverchonii']],
  ['nimblewill small tuft',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},['muhlenbergia-schreberi']],
  ['aparejo small tuft',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['muhlenbergia-utilis']],
  ['nimblewill rooting mat',{habit:'mat',ligule:'membrane',awns:'long'},['muhlenbergia-schreberi']],
  ['aparejo rhizome',{habit:'rhizome',ligule:'membrane'},['muhlenbergia-utilis']],
  ['red and sand lovegrass foliage',{habit:'tuft',ligule:'hairs'},['eragrostis-secundiflora','eragrostis-trichodes']],
  ['red lovegrass compact',{head:'compact',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['eragrostis-secundiflora']],
  ['open red and sand lovegrass',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['eragrostis-secundiflora','eragrostis-trichodes']],
  ['canyon hybrid airy',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['muhlenbergia-x-involuta']],
  ['little bluestem short rhizome',{head:'short_racemes',habit:'rhizome',ligule:'membrane',awns:'long'},['schizachyrium-scoparium']],
  ['sandbur inner membrane',{head:'burrs',habit:'tuft',ligule:'membrane',awns:'burs'},['cenchrus-spinifex']],
  ['sandbur rooted mat with hairs',{head:'burrs',habit:'mat',ligule:'hairs',awns:'burs'},['cenchrus-spinifex']],
  ['sandbur rooted mat membrane',{head:'burrs',habit:'mat',ligule:'membrane',awns:'burs'},['cenchrus-spinifex']],
  ['knotroot bristlegrass tuft',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'},['setaria-parviflora']],
  ['southwestern bristlegrass membrane',{head:'foxtail',habit:'tuft',ligule:'membrane',awns:'bristles'},['setaria-scheelei']],
  ['Reverchon bristles membrane',{head:'sparse_bristles',habit:'tuft',ligule:'membrane',awns:'bristles'},['setaria-reverchonii']],
  ['Reverchon unresolved bristles rhizome',{head:'sparse_bristles',habit:'rhizome',ligule:'hairs',awns:'none_obvious'},['setaria-reverchonii']],
  ['Reverchon unresolved bristles tuft',{head:'sparse_bristles',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['setaria-reverchonii']],
  ['plains lovegrass tuft',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['eragrostis-intermedia']],
  ['plains lovegrass rhizome',{head:'airy',habit:'rhizome',ligule:'hairs',awns:'none_obvious'},['eragrostis-intermedia']],
  ['mourning lovegrass',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['eragrostis-lugens']]
];
for(const [label,picks,expected] of positives) for(const id of expected)
  assert(results(picks).includes(id), label + ': false exclusion of ' + id);
const negatives = [
  [{awns:'three'},'muhlenbergia-lindheimeri'],
  [{head:'burrs'},'eragrostis-trichodes'],
  [{head:'short_racemes',habit:'mat'},'schizachyrium-scoparium'],
  [{head:'burrs',awns:'bristles'},'cenchrus-spinifex'],
  [{awns:'long'},'setaria-parviflora'],
  [{awns:'long'},'setaria-scheelei'],
  [{awns:'long'},'setaria-reverchonii'],
  [{awns:'burs'},'setaria-parviflora'],
  [{awns:'burs'},'setaria-scheelei'],
  [{awns:'burs'},'setaria-reverchonii'],
  [{awns:'long'},'eragrostis-lugens'],
  [{head:'foxtail'},'eragrostis-intermedia']
];
for(const [picks,id] of negatives) assert(!results(picks).includes(id),'false inclusion of ' + id);
const unknown={id:'unknown-test-fixture',common:'Unknown',scientific:'Unknown',traits:{},range:'UNRESOLVED'};
assert.deepEqual(results({ligule:'membrane'},[unknown]),['unknown-test-fixture'], 'unknown must not be hard-excluded');
const provisionalIds = new Set(candidates.map(c => c.id));
assert(!results({}).some(id => provisionalIds.has(id)), 'provisional species leaked into scored results');
console.log(JSON.stringify({pass:true,scored:species.length,provisional:candidates.length,total:allIds.length,
  originalPhotoReferences:originalPhotos,wholeCharacterCombinations:coveredCombinations,
  positiveScenarios:positives.length,negativeControls:negatives.length,
  provisionalScoringBlocked:true,unknownStatePreserved:true},null,2));
