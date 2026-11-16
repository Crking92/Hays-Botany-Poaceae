"use strict";
/* New species admissions must be traceable to actual existing trial profiles,
 * exact scored options and prior source research. This does NOT re-audit botany.
 * The original 112 scored JSON shards and all photos remain immutable. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const dir=path.join(__dirname,"..","site","visual-key-lab");
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
const original=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(s=>read("species-"+s+".json"));
const trialFiles=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"];
const trials=trialFiles.flatMap(name=>read(name).profiles);
const manifest=read("hays-candidates.json");
const bundle=read("source-scored-admissions.json");
assert.equal(original.length,112,"Original key shards must remain 112");
assert.equal(new Set(original.map(s=>s.id)).size,112);
assert.equal(trials.length,53,"Original trial packet count must stay 53");
assert(trials.every(s=>s.trial&&s.admission_status==="RESEARCH_TRIAL_NOT_ADMITTED"),"Trial source files were rewritten or prematurely admitted");
assert.equal(manifest.candidates.length,57);
assert(manifest.candidates.every(c=>c.status==="RESEARCH_CANDIDATE_NOT_RELEASED"),"Research source manifest modified; the separate published key admission controls UI status");
assert.equal(bundle.schema,"HAYS_GRASS_SOURCE_SCORED_ADMISSIONS_V1");
assert.equal(bundle.original_baseline_scored,112);
assert.equal(bundle.release_stage,"SOURCE_SCORED_SPECIES_LITERATURE_NOT_HAYS_SPECIMEN_CERTIFIED");
assert.equal(bundle.admissions.length,4,"Initial admission cohort changed without explicit QA update");
const originalIds=new Set(original.map(s=>s.id)),byTrial=new Map(trials.map(s=>[s.id,s]));
const held=new Set(["phyllostachys-aurea","bromus-brevis","cortaderia-selloana","lolium-x-boucheanum"]);
const expectedIds=new Set(["setaria-viridis","setaria-leucopila","oplismenus-hirtellus","nassella-tenuissima"]);
const names=new Set(),characters=["head","habit","ligule","awns"];
for(const admission of bundle.admissions){
  assert(expectedIds.has(admission.id),"Unexpected/uncleared species in promotion registry: "+admission.id);
  assert(!originalIds.has(admission.id)&&!held.has(admission.id),"Original species or held taxon promoted");
  assert(!names.has(admission.id),"Duplicated species promoted");
  names.add(admission.id);
  assert.equal(admission.admission_level,"SOURCE_SCORED_NOT_LOCAL_VOUCHER");
  const t=byTrial.get(admission.id);
  assert(t&&t.trial&&t.photos.length,"Promotion needs previously published source research and credited images");
  assert.equal(t.scientific,admission.scientific);
  assert.equal(t.range,"UNVERIFIED","County native/range status MUST remain unverified");
  assert(Array.isArray(admission.remaining_cautions)&&admission.remaining_cautions.length>=1,"Cautions were silently erased");
  for(const character of characters){
    assert.deepEqual(admission.core_traits[character],t.traits[character],admission.id+"/"+character+": changing previously trial-scored options");
    const src=admission.core_sources[character];
    assert(src&&src.reference&&src.note&&src.source_url?.startsWith("https://"),admission.id+"/"+character+": published exact-species source missing");
    assert(!src.source_url.includes("iNaturalist.org/observations/"),"An occurrence observation is not printed species morphology evidence");
  }
}
assert.equal(names.size,4);
assert.equal(original.length+bundle.admissions.length+57-bundle.admissions.length,169,"Production/research pool partition changed");
const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(js,"Grass Lab visitor JavaScript missing");new vm.Script(js);
for(const phrase of ["source-scored-admissions.json","SOURCE_SCORED_NOT_LOCAL_VOUCHER","species.trial=false","species.source_scored=true","Source-scored · local status unverified","NOT a Hays County specimen voucher"]){
  assert(js.includes(phrase),"Missing public admission logic or truthful limitation: "+phrase);
}
assert(js.includes("if(s.trial||s.source_scored)")||js.includes("(s.trial||s.source_scored)?allPicks"),
  "Source-scored galleries must keep all already-credited trial photos, not truncate them");
console.log("PASS: first four literature-scored Grass ID profiles, 112 original protected, 53 original trial source packets unchanged, 4 taxon holds, exact 4x4 flora references and county caution");
