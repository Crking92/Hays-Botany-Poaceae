'use strict';
// Coordinator regression: 112 official + 53 unverified research matches, 4 held
// species in the 169-grass Learner. A source-labeled match is NOT a specimen ID.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const lab=path.resolve(__dirname,'../site/visual-key-lab');
const read=x=>JSON.parse(fs.readFileSync(path.join(lab,x),'utf8'));
const existing=['provisional-trial-profiles.json','provisional-trial-batch2.json',
 'provisional-trial-batch3.json','provisional-trial-batch4.json'].flatMap(x=>read(x).profiles);
const original=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(x=>read('species-'+x+'.json'));
const manifest=read('hays-candidates.json').candidates;
const lanes=['a','b','c'].map(x=>read('provisional-trial-batch5-'+x+'.json'));
const newProfiles=lanes.flatMap(x=>x.profiles),holds=lanes.flatMap(x=>x.holds);
const matched=[...original,...existing,...newProfiles];
assert.equal(original.length,112,'Original scored inventory changed');
assert.equal(existing.length,24,'Earlier four source-scoped trial batches changed');
assert.deepEqual(lanes.map(x=>x.profiles.length),[11,10,8]);
assert.deepEqual(lanes.map(x=>x.holds.length),[0,1,3]);
assert.equal(newProfiles.length,29);
assert.equal(holds.length,4);
assert.deepEqual(holds.map(x=>x.id).sort(),
 ['bromus-brevis','cortaderia-selloana','lolium-x-boucheanum','phyllostachys-aurea'].sort());
assert.equal(matched.length,165);
assert.equal(manifest.length,57);
assert.equal(new Set([...original,...manifest].map(x=>x.id)).size,169);
assert.equal(new Set(matched.map(x=>x.id)).size,165);
assert.equal(original.reduce((n,x)=>n+x.photos.length,0),514);
assert.equal(manifest.reduce((n,x)=>n+(x.approved_gallery||[]).length,0),154);
assert.equal(manifest.filter(x=>(x.approved_gallery||[]).length>0).length,56);
const ids=new Set(matched.map(x=>x.id));
for(const h of holds)assert(!ids.has(h.id),'A documented hold has been silently added to the Lab: '+h.id);
const source=new Map(manifest.map(x=>[x.id,x]));
let newPhotoCount=0,emptyTraits=0,retainedChoices=0;
const traitKeys=['head','habit','ligule','awns'];
for(const p of newProfiles){
 const c=source.get(p.id);
 assert(c&&c.status==='RESEARCH_CANDIDATE_NOT_RELEASED',p.id+': not an original held research candidate');
 assert.equal(p.scientific,c.scientific);
 assert.equal(p.trial,true);
 assert.equal(p.admission_status,'RESEARCH_TRIAL_NOT_ADMITTED');
 assert.equal(p.range,'UNVERIFIED');
 assert.equal(p.source_candidate_status,c.status);
 assert.deepEqual(Object.keys(p.traits).sort(),traitKeys.slice().sort());
 assert(p.traits.head.length>0,p.id+': head choice missing');
 for(const [key,values] of Object.entries(p.traits)){
   assert(Array.isArray(values));
   assert.equal(new Set(values).size,values.length,p.id+': duplicate trait choices');
   if(values.length===0)emptyTraits++;
   else retainedChoices+=values.length;
 }
 assert.equal(p.photos.length,c.approved_gallery.length,p.id+': source/gallery photo mismatch');
 assert(p.photos.length>0,p.id+': cannot provide a photo-supported trial with no photographs');
 for(const [i,photo] of p.photos.entries()){
   const {i:index,...originalPhoto}=photo;
   assert.equal(index,i,p.id+': modified trial photo indexing');
   assert.deepEqual(originalPhoto,c.approved_gallery[i],p.id+': exact approved photo rights/creator/source mismatch');
   assert(photo.src&&photo.creator&&photo.license&&photo.license_url&&photo.source_page,
     p.id+': missing individual photo rights provenance');
   newPhotoCount++;
 }
}
assert.equal(newPhotoCount,75,'Batch5 source photo references changed');
assert.equal(emptyTraits,20,'Known uncertainty was silently collapsed or invented');

const html=fs.readFileSync(path.join(lab,'index.html'),'utf8');
assert(html.includes('id="theme-toggle"')&&html.includes('id="compare-toggle"'),
 'Visitor dark mode or compare UI removed during integration');
assert(html.includes('id="preview-toggle"'),'Optional simple-view toggle removed');
assert(!html.includes('Phase 3 in progress:')&&!html.includes('Field-testing prototype:'),
 'Developer notices reintroduced on visitor page');
for(const lane of ['a','b','c'])assert(html.includes('"provisional-trial-batch5-"+lane+".json"'),
 'Coordinator did not wire all three research lane files');
assert(html.includes('additional.length!==29'),'Atomic three-lane import guard missing');
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert(match,'Production evaluator script not located');
const script=match[1];
new vm.Script(script);
const start=script.indexOf('function currentResults()');
const end=script.indexOf('\nfunction renderTabs',start);
assert(start>=0&&end>start,'Unchanged matching logic missing');
const ctx={state:{species:matched,selected:{},range:'all',query:''}};
vm.createContext(ctx);vm.runInContext(script.slice(start,end),ctx);
const query=(selected,rows=matched,range='all')=>{
 ctx.state.species=rows;ctx.state.selected=selected;ctx.state.range=range;ctx.state.query='';
 return Array.from(ctx.currentResults());
};
assert.equal(query({}).length,165);
assert.equal(query({}).filter(x=>x.s.trial).length,53);
assert.equal(query({}).slice(0,112).filter(x=>!x.s.trial).length,112,
 'Existing officially scored species displaced by trial results');
for(const h of holds)assert(!query({}).some(x=>x.s.id===h.id),'Held taxon found in normal ID Lab');
let priorCombos=0,newCombos=0;
function supportedPaths(p,callback){
 const entries=Object.entries(p.traits).filter(([,v])=>v.length);
 const visit=(i,choices={})=>{
   if(i===entries.length){callback(choices);return}
   const [key,values]=entries[i];for(const value of values)visit(i+1,{...choices,[key]:value});
 };
 visit(0);
}
for(const p of original)supportedPaths(p,choices=>{
 assert(query(choices).some(x=>x.s.id===p.id),
  'Original scored grass falsely excluded: '+p.id+' / '+JSON.stringify(choices));
 priorCombos++;
});
assert.equal(priorCombos,447);
for(const p of newProfiles)supportedPaths(p,choices=>{
 const row=query(choices).find(x=>x.s.id===p.id);
 assert(row,p.id+': source-supported new field state falsely excluded '+JSON.stringify(choices));
 newCombos++;
});
let unknownSafety=0;
const opts={
 head:['airy','compact','fingers','spike','foxtail','burrs','one_sided','many_one_sided'],
 habit:['tuft','rhizome','mat','aquatic_rooted'],
 ligule:['membrane','hairs','absent'],
 awns:['long','none_obvious','three','three_short','bristles','burs']
};
for(const p of newProfiles)for(const [trait,states] of Object.entries(p.traits))if(!states.length){
 for(const choice of opts[trait]){
   const row=query({[trait]:choice}).find(x=>x.s.id===p.id);
   assert(row&&row.unknown===1&&row.confirmed===0,
     'Missing trait falsely excluded or treated as positive: '+p.id+'/'+trait+'/'+choice);
   unknownSafety++;
 }
}
for(const p of newProfiles){
 assert(!query({},matched,'native').some(x=>x.s.id===p.id));
 assert(!query({},matched,'introduced').some(x=>x.s.id===p.id));
}
const overlaps=[
 ['echinochloa-walteri','echinochloa-crus-galli',{head:'one_sided',ligule:'absent',awns:'long'}],
 ['tridentopsis-elongata','tridentopsis-mutica',{head:'long_narrow_panicle',awns:'none_obvious'}],
 ['dichanthelium-acuminatum','dichanthelium-oligosanthes',{head:'airy',ligule:'hairs',awns:'none_obvious'}],
 ['tridens-congestus','tridens-albescens',{head:'compact',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['alopecurus-carolinianus','polypogon-monspeliensis',{head:'compact',habit:'tuft',ligule:'membrane',awns:'long'}],
 ['digitaria-californica','digitaria-ciliaris',{head:'fingers',habit:'tuft',ligule:'membrane',awns:'none_obvious'}],
 ['sporobolus-cryptandrus','sporobolus-clandestinus',{head:'long_narrow_panicle',habit:'tuft',ligule:'hairs',awns:'none_obvious'}],
 ['stapfochloa-ciliata','stapfochloa-canterae',{head:'fingers',habit:'tuft'}],
 ['cenchrus-setaceus','cenchrus-ciliaris',{head:'foxtail',habit:'tuft',ligule:'hairs',awns:'bristles'}]
];
for(const [id,look,picks] of overlaps){
 const result=new Set(query(picks).map(x=>x.s.id));
 assert(result.has(id)&&result.has(look),'Expected look-alike comparison lost: '+id+' vs '+look);
}
console.log(JSON.stringify({pass:true,publicTargetKeyMatches:165,originalScored:112,
 priorUnverified:24,addedUnverified:29,totalUnverified:53,learnerCount:169,
 heldLearnerOnly:holds.map(x=>x.scientific),photosReusedExactly:newPhotoCount,
 intentionallyUnknownTraitFields:emptyTraits,sourceSupportedTraitValues:retainedChoices,
 originalScoredPathsPreserved:priorCombos,newResearchPositivePaths:newCombos,
 unknownStateNonExclusionTests:unknownSafety,lookalikeOverlapTests:overlaps.length,
 specimenAdmissions:0,photoCreditsChanged:0,publicationVerified:false},null,2));
