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
  ['mourning lovegrass',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['eragrostis-lugens']],
  // Lane B — #71: previously excluded regional growth forms.
  ['Texas bluegrass rhizomes hidden',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['poa-arachnifera']],
  ['Texas bluegrass rhizome exposed',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane'},['poa-arachnifera']],
  ['composite dropseed true rhizome',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['sporobolus-compositus']],
  ['composite dropseed tuft',{head:'compact',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['sporobolus-compositus']],
  ['Canada wildrye usual tuft',{head:'spike',habit:'tuft',ligule:'membrane',awns:'long'},['elymus-canadensis']],
  ['Canada wildrye occasional short rhizome',{head:'spike',habit:'rhizome',ligule:'membrane',awns:'long'},['elymus-canadensis']],
  ['two Poa species overlapping',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['poa-annua']],
  // Lane C — #75: long-lived false-exclusion regression controls.
  ['fall witchgrass rhizome wiry',{head:'wiry',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['digitaria-cognata']],
  ['fall witchgrass rhizome airy',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['digitaria-cognata']],
  ['broomsedge true ciliate ligule',{head:'short_racemes',habit:'tuft',ligule:'hairs',awns:'long'},['anatherum-virginicum']],
  ['cedar panicgrass minute membrane',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['dichanthelium-pedicellatum']],
  ['rice cutgrass aboveground tuft',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['leersia-oryzoides']],
  ['common reed dense tuft membrane',{head:'reed_plume',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['phragmites-australis']],
  ['common reed true rhizome hair fringe',{head:'reed_plume',habit:'rhizome',ligule:'hairs',awns:'none_obvious'},['phragmites-australis']],
  ['common reed tuft hair fringe',{head:'reed_plume',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['phragmites-australis']],
  ['southern wildrice wetland clump',{head:'aquatic_mixed',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['zizaniopsis-miliacea']],
  ['southern wildrice airy clump',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['zizaniopsis-miliacea']],
  ['brownseed signalgrass ciliate membrane tuft',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['urochloa-fusca']],
  ['brownseed signalgrass ciliate membrane mat',{head:'one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'},['urochloa-fusca']],
  // Source conflict — neither historic Hopia growth-form path may be silently erased.
  ['Hopia aboveground stolon pathway',{habit:'mat',head:'long_narrow_panicle'},['hopia-obtusa']],
  ['Hopia historical rhizome pathway',{habit:'rhizome',head:'long_narrow_panicle'},['hopia-obtusa']],
  // Lane C #83 — alternate Hill Country growth forms and unilateral branch counts.
  ['tobosa true visible tuft',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['hilaria-mutica']],
  ['kleingrass hair fringe tuft',{head:'airy',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['panicum-coloratum']],
  ['kleingrass hair fringe rhizome',{head:'airy',habit:'rhizome',ligule:'hairs',awns:'none_obvious'},['panicum-coloratum']],
  ['vaseygrass exposed rhizome many side branches',{head:'many_one_sided',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['paspalum-urvillei']],
  ['vaseygrass exposed rhizome fewer side branches',{head:'one_sided',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['paspalum-urvillei']],
  ['Dinebra numerous unilateral branches',{head:'many_one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['dinebra-panicea-subsp-mucronata']],
  ['browntop signalgrass numerous one-sided tuft',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['urochloa-fusca']],
  ['browntop signalgrass numerous one-sided mat',{head:'many_one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'},['urochloa-fusca']],
  ['creeping signalgrass numerous one-sided tuft',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['urochloa-reptans']],
  ['creeping signalgrass numerous one-sided mat',{head:'many_one_sided',habit:'mat',ligule:'hairs',awns:'none_obvious'},['urochloa-reptans']],
  // Lane C #91 — preserve branch count and compact panicle alternatives.
  ['Texas cupgrass 7-plus unilateral branches',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['eriochloa-sericea']],
  ['vine mesquite narrow one-sided branches mat',{head:'one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'},['hopia-obtusa']],
  ['vine mesquite narrow one-sided branches rhizome',{head:'one_sided',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['hopia-obtusa']],
  ['rabbitfoot long cylindrical flowering panicle',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},['polypogon-monspeliensis']],
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
  [{head:'foxtail'},'eragrostis-intermedia'],
  // Lane B/C — protect the rejected alternatives as well as permitted paths.
  [{habit:'rhizome'},'poa-annua'],
  [{habit:'rhizome'},'phalaris-caroliniana'],
  [{habit:'rhizome'},'elymus-virginicus'],
  [{habit:'rhizome'},'hordeum-pusillum'],
  [{awns:'three'},'sporobolus-compositus'],
  [{head:'burrs'},'poa-arachnifera'],
  [{habit:'mat',head:'wiry'},'digitaria-cognata'],
  [{awns:'bristles',head:'short_racemes'},'anatherum-virginicum'],
  [{head:'reed_plume',ligule:'absent'},'phragmites-australis'],
  [{head:'one_sided',ligule:'absent'},'urochloa-fusca'],
  [{head:'aquatic_mixed',awns:'long'},'zizaniopsis-miliacea'],
  // Lane C #83 — no generalized over-admission from expanded head/habit choices.
  [{habit:'mat'},'hilaria-mutica'],
  [{ligule:'absent'},'panicum-coloratum'],
  [{head:'fingers'},'urochloa-reptans'],
  [{head:'foxtail'},'dinebra-panicea-subsp-mucronata'],
  // Lane C #91 — don't conflate unilateral branches and true spikes or awns.
  [{head:'fingers'},'eriochloa-sericea'],
  [{head:'fingers'},'hopia-obtusa'],
  [{head:'spike'},'hopia-obtusa'],
  [{head:'spike'},'polypogon-monspeliensis'],
  [{awns:'bristles'},'polypogon-monspeliensis'],
  [{habit:'mat'},'paspalum-urvillei'],
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
