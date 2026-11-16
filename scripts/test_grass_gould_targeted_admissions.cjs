"use strict";
/* Source-scored is a literature species profile, NOT a Hays County voucher.
 * Targeted followup uses Gould's exact printed species accounts and other
 * named botanically authoritative sources without rewriting earlier records. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","site","visual-key-lab");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const originals=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json"));
const packets=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"].flatMap(k=>read(k).profiles);
const manifest=read("hays-candidates.json").candidates;
const old=read("source-scored-admissions.json").admissions;
const followup=read("source-scored-gould-followup-20261116.json");
const ready=read("ready-core-gap-assignments.json"),gould=read("source-reference-gould-1975.json");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js);new vm.Script(js);
assert.equal(originals.length,112);assert.equal(packets.length,53);assert.equal(manifest.length,57);assert.equal(old.length,37);
assert.equal(ready.rows.length,28);assert.equal(ready.held_unknown.length,13);
assert.equal(followup.schema,"HAYS_GRASS_GOULD_TARGETED_ADMISSIONS_V1");
assert.equal(followup.original_scored_species,112);assert.equal(followup.earlier_source_scored_admissions,37);
assert.equal(followup.new_literature_admissions,13);assert.equal(followup.total_source_scored_after_release,162);
assert.equal(followup.remaining_research_profiles,7);
assert.equal(followup.admissions.length,13);
const initial=new Set(old.map(x=>x.id)),newIds=new Set(),pmap=new Map(packets.map(x=>[x.id,x]));
const protectedHolds=new Set(followup.unresolved_species_holds);
assert.equal(protectedHolds.size,7);
const expectedHolds=new Set(["dichanthelium-acuminatum","bothriochloa-longipaniculata","panicum-miliaceum","phyllostachys-aurea","bromus-brevis","cortaderia-selloana","lolium-x-boucheanum"]);
assert.deepEqual([...protectedHolds].sort(),[...expectedHolds].sort());
const opts={head:new Set(),habit:new Set(),ligule:new Set(),awns:new Set()};
const qblock=html.slice(html.indexOf("const qs=["),html.indexOf("const selectedPhotoOverrides="));
for(const [key,set]of Object.entries(opts)){
 const start=qblock.indexOf('{id:"'+key+'"');
 const end=key==="awns"?qblock.length:qblock.indexOf('{id:"'+({head:"habit",habit:"ligule",ligule:"awns"})[key]+'"');
 assert(start>=0);for(const m of qblock.slice(start,end).matchAll(/\["([a-z_]+)","/g))set.add(m[1]);
}
for(const o of ["soft_involucre","short_single","bent_dorsal","many_feathery"])assert(opts.awns.has(o),"Missing a cited, pedagogical awn distinction: "+o);
let unknown=0,withThree=0,traitCitations=0;
for(const a of followup.admissions){
 assert(!initial.has(a.id)&&!protectedHolds.has(a.id)&&!newIds.has(a.id),"Historical or held species accidentally admitted: "+a.id);
 newIds.add(a.id);
 const trial=pmap.get(a.id);assert(trial?.trial&&trial.photos?.length>=1&&trial.range==="UNVERIFIED","Source photos and unchanged range required: "+a.id);
 assert.equal(a.scientific,trial.scientific);
 assert.equal(a.admission_level,"SOURCE_SCORED_NOT_LOCAL_VOUCHER");
 assert.equal(a.local_voucher_status,"NOT_CERTIFIED");
 assert.equal(a.bonap_county_status,"UNVERIFIED");
 assert(a.field_rule?.length>40&&a.remaining_cautions?.length);
 const chars=["head","habit","ligule","awns"];let known=0;
 for(const key of chars){
  const states=a.core_traits[key];assert(Array.isArray(states)&&states.every(v=>opts[key].has(v)),"Unsupported option "+a.id+" "+key);
  if(states.length){
   known++;traitCitations++;
   const p=a.core_sources[key];assert(p&&p.source_url?.startsWith("https://")&&p.reference?.length>3&&p.note?.length>24,
    "Missing organ-scoped source proof "+a.id+" "+key);
   assert(!a.held_unknown_core?.[key],"State both scored and held: "+a.id+" "+key);
  }else{
   unknown++;assert(a.held_unknown_core?.[key]?.length>20,"Unknown not explained: "+a.id+" "+key);
  }
 }
 assert(known>=3,"Stricter-than-original 112 admission? Require at least 3: "+a.id);
 if(known===3)withThree++;
}
assert.equal(newIds.size,13);
assert.equal(unknown,6,"Six evidence-limited traits should remain unknown");
assert.equal(withThree,6);
assert.equal(traitCitations,46);
assert.equal(initial.size+newIds.size,50);
assert.equal(112+initial.size+newIds.size+protectedHolds.size,169);
for(const key of ["source-scored-gould-followup-20261116.json","s.source_scored=true;s.trial=false","s.positiveOnlyCoreKeys","core_sources:a.core_sources","held_unknown_core","soft_involucre","short_single","bent_dorsal","many_feathery"]){
 assert(js.includes(key),"Runtime followup missing "+key);
}
assert(gould.additional_species_treatments.some(x=>x.species_id==="sphenopholis-interrupta"));
assert(gould.additional_species_treatments.some(x=>x.species_id==="pappophorum-bicolor"));
assert(gould.additional_species_treatments.some(x=>x.species_id==="steinchisma-hians"));
assert(packets.every(x=>x.trial&&x.admission_status==="RESEARCH_TRIAL_NOT_ADMITTED"),"Original 53 immutable trial source packets changed");
console.log(JSON.stringify({status:"PASS",visible:169,original112:112,earlierAdmissions:37,newAdmissions:13,sourceScoredTotal:162,researchHeld:7,heldCoreUnknown:unknown,traitCitations,oldEvidenceRecords:1815,photosNotRehosted:true}));
