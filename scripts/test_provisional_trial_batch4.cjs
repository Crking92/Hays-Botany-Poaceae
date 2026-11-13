'use strict';
// Research-only trial Batch 4: three source-backed grass hypotheses, never scored/admitted.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const lab=path.resolve(__dirname,'../site/visual-key-lab');
const read=x=>fs.readFileSync(path.join(lab,x),'utf8');
const scored=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(x=>JSON.parse(read('species-'+x+'.json')));
const candidates=JSON.parse(read('hays-candidates.json')).candidates;
const groups=['provisional-trial-profiles.json','provisional-trial-batch2.json','provisional-trial-batch3.json','provisional-trial-batch4.json'].map(x=>JSON.parse(read(x)).profiles);
const [a,b,c,d]=groups;
assert.equal(scored.length,112);assert.equal(candidates.length,57);
assert.deepEqual(groups.map(g=>g.length),[6,6,6,3]);
assert.deepEqual(d.map(x=>x.id),['rostraria-cristata','bothriochloa-bladhii','dichanthium-aristatum']);
assert.equal(scored.reduce((n,x)=>n+x.photos.length,0),514,'Original scored gallery references changed');
assert.equal(new Set([...scored,...candidates].map(x=>x.id)).size,169,'Learner total changed');
const trialRows=groups.flat();
const all=[...scored,...trialRows];
assert.equal(all.length,133,'Official scored/trial count changed');
assert.equal(new Set(all.map(x=>x.id)).size,133,'Duplicate trial or scored species');
const candidateBy=Object.fromEntries(candidates.map(x=>[x.id,x]));
let photoCount=0;
for(const p of d){
 const src=candidateBy[p.id];
 assert(src&&src.status==='RESEARCH_CANDIDATE_NOT_RELEASED','Source identity/status changed: '+p.id);
 assert.equal(p.trial,true);assert.equal(p.admission_status,'RESEARCH_TRIAL_NOT_ADMITTED');
 assert.equal(p.source_candidate_status,src.status);assert.equal(p.range,'UNVERIFIED');
 assert.equal(p.character_evidence.trial_phase.status,'LITERATURE_SCORING_TRIAL_ONLY');
 assert.equal(p.character_evidence.trial_phase.reviewed_for_admission,false);
 assert(p.field_rule.startsWith('Research trial:'),'Missing field warning '+p.id);
 assert(p.diagnostic_review.stage.endsWith('PENDING_LOCAL_ID'));
 assert.deepEqual(Object.keys(p.traits).sort(),['awns','habit','head','ligule']);
 assert.equal(p.photos.length,src.approved_gallery.length,'Trial/gallery photo count mismatch: '+p.id);
 p.photos.forEach((photo,i)=>{
   const {i:idx,...actual}=photo;
   assert.equal(idx,i,'Photo index shifted '+p.id);
   assert.deepEqual(actual,src.approved_gallery[i],'Exact photo source and license mismatch '+p.id);
   assert(actual.creator&&actual.license&&actual.license_url&&actual.source_page,'Source rights absent');
   assert(/^(?:CC0|CC BY(?:-SA)?|US public domain)(?:\s|$)/i.test(actual.license),'Unsupported source license '+p.id);
   photoCount++;
 });
}
const html=read('index.html');
assert(html.includes('provisional-trial-batch4.json'),'Normal key missing Batch 4');
assert(html.includes('Research trial · unverified'));
assert(html.includes('Identification data still being checked'),'Research trial status must remain visible to field testers');
assert(html.includes('provisional-trial-batch4.json')&&html.includes('state.species.filter(s=>s.trial).length'),'Trial counts must be derived from loaded data, not stale public status banners');
assert(html.includes('pending.length+" grasses not yet included in this photo key"'),'Learner-only records must remain visibly labeled as missing key data');
const match=html.match(/<script>([\s\S]*?)<\/script>/);assert(match);
const script=match[1];
new vm.Script(script);
const start=script.indexOf('function currentResults()'),end=script.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'Production evaluator missing');
const ctx={state:{species:all,selected:{},range:'all',query:''}};
vm.createContext(ctx);vm.runInContext(script.slice(start,end),ctx);
function results(choices,rows=all){ctx.state.species=rows;ctx.state.selected=choices;return Array.from(ctx.currentResults(),x=>x.s.id)}
const positive=[
 ['rostraria-cristata',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['rostraria-cristata',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane'}],
 ['bothriochloa-bladhii',{head:'bushy',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['bothriochloa-bladhii',{head:'bushy',habit:'rhizome',ligule:'membrane',awns:'long'}],
 ['dichanthium-aristatum',{head:'fingers',awns:'long'}]
];
for(const [id,picks] of positive){
 assert(results(picks).includes(id),'Evidence-supported field path falsely excludes '+id+': '+JSON.stringify(picks));
}
const negatives=[
 ['rostraria-cristata',{head:'foxtail'}],
 ['bothriochloa-bladhii',{head:'spike'}],
 ['dichanthium-aristatum',{head:'foxtail'}]
];
for(const [id,picks] of negatives){
 assert(!results(picks).includes(id),'Contradictory field path retained '+id);
}
assert(results({ligule:'hairs'}).includes('dichanthium-aristatum'),'Unknown ligule hard-excluded tentative Dichanthium');
assert(results({habit:'mat'}).includes('dichanthium-aristatum'),'Unknown habit hard-excluded tentative Dichanthium');
assert(results({awns:'long'}).includes('dichanthium-aristatum'));
let preserved=0;
for(const s of scored){
 const entries=Object.entries(s.traits).filter(([,vals])=>vals.length);
 const visit=(idx,picks={})=>{
   if(idx===entries.length){assert(results(picks).includes(s.id),'Original scored grass excluded '+s.id);preserved++;return}
   const [key,vals]=entries[idx];for(const val of vals)visit(idx+1,{...picks,[key]:val});
 };
 visit(0);
}
assert.equal(results({}).length,133);
assert(results({}).slice(0,112).every(id=>scored.some(s=>s.id===id)),'Provisional trial displaced an official scored result');
console.log(JSON.stringify({pass:true,officialScored:112,learnerTotal:169,provisionalUniverse:57,unverifiedTrials:21,newResearchTrials:d.map(x=>x.id),trialSourcePhotos:photoCount,positiveScenarios:positive.length,negativeScenarios:negatives.length,scoredPathsPreserved:preserved,localSpecimenAdmissions:0},null,2));
