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

const trialProfileFiles = ['provisional-trial-profiles.json','provisional-trial-batch2.json','provisional-trial-batch3.json','provisional-trial-batch4.json','provisional-trial-batch5-a.json','provisional-trial-batch5-b.json','provisional-trial-batch5-c.json'];
const trialProfiles = trialProfileFiles.flatMap(f => JSON.parse(read(f)).profiles);
const trialCount = trialProfiles.length;
const learnerOnlyCount = candidates.length - trialCount;
assert.equal(new Set(trialProfiles.map(x=>x.id)).size, trialCount, 'Duplicate trial-profile identifiers');
assert.equal(trialCount, 53, 'Combined Batch 5 should add exactly 29 unverified research trials');
const html = read('index.html');
assert(html.includes('id="coded-total"')&&html.includes('$("coded-total").textContent=state.species.length'),
 'Public key count must follow loaded scoring and research-trial data');
assert(trialProfileFiles.every(file => html.includes(file))&&trialCount===53,
 'All 53 research trials must load in the normal key while staying unverified');
assert(html.includes('pending.length+" grasses not yet included in this photo key"')&&learnerOnlyCount===4,
 'All 4 held Learner-only records must be reported without developer banners');
const newProfiles=trialProfiles.slice(24);
assert.equal(newProfiles.length,29,'All 29 reviewed lane profiles must remain research-only');
const byCandidate=new Map(candidates.map(c=>[c.id,c]));
assert.equal(newProfiles.reduce((sum,p)=>sum+p.photos.length,0),75,'Exact 75 approved Batch 5 photo references changed');
for(const p of newProfiles) {
 assert(p.trial===true&&p.admission_status==='RESEARCH_TRIAL_NOT_ADMITTED'&&p.range==='UNVERIFIED',p.id+': incorrectly admitted');
 const original=byCandidate.get(p.id);
 assert(original,'New profile not in unified 169-grass Learner: '+p.id);
 assert.equal(p.photos.length,original.approved_gallery.length,p.id+': photo count changed');
 p.photos.forEach((photo,i)=>{
  const copy={...photo}; delete copy.i;
  assert.deepEqual(copy,original.approved_gallery[i],p.id+': exact per-photo source, creator, license or caption changed');
 });
}
assert(!html.includes('Phase 3 in progress:')&&!html.includes('Field-testing prototype:'),
 'Internal project progress banners should not appear on the visitor identification page');
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
  ['Little bluestem short fertile awn, no obvious long projection',{head:'short_racemes',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['schizachyrium-scoparium']],
  ['Little bluestem short rhizome and short awn',{head:'short_racemes',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['schizachyrium-scoparium']],
  ['Texas brome genuine short lemma awn without long projection',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['bromus-texensis']],
  ['Male buffalograss unilateral combs',{head:'one_sided',habit:'mat',ligule:'hairs',awns:'none_obvious'},['bouteloua-dactyloides']],
  ['Blue grama unilateral combs',{head:'one_sided',habit:'tuft',ligule:'hairs',awns:'three_short'},['bouteloua-gracilis']],
  ['Hairy grama unilateral combs',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'three_short'},['bouteloua-hirsuta']],
  ['Tall grama unilateral combs',{head:'one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['bouteloua-pectinata']],
  ['Red grama unilateral combs',{head:'one_sided',habit:'rhizome',ligule:'hairs',awns:'three_short'},['bouteloua-trifida']],
  ['Tumble windmillgrass unilateral branches',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'long'},['chloris-verticillata']],
  ['Tumble windmillgrass 7+ one-sided branches',{head:'many_one_sided',habit:'mat',ligule:'hairs',awns:'long'},['chloris-verticillata']],
  ['Feather fingergrass unilateral branches',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'long'},['chloris-virgata']],
  ['Feather fingergrass 7+ one-sided branches',{head:'many_one_sided',habit:'mat',ligule:'hairs',awns:'long'},['chloris-virgata']],
  ['Foxtail millet fringed-membrane field path',{head:'foxtail',habit:'tuft',ligule:'membrane',awns:'bristles'},['setaria-italica']],
  ['Little barley short awns without obvious long projections',{head:'spike',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['hordeum-pusillum']],
  ['Hairy woodland brome short awns without obvious long projections',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['bromus-pubescens']],
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
  // Lane B #92 — contracted panicles should not hide these established grasses.
  ['Indiangrass narrow plume tuft',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},['sorghastrum-nutans']],
  ['Indiangrass narrow plume rhizome',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'long'},['sorghastrum-nutans']],
  ['switchgrass contracted large panicle rhizome',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['panicum-virgatum']],
  ['switchgrass contracted large panicle tuft',{head:'long_narrow_panicle',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['panicum-virgatum']],
  // Lane A #93 — rooted low forms and short rhizomes in blue grama.
  ['blue grama visible short rhizome short awn',{head:'combs',habit:'rhizome',ligule:'hairs',awns:'three_short'},['bouteloua-gracilis']],
  ['blue grama visible short rhizome no awn',{head:'combs',habit:'rhizome',ligule:'hairs',awns:'none_obvious'},['bouteloua-gracilis']],
  ['blue grama low rooted sod short awn',{head:'combs',habit:'mat',ligule:'hairs',awns:'three_short'},['bouteloua-gracilis']],
  ['blue grama low rooted sod no awn',{head:'combs',habit:'mat',ligule:'hairs',awns:'none_obvious'},['bouteloua-gracilis']],
  // Lane B #95 — seven-or-more unilateral branches can be barnyardgrass.
  ['barnyardgrass seven unilateral branches long awns',{head:'many_one_sided',habit:'tuft',ligule:'absent',awns:'long'},['echinochloa-crus-galli']],
  ['barnyardgrass seven unilateral branches no obvious awn',{head:'many_one_sided',habit:'tuft',ligule:'absent',awns:'none_obvious'},['echinochloa-crus-galli']],
  ['barnyardgrass seven unilateral branches unmeasured crown',{head:'many_one_sided',ligule:'absent'},['echinochloa-crus-galli']],
  // Lane A #96 — narrow panicle and genuinely short condensed rhizomes.
  ['Texas wintergrass narrow panicle tuft absent ligule',{head:'long_narrow_panicle',habit:'tuft',ligule:'absent',awns:'long'},['nassella-leucotricha']],
  ['Texas wintergrass narrow panicle tuft membrane',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},['nassella-leucotricha']],
  ['Texas wintergrass open panicle short rhizome absent ligule',{head:'airy',habit:'rhizome',ligule:'absent',awns:'long'},['nassella-leucotricha']],
  ['Texas wintergrass open panicle short rhizome membrane',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'long'},['nassella-leucotricha']],
  ['Texas wintergrass narrow panicle rhizome membrane',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'long'},['nassella-leucotricha']],
  // Lane C #99 — reproductive stage and genuine crown/ligule variation.
  ['Mediterranean brome immature compact panicle',{head:'compact',habit:'tuft',ligule:'membrane',awns:'long'},['bromus-lanceolatus']],
  ['white tridens rhizome ciliate ligule',{head:'compact',habit:'rhizome',ligule:'hairs',awns:'none_obvious'},['tridens-albescens']],
  ['white tridens rhizome inner membrane',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['tridens-albescens']],
  ['white tridens tuft inner membrane',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['tridens-albescens']],
  ['purpletop rhizome membranous collar',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['tridens-flavus']],
  ['purpletop rhizome ciliate ligule',{head:'airy',habit:'rhizome',ligule:'hairs',awns:'none_obvious'},['tridens-flavus']],
  // Lane A #102 — documented conflict-aware Texas grama / knotroot collar options.
  ['Texas grama short rhizome tiny membrane',{head:'short_side_racemes',habit:'rhizome',ligule:'membrane',awns:'three_short'},['bouteloua-rigidiseta']],
  ['Texas grama short rhizome cilia',{head:'short_side_racemes',habit:'rhizome',ligule:'hairs',awns:'none_obvious'},['bouteloua-rigidiseta']],
  ['Texas grama tuft visible membrane',{head:'short_side_racemes',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['bouteloua-rigidiseta']],
  ['knotroot bristlegrass actual membrane exposed',{head:'foxtail',habit:'tuft',ligule:'membrane',awns:'bristles'},['setaria-parviflora']],
  // Lane B #101 — unilateral, subdigitate and whorled answers.
  ['green sprangletop many unilateral',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['disakisperma-dubium']],
  ['green sprangletop near-terminal fingers',{head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['disakisperma-dubium']],
  ['southern crabgrass unilateral fingers',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['digitaria-ciliaris']],
  ['southern crabgrass seven plus branches',{head:'many_one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'},['digitaria-ciliaris']],
  ['southern crabgrass stacked whorls',{head:'whorls',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['digitaria-ciliaris']],
  ['Texas signalgrass seven unilateral hair fringe',{head:'many_one_sided',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['urochloa-texana']],
  ['Texas signalgrass seven unilateral ciliate membrane',{head:'many_one_sided',habit:'mat',ligule:'membrane',awns:'none_obvious'},['urochloa-texana']],
  // Lane C #104 — paired Paspalum racemes and legitimate collar/head appearances.
  ['Texas fescue large-spikelet open brome-style head',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['festuca-versuta']],
  ['nimblewill mat with ciliate inner ligule',{head:'long_narrow_panicle',habit:'mat',ligule:'hairs',awns:'none_obvious'},['muhlenbergia-schreberi']],
  ['nimblewill rooted tuft with ciliate inner ligule',{head:'long_narrow_panicle',habit:'tuft',ligule:'hairs',awns:'long'},['muhlenbergia-schreberi']],
  ['thin paspalum paired racemes tuft',{head:'paired_spikes',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['paspalum-setaceum']],
  ['thin paspalum paired racemes rhizome',{head:'paired_spikes',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['paspalum-setaceum']],
  // Lane A #107 — hairy grama low-rooting form, Chloris ciliate membranes.
  ['hairy grama digitate tuft',{head:'fingers',habit:'tuft',ligule:'hairs',awns:'three_short'},['bouteloua-hirsuta']],
  ['hairy grama comb rooting mat',{head:'combs',habit:'mat',ligule:'membrane',awns:'none_obvious'},['bouteloua-hirsuta']],
  ['hairy grama digitate rooting mat',{head:'fingers',habit:'mat',ligule:'hairs',awns:'none_obvious'},['bouteloua-hirsuta']],
  ['tumble windmillgrass ciliate ligule tuft',{head:'whorls',habit:'tuft',ligule:'hairs',awns:'long'},['chloris-verticillata']],
  ['feather fingergrass ciliate ligule tuft',{head:'fingers',habit:'tuft',ligule:'hairs',awns:'long'},['chloris-virgata']],
  // Lane B #106 — hooded windmillgrass has unilateral rays and cilia.
  ['hooded windmillgrass unilateral ray',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['chloris-cucullata']],
  ['hooded windmillgrass 7-plus rays',{head:'many_one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['chloris-cucullata']],
  ['hooded windmillgrass 7-plus with cilia',{head:'many_one_sided',habit:'mat',ligule:'hairs',awns:'none_obvious'},['chloris-cucullata']],
  ['hooded windmillgrass whorls with cilia',{head:'whorls',habit:'tuft',ligule:'hairs',awns:'none_obvious'},['chloris-cucullata']],
  // Lane B #110 - valid goosegrass branch-count and flattened unilateral racemes.
  ['goosegrass classic fingers',{head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['eleusine-indica']],
  ['goosegrass one-sided rows',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['eleusine-indica']],
  ['goosegrass 7-plus branches',{head:'many_one_sided',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['eleusine-indica']],
  // Lane C #111 - distinct open panicle/inner ligule visual choices.
  ['Texas brome few large multiflowered spikelets',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'long'},['bromus-texensis']],
  ['slender Indiangrass narrow sparse long awned head',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'},['sorghastrum-elliottii']],
  ['hidden dropseed ciliate membrane compact',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['sporobolus-clandestinus']],
  ['hidden dropseed ciliate membrane narrow',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['sporobolus-clandestinus']],
  // Lane B #126 — short ciliate inner ligule and rare 3–4 knotgrass racemes.
  ['plains lovegrass tuft true short membrane',{head:'airy',habit:'tuft',ligule:'membrane',awns:'none_obvious'},['eragrostis-intermedia']],
  ['plains lovegrass rhizome true short membrane',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['eragrostis-intermedia']],
  ['knotgrass occasional near-terminal fingers mat',{head:'fingers',habit:'mat',ligule:'membrane',awns:'none_obvious'},['paspalum-distichum']],
  ['knotgrass occasional near-terminal fingers rhizome',{head:'fingers',habit:'rhizome',ligule:'membrane',awns:'none_obvious'},['paspalum-distichum']],
  // Lane B #132 — solitary unilateral tanglehead raceme before awns twist.
  ['tanglehead one-sided raceme with membrane',{head:'one_sided',habit:'tuft',ligule:'membrane',awns:'long'},['heteropogon-contortus']],
  ['tanglehead one-sided raceme with cilia',{head:'one_sided',habit:'tuft',ligule:'hairs',awns:'long'},['heteropogon-contortus']],
  ['tanglehead one-sided head with collar unanswered',{head:'one_sided'},['heteropogon-contortus']],
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
  // Lane B / Lane A — no false spike, bristle, or habitat-shape inference.
  [{head:'long_narrow_panicle',awns:'long'},'panicum-virgatum'],
  [{awns:'bristles'},'sorghastrum-nutans'],
  [{head:'long_narrow_panicle'},'poa-annua'],
  [{head:'long_narrow_panicle'},'dichanthelium-oligosanthes'],
  [{head:'whorls'},'bouteloua-gracilis'],
  [{awns:'burs'},'bouteloua-gracilis'],
  // This branched Paniceae grass must not be confused with true spikes or bristles.
  // Goosegrass has 1–10(-17) unilateral racemes (Kew GrassBase), so not a valid negative.
  // Carolina canarygrass retains a true compact panicle rather than seven unilateral branches.
  [{head:'many_one_sided'},'phalaris-caroliniana'],
  [{head:'many_one_sided'},'elymus-canadensis'],
  [{head:'many_one_sided',awns:'bristles'},'echinochloa-crus-galli'],
  // Lane A/C — don't turn conditional morphology into every growth form.
  [{head:'foxtail'},'nassella-leucotricha'],
  [{awns:'three'},'nassella-leucotricha'],
  [{habit:'mat'},'nassella-leucotricha'],
  [{head:'foxtail'},'bromus-lanceolatus'],
  [{habit:'mat'},'tridens-albescens'],
  [{ligule:'absent'},'tridens-albescens'],
  [{habit:'mat'},'tridens-flavus'],
  [{head:'long_narrow_panicle',habit:'mat'},'tridentopsis-mutica'],
  // Keep conditional source evidence from hard-coding other heads or false organs.
  [{head:'combs'},'bouteloua-rigidiseta'],
  [{habit:'mat'},'bouteloua-rigidiseta'],
  [{head:'burrs'},'setaria-parviflora'],
  [{awns:'burs'},'setaria-parviflora'],
  [{head:'many_one_sided',awns:'long'},'digitaria-ciliaris'],
  [{head:'many_one_sided',awns:'long'},'urochloa-texana'],
  [{head:'fingers',awns:'bristles'},'disakisperma-dubium'],
  [{head:'many_one_sided'},'hordeum-pusillum'],
  [{head:'whorls'},'elymus-canadensis'],
  // Lane C #104 — conditional broad choices are not exclusive diagnostics.
  [{head:'foxtail'},'festuca-versuta'],
  [{awns:'long'},'festuca-versuta'],
  [{ligule:'absent'},'muhlenbergia-schreberi'],
  [{habit:'rhizome'},'muhlenbergia-schreberi'],
  [{head:'spike'},'paspalum-setaceum'],
  [{head:'many_one_sided'},'paspalum-setaceum'],
  // Hairy grama and Chloris do not acquire unrelated floral architecture.
  [{head:'whorls'},'bouteloua-hirsuta'],
  [{habit:'rhizome'},'bouteloua-hirsuta'],
  [{head:'fingers'},'chloris-verticillata'],
  [{head:'whorls'},'chloris-virgata'],
  [{head:'foxtail'},'chloris-cucullata'],
  [{head:'spike'},'chloris-cucullata'],
  [{ligule:'absent'},'chloris-cucullata'],
  [{awns:'bristles'},'chloris-cucullata'],
  [{habit:'mat'},'paspalum-urvillei'],
  // Retain incompatible alternatives without mistaking valid 7+ goosegrass for false.
  [{head:'foxtail'},'eleusine-indica'],
  [{awns:'bristles'},'eleusine-indica'],
  [{ligule:'absent'},'eleusine-indica'],
  [{head:'spike'},'bromus-texensis'],
  [{head:'foxtail'},'sorghastrum-elliottii'],
  [{awns:'long'},'sporobolus-clandestinus'],
  // Don't misinterpret a short membrane as no ligule or occasional fingers as whorls.
  [{ligule:'absent'},'eragrostis-intermedia'],
  [{head:'fingers'},'eragrostis-intermedia'],
  [{head:'whorls'},'paspalum-distichum'],
  [{awns:'long'},'paspalum-distichum'],
  // Reject distinct branched-raceme and bristle states for tanglehead.
  [{head:'many_one_sided'},'heteropogon-contortus'],
  [{head:'fingers'},'heteropogon-contortus'],
  [{awns:'bristles'},'heteropogon-contortus'],
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
