'use strict';
// Lane A botanical scoring regressions; run: node scripts/test_scoring_lane_a.cjs [baseline-ref]
// Additional controls preserve disputed buffalograss rhizomes without admitting any 57 provisional taxa.
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
 ['arundo-donax',{head:'reed_plume',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['sorghum-halepense',{head:'airy',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['sorghum-halepense',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['bothriochloa-barbinodis',{head:'fingers',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['bothriochloa-torreyana',{head:'bushy',habit:'rhizome',ligule:'membrane',awns:'long'}],
 ['bothriochloa-torreyana',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'long'}],
 ['bouteloua-gracilis',{head:'combs',habit:'rhizome',ligule:'hairs',awns:'three_short'}],
 ['bouteloua-gracilis',{head:'combs',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['bouteloua-gracilis',{head:'combs',habit:'mat',ligule:'hairs',awns:'three_short'}],
 ['bouteloua-gracilis',{head:'combs',habit:'mat',ligule:'hairs',awns:'none_obvious'}],
 ['nassella-leucotricha',{head:'long_narrow_panicle',habit:'tuft',ligule:'absent',awns:'long'}],
 ['nassella-leucotricha',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['nassella-leucotricha',{head:'airy',habit:'rhizome',ligule:'absent',awns:'long'}],
 ['nassella-leucotricha',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'long'}],
 ['nassella-leucotricha',{head:'long_narrow_panicle',habit:'rhizome',ligule:'membrane',awns:'long'}],
 ['bouteloua-rigidiseta',{head:'short_side_racemes',habit:'rhizome',ligule:'membrane',awns:'three_short'}],
 ['bouteloua-rigidiseta',{head:'short_side_racemes',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['bouteloua-rigidiseta',{head:'short_side_racemes',habit:'tuft',ligule:'membrane',awns:'three_short'}],
 ['bouteloua-rigidiseta',{head:'short_side_racemes',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['setaria-parviflora',{head:'foxtail',habit:'rhizome',ligule:'membrane',awns:'bristles'}],
 ['setaria-parviflora',{head:'foxtail',habit:'tuft',ligule:'membrane',awns:'bristles'}],
 ['bouteloua-hirsuta',{head:'fingers',habit:'tuft',ligule:'hairs',awns:'three_short'}],
 ['bouteloua-hirsuta',{head:'combs',habit:'mat',ligule:'membrane',awns:'none_obvious'}],
 ['bouteloua-hirsuta',{head:'fingers',habit:'mat',ligule:'hairs',awns:'none_obvious'}],
 ['chloris-verticillata',{head:'whorls',habit:'tuft',ligule:'hairs',awns:'long'}],
 ['chloris-verticillata',{head:'whorls',habit:'mat',ligule:'hairs',awns:'long'}],
 ['chloris-virgata',{head:'fingers',habit:'tuft',ligule:'hairs',awns:'long'}],
 ['chloris-virgata',{head:'fingers',habit:'mat',ligule:'hairs',awns:'long'}]
];
const incompatible=[
 ['chasmanthium-latifolium',{head:'fingers'}],
 ['andropogon-gerardi',{head:'burrs'}],
 ['hilaria-belangeri',{habit:'rhizome'}],
 ['aristida-oligantha',{head:'foxtail'}],
 ['arundo-donax',{habit:'mat'}],
 ['arundo-donax',{awns:'long'}],
 ['sorghum-halepense',{habit:'mat'}],
 ['bouteloua-curtipendula',{head:'side_oats',awns:'three_short'}],
 ['bothriochloa-barbinodis',{head:'whorls'}],
 ['bothriochloa-torreyana',{head:'fingers'}],
 ['bouteloua-gracilis',{head:'whorls'}],
 ['bouteloua-gracilis',{awns:'burs'}],
 ['nassella-leucotricha',{head:'foxtail'}],
 ['nassella-leucotricha',{awns:'three'}],
 ['nassella-leucotricha',{habit:'mat'}],
 ['bouteloua-rigidiseta',{head:'combs'}],
 ['bouteloua-rigidiseta',{habit:'mat'}],
 ['setaria-parviflora',{head:'burrs'}],
 ['setaria-parviflora',{awns:'burs'}],
 ['bouteloua-hirsuta',{head:'whorls'}],
 ['bouteloua-hirsuta',{habit:'rhizome'}],
 ['chloris-verticillata',{head:'fingers'}],
 ['chloris-virgata',{head:'whorls'}],
 ['chloris-verticillata',{awns:'burs'}],
 ['chloris-virgata',{awns:'burs'}]
];
for(const [id,picks] of newlyValid) assert(results(picks).includes(id),'false exclusion remains: '+id+' '+JSON.stringify(picks));
for(const [id,picks] of incompatible) assert(!results(picks).includes(id),'negative control leaked: '+id);
// Contradictory sources must not cause unverified rhizome states or correctly represented sex-specific heads to vanish.
const retainedDisputed=[
 ['bouteloua-dactyloides',{head:'burrs',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['bouteloua-dactyloides',{head:'combs',habit:'mat',ligule:'membrane',awns:'none_obvious'}]
];
for(const [id,picks] of retainedDisputed) assert(results(picks).includes(id),'disputed/sex-specific path dropped: '+id);
assert(specimenMap.get('bouteloua-dactyloides').character_evidence.growth_stems.reported_conflict?.length===2,'regional buffalo rhizome conflict must stay explicit');
assert(specimenMap.get('bothriochloa-torreyana').character_evidence.habit.reported_states?.length===2,'silver bluestem primary/regional specimen disagreement must remain explicit');
assert(specimenMap.get('nassella-leucotricha').character_evidence.habit.reported_states?.length===2,'wintergrass H&L/FNA versus UT condensed rhizome conflict must remain visible');
assert(specimenMap.get('nassella-leucotricha').character_evidence.head.reported_states?.length===2,'wintergrass FNA versus GrassBase head breadth variation must remain visible');
assert(specimenMap.get('bouteloua-rigidiseta').character_evidence.habit.reported_states?.length===2,'Texas grama no-rhizome versus UT short-rhizome conflict must be preserved');
assert(specimenMap.get('bouteloua-rigidiseta').character_evidence.ligule.reported_states?.length===2,'Texas grama hair fringe versus ciliate membrane disagreement must be preserved');
assert(specimenMap.get('setaria-parviflora').character_evidence.ligule.reported_states?.length===2,'Knotroot bristlegrass ligule tissue observations must be retained');
assert(specimenMap.get('bouteloua-hirsuta').character_evidence.habit.reported_states?.length===3,'Hairy grama H&L versus FNA surface-stem conflict must remain explicit');
assert(specimenMap.get('bouteloua-hirsuta').character_evidence.head.reported_states?.length===2,'Hairy grama Diggs versus FNA digitate variation must remain visible');
for(const id of ['chloris-verticillata','chloris-virgata'])assert(specimenMap.get(id).character_evidence.ligule.reported_states?.length===2,id+': ciliate membrane source observations absent');
const unknown={id:'unknown',common:'Unknown',scientific:'Unknown',range:'UNRESOLVED',traits:{}};
assert.deepEqual(results({head:'flat_oats',ligule:'hairs'},[unknown]),['unknown'],'missing states must not become negative evidence');
const expectedAdditions={
 'chasmanthium-latifolium':{habit:['tuft'],ligule:['hairs']},
 'andropogon-gerardi':{habit:['rhizome']},
 'hilaria-belangeri':{habit:['tuft']},
 'aristida-oligantha':{ligule:['membrane']},
 'arundo-donax':{habit:['tuft'],ligule:['hairs']},
 'sorghum-halepense':{habit:['tuft']},
 'bothriochloa-barbinodis':{head:['fingers']},
 'bothriochloa-torreyana':{habit:['rhizome']},
 'bouteloua-gracilis':{habit:['rhizome','mat']},
 'nassella-leucotricha':{head:['long_narrow_panicle'],habit:['rhizome']},
 'bouteloua-rigidiseta':{habit:['rhizome'],ligule:['membrane']},
 'setaria-parviflora':{ligule:['membrane']},
 'bouteloua-hirsuta':{head:['fingers'],habit:['mat']},
 'chloris-verticillata':{ligule:['hairs']},
 'chloris-virgata':{ligule:['hairs']}
};
for(const [id,expected] of Object.entries(expectedAdditions)){
 const s=specimenMap.get(id);
 assert(s,id+' absent');
 for(const key of Object.keys(expected)){
  const evidence=s.character_evidence[key];
  assert(evidence,id+': missing evidence for '+key);
  if(key==='head'){
   // Reproductive evidence belongs to Diggs first; species-level FNA or GrassBase supplies permitted alternatives.
   const supplemental=id==='bouteloua-hirsuta' ? 'Flora of North America' : 'GrassBase';
   assert(evidence.source.includes('Diggs') && evidence.source.includes(supplemental),id+': missing regional reproductive and supplemental authority');
  }else if(id==='bouteloua-gracilis' && key==='habit'){
   // No B. gracilis treatment in Hagenbuch & Lemke; use FNA and USDA for vegetative range.
   assert(evidence.source.includes('Flora of North America') && evidence.source.includes('USDA Forest Service'),id+': missing FNA/USFS fallback evidence');
   assert(evidence.source_hierarchy_exception?.includes('Hagenbuch & Lemke'),id+': missing explicit regional-treatment gap');
  }else{
   // Ligules and growth-form states covered by the Hill Country vegetative account.
   assert(evidence.source.includes('Hagenbuch & Lemke'),id+': missing regional vegetative authority for '+key);
  }
  assert(evidence.status.includes('SPECIMEN_PENDING'),id+': uncertainty not retained for '+key);
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
 correctedSpecies:Object.keys(expectedAdditions),scoringStatesAdded:21,
 regressions: newlyValid.length,negativeControls:incompatible.length,disputedBuffalograssPathsRetained:retainedDisputed.length,unknownRetained:true,
 baselineChecked,historicalCombinationsRetained:historicalCombinations,
 photoReferencesPreserved
},null,2));
