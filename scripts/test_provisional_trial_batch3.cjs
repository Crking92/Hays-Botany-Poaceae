'use strict';
// Batch 3: source-backed but specimen-unverified research hypotheses in normal key.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../site/visual-key-lab');
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const scored=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(n=>JSON.parse(read('species-'+n+'.json')));
const source=JSON.parse(read('hays-candidates.json')).candidates;
const first=JSON.parse(read('provisional-trial-profiles.json')).profiles;
const second=JSON.parse(read('provisional-trial-batch2.json')).profiles;
const third=JSON.parse(read('provisional-trial-batch3.json')).profiles;
assert.equal(scored.length,112);assert.equal(source.length,57);
assert.equal(new Set([...scored,...source].map(x=>x.id)).size,169);
assert.equal(scored.reduce((n,x)=>n+(x.photos||[]).length,0),514,'Original scored photos were rewritten');
assert.equal(first.length,6);assert.equal(second.length,6);assert.equal(third.length,6);
const allowed=['triticum-aestivum','polypogon-viridis','dactyloctenium-aegyptium','hordeum-murinum','cenchrus-ciliaris','panicum-repens'];
assert.deepEqual(third.map(x=>x.id),allowed);
assert.equal(new Set([...scored,...first,...second,...third].map(x=>x.id)).size,130);
let photos=0;
for(const t of third){
 const src=source.find(x=>x.id===t.id);assert(src,'Missing candidate: '+t.id);
 assert.equal(src.status,'RESEARCH_CANDIDATE_NOT_RELEASED');
 assert.equal(t.trial,true);assert.equal(t.admission_status,'RESEARCH_TRIAL_NOT_ADMITTED');
 assert.equal(t.source_candidate_status,src.status);assert.equal(t.range,'UNVERIFIED');
 assert(t.field_rule.startsWith('Research trial:'));assert(t.diagnostic_review.stage.includes('PENDING_LOCAL_ID'));
 assert.equal(t.character_evidence.trial_phase.status,'LITERATURE_SCORING_TRIAL_ONLY');
 assert.deepEqual(Object.keys(t.traits).sort(),['awns','habit','head','ligule']);
 assert.deepEqual(t.photos.length,src.approved_gallery.length);
 for(let i=0;i<t.photos.length;i++){
   const {i:pi,...original}=t.photos[i];assert.equal(pi,i);
   assert.deepEqual(original,src.approved_gallery[i],'Source-specific file/credit/license changed: '+t.id);
   assert(original.creator&&original.license&&original.source_page&&original.src);
   assert(/^(CC0|CC BY(?:-SA)?)/i.test(original.license),'Unexpected license '+original.license);
   photos++;
 }
}
assert(photos>=12,'Original 12 source-credited photo references must be retained; further approved additions are permitted only by the exact gallery equality checks above');
assert.deepEqual(third.find(x=>x.id==='triticum-aestivum').traits.awns,[],'Uncertain wheat awns are not hard-scored');
assert.deepEqual(third.find(x=>x.id==='dactyloctenium-aegyptium').traits.habit,[],'Unobserved root/base form must remain unknown');
assert.deepEqual(third.find(x=>x.id==='cenchrus-ciliaris').traits.habit,[],'Tuft vs spreading must remain unresolved');
const html=read('index.html');
assert(html.includes('provisional-trial-batch3.json')&&html.includes('provisional-trial-batch2.json'));
assert(html.includes('Research trial · unverified')&&html.includes('Not admitted to the officially scored 112'));
const match=html.match(/<script>([\s\S]*?)<\/script>/);assert(match);
new vm.Script(match[1]);
const js=match[1],from=js.indexOf('function currentResults()'),to=js.indexOf('\nfunction renderTabs',from);
assert(from>=0&&to>from);
const ctx={state:{species:[],selected:{},range:'all',query:''}};
vm.createContext(ctx);vm.runInContext(js.slice(from,to),ctx);
const all=[...scored,...first,...second,...third];
function results(picks={},rows=all){
 ctx.state.species=rows;ctx.state.selected=picks;ctx.state.range='all';ctx.state.query='';
 return Array.from(ctx.currentResults(),x=>x.s.id);
}
const positives=[
 ['triticum-aestivum',{head:'spike',ligule:'membrane'}],
 ['triticum-aestivum',{head:'spike',ligule:'membrane',awns:'long'}],
 ['polypogon-viridis',{head:'compact',ligule:'membrane',awns:'none_obvious'}],
 ['polypogon-viridis',{head:'long_narrow_panicle',ligule:'membrane',awns:'none_obvious'}],
 ['polypogon-viridis',{head:'compact'}],
 ['dactyloctenium-aegyptium',{head:'fingers',ligule:'hairs'}],
 ['dactyloctenium-aegyptium',{head:'fingers',ligule:'membrane'}],
 ['dactyloctenium-aegyptium',{head:'fingers',habit:'tuft',awns:'long'}],
 ['hordeum-murinum',{head:'spike',awns:'long'}],
 ['hordeum-murinum',{head:'spike',awns:'long',ligule:'absent'}],
 ['cenchrus-ciliaris',{head:'foxtail',awns:'bristles'}],
 ['cenchrus-ciliaris',{head:'foxtail',habit:'mat',awns:'bristles'}],
 ['panicum-repens',{head:'airy',habit:'rhizome',ligule:'membrane',awns:'none_obvious'}],
 ['panicum-repens',{head:'airy',habit:'rhizome',ligule:'hairs',awns:'none_obvious'}],
 ['panicum-repens',{habit:'rhizome',ligule:'hairs'}]
];
for(const [id,picks] of positives)assert(results(picks).includes(id),'False exclusion: '+id+' '+JSON.stringify(picks));
const negatives=[
 ['triticum-aestivum',{head:'foxtail'}],
 ['polypogon-viridis',{awns:'long'}],
 ['polypogon-viridis',{head:'spike'}],
 ['dactyloctenium-aegyptium',{head:'spike'}],
 ['hordeum-murinum',{head:'foxtail'}],
 ['cenchrus-ciliaris',{head:'fingers'}],
 ['cenchrus-ciliaris',{awns:'long'}],
 ['panicum-repens',{head:'spike'}],
 ['panicum-repens',{awns:'long'}]
];
for(const [id,picks] of negatives)assert(!results(picks).includes(id),'False inclusion: '+id+' '+JSON.stringify(picks));
let preserved=0;
for(const species of scored){
 const combos=Object.entries(species.traits).filter(([,vals])=>vals.length);
 function step(i,choice={}){
  if(i===combos.length){assert(results(choice).includes(species.id),'Original scored false exclusion '+species.id);preserved++;return;}
  const [k,vals]=combos[i];for(const v of vals)step(i+1,{...choice,[k]:v});
 }
 step(0);
}
assert.equal(results({}).length,130);
assert.equal(results({}).slice(0,112).filter(id=>scored.some(x=>x.id===id)).length,112,
 'First 112 original scored entries displaced by trials');
console.log(JSON.stringify({pass:true,scored:112,provisional:57,normalKey:130,unverifiedTrials:18,
 newTrials:6,originalScoringCombinationsPreserved:preserved,positivePaths:positives.length,negativeControls:negatives.length,
 copiedCreditedSourcePhotos:photos,officialAdmissions:0},null,2));
