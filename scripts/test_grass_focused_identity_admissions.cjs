"use strict";
/* Two conservatively literature-scored grasses with credible source-labeled
 * existing general photographs. NO same-plant ID or local voucher claim. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","site","visual-key-lab");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const original=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(x=>read("species-"+x+".json"));
const trials=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"].flatMap(x=>read(x).profiles);
const follow=read("source-scored-gould-followup-20261116.json"),old=read("source-scored-admissions.json").admissions;
const focus=read("focused-identity-review-20261116.json"),manifest=read("hays-candidates.json").candidates;
const priorReview=read("promotion-review-37-20261116.json").reviewed;
assert.equal(original.length,112);assert.equal(trials.length,53);assert.equal(manifest.length,57);
assert.equal(old.length,37);assert.equal(follow.admissions.length,13);assert.equal(follow.total_source_scored_after_release,162);
assert.equal(focus.schema,"HAYS_GRASS_FOCUSED_IDENTITY_ADMISSIONS_V1");
assert.equal(focus.prior_scored_162,true);assert.equal(focus.admission_count,2);
assert.equal(focus.total_source_scored_after_release,164);assert.equal(focus.remaining_research_species_count,5);
assert.equal(focus.admissions.length,2);
const wanted=new Set(["bothriochloa-longipaniculata","panicum-miliaceum"]);
assert.deepEqual(new Set(focus.admissions.map(x=>x.id)),wanted);
const held=new Set(["dichanthelium-acuminatum","phyllostachys-aurea","bromus-brevis","cortaderia-selloana","lolium-x-boucheanum"]);
assert.deepEqual(new Set(focus.remaining_holds),held);
assert.deepEqual(new Set(follow.unresolved_species_holds.filter(x=>!wanted.has(x))),held);
const byTrial=new Map(trials.map(x=>[x.id,x]));
const approved=new Set([...old,...follow.admissions,...focus.admissions].map(x=>x.id));
assert.equal(approved.size,52);
assert([...held].every(x=>!approved.has(x)));
let citations=0;
for(const a of focus.admissions){
 const t=byTrial.get(a.id);assert(t&&t.trial&&t.range==="UNVERIFIED"&&t.photos.length);
 assert.equal(t.scientific,a.scientific);
 assert.equal(a.admission_level,"SOURCE_SCORED_NOT_LOCAL_VOUCHER");
 assert.equal(a.local_voucher_status,"NOT_CERTIFIED");
 assert.equal(a.bonap_county_status,"UNVERIFIED");
 assert.equal(a.photo_specific_identity_certified,false);
 assert(a.field_rule?.length>100&&a.remaining_cautions?.length>=3);
 const p=a.identification_reference,photo=t.photos[p.existing_photo_index];
 assert(photo&&photo.source_page===p.source_page);
 assert(photo.creator&&photo.license&&photo.license_url?.startsWith("https://")&&photo.src?.startsWith("https://"));
 for(const k of ["head","habit","ligule","awns"]){
   const states=a.core_traits[k],proof=a.core_sources[k];
   assert(states?.length&&proof?.reference&&proof?.source_url?.startsWith("https://")&&proof?.note?.length>45);
   citations++;
 }
}
const millet=focus.admissions.find(x=>x.id==="panicum-miliaceum");
assert.deepEqual(millet.core_traits.head,["compact","airy"]);
assert.equal(millet.identification_reference.existing_photo_index,2);
assert(millet.remaining_cautions.some(s=>s.includes("green Jardin des Plantes")));
const both=focus.admissions.find(x=>x.id==="bothriochloa-longipaniculata");
assert(both.core_sources.head.source_url.includes("floranorthamerica.org/Bothriochloa_longipaniculata"));
assert(both.field_rule.includes("torreyana"));
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(js);new vm.Script(js);
for(const token of ["focused-identity-review-20261116.json","currentScored!==50||currentHeld!==7",
"s.source_scored=true","s.trial=false","s.hero_i=a.identification_reference.existing_photo_index",
"source_scored).length!==52","trial).length!==5"])
 assert(js.includes(token),"Missing live identity resolution validation: "+token);
assert(trials.every(x=>x.trial&&x.admission_status==="RESEARCH_TRIAL_NOT_ADMITTED"));
console.log(JSON.stringify({status:"PASS",sourceScored:164,held:5,species:169,original:112,photographsPreserved:true,sourceCitations:citations,strictBothriochloa:true,conditionalMillet:true}));
