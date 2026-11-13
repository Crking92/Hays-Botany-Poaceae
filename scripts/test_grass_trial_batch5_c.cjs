'use strict';
/**
 * Staged-only Chat C evidence gate. This script must not add profiles to the live key.
 * Only source-scoped hypotheses, not field-verified identities or rights grants.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../site/visual-key-lab');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const data=JSON.parse(read('provisional-trial-batch5-c.json'));
const scored=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(k=>JSON.parse(read('species-'+k+'.json')));
const candidates=JSON.parse(read('hays-candidates.json')).candidates;
const old=['provisional-trial-profiles.json','provisional-trial-batch2.json','provisional-trial-batch3.json','provisional-trial-batch4.json']
 .flatMap(f=>JSON.parse(read(f)).profiles);
assert.equal(scored.length,112,'Original scored count changed');
assert.equal(scored.reduce((n,x)=>n+x.photos.length,0),514,'Original 112 photo references changed');
assert.equal(candidates.length,57);
assert.equal(candidates.reduce((n,x)=>n+(x.approved_gallery?.length||0),0),154,'Existing provisional gallery references changed');
assert.equal(candidates.filter(x=>x.approved_gallery?.length).length,56);
assert.equal(old.length,24);
assert.equal(data.profiles.length,8);
assert.equal(data.holds.length,3);
assert.equal(data.assigned_cohort,11);
assert.equal(data.staging_status,'NOT_LOADED_IN_NORMAL_KEY_PENDING_COORDINATOR_INTEGRATION');
assert.equal(data.official_scored_baseline,112);
assert.equal(data.learner_total,169);
assert.equal(data.prior_unverified_trials,24);
assert.equal(data.new_unverified_trials,8);
const expectedReady=['eragrostis-superba','panicum-miliaceum','megathyrsus-maximus','muhlenbergia-capillaris','melinis-repens','nassella-tenuissima','cenchrus-setaceus','miscanthus-sinensis'];
const expectedHold=['phyllostachys-aurea','cortaderia-selloana','lolium-x-boucheanum'];
assert.deepEqual(data.profiles.map(x=>x.id),expectedReady);
assert.deepEqual(data.holds.map(x=>x.id),expectedHold);
const allIds=[...scored,...old,...data.profiles].map(x=>x.id);
assert.equal(new Set(allIds).size,allIds.length,'Duplicated scored or research trial id');
assert.equal(allIds.length,144,'Staging scope is 112 scored plus 24 live trials plus 8 new staged');
const byId=Object.fromEntries(candidates.map(x=>[x.id,x]));
let photos=0;
for(const p of data.profiles){
 const src=byId[p.id];
 assert(src&&src.status==='RESEARCH_CANDIDATE_NOT_RELEASED','Not an exact approved original research candidate '+p.id);
 assert.equal(p.scientific,src.scientific);
 assert.equal(p.trial,true);
 assert.equal(p.admission_status,'RESEARCH_TRIAL_NOT_ADMITTED');
 assert.equal(p.range,'UNVERIFIED');
 assert.equal(p.source_candidate_status,src.status);
 assert.equal(p.character_evidence.trial_phase.status,'LITERATURE_SCORING_TRIAL_ONLY');
 assert.equal(p.character_evidence.trial_phase.reviewed_for_admission,false);
 assert.equal(p.character_evidence.character_basis.unknown_states.includes('unknown'),true);
 assert(p.field_rule.startsWith('Research trial:'));
 assert(p.diagnostic_review.stage.endsWith('PENDING_LOCAL_ID'));
 assert.deepEqual(Object.keys(p.traits).sort(),['awns','habit','head','ligule']);
 const modes={
  head:['short_racemes','fingers','side_oats','short_side_racemes','combs','whorls','flat_oats','airy','foxtail','sparse_bristles','wiry','compact','bushy','reed_plume','branched_oat','burrs','one_sided','many_one_sided','spike','tangled_awns','long_narrow_panicle','golden_plume','paired_spikes','mixed_gender','aquatic_gender','aquatic_mixed'],
  habit:['tuft','mat','rhizome','aquatic_rooted'],
  ligule:['hairs','membrane','absent'],
  awns:['three','three_short','long','bristles','none_obvious','burs']
 };
 for(const [key,values] of Object.entries(p.traits)){
  assert(Array.isArray(values));
  assert.equal(new Set(values).size,values.length,'Repeated state '+p.id+'/'+key);
  for(const value of values) assert(modes[key].includes(value),'Unsupported key state '+p.id+'/'+key+'/'+value);
  if(values.length) assert(p.character_evidence.character_basis.source_details[key]?.length,'No source for scored character '+p.id+'/'+key);
 }
 assert.equal(p.photos.length,src.approved_gallery.length,'Photo source count differs '+p.id);
 assert(p.hero_i>=0&&p.hero_i<p.photos.length,'Hero photo out of range '+p.id);
 p.photos.forEach((photo,i)=>{
  const {i:originalIndex,...originalPhoto}=photo;
  assert.equal(originalIndex,i,'Changed index '+p.id);
  assert.deepEqual(originalPhoto,src.approved_gallery[i],'Altered original source/credits '+p.id+'/'+i);
  assert(photo.creator&&photo.license&&photo.license_url&&photo.source_page&&photo.src);
  const cc=/^(CC0|CC BY(?:-SA)?)(?:\\s|$)/i.test(photo.license);
  const usgs=p.id==='muhlenbergia-capillaris'&&i===1
    &&photo.creator==='Elizabeth A. Sellers / U.S. Geological Survey'
    &&photo.license==='U.S. public domain (USGS-authored)'
    &&photo.license_url==='https://www.usgs.gov/faqs/are-usgs-reportspublications-copyrighted'
    &&photo.source_page==='https://www.usgs.gov/media/images/gulf-muhly-muhlenbergia-capillaris'
    &&photo.exact_rights_evidence?.includes('Public Domain');
  assert(cc||usgs,'Unexpected rights '+p.id+'/'+i);
  photos++;
 });
}
assert.equal(photos,20);
for(const h of data.holds){
 assert(byId[h.id]&&h.scientific===byId[h.id].scientific);
 assert(h.status.startsWith('HOLD_')&&h.reason&&h.needed);
 assert.equal(h.scoring,false);
 assert(!data.profiles.some(x=>x.id===h.id),'Hold admitted to staging');
}
assert.equal(byId['lolium-x-boucheanum'].approved_gallery?.length||0,0,'Hybrid suddenly granted photo');
const html=read('index.html');
assert(!html.includes('provisional-trial-batch5-c.json'),'Chat C silently changed normal public loader');
assert(html.includes('Research trial · unverified'),'Guest trial status changed');
const m=html.match(/<script>([\s\S]*?)<\/script>/);assert(m,'Current production scoring script absent');
const source=m[1],start=source.indexOf('function currentResults()'),end=source.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'Cannot extract actual production filter implementation');
const ctx={state:{species:[],selected:{},range:'all',query:''}};
vm.createContext(ctx);
vm.runInContext(source.slice(start,end),ctx);
const rows=[...scored,...old,...data.profiles];
function entries(picks,sourceRows=rows){
 ctx.state.species=sourceRows;
 ctx.state.selected=picks;
 return Array.from(ctx.currentResults());
}
const names=picks=>entries(picks).map(x=>x.s.id);
assert.equal(names({}).length,144);
assert(names({}).slice(0,112).every(id=>scored.some(s=>s.id===id)),'Production names no longer retain order');
const positives=[
 ['eragrostis-superba',{head:'compact',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['eragrostis-superba',{head:'long_narrow_panicle',habit:'tuft'}],
 ['panicum-miliaceum',{head:'compact',ligule:'membrane',awns:'none_obvious'}],
 ['panicum-miliaceum',{head:'compact',ligule:'hairs'}],
 ['megathyrsus-maximus',{head:'airy',habit:'tuft',ligule:'membrane'}],
 ['megathyrsus-maximus',{head:'airy',habit:'rhizome',ligule:'hairs'}],
 ['muhlenbergia-capillaris',{head:'airy',habit:'tuft',ligule:'membrane'}],
 ['melinis-repens',{head:'airy',habit:'tuft',ligule:'hairs'}],
 ['melinis-repens',{head:'compact',habit:'tuft',ligule:'hairs'}],
 ['nassella-tenuissima',{head:'long_narrow_panicle',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['cenchrus-setaceus',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'}],
 ['miscanthus-sinensis',{head:'bushy',habit:'tuft',ligule:'membrane'}],
 ['miscanthus-sinensis',{head:'bushy',habit:'rhizome',ligule:'hairs'}]
];
for(const [id,picks] of positives) assert(names(picks).includes(id),'Supported state false-excluded '+id+' '+JSON.stringify(picks));
const negatives=[
 ['eragrostis-superba',{head:'foxtail'}],
 ['eragrostis-superba',{awns:'long'}],
 ['panicum-miliaceum',{head:'spike'}],
 ['panicum-miliaceum',{awns:'burs'}],
 ['megathyrsus-maximus',{head:'spike'}],
 ['megathyrsus-maximus',{habit:'mat'}],
 ['muhlenbergia-capillaris',{head:'spike'}],
 ['muhlenbergia-capillaris',{habit:'rhizome'}],
 ['melinis-repens',{head:'spike'}],
 ['melinis-repens',{ligule:'absent'}],
 ['nassella-tenuissima',{head:'foxtail'}],
 ['nassella-tenuissima',{awns:'burs'}],
 ['cenchrus-setaceus',{awns:'burs'}],
 ['miscanthus-sinensis',{head:'foxtail'}],
 ['miscanthus-sinensis',{habit:'mat'}]
];
for(const [id,picks] of negatives) assert(!names(picks).includes(id),'Contradictory path incorrectly retained '+id+' '+JSON.stringify(picks));
for(const h of data.holds) assert(!names({}).includes(h.id),'Unadmitted hold leaked '+h.id);
for(const val of ['tuft','rhizome','mat','aquatic_rooted']) assert(names({head:'compact',habit:val}).includes('panicum-miliaceum'),'Unknown proso millet base hard-excluded');
for(const id of ['megathyrsus-maximus','muhlenbergia-capillaris','melinis-repens','miscanthus-sinensis']){
 for(const awns of ['long','none_obvious','bristles','burs','three']) assert(names({awns}).includes(id),'Unconfirmed awns hard-excluded '+id);
 let row=entries({awns:'three'}).find(x=>x.s.id===id);
 assert(row&&row.unknown===1&&row.confirmed===0,'Unknown awns counted as confirmed '+id);
}
const airy=names({head:'airy',habit:'tuft'});
assert(airy.includes('muhlenbergia-capillaris')&&airy.includes('melinis-repens')&&airy.includes('megathyrsus-maximus'),'Look-alike panicles falsely separated');
const foxtail=names({head:'foxtail',awns:'bristles'});
assert(foxtail.includes('cenchrus-setaceus')&&foxtail.includes('cenchrus-ciliaris'),'Fountain grass/buffelgrass overlap lost');
let preserved=0;
for(const s of scored){
 const keys=Object.entries(s.traits).filter(([,vals])=>vals.length);
 function visit(i,picks={}){
  if(i===keys.length){assert(names(picks).includes(s.id),'Original scored grass falsely excluded: '+s.id);preserved++;return}
  const [key,vals]=keys[i];for(const v of vals)visit(i+1,{...picks,[key]:v});
 }
 visit(0);
}
console.log(JSON.stringify({pass:true,stagingOnly:true,scored:112,existingResearchTrials:24,newResearchTrials:data.profiles.length,held:data.holds.length,learnerSpecies:169,sourcePhotosMirrored:photos,positivePaths:positives.length,contradictions:negatives.length,existingScoredPathsPreserved:preserved,confirmedSpecimenAdmissions:0},null,2));
