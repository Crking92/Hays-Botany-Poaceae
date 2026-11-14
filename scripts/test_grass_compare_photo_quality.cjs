"use strict";
// Check proposed comparison photo placements against the existing published
// source/creator/rights records. This does not relicense or validate new images.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const lab=path.join(__dirname,"..","site","visual-key-lab");
const html=fs.readFileSync(path.join(lab,"index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(script);
new Function(script);
const from=script.indexOf("/* Existing photographs only.");
const until=script.indexOf("function compareCandidates(){",from);
assert.ok(from>=0&&until>from,"Comparison photo selector not found");
const sandbox={};vm.createContext(sandbox);vm.runInContext(script.slice(from,until),sandbox);
const select=s=>Array.from(vm.runInContext("comparisonPhotos(species)",Object.assign(sandbox,{species:s})));
const names=["species-a","species-b","species-c1","species-c2","species-c3",
 "species-d1","species-d2","species-d3","species-d4"];
const scored=names.flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,n+".json"),"utf8")));
assert.equal(scored.length,112,"Officially scored grass inventory must stay 112");
const trials=["provisional-trial-profiles","provisional-trial-batch2","provisional-trial-batch3",
 "provisional-trial-batch4","provisional-trial-batch5-a","provisional-trial-batch5-b","provisional-trial-batch5-c"]
 .flatMap(n=>JSON.parse(fs.readFileSync(path.join(lab,n+".json"),"utf8")).profiles||[]);
const uniqueTrials=[...new Map(trials.map(s=>[s.id,s])).values()];
assert.equal(uniqueTrials.length,53,"Expected 53 trial profiles in normal key; research remains unverified");
let displayed=0,secondary=0,missing=[];
for(const s of scored.concat(uniqueTrials)){
 const views=select(s);
 assert.ok(views.length<=2,"Too many comparison images: "+s.id);
 if(!views.length)missing.push(s.id);else displayed++;
 if(views.length===2)secondary++;
 assert.equal(new Set(views.map(p=>p.src)).size,views.length,"Duplicate pixels selected for "+s.id);
 for(const p of views){
  assert.ok((s.photos||[]).some(o=>o.src===p.src),"Invented comparison photo for "+s.id);
  assert.ok(p.source_page?.startsWith("https://")&&p.src.startsWith("https://"),
   "Missing origin/source for "+s.id);
  assert.ok(p.creator&&p.license,"Missing existing creator or license for "+s.id);
  assert.ok(!/version not recorded|rights hold|copyright reserved/i.test(p.license+" "+p.label),
   "Unreviewed photo was promoted: "+s.id);
 }
}
const byId=id=>scored.find(s=>s.id===id);
assert.deepEqual(select(byId("muhlenbergia-x-involuta")).map(p=>p.i),[],"Hybrid remains photo hold");
assert.deepEqual(select(byId("anatherum-tenuispatheum")).map(p=>p.i),[0],
 "Duplicate and mismatched-species Starr frames must not be reused");
assert.equal(select(byId("triplasiella-eragrostoides"))[0].i,0,
 "Other grass in photo must not be featured");
for(const [id,held] of Object.entries({"aristida-oligantha":[3,4],
 "eragrostis-trichodes":[4,6],
 "chloris-andropogonoides":[3,4],
 "dinebra-panicea-subsp-mucronata":[4,6]})){
 assert.ok(select(byId(id)).every(p=>!held.includes(p.i)),
  "Photo held over exact-source rights appeared in new comparison: "+id);
}
assert.deepEqual(select(byId("nassella-leucotricha")),[],
 "Photos with unspecified CC BY versions stay out of new placements");
assert.ok(displayed>=130&&secondary>=110,"Comparison photo selection unexpectedly lost broad gallery coverage");
assert.ok(html.includes('.compare-photo .photo-frame img{object-fit:contain}'),
 "Do not crop seedheads or panicles");
assert.ok(html.includes("Comparison photo pending identity or rights verification."));
assert.ok(html.includes("Only one cleared comparison view is recorded"));
assert.ok(html.includes('figure.append(image(p,s.common+" — "+(p.label||"photograph")),caption)'));
assert.ok(html.includes('caption.append(label,byline)'));
assert.ok(html.includes('p?.source_page?.startsWith("https://")'));
assert.ok(html.includes("const features=comparisonFeatureRows(species)"));
assert.ok(html.includes("b.refinementMatches.length-a.refinementMatches.length"));
console.log("PASS: "+scored.length+" scored grasses + "+uniqueTrials.length+" research trials audited for new comparison placements; "+displayed+" with a comparison image, "+secondary+" with a second source-labeled view; "+missing.length+" unresolved holds. No new image records or evidence.");
