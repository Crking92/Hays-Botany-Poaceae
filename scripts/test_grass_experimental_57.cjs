'use strict';
// Separate opt-in 57-grass field-trial gate. No provisional admissions into scored shards.
// Run: node scripts/test_grass_experimental_57.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const rootDir='site/visual-key-lab/';
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const existing=shards.flatMap(n=>JSON.parse(read(rootDir+'species-'+n+'.json')));
const manifest=JSON.parse(read(rootDir+'hays-candidates.json')).candidates;
const pilot=JSON.parse(read(rootDir+'experimental-57-profiles.json'));
assert.equal(existing.length,112);
assert.equal(manifest.length,57);
assert.equal(pilot.profiles.length,57);
assert.equal(pilot.baseline_scored,112);
assert.equal(pilot.provisional_count,57);
assert.equal(pilot.schema,'HAYS_GRASS_57_EXPERIMENTAL_FIELD_TRIAL_V1');
assert.equal(existing.reduce((n,s)=>n+(s.photos||[]).length,0),514);
const known=new Set(existing.map(x=>x.id));
assert.equal(known.size,112);
const byCandidate=new Map(manifest.map(c=>[c.id,c]));
assert.equal(byCandidate.size,57);
let states=0,zero=0;
for(const p of pilot.profiles){
  assert(!known.has(p.id),'trial profile duplicates scored: '+p.id);
  assert(byCandidate.has(p.id),'trial profile missing candidate: '+p.id);
  assert.equal(p.reviewed_for_admission,false,'trial falsely claims verification: '+p.id);
  assert.equal(p.status,'UNVERIFIED_EXPERIMENTAL_LITERATURE_MAPPING');
  known.add(p.id);
  const c=byCandidate.get(p.id);
  for(const [key,allowed] of Object.entries(pilot.character_values)){
    assert(Array.isArray(p.traits[key]),'missing trait array: '+p.id+' '+key);
    assert(Array.isArray(p.source_details[key]),'missing evidence list: '+p.id+' '+key);
    assert.equal(new Set(p.traits[key]).size,p.traits[key].length);
    for(const v of p.traits[key])assert(allowed.includes(v),'unknown vocabulary '+p.id+' '+key+': '+v);
    if(p.traits[key].length)assert(p.source_details[key].length>0,'uncited trait '+p.id+' '+key);
    for(const d of p.source_details[key]){
      assert(c.details.some(x=>x.part===d.part&&x.description===d.description&&x.source===d.source),
        'invented detail or changed metadata: '+p.id+' '+key+' '+d.part);
    }
    states+=p.traits[key].length;
  }
  if(!Object.values(p.traits).some(x=>x.length))zero++;
}
assert.equal(known.size,169);
assert.equal(states,pilot.counts.states);
assert.equal(zero,pilot.counts.zero_profiles.length);
// Test the actual currently shipped JS scoring evaluator with trial records, without changing main.
const html=read(rootDir+'index.html');
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert(script,'production evaluator script not found');
new vm.Script(script[1]);
const trial=pilot.profiles.map(x=>({...x,...{common:byCandidate.get(x.id).common,scientific:byCandidate.get(x.id).scientific,range:'UNRESOLVED'}}));
const universe=[...existing,...trial];
const context={state:{selected:{},species:universe,range:'all',query:''}};
vm.createContext(context);
vm.runInContext(script[1].slice(script[1].indexOf('function currentResults()'),script[1].indexOf('\nfunction renderTabs')),context);
assert.equal(typeof context.currentResults,'function');
const matches=picks=>{context.state.selected=picks;return Array.from(context.currentResults(),r=>r.s.id)};
assert.equal(matches({}).length,169);
const examples=[
  ['bromus-catharticus',{head:'branched_oat',awns:'none_obvious'}],
  ['lolium-perenne',{head:'spike',awns:'none_obvious'}],
  ['lolium-multiflorum',{head:'spike',awns:'long',ligule:'membrane'}],
  ['setaria-viridis',{head:'foxtail',awns:'bristles'}],
  ['echinochloa-colona',{ligule:'absent'}],
  ['stenotaphrum-secundatum',{habit:'mat',ligule:'hairs',awns:'none_obvious'}],
  ['nassella-tenuissima',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'}],
  ['phyllostachys-aurea',{habit:'rhizome'}]
];
for(const [id,picks] of examples)assert(matches(picks).includes(id),'known trial source path excluded: '+id);
assert(!matches({head:'foxtail'}).includes('lolium-perenne'));
assert(!matches({ligule:'membrane'}).includes('echinochloa-colona'));
// Candidate absent data stay possible, but are counted as unknown rather than a false confirmation.
for(const id of pilot.counts.zero_profiles)assert(matches({head:'foxtail',ligule:'absent'}).includes(id));
const withData=pilot.profiles.filter(x=>Object.values(x.traits).some(v=>v.length));
for(const p of withData){
  const selections=Object.fromEntries(Object.entries(p.traits).filter(([,v])=>v.length).map(([k,v])=>[k,v[0]]));
  assert(matches(selections).includes(p.id),'experimental candidate removed by its mapped source states: '+p.id);
}
const page=read(rootDir+'try-57.html');
const pageJS=page.match(/<script>([\s\S]*?)<\/script>/);
assert(pageJS,'standalone trial UI script absent');
new vm.Script(pageJS[1]);
for(const token of ['experimental-57-profiles.json','UNVERIFIED TRIAL','112 current scored grasses + 57','Unknown traits keep this possible'])
  assert(page.includes(token),'experimental caution or data link missing: '+token);
console.log(JSON.stringify({pass:true,baselineScored:112,provisionalTrial:57,totalTrial:169,
  provisionalScoredAdmissions:0,mappedStates:states,mappedCandidates:withData.length,
  noBroadAxisValues:zero,knownPositivePaths:examples.length,allCandidateSourcePathsRetained:withData.length,
  existingPhotoReferences:514,actualProductionEvaluatorUsed:true,trialUiScriptSyntax:'valid'},null,2));