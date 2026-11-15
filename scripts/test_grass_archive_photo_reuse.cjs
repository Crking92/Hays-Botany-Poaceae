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
assert.equal(manifest.photos.length,9);
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
assert.deepEqual(manifest.photos.slice(0,4).map(x=>x.species_id),checks.map(x=>x.id));
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
assert.equal(install(visitor,manifest),9,"Nine source-specific, reviewed archive photographs must install into in-memory galleries only");
for(const check of checks){
 const s=visitor.find(x=>x.id===check.id);
 assert.equal(s.photos.length,2);assert.equal(s.hero_i,1);
 assert.equal(s.photos[1].source_page,check.source);
 assert.deepEqual(JSON.parse(JSON.stringify(s.photos[0])),originals.find(x=>x.id===check.id).photos[0]);
 assert.deepEqual(JSON.parse(JSON.stringify(s.traits)),originals.find(x=>x.id===check.id).traits);
}
assert.equal(visitor.reduce((n,s)=>n+s.photos.length,0),523);
assert.equal(visitor.filter(s=>s.photos.length>=2).length,107);
assert.equal(visitor.filter(s=>s.photos.length===1).length,4);
assert.deepEqual(visitor.filter(s=>s.photos.length===0).map(s=>s.id),["muhlenbergia-x-involuta"]);
assert.equal(install(visitor,manifest),0,"Repeat manifest load must not duplicate gallery photos");
assert.equal(install(structuredClone(originals),{schema:"INVALID",photos:manifest.photos}),0,"Unknown manifest schema cannot install");
const forged=structuredClone(manifest);forged.photos[0].photo.license="All rights reserved";
const partial=structuredClone(originals);
assert.equal(install(partial,forged),8,"Unapproved rights cannot be promoted");
const alteredSource=structuredClone(manifest);
alteredSource.photos[2].photo.source_page="https://www.gbif.org/occurrence/000000000";
assert.equal(install(structuredClone(originals),alteredSource),8,"Different GBIF photo source cannot inherit the approval");
const alteredSha=structuredClone(manifest);
alteredSha.photos[3].photo.hosted_git_blob_sha="0".repeat(40);
assert.equal(install(structuredClone(originals),alteredSha),8,"Different archived bytes cannot inherit the approval");
const alteredCreator=structuredClone(manifest);
alteredCreator.photos[2].photo.creator="Unknown";
assert.equal(install(structuredClone(originals),alteredCreator),8,"Attribution cannot be substituted");

/* Five photo-specific permission decisions from sources that were opened and
   visually inspected. A Tom Chester page-level grant is not a CC license. */
const restricted=[
 {id:"erioneuron-pilosum",i:1,hero:1,
  file:"content/taxa/Poaceae/Erioneuron/erioneuron-pilosum/images/tom-chester-hairy-tridens-in-situ-heads-and-crown.jpg",
  sha:"82fb3407e1ec323eb822c345df5f8550d1f542c5",
  source:"https://tchester.org/gc/plants/species/pix/erioneuron_pilosum/erioneuron_pilosum_5_crop_35.jpg",
  creator:"Tom Chester",license:"Copyright Tom Chester; permission to reproduce with source credit (not CC)",
  terms:"https://tchester.org/gc/plants/species/erioneuron_pilosum.html"},
 {id:"erioneuron-pilosum",i:2,hero:null,
  file:"content/taxa/Poaceae/Erioneuron/erioneuron-pilosum/images/tom-chester-hairy-tridens-narrow-white-edged-basal-leaves.jpg",
  sha:"e7b87bbda4182f654a7316e77d30df3a5a3dcdef",
  source:"https://tchester.org/gc/plants/species/pix/erioneuron_pilosum/erioneuron_pilosum_4_crop_50.jpg",
  creator:"Tom Chester",license:"Copyright Tom Chester; permission to reproduce with source credit (not CC)",
  terms:"https://tchester.org/gc/plants/species/erioneuron_pilosum.html"},
 {id:"erioneuron-pilosum",i:3,hero:null,
  file:"content/taxa/Poaceae/Erioneuron/erioneuron-pilosum/images/tom-chester-hairy-tridens-woolly-spikelet-head-close.jpg",
  sha:"856648c6b058fd75a75ca9b6573bf85d0a96e8f6",
  source:"https://tchester.org/gc/plants/species/pix/erioneuron_pilosum/erioneuron_pilosum_3_crop_2.jpg",
  creator:"Tom Chester",license:"Copyright Tom Chester; permission to reproduce with source credit (not CC)",
  terms:"https://tchester.org/gc/plants/species/erioneuron_pilosum.html"},
 {id:"tridentopsis-mutica",i:1,hero:1,
  file:"content/taxa/Poaceae/Tridentopsis/tridentopsis-mutica/images/joey-inat-667323408.jpg",
  sha:"5e53f5816e02aa7b118e40edf9ad63526997523f",
  source:"https://www.inaturalist.org/photos/667323408",
  creator:"Joey Santore",license:"CC BY-NC 4.0",
  terms:"https://creativecommons.org/licenses/by-nc/4.0/"},
 {id:"tridentopsis-mutica",i:2,hero:null,
  file:"content/taxa/Poaceae/Tridentopsis/tridentopsis-mutica/images/joey-inat-667323452.jpg",
  sha:"aa0ea821fe8bbe059662bb6fb968cff0e4f66af4",
  source:"https://www.inaturalist.org/photos/667323452",
  creator:"Joey Santore",license:"CC BY-NC 4.0",
  terms:"https://creativecommons.org/licenses/by-nc/4.0/"}
];
assert.deepEqual(manifest.photos.slice(4).map(x=>x.species_id+":"+x.photo.i),
 restricted.map(x=>x.id+":"+x.i));
for(const check of restricted){
 const entry=manifest.photos.find(e=>e.species_id===check.id&&e.photo.i===check.i),p=entry?.photo;
 assert.ok(p,check.id+":"+check.i+" not in public photo manifest");
 assert.equal(entry.hero_i,check.hero);
 assert.equal(p.creator,check.creator);
 assert.equal(p.license,check.license);
 assert.equal(p.license_url,check.terms);
 assert.equal(p.source_page,check.source);
 assert.equal(p.hosted_git_blob_sha,check.sha);
 assert.equal(p.src,"https://crking92.github.io/Hays-Botany-Poaceae/"+check.file);
 assert.ok(p.photo_qa_note.includes("2026-11-15"),"Pixel review missing: "+check.file);
 if(check.creator==="Tom Chester")assert.ok(p.photo_qa_note.includes("permission"),"Explicit credited permission not recorded");
 else assert.ok(/noncommercial/i.test(p.photo_qa_note),"Joey CC BY-NC must restrict commercial reuse");
 const bytes=fs.readFileSync(path.join(root,check.file));
 assert.ok(bytes.length>30000,"Empty original photo: "+check.file);
 const sha=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 assert.equal(sha,check.sha,"Hosted image does not equal credited source: "+check.file);
}
for(const [id,total] of [["erioneuron-pilosum",4],["tridentopsis-mutica",3]]){
 const source=originals.find(x=>x.id===id),shown=visitor.find(x=>x.id===id);
 assert.equal(source.photos.length,1,"Original score gallery was modified for "+id);
 assert.equal(shown.photos.length,total,"New independent views absent for "+id);
 assert.equal(shown.hero_i,1,"Visitor must show flowering/habit photo first for "+id);
 assert.deepEqual(shown.photos[0],source.photos[0],"Historical creator/license mutated for "+id);
 assert.deepEqual(shown.traits,source.traits,"Photo overlay changed scoring for "+id);
 assert.equal(new Set(shown.photos.map(p=>p.src)).size,total,"Duplicate photo URL for "+id);
}
const tryRemoveOne=(index,property,value)=>{
 const altered=structuredClone(manifest);altered.photos[index].photo[property]=value;
 return install(structuredClone(originals),altered);
};
assert.equal(tryRemoveOne(4,"license_url","https://not-permitted.invalid/"),8,"Tom Chester permission page was ignored");
assert.equal(tryRemoveOne(5,"hosted_git_blob_sha","0".repeat(40)),8,"Unknown Tom Chester bytes were approved");
assert.equal(tryRemoveOne(6,"source_page","https://tchester.org/elsewhere.jpg"),8,"Different Tom Chester photo was approved");
assert.equal(tryRemoveOne(7,"license","CC BY 4.0"),8,"Changed noncommercial license was treated as approved");
assert.equal(tryRemoveOne(8,"creator","Uncredited"),8,"Joey image attribution can not change");
const comparisonStart=inline.indexOf("/* Existing photographs only.");
const comparisonEnd=inline.indexOf("function compareCandidates(){",comparisonStart);
assert.ok(comparisonStart>=0&&comparisonEnd>comparisonStart,"Comparison selector unavailable");
vm.runInContext(inline.slice(comparisonStart,comparisonEnd),sandbox);
const compare=(s)=>Array.from(vm.runInContext("comparisonPhotos(species)",Object.assign(sandbox,{species:s})));
for(const id of ["erioneuron-pilosum","tridentopsis-mutica"]){
 const photos=compare(visitor.find(x=>x.id===id));
 assert.equal(photos.length,2,"Two distinct credited comparisons not available for "+id);
 assert.equal(new Set(photos.map(p=>p.src)).size,2);
 assert.ok(photos.every(p=>p.source_page&&p.creator&&p.license),"A selected comparison photo lacks its source, creator or legal status");
 assert.ok(photos.some(p=>p.license_url),"Newly admitted rights-controlled photos must link the exact author permission or CC deed");
}
assert.ok(inline.includes("Author's reuse permission"),"Tom Chester permission link is not displayed");
assert.ok(inline.includes("Photo license terms"),"NC license link is not displayed");

assert.equal(JSON.stringify(originals),baseline,"In-memory photo overlay mutated original scored source records");
assert.ok(inline.includes('await fetch("photo-general-archive-extras.json"'),"Visitor boot does not retrieve supplement");
assert.ok(inline.includes("if(state.species.length!==112)"),"112 scored count guard removed");
assert.ok(inline.includes("const views=comparisonPhotos(s)"),"Comparison does not use same enriched photos");
console.log("PASS: nine exact-source, visually reviewed archived JPEGs; 514 source-photo records unchanged; 523 visitor references, 107 grasses with 2+ photos, 4 single and 1 still empty; strict author grant/CC BY-NC metadata verified; no scoring changes.");
