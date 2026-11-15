"use strict";
/* Photo-first QA: validate real, already-hosted public-domain file bytes and
   visitor-only overlay. No scored source shards, character records or trials change. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const crypto=require("node:crypto"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),lab=path.join(root,"site/visual-key-lab");
const shards=["a","b","c1","c2","c3","d1","d2","d3","d4"];
const originals=shards.flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,"species-"+n+".json"),"utf8")));
assert.equal(originals.length,112,"Official scored species count changed");
assert.equal(new Set(originals.map(s=>s.id)).size,112);
assert.equal(originals.reduce((n,s)=>n+(s.photos||[]).length,0),514,"Original 514 scored source photos must be untouched");
const manifest=JSON.parse(fs.readFileSync(path.join(lab,"photo-general-archive-extras.json"),"utf8"));
assert.equal(manifest.schema,"HAYS_GRASS_GENERAL_PHOTO_ARCHIVE_EXTRAS_V1");
assert.equal(manifest.photos.length,4);
const checks=[
 {id:"bromus-pubescens",file:"content/taxa/Poaceae/Bromus/bromus-pubescens/images/commons-bromus-pubescens-epa.jpg",
  source:"https://commons.wikimedia.org/wiki/File:Bromus_pubescens.jpg",
  creator:"U.S. Environmental Protection Agency, Great Lakes image collection",
  sha:"efe6b458d8a4e06aaf02854401fe416cd96037f3",
  license:"Public domain (U.S. federal employee work)",
  licenseUrl:"https://creativecommons.org/publicdomain/mark/1.0/"},
 {id:"tridens-flavus",file:"content/taxa/Poaceae/Tridens/tridens-flavus/images/tridens-flavus-provisional-face.jpg",
  source:"https://commons.wikimedia.org/wiki/File:Tridens_flavus.jpg",
  creator:"Mason Brock (Masebrock)",
  sha:"af7f91eb910e56dc682f73274f2bfadfc230ae6d",
  license:"Public domain (author's worldwide release)",
  licenseUrl:"https://creativecommons.org/publicdomain/mark/1.0/"},
 {id:"muhlenbergia-lindheimeri",file:"content/taxa/Poaceae/Muhlenbergia/muhlenbergia-lindheimeri/images/library-review014-aa102d046852702.jpg",
  source:"https://www.gbif.org/occurrence/6234431311",
  creator:"Wendy A",sha:"0a37f7836fdc189b3bbbf829bf3c41d2ee5016bb",
  license:"CC0 1.0",licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/"},
 {id:"sporobolus-compositus",file:"content/taxa/Poaceae/Sporobolus/sporobolus-compositus/images/gbif-manual-6178340261-33f83ef05.jpg",
  source:"https://www.gbif.org/occurrence/6178340261",
  creator:"sonoresmore",sha:"4565144aaae65865a2c55688fd9ff01b28201c5c",
  license:"CC0 1.0",licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/"}
];
assert.deepEqual(manifest.photos.map(x=>x.species_id),checks.map(x=>x.id));
for(const check of checks){
 const original=originals.find(s=>s.id===check.id),entry=manifest.photos.find(e=>e.species_id===check.id);
 assert.equal(original?.photos.length,1,check.id+": unexpected scored baseline");
 assert.equal(original.hero_i,0,check.id+": scored hero changed");
 assert.equal(entry.hero_i,1);
 const p=entry.photo;
 assert.equal(p.i,1);assert.equal(p.creator,check.creator);assert.equal(p.source_page,check.source);
 assert.ok(p.src.endsWith("/"+check.file),check.id+": wrong already-hosted file");
 assert.equal(p.license,check.license,check.id+": license metadata altered");
 assert.equal(p.license_url,check.licenseUrl,check.id+": license URL altered");
 assert.ok(p.photo_qa_note.includes("2026-11-15"),check.id+": source/pixel review missing");
 assert.ok(/not (?:a Hays|an authenticated)|not verified|cannot|do not infer|not independently proven/i.test(p.photo_qa_note),check.id+": identity or anatomy caveat absent");
 assert.equal(p.hosted_git_blob_sha,check.sha);
 const bytes=fs.readFileSync(path.join(root,check.file));
 assert.ok(bytes.length>30000,check.id+": archive image truncated");
 const header=Buffer.from("blob "+bytes.length+"\0");
 const hash=crypto.createHash("sha1").update(header).update(bytes).digest("hex");
 assert.equal(hash,check.sha,check.id+": original Git file bytes do not match reviewed photograph");
}
const html=fs.readFileSync(path.join(lab,"index.html"),"utf8");
const inline=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(inline);
new Function(inline);
const start=inline.indexOf("function applyApprovedGeneralPhotos(scored,manifest){");
const end=inline.indexOf("function credit(p){",start);
assert.ok(start>=0&&end>start,"Runtime photo-only overlay unavailable");
const sandbox={};vm.createContext(sandbox);vm.runInContext(inline.slice(start,end),sandbox);
const install=(scored,pack)=>vm.runInContext("applyApprovedGeneralPhotos(scored,manifest)",Object.assign(sandbox,{scored,manifest:pack}));
const visitor=structuredClone(originals),baseline=JSON.stringify(originals);
assert.equal(install(visitor,manifest),4,"Four reviewed archive photos must install into in-memory galleries only");
for(const check of checks){
 const s=visitor.find(x=>x.id===check.id);
 assert.equal(s.photos.length,2);assert.equal(s.hero_i,1);
 assert.equal(s.photos[1].source_page,check.source);
 assert.deepEqual(JSON.parse(JSON.stringify(s.photos[0])),originals.find(x=>x.id===check.id).photos[0]);
 assert.deepEqual(JSON.parse(JSON.stringify(s.traits)),originals.find(x=>x.id===check.id).traits);
}
assert.equal(visitor.reduce((n,s)=>n+s.photos.length,0),518);
assert.equal(visitor.filter(s=>s.photos.length>=2).length,105);
assert.equal(visitor.filter(s=>s.photos.length===1).length,6);
assert.deepEqual(visitor.filter(s=>s.photos.length===0).map(s=>s.id),["muhlenbergia-x-involuta"]);
assert.equal(install(visitor,manifest),0,"Repeat manifest load must not duplicate gallery photos");
assert.equal(install(structuredClone(originals),{schema:"INVALID",photos:manifest.photos}),0,"Unknown manifest schema cannot install");
const forged=structuredClone(manifest);forged.photos[0].photo.license="All rights reserved";
const partial=structuredClone(originals);
assert.equal(install(partial,forged),3,"Unapproved rights cannot be promoted");
const alteredSource=structuredClone(manifest);
alteredSource.photos[2].photo.source_page="https://www.gbif.org/occurrence/000000000";
assert.equal(install(structuredClone(originals),alteredSource),3,"Different GBIF photo source cannot inherit the approval");
const alteredSha=structuredClone(manifest);
alteredSha.photos[3].photo.hosted_git_blob_sha="0".repeat(40);
assert.equal(install(structuredClone(originals),alteredSha),3,"Different archived bytes cannot inherit the approval");
const alteredCreator=structuredClone(manifest);
alteredCreator.photos[2].photo.creator="Unknown";
assert.equal(install(structuredClone(originals),alteredCreator),3,"Attribution cannot be substituted");
assert.equal(JSON.stringify(originals),baseline,"In-memory photo overlay mutated original scored source records");
assert.ok(inline.includes('await fetch("photo-general-archive-extras.json"'),"Visitor boot does not retrieve supplement");
assert.ok(inline.includes("if(state.species.length!==112)"),"112 scored count guard removed");
assert.ok(inline.includes("const views=comparisonPhotos(s)"),"Comparison does not use same enriched photos");
console.log("PASS: 4 already-hosted PD/CC0 JPEGs match exact original Git hashes; 514 scored source records unchanged; visitor galleries 518, 105 with two or more, 6 single, 1 held empty; scoring and trials untouched.");
