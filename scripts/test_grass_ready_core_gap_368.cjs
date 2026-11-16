"use strict";
/* Complete acceptance of A-D's 28 newly verified CORE choices from #368,
 * plus the one omitted Polypogon grass habit. No more botanical research or
 * production photo changes. Preserve 13 exact unknowns. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const dir=path.join(__dirname,"..","site","visual-key-lab");
const read=file=>JSON.parse(fs.readFileSync(path.join(dir,file),"utf8"));
const base=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(n=>read("species-"+n+".json"));
const trials=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"].flatMap(n=>read(n).profiles);
const manifest=read("hays-candidates.json").candidates;
const assignments=read("ready-core-gap-assignments.json");
const admissions=read("source-scored-admissions.json").admissions;
assert.equal(base.length,112);assert.equal(trials.length,53);assert.equal(manifest.length,57);assert.equal(admissions.length,4);
assert.equal(assignments.schema,"HAYS_GRASS_READY_CORE_GAPS_V1");assert.equal(assignments.integration_count,28);
assert.equal(assignments.rows.length,28);assert.equal(assignments.held_unknown.length,13);
assert.equal(assignments.prior_research_master_records,1815);
const original=new Set(base.map(s=>s.id)),byTrial=new Map(trials.map(s=>[s.id,s]));
const expectedMissing=new Set(trials.flatMap(s=>["habit","ligule","awns"].filter(k=>!s.traits[k].length).map(k=>s.id+"|"+k)));
assert.equal(expectedMissing.size,41,"Unexpected source-packet core gap count");
const allowed={habit:new Set(["tuft","mat","rhizome","aquatic_rooted"]),ligule:new Set(["hairs","membrane","absent"]),awns:new Set(["three","three_short","long","bristles","none_obvious","burs"])};
const seen=new Set(),selected=new Map();
for(const r of assignments.rows){
 const key=r.id+"|"+r.character;assert(expectedMissing.has(key),"Nonmissing baseline trait incorrectly overwritten: "+key);
 assert(!seen.has(key)&&!original.has(r.id),"Duplicate or original-112 override: "+key);
 seen.add(key);assert(r.status.includes("READY"),key+": not source-approved");
 assert(r.states.length&&!r.states.some(s=>!allowed[r.character].has(s)),key+": unsupported menu option");
 assert(r.source_url?.startsWith("https://")&&r.source_citation&&r.handoff?.includes("issues/368#issuecomment-"),key+": source/decision evidence missing");
 assert(r.variation_note&&r.variation_note.length>45,key+": specific variation or anatomical note missing");
 selected.set(key,r);
}
for(const hold of assignments.held_unknown){const key=hold.id+"|"+hold.character;assert(expectedMissing.has(key),key+": not an originally blank option");assert(!seen.has(key),key+": a source hold was filled");seen.add(key)}
assert.equal(seen.size,41,"One or more previous missing assignments were silently dropped");
assert(seen.has("polypogon-viridis|habit")&&selected.get("polypogon-viridis|habit").states.includes("mat"),"Lane C omitted Water bentgrass gap not recovered");
const species=[...base,...trials.map(s=>structuredClone(s))];
const bySpecies=new Map(species.map(s=>[s.id,s]));
for(const r of assignments.rows){
 const s=bySpecies.get(r.id);assert(s&&s.trial);assert.equal(s.traits[r.character].length,0);
 s.traits[r.character]=[...r.states];(s.positiveOnlyCoreKeys??=[]).push(r.character);
}
const html=fs.readFileSync(path.join(dir,"index.html"),"utf8"),js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js,"Missing Grass Lab script");new vm.Script(js);
for(const required of [
 "ready-core-gap-assignments.json","s.positiveOnlyCoreKeys?.includes(key)","source-scored-admissions.json",
 "Original 41-specific-gap coverage changed","Newly source-verified field characters"
])assert(js.includes(required),"Missing live key source-safe logic: "+required);
const fragment=js.slice(js.indexOf("function refinementEvidence("),js.indexOf("function renderOptionalCharacters(){"));
const results=js.slice(js.indexOf("function currentResults(){"),js.indexOf("function renderTabs(){"));
const pack=read("optional-refinement-evidence.json");
const ev=pack.evidence.reduce((acc,row)=>( (acc[row.id]??=[]).push(row), acc ),{});
const state={species,refineSelected:{},refineCharacters:pack.characters,refineEvidenceMap:ev,refineOnlyDocumented:false,range:"all",query:"",selected:{head:null,habit:null,ligule:null,awns:null}};
const context={state,qs:["head","habit","ligule","awns"].map(id=>({id}))};vm.createContext(context);
vm.runInContext(fragment+"\n"+results,context);
const get=()=>vm.runInContext("progressiveResultGroups(currentResults())",context);
const total=g=>g.confirmed.length+g.unresolved.length+g.excluded.length;
// Unknown-safe new mapping must not create a hard negative for a source that
// only established a positive option (e.g. caespitose vs decumbent variants).
state.selected.habit="tuft";
let res=get();
assert.equal(total(res),169,"A core choice silently dropped research candidates");
assert(res.unresolved.some(x=>x.s.id==="polypogon-viridis"),"Mat-only positive Polypogon improperly excluded by 'tuft'");
state.selected.habit="mat";res=get();
assert.equal(total(res),169);
assert(res.confirmed.some(x=>x.s.id==="polypogon-viridis"),"Documented Polypogon mat habit not positively matched");
assert(res.unresolved.some(x=>x.s.id==="briza-minor"),"Tuft-only Briza improperly excluded by mat");
state.selected={head:null,habit:null,ligule:null,awns:null};
assert.equal(get().confirmed.length,169,"Cleared key did not restore 169");
for(const hold of assignments.held_unknown){
 const s=bySpecies.get(hold.id);
 assert(s&&s.traits[hold.character].length===0,"Held unknown unexpectedly scored: "+hold.id+"|"+hold.character);
}
console.log(JSON.stringify({result:"PASS",original112:112,unmodifiedTrialPackets:53,visibleGrasses:169,readyCoreFields:28,documentedHolds:13,recoveredPolypogon:true,sourceRowsPreserved:1815,negativeExclusionsFromNewFields:0}));
