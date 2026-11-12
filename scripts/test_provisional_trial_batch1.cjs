'use strict';
// First six candidate grasses in the normal key, without certifying specimen IDs.
// Execute production currentResults() and safeguard the original 112-scored inventory.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const lab=path.resolve(__dirname,'../site/visual-key-lab');
const read=f=>fs.readFileSync(path.join(lab,f),'utf8');
const sourceLicensePattern=/^(?:CC0|CC BY(?:-SA)?)(?=$|\\s)/i;
for(const valid of ['CC0 1.0','CC BY 2.0','CC BY 3.0 US','CC BY-SA 4.0'])
 assert(sourceLicensePattern.test(valid),'Valid reusable license rejected: '+valid);
for(const invalid of ['CC BY-NC 4.0','CC BY-ND 4.0','All rights reserved'])
 assert(!sourceLicensePattern.test(invalid),'Restricted license incorrectly accepted: '+invalid);
const scored=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(x=>JSON.parse(read('species-'+x+'.json')));
const candidates=JSON.parse(read('hays-candidates.json')).candidates;
const trials=JSON.parse(read('provisional-trial-profiles.json')).profiles;
assert.equal(scored.length,112,'Official scored inventory must remain unchanged');
assert.equal(candidates.length,57,'All original candidate records must be kept');
assert.equal(trials.length,6,'Expected first six provisional trials');
assert.equal(scored.reduce((n,x)=>n+x.photos.length,0),514,'Original scored photo references modified');
assert.equal(new Set([...scored,...candidates].map(x=>x.id)).size,169,'Original Learner inventory changed');
assert.equal(new Set([...scored,...trials].map(x=>x.id)).size,118,'Trial duplicates an official score record');
const allowedIds=['setaria-viridis','setaria-leucopila','bromus-tectorum','bromus-catharticus','lolium-multiflorum','echinochloa-colona'];
assert.deepEqual(trials.map(x=>x.id),allowedIds,'Unreviewed trial species introduced');
let photos=0;
for(const t of trials){
 const src=candidates.find(c=>c.id===t.id);
 assert(src,'Source candidate missing '+t.id);
 assert.equal(src.status,'RESEARCH_CANDIDATE_NOT_RELEASED','Candidate status was silently changed');
 assert.equal(t.trial,true,'Missing explicit research trial flag');
 assert.equal(t.admission_status,'RESEARCH_TRIAL_NOT_ADMITTED','Trial mislabeled as admitted');
 assert.equal(t.source_candidate_status,src.status,'Original provisional label not preserved');
 assert.equal(t.range,'UNVERIFIED','Trial acquired unverified county nativity/introductions claim');
 assert(t.field_rule&&t.field_rule.includes('Research trial:'),'Crew-facing warning missing');
 assert(t.diagnostic_review?.stage==='SIX_SPECIES_TEST_BATCH1_PENDING_LOCAL_ID','Specimen gate missing');
 assert(t.character_evidence?.trial_phase?.status==='LITERATURE_SCORING_TRIAL_ONLY','Evidence status inflated');
 assert(t.photos.length>0,'A trial requires exact-source credited general photos');
 assert.equal(t.photos.length,src.approved_gallery.length,'Unapproved image inserted or credited image omitted');
 for(let i=0;i<t.photos.length;i++){
  const {i:photoIndex,...original}=t.photos[i];
  assert.equal(photoIndex,i,'Duplicate/misaligned photo index');
  assert.deepEqual(original,src.approved_gallery[i],'Source photo/credit/license metadata changed');
  assert(original.src?.startsWith('https://')&&original.source_page?.startsWith('https://'),'Source URL absent');
  assert(original.creator&&original.license,'Exact creator/license required');
  assert(sourceLicensePattern.test(original.license),'Unexpected source license: '+original.license);
  photos++;
 }
 assert(t.diagnostic_checks?.length,'Diagnostic checks not supplied');
 assert(Array.isArray(t.traits.awns)&&Object.keys(t.traits).sort().join('|')==='awns|habit|head|ligule',
   'Not exactly the four key characters');
}
const html=read('index.html');
assert(html.includes('provisional-trial-profiles.json'),'The normal key does not load trials');
assert(html.includes('Research trial · unverified'),'Missing result badge');
assert(html.includes('Not admitted to the officially scored 112'),'Missing explicit detail warning');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js,'Production JavaScript absent');
new vm.Script(js);
const start=js.indexOf('function currentResults()'),end=js.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'Production filter moved');
const ctx={state:{species:scored,selected:{},range:'all',query:''}};
vm.createContext(ctx);vm.runInContext(js.slice(start,end),ctx);
const filter=(choices,records)=>{ctx.state.selected=choices;ctx.state.species=records;ctx.state.range='all';ctx.state.query='';return Array.from(ctx.currentResults(),x=>x.s.id)};
const all=[...scored,...trials];
const positives=[
 ['setaria-viridis',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'}],
 ['setaria-leucopila',{head:'foxtail',habit:'tuft',ligule:'membrane',awns:'bristles'}],
 ['setaria-leucopila',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'}],
 ['bromus-tectorum',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['bromus-catharticus',{head:'branched_oat',habit:'tuft',ligule:'membrane'}],
 ['bromus-catharticus',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['lolium-multiflorum',{head:'spike',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['lolium-multiflorum',{head:'spike',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['echinochloa-colona',{head:'compact',habit:'tuft',ligule:'absent',awns:'none_obvious'}],
 ['echinochloa-colona',{head:'one_sided',habit:'mat',ligule:'absent',awns:'none_obvious'}]
];
for(const[id,choices]of positives){
 assert(!filter(choices,scored).includes(id),'Trial candidate was already officially scored '+id);
 assert(filter(choices,all).includes(id),'Trial falsely excluded '+id+' '+JSON.stringify(choices));
}
const negatives=[
 ['setaria-viridis',{ligule:'absent'}],
 ['setaria-leucopila',{ligule:'absent'}],
 ['bromus-tectorum',{head:'foxtail'}],
 ['bromus-catharticus',{head:'spike'}],
 ['lolium-multiflorum',{head:'airy'}],
 ['echinochloa-colona',{ligule:'hairs'}]
];
for(const [id,choices] of negatives)
 assert(!filter(choices,all).includes(id),'False inclusion in trial '+id+' '+JSON.stringify(choices));
assert(filter({awns:'burs'},all).includes('bromus-catharticus'),
 'Unknown rescue-brome awn state became a false exclusion');
// Original scored profiles must retain every currently coded full answer combination.
let preserved=0;
for(const s of scored){
 const pairs=Object.entries(s.traits).filter(([,vals])=>vals.length);
 const visit=(i,picks={})=>{
  if(i===pairs.length){
   assert(filter(picks,all).includes(s.id),'Original scored path broken: '+s.id);
   preserved++;return;
  }
  const [part,opts]=pairs[i];for(const v of opts)visit(i+1,{...picks,[part]:v});
 };visit(0);
}
assert.equal(filter({},all).length,118,'Initial results did not include six research matches');
assert.equal(filter({},all).slice(0,112).filter(x=>!allowedIds.includes(x)).length,112,
 'Research trials should not displace original scored species above the fold');
console.log(JSON.stringify({pass:true,officialScored:112,provisionalUniverse:57,trialMatches:6,
 totalNormalKeyMatches:118,positivePaths:positives.length,negativeControls:negatives.length,
 originalSupportedCombinationsPreserved:preserved,creditedSourcePhotoRefs:photos,
 specimenApprovalsGranted:0},null,2));
