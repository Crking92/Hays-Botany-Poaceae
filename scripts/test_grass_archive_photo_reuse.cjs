"use strict";
/* Archive-first photo publication QA: no download and no altered botanical scoring. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const lab=path.join(root,"site/visual-key-lab");
const shards=["a","b","c1","c2","c3","d1","d2","d3","d4"];
const species=shards.flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,"species-"+n+".json"),"utf8")));
assert.equal(species.length,112,"112 scored grasses must remain unchanged");
const byId=new Map(species.map(s=>[s.id,s]));
assert.equal(byId.size,112,"No scored species may be duplicated");
const checks=[
 {id:"bromus-pubescens",file:"content/taxa/Poaceae/Bromus/bromus-pubescens/images/commons-bromus-pubescens-epa.jpg",
  source:"https://commons.wikimedia.org/wiki/File:Bromus_pubescens.jpg",
  creator:"U.S. Environmental Protection Agency, Great Lakes image collection",
  sha:"efe6b458d8a4e06aaf02854401fe416cd96037f3"},
 {id:"tridens-flavus",file:"content/taxa/Poaceae/Tridens/tridens-flavus/images/tridens-flavus-provisional-face.jpg",
  source:"https://commons.wikimedia.org/wiki/File:Tridens_flavus.jpg",
  creator:"Mason Brock (Masebrock)",
  sha:"af7f91eb910e56dc682f73274f2bfadfc230ae6d"}
];
for(const check of checks){
 const s=byId.get(check.id);
 assert.ok(s,check.id+" missing");
 assert.equal(s.photos.length,2,check.id+" must retain original plus one source-checked photo");
 assert.equal(s.hero_i,1,check.id+" should show a useful flowering example by default");
 assert.equal(s.photos[0].i,0,"Historical gallery record must remain at original index");
 const p=s.photos.find(x=>x.i===1);
 assert.ok(p,"New source image absent "+check.id);
 assert.equal(p.creator,check.creator);
 assert.equal(p.source_page,check.source);
 assert.ok(p.src.endsWith("/"+check.file),"New image must use archived Poaceae family file "+check.id);
 assert.ok(/^Public domain/.test(p.license),"Exact photo must be public domain "+check.id);
 assert.equal(p.license_url,"https://creativecommons.org/publicdomain/mark/1.0/");
 assert.ok(p.label.includes("flowering")||p.label.includes("panicle"),"Label must say what the photo teaches");
 assert.ok(/nonlocal|Tennessee/i.test(p.label)||/Nonlocal/.test(p.photo_qa_note),
  "Nonlocal source must not imply a Hays voucher");
 assert.ok(p.hosted_git_blob_sha===check.sha,"Do not substitute original archive bytes");
 const bytes=fs.readFileSync(path.join(root,check.file));
 assert.ok(bytes.length>30000,"Image appears truncated");
 const head=Buffer.from("blob "+bytes.length+"\0");
 const sha=crypto.createHash("sha1").update(head).update(bytes).digest("hex");
 assert.equal(sha,check.sha,check.id+" archived exact bytes changed");
 assert.ok(p.src.startsWith("https://crking92.github.io/Hays-Botany-Poaceae/"));
 assert.equal(new Set(s.photos.map(x=>x.src)).size,2,"Do not duplicate photo views");
 assert.ok(s.photo_character_audit?.photo_roles?.some(x=>x.i===0),
  "Do not delete older photo-character audit");
 assert.ok(s.photos[0].creator&&s.photos[0].source_page,
  "Do not remove existing attribution");
}
const noPhoto=species.filter(s=>!s.photos?.length).map(s=>s.id);
assert.deepEqual(noPhoto,["muhlenbergia-x-involuta"],"Do not silently publish held hybrid plate as a photo");
const key=fs.readFileSync(path.join(lab,"index.html"),"utf8");
assert.ok(key.includes("const card=node(\"section\",\"compare-card\")"));
assert.ok(key.includes("const views=comparisonPhotos(s)"));
assert.ok(key.includes("s.hero_i"),"New heads must be selected on results and comparison");
console.log("PASS: 2 actual pre-existing family JPEGs, byte-for-byte Git hash matches; 112 unchanged grasses; "+species.reduce((n,s)=>n+s.photos.length,0)+" Lab photo records; no new downloads, no held hybrid image, all source/creator/license details retained.");
