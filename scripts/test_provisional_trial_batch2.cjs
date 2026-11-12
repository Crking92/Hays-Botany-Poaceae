'use strict';
// Normal-key provisional Batch 2: source-evidence/photo parity and actual filter QA.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const lab='site/visual-key-lab/';
const read=p=>fs.readFileSync(path.join(root,lab,p),'utf8');
const shards=['a','b','c1','c2','c3','d1','d2','d3','d4'];
const existing=shards.flatMap(x=>JSON.parse(read('species-'+x+'.json')));
const candidates=JSON.parse(read('hays-candidates.json')).candidates;
const first=JSON.parse(read('provisional-trial-profiles.json')).profiles;
const more=JSON.parse(read('provisional-trial-batch2.json')).profiles;
assert.equal(existing.length,112);
assert.equal(candidates.length,57);
assert.equal(first.length,6);
assert.equal(more.length,6);
assert.equal(existing.reduce((n,x)=>n+x.photos.length,0),514);
const expected=['lolium-perenne','paspalum-notatum','stenotaphrum-secundatum','oplismenus-hirtellus','aegilops-cylindrica','avena-sativa'];
assert.deepEqual(more.map(x=>x.id),expected);
const ids=new Set([...existing,...first,...more].map(s=>s.id));
assert.equal(ids.size,124,'Duplication or missing normal-key candidates');
assert.equal(new Set([...existing,...candidates].map(s=>s.id)).size,169,'Learner inventory changed');
let sourceImages=0;
for(const t of more){
 const candidate=candidates.find(c=>c.id===t.id);
 assert(candidate,'Missing candidate '+t.id);
 assert.equal(candidate.status,'RESEARCH_CANDIDATE_NOT_RELEASED','Candidate original release state modified');
 assert.equal(t.trial,true);
 assert.equal(t.admission_status,'RESEARCH_TRIAL_NOT_ADMITTED');
 assert.equal(t.source_candidate_status,candidate.status);
 assert.equal(t.range,'UNVERIFIED');
 assert(t.field_rule.includes('Research trial:'));
 assert.equal(t.diagnostic_review.stage,'SIX_SPECIES_TEST_BATCH2_PENDING_LOCAL_ID');
 assert.equal(t.character_evidence.trial_phase.status,'LITERATURE_SCORING_TRIAL_ONLY');
 assert.deepEqual(t.warning_flags,candidate.warning_flags);
 assert.deepEqual(Object.keys(t.traits).sort(),['awns','habit','head','ligule']);
 assert.equal(t.photos.length,candidate.approved_gallery.length);
 assert(t.photos.length>0,'Unlicensed/no-image candidate must not be a normal-key trial');
 for(let i=0;i<t.photos.length;i++){
   const {i:photoIndex,...actual}=t.photos[i];
   assert.equal(photoIndex,i);
   assert.deepEqual(actual,candidate.approved_gallery[i],'Original exact image/license/source metadata changed: '+t.id);
   assert(actual.creator&&actual.license&&actual.source_page?.startsWith('https://'));
   assert(/^(?:CC0|CC BY(?:-SA)?)(?:\b|$)/i.test(actual.license),'Unexpected source license: '+actual.license);
   sourceImages++;
 }
 for(const check of t.diagnostic_checks){
   assert(candidate.details.some(d=>d.description===check.check&&d.source===check.source),
     'Unsupported source diagnostic: '+t.id);
 }
}
const html=read('index.html');
assert(html.includes('provisional-trial-batch2.json'));
assert(html.includes('112 original scored + '));
assert(html.includes('Research trial · unverified'));
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js);
new vm.Script(js);
const start=js.indexOf('function currentResults()'),end=js.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'Production evaluator changed');
const context={state:{selected:{},species:existing,range:'all',query:''}};
vm.createContext(context);
vm.runInContext(js.slice(start,end),context);
const all=[...existing,...first,...more];
const matches=(pick,records=all)=>{context.state.species=records;context.state.selected=pick;context.state.range='all';context.state.query='';return Array.from(context.currentResults(),r=>r.s.id)};
const positives=[
 ['lolium-perenne',{head:'spike',awns:'none_obvious'}],
 ['lolium-perenne',{head:'spike',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['paspalum-notatum',{head:'paired_spikes',habit:'rhizome',ligule:'hairs'}],
 ['paspalum-notatum',{head:'one_sided',habit:'mat',ligule:'hairs'}],
 ['stenotaphrum-secundatum',{head:'spike',habit:'mat',ligule:'hairs',awns:'none_obvious'}],
 ['oplismenus-hirtellus',{head:'one_sided',habit:'mat',ligule:'membrane',awns:'long'}],
 ['oplismenus-hirtellus',{head:'one_sided',habit:'mat',ligule:'hairs',awns:'long'}],
 ['aegilops-cylindrica',{head:'spike',ligule:'membrane',awns:'long'}],
 ['avena-sativa',{head:'branched_oat',awns:'none_obvious'}],
 ['avena-sativa',{head:'branched_oat',habit:'tuft',ligule:'membrane',awns:'none_obvious'}]
];
for(const[id,pick]of positives){
 assert(!matches(pick,existing).includes(id),'New candidate was already admitted: '+id);
 assert(matches(pick).includes(id),'Valid research trial incorrectly excluded: '+id+' '+JSON.stringify(pick));
}
const negatives=[
 ['lolium-perenne',{head:'foxtail'}],
 ['paspalum-notatum',{head:'foxtail'}],
 ['stenotaphrum-secundatum',{ligule:'absent'}],
 ['oplismenus-hirtellus',{head:'burrs'}],
 ['aegilops-cylindrica',{awns:'burs'}],
 ['avena-sativa',{head:'spike'}]
];
for(const[id,pick]of negatives)assert(!matches(pick).includes(id),'Unsupported trial state included '+id+' '+JSON.stringify(pick));
assert(matches({ligule:'absent'}).includes('avena-sativa'),'Unknown oat ligule mistakenly treated as negative');
assert(matches({awns:'three'}).includes('paspalum-notatum'),'Unknown Bahia grass awns incorrectly excluded');
// Every existing score profile and its own complete current path remains included.
let routes=0;for(const s of existing){const rows=Object.entries(s.traits).filter(([,v])=>v.length);const walk=(i,p={})=>{if(i===rows.length){assert(matches(p).includes(s.id),'Official scored path lost: '+s.id);routes++;return}const [k,vals]=rows[i];for(const v of vals)walk(i+1,{...p,[k]:v})};walk(0)}
assert.equal(matches({}).length,124);
assert.equal(matches({}).slice(0,112).filter(id=>existing.some(s=>s.id===id)).length,112,'Research trials displaced existing scores');
console.log(JSON.stringify({pass:true,officialScored:112,firstResearchTrials:6,addedResearchTrials:6,normalKeyProfiles:124,
 learnerTotal:169,stillResearchOnly:45,photoRefsReused:sourceImages,originalScoredPhotosRetained:514,
 positivePaths:positives.length,negativeControls:negatives.length,originalRoutesRetained:routes,localSpecimenSignoffs:0},null,2));
