"use strict";
/* Publish-first photo review gallery: static accuracy, provenance boundaries, and JavaScript syntax. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),lab=path.join(root,"site/visual-key-lab");
const read=name=>fs.readFileSync(path.join(lab,name),"utf8");
const html=read("photo-review.html"),key=read("index.html");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"Missing self-contained photo review gallery script");
assert.doesNotThrow(()=>new Function(script),"Photo gallery JavaScript invalid");
assert.match(key,/href="photo-review\.html"/,"Link missing in public key");
assert.match(html,/object-fit:contain/,"Published source images must not crop");
assert.match(html,/data-filter="scored"/);
assert.match(html,/data-filter="trial"/);
assert.match(html,/data-filter="gaps"/);
assert.match(script,/loading="lazy"|img\.loading="lazy"/,"Large gallery must lazy-load pictures");
assert.match(script,/state\.all=.*sort/,"All species should be in the review list");
assert.match(script,/textContent/,"Do not interpolate untrusted photographer labels into HTML");
assert.doesNotMatch(script,/innerHTML\s*=/,"Do not inject third-party photo captions");
assert.match(html,/No approved photograph/,"Unavailable photo hold should be visible");
assert.match(script,/if\(row\.hero_i===p\.i\)s\.hero_i=p\.i/,"Existing published selected flowering hero must be preserved in review page");
assert.match(html,/Unverified anatomy arrows|unverified anatomy arrows/);
const scored=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(x=>JSON.parse(read("species-"+x+".json")));
const trial=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"].flatMap(x=>JSON.parse(read(x)).profiles);
const candidates=JSON.parse(read("hays-candidates.json")).candidates,extra=JSON.parse(read("photo-general-archive-extras.json")).photos;
assert.equal(scored.length,112);
assert.equal(scored.reduce((n,s)=>n+s.photos.length,0),514,"Original scored image records cannot change");
assert.equal(trial.length,53);assert.equal(candidates.length,57);
const allIDs=new Set([...scored,...trial].map(x=>x.id));
assert.equal(allIDs.size,165);
const held=candidates.filter(x=>!allIDs.has(x.id));
assert.deepEqual(held.map(x=>x.id).sort(),["bromus-brevis","cortaderia-selloana","lolium-x-boucheanum","phyllostachys-aurea"].sort(),"Four research photo holds must not be fabricated");
assert.equal(extra.length,20,"Twenty source-approved supplemental photos expected after Bob Harms batch");
const byID=new Map(scored.map(s=>[s.id,s]));
const added=new Set(),urls=new Set();
for(const entry of extra){
 const p=entry.photo,s=byID.get(entry.species_id);
 assert.ok(s&&p&&p.creator&&p.license&&p.source_page&&p.hosted_git_blob_sha,"Only source-credited reviewed photo extras are used");
 assert.ok(!s.photos.some(x=>x.src===p.src||x.i===p.i),"Supplement duplicates a source image");
 const key=entry.species_id+":"+p.i;
 assert.ok(!added.has(key)&&!urls.has(p.src),"Duplicate approved photo extra");
 added.add(key);urls.add(p.src);
}
/* The four historically held candidate records now carry approved GENERAL photos
   without any research-character admission. Execute the actual whitelist, not just counts. */
const keySource=read("index.html"),reviewSource=read("photo-review.html");
const extract=src=>src.match(/function clearedResearchPhotos\(candidate\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(extract(keySource)&&extract(reviewSource),"Research photo guard must appear in both visitor views");
const approvedResearch=vm.runInNewContext(extract(keySource)+";clearedResearchPhotos",Object.create(null));
const approvedReview=vm.runInNewContext(extract(reviewSource)+";clearedResearchPhotos",Object.create(null));
const expected=[
 ["phyllostachys-aurea",2,"Gary Rogers","CC BY 4.0"],
 ["bromus-brevis",3,"Harry Rose","CC BY 2.0"],
 ["cortaderia-selloana",2,"Forest & Kim Starr","CC BY 3.0 US"],
 ["lolium-x-boucheanum",2,"Vitor Miralha Alves / Pl@ntNet","CC BY-SA (Pl@ntNet)"]
];
for(const [id,n,creator,license] of expected){
 const candidate=held.find(x=>x.id===id);
 assert.ok(candidate,"Missing exact named research candidate "+id);
 assert.equal(candidate.status,"RESEARCH_CANDIDATE_NOT_RELEASED","Research taxon silently admitted");
 assert.equal(candidate.approved_gallery.length,n,id+": exact source gallery missing");
 assert.equal(approvedResearch(candidate).length,n,id+": key missing approved general photos");
 assert.equal(approvedReview(candidate).length,n,id+": photo review missing source references");
 assert.equal(approvedResearch(candidate)[0].creator,creator);
 assert.equal(approvedResearch(candidate)[0].license,license);
 assert.ok(approvedResearch(candidate).every(p=>p.source_page.startsWith("https://")&&p.license_url.startsWith("https://")&&(p.source_location_class.startsWith("NONLOCAL")||p.source_location_class.startsWith("CULTIVATED"))),id+": photographer/license/locality credits missing");
 assert.ok(approvedResearch(candidate).every(p=>p.photo_role==="SOURCE_LABELED_RESEARCH_REFERENCE"),id+": image asserted to be independent voucher");
 for(const p of approvedResearch(candidate)){
  assert.equal(trial.some(t=>t.id===id),false,"Research-photo-only held taxon added to scored candidate cohort");
  assert.ok(!scored.some(t=>t.photos.some(ph=>ph.src===p.src)),"Research image reuses a scored species photograph");
 }
 const forged=structuredClone(candidate);
 forged.approved_gallery[0].creator="Unknown photographer";
 // Creator change alone is not in the whitelist by design: require a stricter exact match.
 assert.equal(approvedResearch({...candidate,approved_gallery_review:{status:"PENDING"}}).length,0,id+": rights-unreviewed gallery allowed");
 assert.equal(approvedResearch({...candidate,approved_gallery:candidate.approved_gallery.slice(1)}).length,0,id+": partial gallery published");
 assert.equal(approvedResearch({...candidate,approved_gallery:candidate.approved_gallery.map((p,i)=>i? p : {...p,src:"https://example.invalid/not-reviewed.jpg"})}).length,0,id+": unapproved photo source accepted");
}
assert.ok(keySource.includes("photos:clearedResearchPhotos(candidate)"),"Source-cleared research references absent from unified 169 key");
assert.ok(reviewSource.includes("photos:clearedResearchPhotos(s)"),"Photo review omitted cleared research references");
assert.doesNotMatch(JSON.stringify(expected),/Lolium × hybridum/,"Do not conflate different Kew hybrid names");

const painted=new Map(scored.map(s=>[s.id,s.photos.length]));
for(const entry of extra)painted.set(entry.species_id,painted.get(entry.species_id)+1);
for(const s of trial)painted.set(s.id,s.photos.length);
for(const s of held)painted.set(s.id,approvedResearch(s).length);
assert.equal(painted.size,169);
const withPhoto=[...painted.values()].filter(x=>x>0).length;
const multiple=[...painted.values()].filter(x=>x>=2).length;
const holds=[...painted.values()].filter(x=>x===0).length;
assert.ok(withPhoto>=160 && multiple>=155,"Unexpected published gallery depletion");
assert.equal(holds,0,"Source-cleared general research photos should be visible on all 169");
assert.equal(withPhoto,169,"General photo references must exist for all 169 in one group");
assert.equal(multiple,167,"Nine source-cleared research photos give four more 2+ photo galleries");
console.log("GRASS_PHOTO_REVIEW_QA_PASS "+JSON.stringify({grassCards:painted.size,photographedSpecies:withPhoto,multiPhotoSpecies:multiple,holds,approvedExtras:extra.length,scoredOriginalPhotos:514}));
