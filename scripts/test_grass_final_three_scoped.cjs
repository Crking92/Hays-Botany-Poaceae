"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","site","visual-key-lab"),read=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const f=read("source-scored-final-three-20261116.json"),old=read("source-scored-bromus-brevis-20261116.json");
const old37=read("source-scored-admissions.json"),old13=read("source-scored-gould-followup-20261116.json");
const old2=read("focused-identity-review-20261116.json");
const manifest=read("hays-candidates.json").candidates;
const original=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(n=>read("species-"+n+".json"));
const trial=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"].flatMap(n=>read(n).profiles);
assert.equal(original.length,112);assert.equal(trial.length,53);assert.equal(manifest.length,57);
assert.equal(old37.admissions.length,37);assert.equal(old13.admissions.length,13);assert.equal(old2.admissions.length,2);
assert.equal(old.total_source_scored_after_release,165);
assert.equal(read("optional-refinement-evidence.json").evidence.length,1815);
assert.equal(f.schema,"HAYS_GRASS_FINAL_THREE_TAXON_SCOPE_V1");
assert.equal(f.previous_source_scored,165);assert.equal(f.promotions,3);
assert.equal(f.total_source_scored_after_release,168);assert.equal(f.remaining_research_only,1);
const expected=new Set(["cortaderia-selloana","phyllostachys-aurea","dichanthelium-acuminatum"]);
assert.deepEqual(new Set(f.admissions.map(a=>a.id)),expected);
assert.deepEqual(f.remaining_exact_hybrid_taxonomic_hold,["lolium-x-boucheanum"]);
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(js);new vm.Script(js);
for(const phrase of ["pampas_plume","woody_canes","source-scored-final-three-20261116.json","source_scored).length!==56","trial).length!==1","source_scored).length!==53","a.vegetative_diagnostic_sources?.length!==4"])
 assert(js.includes(phrase),"New UI or special admission guard absent: "+phrase);
assert(html.includes('["pampas_plume","Very large silvery, feathery plume"'));
assert(html.includes('["woody_canes","Tall, jointed woody bamboo canes"'));
const byId=new Map(manifest.map(c=>[c.id,c]));
let known=0,held=0;
for(const a of f.admissions){
 const source=byId.get(a.id);
 assert(source?.approved_gallery.length===a.required_gallery_count);
 assert(source.status==="RESEARCH_CANDIDATE_NOT_RELEASED");
 assert(a.admission_level==="SOURCE_SCORED_NOT_LOCAL_VOUCHER");
 assert(a.local_voucher_status==="NOT_CERTIFIED");
 assert(a.bonap_county_status==="UNVERIFIED");
 assert(a.photo_identity_held===true);
 for(const [i,name]of a.required_gallery_creators.entries()){
  const img=source.approved_gallery[i];
  assert(img.creator===name&&img.source_page.startsWith("https://")&&img.license_url.startsWith("https://")&&img.reuse_status==="SOURCE_LICENSE_VERIFIED_GENERAL_PHOTO_ID_NOT_LOCAL_VOUCHER");
 }
 for(const key of ["head","habit","ligule","awns"]){
  assert(Array.isArray(a.core_traits[key]));
  if(a.core_traits[key].length){
   known++;
   assert(a.core_sources[key]?.reference&&a.core_sources[key]?.source_url.startsWith("https://"));
   assert(a.core_sources[key]?.note?.length>45);
  }else{held++;assert(a.held_unknown_core?.[key]?.length>30);}
 }
 assert(a.remaining_cautions.length>=3&&a.field_rule.length>160);
}
const bamboo=f.admissions.find(a=>a.id==="phyllostachys-aurea");
assert.deepEqual(bamboo.core_traits.head,[]);assert.deepEqual(bamboo.core_traits.awns,[]);
assert.deepEqual(bamboo.core_traits.habit,["rhizome","woody_canes"]);
assert.equal(bamboo.vegetative_diagnostic_sources.length,4);
const dich=f.admissions.find(a=>a.id==="dichanthelium-acuminatum");
assert(dich.concept_scope.includes("sensu lato")&&dich.field_rule.includes("NOT strict"));
const pampas=f.admissions.find(a=>a.id==="cortaderia-selloana");
assert.deepEqual(pampas.core_traits.awns,[]);
assert(pampas.held_unknown_core.awns.includes("FNA"));
assert.equal(112+37+13+2+1+f.admissions.length,168);
const knownIDs=new Set([...old37.admissions,...old13.admissions,...old2.admissions,old.admission,...f.admissions].map(a=>a.id));
assert.equal(knownIDs.size,56);
assert(!knownIDs.has("lolium-x-boucheanum"));
assert(trial.every(t=>t.trial&&t.admission_status==="RESEARCH_TRIAL_NOT_ADMITTED"));
console.log(JSON.stringify({result:"PASS",sourceScored:168,researchOnly:1,coreTraitsCited:known,coreHeldUnknown:held,vegetativeOnlyBamboo:true,FNAComplexNotStrict:true,photographsAndCreditsPreserved:true}));
