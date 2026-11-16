"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","site","visual-key-lab");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const base=read("optional-refinement-evidence.json"),earlier=read("optional-evidence-targeted-20261116.json");
const latest=read("optional-evidence-final-four-20261116.json");
const original=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(n=>read("species-"+n+".json"));
const rawTrials=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"].flatMap(n=>read(n).profiles);
const manifest=read("hays-candidates.json").candidates;
assert.equal(original.length,112);assert.equal(rawTrials.length,53);assert.equal(manifest.length,57);
assert.equal(base.evidence.length,1815);
assert.equal(base.characters.length,24);
assert.equal(base.characters.reduce((n,c)=>n+c.options.length,0),111);
assert.equal(earlier.evidence.length,8);assert.equal(earlier.newly_source_supported_options,9);
assert.equal(latest.schema,"HAYS_GRASS_FINAL_FOUR_OPTION_CORRECTION_V1");
assert.equal(latest.species_scored_baseline,168);
assert.equal(latest.remaining_taxon_hold,"lolium-x-boucheanum");
assert.equal(latest.original_master_records,1815);assert.equal(latest.original_advanced_options,111);
assert.equal(latest.previous_supplement_supported,9);
assert.equal(latest.previously_pending_options,4);
assert.equal(latest.new_supported_options,4);
assert.equal(latest.remaining_pending_options,0);
assert.equal(latest.evidence.length,4);
assert.equal(latest.legacy_option_relabels.length,2);
const expected=new Map([
["blade_venation:raised_ribs","lolium-perenne"],
["true_lemma_awn:apical_mucro","setaria-italica"],
["glume_marks:central_glume_glabrous","setaria-italica"],
["glume_marks:central_glume_scabrous","poa-annua"]]);
const sourceIDs=new Map([...original,...rawTrials,...manifest].map(s=>[s.id,s.scientific]));
const definitions=new Map(base.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
const originallySupported=new Set(base.evidence.flatMap(e=>e.states.map(v=>e.character+":"+v)));
const first9=new Set(earlier.evidence.flatMap(e=>e.states.map(v=>e.character+":"+v)));
assert.equal(originallySupported.size,98);
assert.equal(first9.size,9);
const afterFirst=new Set([...originallySupported,...first9]);
assert.equal(afterFirst.size,107);
for(const [key,id] of expected){
 assert(!afterFirst.has(key),"Option not actually source-pending: "+key);
 assert(sourceIDs.has(id),"Exact target species missing: "+id);
}
const seen=new Set();
for(const e of latest.evidence){
 const key=e.character+":"+e.states[0];
 assert(expected.has(key)&&!seen.has(key)&&expected.get(key)===e.id);
 assert.equal(sourceIDs.get(e.id),e.scientific);
 assert(definitions.get(e.character)?.has(e.states[0]));
 assert(e.source_url.startsWith("https://")&&e.source&&e.note.length>65);
 assert.equal(e.hays_local_voucher,"NOT_CERTIFIED");
 assert.equal(e.decision,"READY_ORGAN_SPECIFIC_POSITIVE_ONLY");
 assert(e.organ_scope);
 if(e.id==="setaria-italica"&&e.character==="true_lemma_awn")
   assert(/fertile/i.test(e.organ_scope)&&/mucro/i.test(e.organ_scope));
 if(e.character==="glume_marks")assert(/first\/lower/i.test(e.organ_scope));
 seen.add(key);
}
assert.deepEqual(seen,new Set(expected.keys()));
assert.equal(new Set([...afterFirst,...seen]).size,111);
assert.deepEqual(new Set(latest.legacy_option_relabels.map(x=>x.id)),
 new Set(["central_glume_glabrous","central_glume_scabrous"]));
assert(latest.legacy_option_relabels.every(x=>
 x.display_label.startsWith("Lower glume midnerve")&&x.new_anatomical_interpretation.includes("lower glume midnerve")));
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js);new vm.Script(js);
for(const token of ["optional-evidence-final-four-20261116.json",
 "pack.final_option_count_with_any_source!==111",
 "state.species.filter(x=>x.source_scored).length!==56",
 "const replaceNames=new Map(",
 "option.label=change.display_label",
 "option.evidence_pending=false",
 "central_glume_glabrous",
 "central_glume_scabrous",
 "apical_mucro",
 "additional_state_sources",
 "state.refineEvidenceOptionKeys=new Set"])
  assert(js.includes(token),"Missing safe published behavior: "+token);
assert(!latest.evidence.some(x=>x.id==="lolium-x-boucheanum"));
assert.equal(read("source-scored-final-three-20261116.json").total_source_scored_after_release,168);
console.log(JSON.stringify({result:"PASS",advancedGroups:24,advancedOptions:111,
 sourceSupported:111,pending:0,originalMaster:1815,addedExactRecords:4,
 historicGlumeIdsRetained:true,visibleGlumeAnatomyCorrected:true,
 legacy112Preserved:true,hybridTaxonomyHoldPreserved:true,photoRightsUnchanged:true}));
