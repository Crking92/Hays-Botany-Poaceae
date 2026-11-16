"use strict";
/* No fresh photo rights or arrow location assertions: reuse exact existing
   identified, source-pinned Learner photo data. Verify all eight main cards. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","site","visual-key-lab");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const batch=read(path.join(root,"main-question-existing-arrows-batch1.json"));
const source=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(s=>read(path.join(root,"species-"+s+".json")));
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js);new vm.Script(js);
const choices=html.match(/const qs=([\s\S]*?);\s*const selectedPhotoOverrides=/)?.[1];
assert(choices,"Main question options missing");
const qs=vm.runInNewContext("("+choices+")");
const optionMap=new Map(qs.flatMap(q=>q.options.map(o=>[q.id+":"+o[0],{id:o[3],photo_i:o[4]}])));
assert.equal(qs.length,4);assert.equal(source.length,112);
assert.equal(batch.schema,"HAYS_GRASS_MAIN_KEY_EXISTING_PHOTO_MARKERS_BATCH1_V1");
assert.deepEqual(batch.main_question_groups,["head","habit","ligule","awns"]);
assert.equal(batch.annotated_choice_count,8);
assert.equal(batch.existing_marker_records,14);
assert.equal(batch.photos_rehosted,0);assert.equal(batch.new_photograph_downloads,0);
assert.equal(batch.placements.length,8);
const used=new Set(),keys=new Set(),len={};
const filename=s=>decodeURIComponent(s.split("?")[0].split("/").pop());
for(const x of batch.placements){
 const key=x.option;
 assert(!keys.has(key));keys.add(key);
 const o=optionMap.get(key);
 assert(o&&o.id===x.species_id&&o.photo_i===x.photo_i,"Photo reference changed "+key);
 const host=source.find(s=>s.id===x.species_id);
 const photo=host?.photos.find(p=>p.i===x.photo_i);
 assert(photo,"Previously approved original source photograph unavailable "+key);
 const sample=read(path.join(root,"..","data","species",x.species_id+".json"));
 assert.equal(sample.id,x.species_id);
 const lp=sample.panels.find(p=>p.source_page===photo.source_page&&p.creator===photo.creator&&
   p.license===photo.license&&filename(p.src)===filename(photo.src)&&
   p.photo_role==="TARGET_SPECIES_SOURCE");
 assert(lp,"No exact previously arrow-marked learner source photo "+key);
 for(const f of ["expected_source","expected_creator","expected_license","expected_src"]){
   const k={expected_source:"source_page",expected_creator:"creator",expected_license:"license",expected_src:"src"}[f];
   assert.equal(x[f],photo[k],key+" original photo metadata changed");
 }
 assert(photo.license_url?.startsWith("https://")&&photo.source_page?.startsWith("https://"));
 assert(!/Copyright.*reserved|unknown rights|not verified/i.test(photo.license));
 assert.equal(x.annotation_provenance,"EXISTING_LEARNER_TARGET_SPECIES_PHOTO_MARKERS_NOT_NEW_LOCATION_CLAIM");
 assert(x.visible.length>=35&&x.not_proven.length>=35);
 assert(x.markers.length>=1);
 const markerKey=x.species_id+":"+x.photo_i;
 assert(!used.has(markerKey));used.add(markerKey);
 for(const marker of x.markers){
   assert(lp.markers.some(m=>JSON.stringify(m)===JSON.stringify(marker)),
     "Marker was moved or invented rather than borrowed from Learner "+key);
   for(const coord of ["label_x","label_y","target_x","target_y"]){
     assert(Number.isFinite(marker[coord])&&marker[coord]>=0&&marker[coord]<=100);
   }
   assert(marker.label.length>=10);
 }
 len[key]=x.markers.length;
}
assert.equal(keys.size,8);
assert.equal(Object.values(len).reduce((n,m)=>n+m,0),14);
for(const k of ["main-question-existing-arrows-batch1.json","state.mainPhotoArrows=staged",
"f.classList.add(\"with-reviewed-arrows\")","svg.setAttribute(\"preserveAspectRatio\",\"xMidYMid meet\")",
"svg.setAttribute(\"viewBox\",\"0 0 \"+w+\" \"+h)",
"validReviewed?.markers","photo-arrow-legend","General reference photo; the drawing explains the structure",
"Not proven here: "])
  assert(js.includes(k),"Main card lacks safely matched visible pointers: "+k);
assert.equal(JSON.stringify(source).includes("main-question-existing-arrows-batch1"),false);
console.log(JSON.stringify({result:"PASS",mainQuestionGroups:4,annotatedMainOptions:8,
 existingPhotoPointers:14,rightsAndSourcePinned:true,sourcePhotosRehosted:0,
 original112Unchanged:true,unknownPhotoAnatomyDisclosed:true,matchingProof:"same source+creator+license+filename"}));
