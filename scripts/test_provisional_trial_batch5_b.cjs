'use strict';
// Chat B / Batch 5 lane only. Test the *existing* normal four-character
// evaluator without modifying HTML, scoring shards, images or other trial files.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const lab=path.resolve(__dirname,'../site/visual-key-lab');
const read=(n)=>fs.readFileSync(path.join(lab,n),'utf8');
const scored=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(n=>JSON.parse(read('species-'+n+'.json')));
const manifest=JSON.parse(read('hays-candidates.json'));
const priorFiles=['provisional-trial-profiles.json','provisional-trial-batch2.json','provisional-trial-batch3.json','provisional-trial-batch4.json'];
const old=priorFiles.flatMap(n=>JSON.parse(read(n)).profiles);
const batch=JSON.parse(read('provisional-trial-batch5-b.json'));
const candidates=manifest.candidates;
const byId=new Map(candidates.map(c=>[c.id,c]));
assert.equal(scored.length,112);
assert.equal(scored.reduce((n,s)=>n+s.photos.length,0),514,'Original 112 gallery reference count drift');
assert.equal(candidates.length,57);
assert.equal(new Set([...scored,...candidates].map(x=>x.id)).size,169);
assert.equal(old.length,24);
assert.equal(new Set([...scored,...old].map(x=>x.id)).size,136);
assert.equal(batch.original_scored,112);
assert.equal(batch.provisional_inventory,57);
assert.equal(batch.prior_unverified_trials,24);
assert.equal(batch.assigned_taxa,11);
assert.equal(batch.new_unverified_trials,10);
assert.equal(batch.held_taxa,1);
assert.equal(batch.profiles.length,10);
assert.deepEqual(batch.holds.map(h=>h.id),['bromus-brevis']);
assert(batch.holds[0].reason.includes('Hays')&&batch.holds[0].next_evidence);
const expected=[
'bothriochloa-longipaniculata','eragrostis-curtipedicellata','eragrostis-minor',
'stapfochloa-ciliata','briza-minor','elymus-macgregorii',
'panicum-dichotomiflorum','sclerochloa-dura','stapfochloa-canterae','janochloa-antidotalis'];
assert.deepEqual(batch.profiles.map(x=>x.id),expected);
const all=[...scored,...old,...batch.profiles], allIds=all.map(s=>s.id);
assert.equal(new Set(allIds).size,all.length,'Scored/older trial/new trial ID collision');
assert.equal(all.length,146,'Total only after an eventual coordinated integration; must not imply current site has 146');
const options={
 head:new Set(['short_racemes','fingers','side_oats','short_side_racemes','combs','whorls',
  'flat_oats','airy','foxtail','sparse_bristles','wiry','compact','bushy','reed_plume',
  'branched_oat','burrs','one_sided','many_one_sided','spike','tangled_awns',
  'long_narrow_panicle','golden_plume','paired_spikes','mixed_gender','aquatic_gender','aquatic_mixed']),
 habit:new Set(['tuft','mat','rhizome','aquatic_rooted']),
 ligule:new Set(['hairs','membrane','absent']),
 awns:new Set(['three','three_short','long','bristles','none_obvious','burs'])
};
let credited=0, unknowns=0;
for(const t of batch.profiles){
 const c=byId.get(t.id);
 assert(c&&c.status==='RESEARCH_CANDIDATE_NOT_RELEASED','Candidate missing or source state changed '+t.id);
 assert.equal(t.trial,true);
 assert.equal(t.admission_status,'RESEARCH_TRIAL_NOT_ADMITTED');
 assert.equal(t.range,'UNVERIFIED');
 assert.equal(t.source_candidate_status,c.status);
 assert.equal(t.scientific,c.scientific);
 assert.equal(t.common,c.common);
 assert(t.field_rule.startsWith('Research trial:'));
 assert(t.character_evidence.trial_phase.status==='LITERATURE_SCORING_TRIAL_ONLY');
 assert.equal(t.character_evidence.trial_phase.reviewed_for_admission,false);
 assert(t.diagnostic_review.stage.endsWith('PENDING_LOCAL_ID'));
 assert(Array.isArray(t.diagnostic_review.look_alikes)&&t.diagnostic_review.look_alikes.length>=2);
 assert(t.diagnostic_checks.length>=4);
 assert.deepEqual(Object.keys(t.traits).sort(),['awns','habit','head','ligule']);
 for(const [k,vals] of Object.entries(t.traits)){
   assert(Array.isArray(vals)&&new Set(vals).size===vals.length,'Invalid/duplicate character array '+t.id+' '+k);
   for(const v of vals)assert(options[k].has(v),'Unsupported normal-key choice: '+k+':'+v);
   if(!vals.length)unknowns++;
 }
 assert.equal(t.photos.length,c.approved_gallery.length,'Changed existing gallery photo count '+t.id);
 assert(t.photos.length>0,'No visual references '+t.id);
 assert(t.hero_i>=0&&t.hero_i<t.photos.length,'Invalid hero source '+t.id);
 for(let i=0;i<t.photos.length;i++){
  const {i:idx,...copy}=t.photos[i];
  assert.equal(idx,i);
  assert.deepEqual(copy,c.approved_gallery[i],'Creator/license/source/photos not byte-for-byte reused '+t.id+' '+i);
  assert(copy.src&&copy.creator&&copy.license&&copy.license_url&&copy.source_page,'Missing existing photo credit '+t.id);
  credited++;
 }
}
const html=read('index.html');
assert(!html.includes('provisional-trial-batch5-b.json'),'Lane B file must remain staged; coordinator owns key integration');
const m=html.match(/<script>([\s\S]*?)<\/script>/);assert(m,'Cannot locate current production key JS');
new vm.Script(m[1]);
const js=m[1],start=js.indexOf('function currentResults()'),end=js.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start);
const ctx={state:{species:all,selected:{},range:'all',query:''}};
vm.createContext(ctx);
vm.runInContext(js.slice(start,end),ctx);
function score(picks={},rows=all){
 ctx.state.selected=picks;ctx.state.species=rows;ctx.state.range='all';ctx.state.query='';
 return Array.from(ctx.currentResults(),x=>({id:x.s.id,unknown:x.unknown,confirmed:x.confirmed,conflict:x.conflict}));
}
function has(id,picks){return score(picks).some(r=>r.id===id)}
let positives=0,negatives=0,unknownCases=0,scoredPaths=0,previousPaths=0;
for(const p of batch.profiles){
 const dims=Object.entries(p.traits).filter(([,values])=>values.length);
 function visit(i,picks={}){
  if(i===dims.length){
   assert(has(p.id,picks),'FALSE EXCLUSION on positive documented path '+p.id+': '+JSON.stringify(picks));
   const row=score(picks).find(x=>x.id===p.id);
   assert(row&&row.unknown===0,'Complete known path should have no unknown among selected');
   positives++;return;
  }
  const [key,values]=dims[i];
  for(const val of values)visit(i+1,{...picks,[key]:val});
 }
 visit(0);
 for(const [k,vals] of Object.entries(p.traits)){
  if(!vals.length){
   for(const v of options[k]){
    const q={head:p.traits.head[0],[k]:v};
    assert(has(p.id,q),'UNKNOWN hardened into exclusion '+p.id+' '+k+' '+v);
    const r=score(q).find(x=>x.id===p.id);
    assert(r&&r.unknown>=1,'Unknown state incorrectly counted as positive '+p.id);
    unknownCases++;
   }
  }else{
   const alternate=Array.from(options[k]).find(v=>!vals.includes(v));
   assert(alternate,'No contradictory option available '+p.id+' '+k);
   assert(!has(p.id,{[k]:alternate}),'Explicit contradictory character unexpectedly retained '+p.id+' '+k+':'+alternate);
   negatives++;
  }
 }
}
assert(!has('bromus-brevis',{}),'Held Bromus must remain outside the trial result set');
assert(has('stapfochloa-ciliata',{head:'fingers',habit:'tuft'}));
assert(has('stapfochloa-canterae',{head:'fingers',habit:'tuft'}),'Lookalike canterae discarded by shared silhouette');
assert(has('stapfochloa-ciliata',{head:'fingers',ligule:'membrane'}),'Ciliate/absent ligule treated as false negative');
const srow=score({head:'fingers',ligule:'membrane'}).find(x=>x.id==='stapfochloa-ciliata');
assert(srow&&srow.unknown===1&&srow.confirmed===1,'Unseen Stapfochloa ligule falsely counted as confirmed');
assert(has('janochloa-antidotalis',{head:'airy',ligule:'hairs'}));
assert(has('panicum-dichotomiflorum',{head:'airy',ligule:'hairs'}),'Fall panicum should stay in comparison');
assert(has('panicum-dichotomiflorum',{head:'airy',ligule:'membrane'}),'Membrane with cilia should not be an exclusion');
assert(has('janochloa-antidotalis',{head:'airy',habit:'rhizome'}));
assert(has('panicum-dichotomiflorum',{head:'airy',habit:'rhizome'}),'Unknown Panicum habit should be kept possible');
function enumerate(s,cb){
 const nonEmpty=Object.entries(s.traits).filter(([,v])=>v.length);
 function visit(i,picks={}){
  if(i===nonEmpty.length){cb(picks);return}
  const [key,vals]=nonEmpty[i];
  for(const val of vals)visit(i+1,{...picks,[key]:val});
 }
 visit(0);
}
for(const s of scored)enumerate(s,picks=>{assert(has(s.id,picks),'Previously supported official path excluded '+s.id);scoredPaths++});
for(const s of old)enumerate(s,picks=>{assert(has(s.id,picks),'Existing unverified trial path excluded '+s.id);previousPaths++});
assert.equal(score({}).length,146);
assert.equal(score({}).slice(0,112).filter(x=>scored.some(y=>y.id===x.id)).length,112,'Unverified trials displace official results');
console.log(JSON.stringify({pass:true,originalScored:112,originalScoredPhotoRefs:514,totalLearner:169,
 priorUnverifiedTrials:24,chatBStaged:10,chatBHolds:1,
 normalKeyIfLaterIntegrated:146,approvedCreditedPhotoRefsCopied:credited,
 positivePaths:positives,contradictionChecks:negatives,unknownSurvivalChecks:unknownCases,
 preexistingOfficialPathsPreserved:scoredPaths,oldResearchPathsPreserved:previousPaths,
 unknownTraitArrays:unknowns,localSpecimenAdmissions:0,publishedNewPhotoCount:0,
 note:'Unverified trial; no specimen admission; public QA required after merge'},null,2));
