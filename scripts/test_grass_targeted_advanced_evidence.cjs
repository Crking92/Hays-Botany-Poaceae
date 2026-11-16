"use strict";
// Nine exact, independent plant-organ states; supplement does not rewrite the
// 1,815-record evidence ledger, historical photographs or Hays nativity.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","site","visual-key-lab");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const baseline=read("optional-refinement-evidence.json");
const add=read("optional-evidence-targeted-20261116.json");
assert.equal(baseline.evidence.length,1815);assert.equal(baseline.characters.length,24);
assert.equal(baseline.characters.reduce((n,c)=>n+c.options.length,0),111);
assert.equal(add.schema,"HAYS_GRASS_TARGETED_ADVANCED_EVIDENCE_V1");
assert.equal(add.prior_master_records,1815);assert.equal(add.original_pending_options,13);
assert.equal(add.newly_source_supported_options,9);assert.equal(add.expected_pending_after_release,4);
assert.equal(add.mode,"NON_EXCLUDING_POSITIVE_RANKING");
assert.equal(add.evidence.length,8);assert.equal(add.retained_pending.length,4);
const options=new Map(baseline.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
const known=new Set(baseline.evidence.flatMap(e=>e.states.map(s=>e.character+":"+s)));
const expected=new Set([
"sheath_margins:closed","culm_posture:prostrate","glume_marks:upper_one_vein",
"glume_marks:lower_one_vein","true_lemma_awn:lower_sterile_awn_variable",
"floral_hair_position:lower_sterile_lemma_hairs",
"floral_hair_position:upper_fertile_lemma_hairs",
"floral_hair_position:spikelet_callus_hairs","true_lemma_awn:fertile_awn_2_to_5mm"
]);
const retained=new Set([
"blade_venation:raised_ribs","glume_marks:central_glume_glabrous",
"glume_marks:central_glume_scabrous","true_lemma_awn:apical_mucro"
]);
assert.deepEqual(new Set(add.retained_pending),retained);
const formerlyPending=baseline.characters.flatMap(c=>c.options.filter(o=>o.evidence_pending||!known.has(c.id+":"+o.id)).map(o=>c.id+":"+o.id));
assert.equal(formerlyPending.length,13);
assert.deepEqual(new Set(formerlyPending),new Set([...expected,...retained]));
const base=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(n=>read("species-"+n+".json"));
const trial=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"].flatMap(n=>read(n).profiles);
const manifest=read("hays-candidates.json").candidates;
assert.equal(base.length,112);assert.equal(trial.length,53);assert.equal(manifest.length,57);
const allIds=new Map([...base,...trial,...manifest].map(x=>[x.id,x]));
const seen=new Set();
for(const e of add.evidence){
 assert.equal(e.decision,"READY_ORGAN_SPECIFIC_POSITIVE_ONLY");
 assert.equal(e.hays_local_voucher,"NOT_CERTIFIED");
 assert(e.source&&e.source_url.startsWith("https://")&&e.note.length>=65&&e.organ_scope);
 const s=allIds.get(e.id);assert(s&&s.scientific===e.scientific);
 assert.notEqual(e.id,"lolium-x-boucheanum");
 for(const state of e.states){
  const key=e.character+":"+state;
  assert(options.get(e.character)?.has(state),"Option does not exist: "+key);
  assert(expected.has(key)&&!seen.has(key)&&!known.has(key),"Wrong or unsupported option: "+key);
  seen.add(key);
 }
}
assert.deepEqual(seen,expected);
assert.equal(111-(formerlyPending.length-seen.size),107);
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js);new vm.Script(js);
for(const phrase of ["optional-evidence-targeted-20261116.json","originalRows!==1815",
"state.species.filter(s=>s.source_scored).length!==56",
"state.species.filter(s=>s.trial).length!==1",
"for(const e of validated)(state.refineEvidenceMap[e.id]??=[]).push(e)",
"expected_pending_after_release!==4","seen.size!==9",
"Additional field details unavailable"])
 assert(js.includes(phrase),"Supplement safely fails closed? Missing "+phrase);
console.log(JSON.stringify({status:"PASS",sourceBackedPreviously:98,sourceBackedAfter:107,
pendingPreviously:13,pendingAfter:4,newTraitStates:seen.size,newEvidenceRecords:add.evidence.length,
sourceMasterUnchanged:baseline.evidence.length,original112:112,rawTrialPackets:53,hybridHold:true}));
