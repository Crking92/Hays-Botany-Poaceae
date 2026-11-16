"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const html=read("site/visual-key-lab/index.html");
const match=html.match(/const reviewedCharacterPhotoExamples=(\{[\s\S]*?\});\s*function characterPhotoExample\(/);
assert(match,"reviewed example manifest missing");
const examples=JSON.parse(match[1]);
const shards=["a","b","c1","c2","c3","d1","d2","d3","d4"];
const scored=shards.flatMap(shard=>JSON.parse(read("site/visual-key-lab/species-"+shard+".json")));
const extras=JSON.parse(read("site/visual-key-lab/photo-general-archive-extras.json")).photos;
assert.equal(scored.length,112,"do not alter original scored inventory");
assert.equal(Object.keys(examples).length,8,"first approved character-photo batch should remain exact");
assert(html.includes("if(reviewedPhoto)content.append(reviewedPhoto);"),"pictures must appear in optional character view");
assert(html.includes('content.append(choices);'),"existing character options must remain");
assert(html.includes('Not proven: '),"every picture must explicitly state its limitations");
const allowed=new Set(["blade_shape","leaf_base","ligule_length","stem_nodes","basal_crown","spikelet_position","florets_per_spikelet","culm_posture"]);
const seen=new Set();
let archiveCount=0,scoredCount=0;
for(const [id,x] of Object.entries(examples)){
 assert(allowed.has(id),"unexpected character group "+id);
 assert(!seen.has(x.species_id+":"+x.photo_i),"duplicate picture placement");
 seen.add(x.species_id+":"+x.photo_i);
 const host=scored.find(s=>s.id===x.species_id);
 assert(host,"unknown original species "+x.species_id);
 const original=host.photos.find(p=>p.i===x.photo_i);
 const archive=extras.find(row=>row.species_id===x.species_id&&row.photo?.i===x.photo_i);
 const p=archive?.photo||original;
 assert(p,"source photo is absent from approved published galleries");
 assert(p.src.startsWith("https://")&&p.source_page.startsWith("https://")&&p.license_url.startsWith("https://"),"source and license links required");
 assert.equal(p.source_page,x.expected_source,"source mismatch");
 assert.equal(p.creator,x.expected_creator,"photographer mismatch");
 assert.equal(p.license,x.expected_license,"license mismatch");
 assert(x.visible&&x.limit&&x.limit.length>35,"both visible feature and missing proof required");
 assert(!/not verified|not yet verified|copyright reserved/i.test(p.license),"unclear reuse rights");
 if(archive){
   archiveCount++;
   assert.equal(p.hosted_git_blob_sha,x.hosted_sha,"exact archive source hash mismatch");
   assert(p.photo_qa_note&&p.photo_qa_note.length>60,"source and visual QA note required");
   if(!/^(CC0|CC BY|Public domain)/i.test(p.license)){
     assert(/scientific\/educational use with attribution|permission to reproduce with source credit/.test(p.license),"non-CC image must have explicitly restricted grant");
     assert(/permission rechecked|permission to reproduce|permission and required/.test(p.photo_qa_note+p.license),"specific educational permission must be documented");
   }
 }else{
   scoredCount++;
   assert(/^CC0|^CC BY/.test(p.license),"scored gallery image must carry compatible CC photo license");
   const audit=host.photo_character_audit?.photo_roles?.find(q=>q.i===x.photo_i);
   assert(audit&&["DIRECT_VISIBLE","PARTIAL_VISIBLE"].includes(audit.verdict),"prior visible-structure photo audit required");
   assert(!x.hosted_sha,"do not claim unseen archive hash");
 }
}
assert.equal(archiveCount,6);assert.equal(scoredCount,2);
console.log("PASS: 8 previously hosted source-pinned character photographs (6 archived approved + 2 original CC), credit/source/limits intact; original 112 unchanged");
