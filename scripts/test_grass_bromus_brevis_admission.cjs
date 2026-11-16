"use strict";
/* B. brevis: published Kew/NSW/NZ taxon morphology; NOT a Hays voucher. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.join(__dirname,"..","site","visual-key-lab"),read=n=>JSON.parse(fs.readFileSync(path.join(base,n),"utf8"));
const p=read("source-scored-bromus-brevis-20261116.json");
const old=read("focused-identity-review-20261116.json");
const manifest=read("hays-candidates.json").candidates;
const b=manifest.find(c=>c.id==="bromus-brevis");
assert.equal(p.schema,"HAYS_GRASS_BROMUS_BREVIS_TARGETED_ADMISSION_V1");
assert.equal(p.baseline_source_scored,164);assert.equal(p.total_source_scored_after_release,165);
assert.equal(p.remaining_research_only,4);
assert.equal(p.admission.id,"bromus-brevis");
assert.equal(p.admission.local_voucher_status,"NOT_CERTIFIED");
assert.equal(p.admission.bonap_county_status,"UNVERIFIED");
assert.equal(p.admission.admission_level,"SOURCE_SCORED_NOT_LOCAL_VOUCHER");
assert(b&&b.status==="RESEARCH_CANDIDATE_NOT_RELEASED");
assert.equal(b.approved_gallery.length,3);
assert(p.admission.expected_source_pages.every((url,i)=>url===b.approved_gallery[i].source_page));
assert(b.approved_gallery.every(x=>x.creator==="Harry Rose"&&x.license==="CC BY 2.0"&&
   x.source_page.startsWith("https://")&&x.license_url.startsWith("https://")));
assert.deepEqual(p.admission.core_traits,{
 head:["compact"],habit:["tuft","rhizome"],ligule:["membrane"],awns:["none_obvious"]
});
for(const k of ["head","habit","ligule","awns"]){
 const proof=p.admission.core_sources[k];
 assert(proof?.reference&&proof?.source_url.startsWith("https://")&&proof.note.length>60);
}
assert(p.admission.taxonomic_source.url.includes("powo.science.kew.org"));
assert(p.admission.remaining_cautions.some(x=>x.includes("Texas voucher")));
assert.deepEqual(new Set(p.remaining_holds),
 new Set(["dichanthelium-acuminatum","phyllostachys-aurea","cortaderia-selloana","lolium-x-boucheanum"]));
assert.deepEqual(new Set(old.remaining_holds.filter(x=>x!=="bromus-brevis")),new Set(p.remaining_holds));
const html=fs.readFileSync(path.join(base,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];new vm.Script(js);
for(const phrase of ["source-scored-bromus-brevis-20261116.json","species.photos.length!==3","species.source_scored=true","species.trial=false","source.approved_gallery_review","source_scored).length!==53","trial).length!==4"])
 assert(js.includes(phrase),"Missing cautious runtime proof: "+phrase);
const trials=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"].flatMap(x=>read(x).profiles);
assert.equal(trials.length,53);
assert(!trials.some(t=>t.id==="bromus-brevis"));
assert(trials.every(t=>t.trial&&t.admission_status==="RESEARCH_TRIAL_NOT_ADMITTED"));
const scores=read("source-scored-admissions.json").admissions;
const gould=read("source-scored-gould-followup-20261116.json").admissions;
assert.equal(112+scores.length+gould.length+old.admissions.length+1,165);
console.log("PASS: 165 source-scored (1 strict B. brevis), four unresolved, 3 credited original photos, zero Hays/native/photo certificate changes");
