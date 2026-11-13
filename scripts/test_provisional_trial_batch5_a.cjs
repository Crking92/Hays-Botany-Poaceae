'use strict';
// Chat A: independent research-trial source, fit, and false-exclusion checks.
// Does NOT add source-labeled research species to the 112 officially scored grasses.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const lab=path.join(root,'site','visual-key-lab');
const read=(name)=>JSON.parse(fs.readFileSync(path.join(lab,name),'utf8'));
const expected=[
  'melica-nitens','echinochloa-walteri','steinchisma-hians',
  'sphenopholis-interrupta','tridentopsis-elongata','dichanthelium-acuminatum',
  'tridens-congestus','alopecurus-carolinianus','digitaria-californica',
  'pappophorum-bicolor','sporobolus-cryptandrus'
];
const pack=read('provisional-trial-batch5-a.json');
const candidates=read('hays-candidates.json').candidates;
const candidateBy=new Map(candidates.map(x=>[x.id,x]));
const scored=['a','b','c1','c2','c3','d1','d2','d3','d4']
  .flatMap(s=>read('species-'+s+'.json'));
const oldTrialNames=[
  'provisional-trial-profiles.json','provisional-trial-batch2.json',
  'provisional-trial-batch3.json','provisional-trial-batch4.json'
];
const oldTrials=oldTrialNames.flatMap(readFile=>read(readFile).profiles);
const newTrials=pack.profiles;
assert.equal(scored.length,112);
assert.equal(oldTrials.length,24);
assert.equal(candidates.length,57);
assert.equal(scored.reduce((n,x)=>n+x.photos.length,0),514);
assert.equal(new Set([...scored,...candidates].map(x=>x.id)).size,169);
assert.equal(new Set([...scored,...oldTrials].map(x=>x.id)).size,136);
assert.equal(pack.publication_status,'UNVERIFIED_TRIAL_LOADED_IN_NORMAL_KEY_NOT_SPECIMEN_ADMITTED');
assert.equal(pack.new_official_admissions,0);
assert.deepEqual(newTrials.map(x=>x.id),expected,'Owner-exclusive Chat A set/order changed');
assert.deepEqual(pack.holds,[],'No trial-stage hold expected on this scoped lane');

const optionStates={
 head:['short_racemes','fingers','side_oats','short_side_racemes','combs',
       'whorls','flat_oats','airy','foxtail','sparse_bristles','wiry',
       'compact','bushy','reed_plume','branched_oat','burrs','one_sided',
       'many_one_sided','spike','tangled_awns','long_narrow_panicle',
       'golden_plume','paired_spikes','mixed_gender','aquatic_gender','aquatic_mixed'],
 habit:['tuft','mat','rhizome','aquatic_rooted'],
 ligule:['hairs','membrane','absent'],
 awns:['three','three_short','long','bristles','none_obvious','burs']
};
let photoCount=0,unknownFields=0,nonemptyFields=0;
const oldIDs=new Set([...scored,...oldTrials].map(x=>x.id));
for(const p of newTrials){
 const c=candidateBy.get(p.id);
 assert(c,'Candidate not in fixed 57: '+p.id);
 assert(!oldIDs.has(p.id),'Re-admits official or existing trial: '+p.id);
 assert.equal(p.scientific,c.scientific);
 assert.equal(p.common,c.common);
 assert.equal(p.trial,true);
 assert.equal(p.admission_status,'RESEARCH_TRIAL_NOT_ADMITTED');
 assert.equal(p.source_candidate_status,'RESEARCH_CANDIDATE_NOT_RELEASED');
 assert.equal(p.range,'UNVERIFIED');
 assert.equal(p.source_location,c.source_location);
 assert.equal(p.source_packet,c.source_packet);
 assert(p.field_rule.startsWith('Research trial:'),'Missing visible research warning '+p.id);
 assert.equal(p.character_evidence.trial_phase.reviewed_for_admission,false);
 assert.equal(p.character_evidence.trial_phase.status,'LITERATURE_SCORING_TRIAL_ONLY');
 assert.equal(p.diagnostic_review.stage,'BATCH5_A_RESEARCH_TRIAL_PENDING_LOCAL_ID');
 assert.equal(p.photo_character_audit.specimen_identity_verified,false);
 assert.equal(p.photo_character_audit.exact_photo_rights_metadata_reused,true);
 assert.deepEqual(Object.keys(p.traits).sort(),Object.keys(optionStates).sort());
 for(const [key,values] of Object.entries(p.traits)){
   assert(Array.isArray(values),p.id+': trait not an array '+key);
   assert.equal(new Set(values).size,values.length,p.id+': repeated states '+key);
   for(const value of values)assert(optionStates[key].includes(value),p.id+': unsupported '+key+'='+value);
   if(values.length)nonemptyFields++;else unknownFields++;
 }
 assert(p.traits.head.length,'No photo-supported field head path '+p.id);
 assert.equal(p.photos.length,c.approved_gallery.length,p.id+': source photo list mismatch');
 assert(p.photos.length>=1,p.id+': photos absent');
 assert(p.hero_i>=0&&p.hero_i<p.photos.length,p.id+': invalid hero reference');
 for(const [i,photo] of p.photos.entries()){
   const {i:index,...rest}=photo;
   assert.equal(index,i,p.id+': changed photo reference index');
   assert.deepEqual(rest,c.approved_gallery[i],p.id+': modified original photo credit/rights/source');
   assert(photo.src&&photo.creator&&photo.license&&photo.license_url&&photo.source_page,
     p.id+': missing immutable photo provenance');
   photoCount++;
 }
 assert(p.diagnostic_checks.length>0,p.id+': missing botanical detail checklist');
 assert(p.diagnostic_review.missing_evidence.length>0,p.id+': unsafe unqualified ID admission');
}
assert.equal(photoCount,28,'Photo-source parity changed in Chat A');

// Execute the unchanged production matching function, not a reimplementation.
// The branch intentionally leaves the shared key HTML untouched.
const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
const scripts=Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),m=>m[1]);
const script=scripts.find(s=>s.includes('function currentResults()'));
assert(script,'Production evaluator not found');
const start=script.indexOf('function currentResults()');
const end=script.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'Production evaluator boundary changed');
const all=[...scored,...oldTrials,...newTrials];
assert.equal(all.length,147);
assert.equal(new Set(all.map(x=>x.id)).size,147);
const ctx={state:{species:all,selected:{},range:'all',query:''}};
vm.createContext(ctx);
vm.runInContext(script.slice(start,end),ctx);
const match=(selected,rows=all,range='all')=>{
 ctx.state.species=rows;ctx.state.selected=selected;ctx.state.range=range;ctx.state.query='';
 return Array.from(ctx.currentResults(),r=>r.s.id);
};
assert.equal(match({}).length,147);
for(const p of newTrials)assert(match({}).includes(p.id));

// Exhaustively test every source-supported combination for each research profile.
// No declared positive path can hard-exclude its own species.
let positivePaths=0;
for(const p of newTrials){
 const entries=Object.entries(p.traits).filter(([,values])=>values.length);
 function visit(i,picks={}){
   if(i===entries.length){
      assert(match(picks).includes(p.id),
        'Self-exclusion '+p.id+' '+JSON.stringify(picks));
      positivePaths++;
      return;
   }
   const [key,values]=entries[i];
   for(const value of values)visit(i+1,{...picks,[key]:value});
 }
 visit(0);
}

// True unknowns cannot act as negative evidence; checking a wildly different
// state should not remove a research species when that state is unreviewed.
const unknownChecks=[
 ['echinochloa-walteri',{habit:'mat'}],
 ['steinchisma-hians',{habit:'rhizome',awns:'burs'}],
 ['sphenopholis-interrupta',{awns:'bristles'}],
 ['tridentopsis-elongata',{ligule:'absent'}],
 ['dichanthelium-acuminatum',{habit:'mat'}],
 ['pappophorum-bicolor',{awns:'three'}]
];
for(const [id,picks] of unknownChecks)
 assert(match(picks).includes(id),'Unknown trait falsely excluded '+id);

// Look-alikes should remain visible beside these provisional hypotheses.
const overlapCases=[
 ['echinochloa-walteri','echinochloa-crus-galli',{head:'one_sided',ligule:'absent',awns:'long'}],
 ['dichanthelium-acuminatum','dichanthelium-oligosanthes',{head:'airy',ligule:'hairs',awns:'none_obvious'}],
 ['tridentopsis-elongata','tridentopsis-mutica',{head:'long_narrow_panicle',awns:'none_obvious'}],
 ['tridens-congestus','tridens-albescens',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['alopecurus-carolinianus','polypogon-monspeliensis',{head:'compact',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['digitaria-californica','digitaria-ciliaris',{head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['sporobolus-cryptandrus','sporobolus-clandestinus',{head:'long_narrow_panicle',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['sphenopholis-interrupta','sphenopholis-obtusata',{head:'compact',habit:'tuft',ligule:'membrane'}]
];
for(const [target,lookalike,picks] of overlapCases){
 const rows=match(picks);
 assert(rows.includes(target),target+' excluded on shared look-alike path');
 assert(rows.includes(lookalike),lookalike+' excluded from honest comparison');
}

// Contrary observed head forms must still eliminate incompatible trials.
const negativeCases=[
 ['melica-nitens',{head:'burrs'}],
 ['echinochloa-walteri',{head:'foxtail'}],
 ['steinchisma-hians',{head:'spike'}],
 ['sphenopholis-interrupta',{head:'airy'}],
 ['tridentopsis-elongata',{head:'airy'}],
 ['dichanthelium-acuminatum',{head:'compact'}],
 ['tridens-congestus',{head:'airy'}],
 ['alopecurus-carolinianus',{head:'airy'}],
 ['digitaria-californica',{head:'foxtail'}],
 ['pappophorum-bicolor',{head:'burrs'}],
 ['sporobolus-cryptandrus',{head:'fingers'}]
];
for(const [target,picks] of negativeCases)
 assert(!match(picks).includes(target),'Unsupported source state added '+target);

// All previously supported scored paths remain intact after staging additions.
let scoredPaths=0;
for(const p of scored){
 const entries=Object.entries(p.traits).filter(([,values])=>values.length);
 function visit(i,picks={}){
   if(i===entries.length){
      assert(match(picks).includes(p.id),'Original scored profile falsely excluded '+p.id);
      scoredPaths++;
      return;
   }
   const [key,values]=entries[i];
   for(const value of values)visit(i+1,{...picks,[key]:value});
 }
 visit(0);
}
// Two primary-source-reviewed additions to the original scored set are documented
// in the source records; this does not admit any provisional research species.
for (const [id, status] of [
  ['eleusine-indica','PRIMARY_HILL_COUNTRY_OCCASIONAL_STOLONS_ADDITIVE_NONEXCLUSION_IFAS_CONTRAST'],
  ['polypogon-monspeliensis','PRIMARY_HILL_COUNTRY_ROOTED_DECUMBENT_CULM_ADDITIVE_NONEXCLUSION']
]) {
  const p=scored.find(x=>x.id===id);
  assert(p?.traits.habit.includes('tuft') && p.traits.habit.includes('mat'),
    'Missing source-backed conditional growth path '+id);
  assert.equal(p.character_evidence?.habit?.status,status,
    'Conditional growth option lost its primary-source provenance '+id);
}
// Formerly 447, now 452 permitted scored paths from exactly two additive
// growth choices. No prior supported path is removed or narrowed.
// Source-backed additional ligule appearance for Texas cupgrass: the Hill Country
// vegetative account has a tiny membranous base under the conspicuous cilia.
const texasCupgrass=scored.find(x=>x.id==='eriochloa-sericea');
assert(texasCupgrass?.traits.ligule.includes('hairs') &&
       texasCupgrass.traits.ligule.includes('membrane') &&
       texasCupgrass.character_evidence?.ligule?.status ===
       'PRIMARY_HILL_COUNTRY_CILIATE_MINUTE_MEMBRANOUS_BASE_CONDITIONAL_PHOTO_PENDING');
// Scoring review 2026-11-13: three source-backed, additive non-exclusion choices
// (Bromus pubescens and Hordeum pusillum short-awns; Setaria italica fringed
// membrane) add four valid complete combinations: 455 -> 459. This retains
// a strict exact count to catch unreviewed expansion or deletion of scored paths.
// Batch 2 (2026-11-13): two species gain two reviewed unilateral-head
// field matches each; 2 habit x 2 ligule x 1 awn = 4 new complete
// combinations per head option per species: 459 + 16 = 475.
// Batch 3 (2026-11-13): five source-backed one-sided grama comb aliases.
// New complete combinations: buffalograss 4 + blue 6 + hairy 8 + tall 1 + red 4 = 23.
// Exact validated total: 475 + 23 = 498.
// Batch 4 (2026-11-13): source-supported SHORT true lemma awn ranges
// may be observed as 'no conspicuous LONG awns' at field scale.
// Little bluestem adds 2 complete combinations, Texas brome adds 1.
// 498 + 3 = 501. Neither taxon is coded biologically awnless.
assert.equal(scoredPaths,501,'Reviewed scored character-combination total changed');

// Because all new entries have UNVERIFIED range, all 11 are omitted from both
// native and introduced filters. No county-level native approval is inferred.
for(const p of newTrials){
 assert(!match({},all,'native').includes(p.id));
 assert(!match({},all,'introduced').includes(p.id));
}

console.log(JSON.stringify({pass:true,lane:'A',learner:169,officialScored:112,
 priorResearchTrials:24,newTrials:11,projectedUnverifiedTrials:35,
 projectedLabMatches:147,sourcePhotosReused:photoCount,emptyTraitFields:unknownFields,
 sourceBackedTraitFields:nonemptyFields,sourceSupportedPositivePaths:positivePaths,
 unknownTraitRetentionTests:unknownChecks.length,lookalikeOverlapTests:overlapCases.length,
 incompatibleTraitExclusionTests:negativeCases.length,existingScoredPathsPreserved:scoredPaths,
 localSpecimenAdmissions:0,photoRightsModified:0,publicDeployment:false},null,2));
