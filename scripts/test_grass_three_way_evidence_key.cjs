"use strict";
/* Three-way grass key: only documentary contradictions can set a species aside. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.join(__dirname,"..","site","visual-key-lab");
const read=n=>fs.readFileSync(path.join(root,n),"utf8");
const bundle=JSON.parse(read("optional-refinement-evidence.json"));
const html=read("index.html");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script,"Lab script missing");
new vm.Script(script,{filename:"grass-lab.js"});
assert.equal(bundle.evidence.length,1815,"preserve published character source rows");
assert.equal(bundle.characters.length,24,"all advanced groups stay present");
const scored=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(n=>JSON.parse(read("species-"+n+".json")));
assert.equal(scored.length,112,"original scored grass roster must not change");
const refs={};
for(const row of bundle.evidence)(refs[row.id]??=[]).push(row);
const state={selected:{head:null,habit:null,ligule:null,awns:null},refineSelected:{},refineOnlyDocumented:false,refineCharacters:bundle.characters,refineEvidenceMap:refs,range:"all",query:"",species:scored};
const sandbox={state};
vm.createContext(sandbox);
const section=script.slice(script.indexOf("function refinementEvidence("),script.indexOf("function renderOptionalCharacters(){"));
const results=script.slice(script.indexOf("function currentResults(){"),script.indexOf("function renderTabs(){"));
assert(section&&results,"key code boundaries missing");
vm.runInContext(section+"\n"+results,sandbox);
const inspect=()=>vm.runInContext("progressiveResultGroups(currentResults())",sandbox);
const excluded=()=>Array.from(inspect().excluded).map(row=>row.s.id);
const contradictions=id=>Array.from(vm.runInContext("verifiedAdvancedConflict({id:"+JSON.stringify(id)+"})",sandbox));
const sum=g=>g.confirmed.length+g.unresolved.length+g.excluded.length;
let groups=inspect();
assert(!groups.active&&!groups.excluded.length&&sum(groups)===112,"clear selections restore all grasses");
state.refineSelected={blade_width:"broad"};
groups=inspect();
assert(groups.excluded.length>0&&sum(groups)===112,"source-measured leaf width must set aside documented nonmatches");
assert(excluded().includes("bouteloua-hirsuta"),"1–2 mm documented blade width conflicts with >10 mm observation");
assert(!contradictions("setaria-italica").length,"an upper bound alone cannot justify exclusion");
const priorBrome=refs["bouteloua-hirsuta"];
refs["bouteloua-hirsuta"]=priorBrome.map(row=>row.character==="blade_width"?{...row,source_status:"READY_SUPPLEMENTAL_CONDITIONAL"}:row);
assert(!contradictions("bouteloua-hirsuta").length,"conditional supplemental trait cannot prove exclusion");
refs["bouteloua-hirsuta"]=priorBrome;
state.refineSelected={ligule_length:"tiny"};
assert(excluded().includes("muhlenbergia-lindheimeri"),"8–15 mm ligule conflicts with tiny membrane");
assert(contradictions("phragmites-australis").length===0,"unbounded tiny ligule cannot be ruled out");
// Approximate bands SHARE their 1, 2, 3 and 5 mm endpoints. The
// exact published interval must be consulted before calling a species
// incompatible merely because its pre-binned positive state differs.
for(const [species,char,choice,cutpoint] of [
 ["hordeum-murinum","ligule_length","short",1],
 ["bouteloua-hirsuta","blade_width","narrow",2],
 ["bothriochloa-ischaemum","blade_width","medium",5],
 ["melica-nitens","ligule_length","short",3]
]){
 const record=(refs[species]||[]).find(x=>x.character===char);
 assert(record,"Expected named species and measured trait present: "+species+"/"+char);
 const interval=char==="blade_width"?record.width_mm:record.length_mm;
 assert(Array.isArray(interval)&&interval[0]<=cutpoint&&interval[1]>=cutpoint,
   species+": source interval does not cross expected boundary "+cutpoint);
 state.refineSelected={[char]:choice};
 assert(!contradictions(species).some(x=>x.character===char),
   species+": adjacent approximate band wrongly treated as a documented contradiction");
}
state.refineSelected={blade_width:"broad"};
assert(excluded().includes("bouteloua-hirsuta"),
 "Clearly separated 1–2 vs >10 mm blade widths must still exclude when measured.");
state.refineSelected={florets_per_spikelet:"one"};
assert(excluded().includes("eragrostis-spectabilis"),"exact species mature several-floret count must conflict with one");
assert(!excluded().includes("bromus-japonicus"),"generic many-flowered note without exact source gate cannot eliminate");
state.refineSelected={blade_shape:"inrolled"};
assert(!contradictions("eragrostis-intermedia").length,"flat versus rolled leaf shape may be seasonal; leave unresolved");
state.refineSelected={glume_marks:"upper_one_vein"};
assert(!contradictions("cenchrus-setaceus").length,"new anatomy-specific option still lacks evidence; do not exclude");
state.refineSelected={blade_width:"narrow",ligule_edge:"lacerate"};
groups=inspect();assert(sum(groups)===112&&groups.unresolved.length>0,"missing or nonexclusive traits remain possible");
state.refineSelected={};
state.selected.head="fingers";
assert(vm.runInContext("currentResults()",sandbox).length<112,"original four-question conflicting-character exclusions must remain active");
state.selected.head=null;
assert(sum(inspect())===112,"clear both core and advanced observations restores all originals");
// The three rhizome descriptions are conflicting SOURCE reports, not
// verified absences or fully confirmed regional habit matches. Keep the
// underlying literature states available, but keep their rhizome results
// reviewable under Still possible until the owner rechecks their book.
state.refineSelected={};state.selected={head:null,habit:"rhizome",ligule:null,awns:null};
const disputed=["bouteloua-dactyloides","eragrostis-intermedia","hopia-obtusa"];
groups=inspect();
for(const id of disputed){
 assert(groups.unresolved.some(x=>x.s.id===id&&x.rhizomeSourceHold),
   id+": source-disputed rhizome wrongly presented as confirmed or excluded");
 assert(!groups.confirmed.some(x=>x.s.id===id),
   id+": conflicting rhizome reports called confirmed");
 assert(!groups.excluded.some(x=>x.s.id===id),
   id+": source uncertainty mislabeled as evidence of absence");
}
assert(sum(groups)===vm.runInContext("currentResults().length",sandbox),
 "Rhizome review hold silently removes a grass");
state.selected={head:null,habit:null,ligule:null,awns:null};
assert(inspect().confirmed.length===112,"Clearing rhizome restores all 112 scored base grasses");

// Repeated observation of the SAME pale central vein or node gland ring
// deserves only ONE positive ranking point despite two available UI labels.
// Independent anatomy remains separately selectable.
function matchCount(id){return vm.runInContext(
 "refinementMatches(state.species.find(s=>s.id==="+JSON.stringify(id)+")).length",sandbox);}
state.refineSelected={blade_midnerve:"pale_center"};
assert.equal(matchCount("sorghum-halepense"),1,"Pale midrib source record missing");
state.refineSelected={blade_venation:"pale_midvein"};
assert.equal(matchCount("sorghum-halepense"),1,"Venation midrib source record missing");
state.refineSelected={blade_midnerve:"pale_center",blade_venation:"pale_midvein"};
assert.equal(matchCount("sorghum-halepense"),1,"One pale midrib counted twice");
state.refineSelected={stem_nodes:"gland_ring"};
assert.equal(matchCount("eragrostis-cilianensis"),1,"Node gland source record missing");
state.refineSelected={stem_special:"node_gland_ring"};
assert.equal(matchCount("eragrostis-cilianensis"),1,"Special node gland source record missing");
state.refineSelected={stem_nodes:"gland_ring",stem_special:"node_gland_ring"};
assert.equal(matchCount("eragrostis-cilianensis"),1,"One culm-node gland ring counted twice");
state.refineSelected={};
assert(html.includes('const advancedExcluded=groups.excluded.map('),"advanced exclusions must appear in visitor review section");
assert(html.includes('Published evidence: '),"published source links must accompany exclusions");
assert(html.includes("const excludedIds=new Set(groups.excluded.map("),"excluded matches should not remain in main results");
// Exact callus/beard vs separate sterile-branchlet anatomy from Chat D.
const wrongBelow=[
 "bothriochloa-bladhii","anatherum-virginicum","andropogon-gerardi",
 "avena-fatua","chasmanthium-latifolium","heteropogon-contortus",
 "miscanthus-sinensis","nassella-tenuissima","tridentopsis-buckleyana"
];
const originalCount=bundle.evidence.length;
for(const id of wrongBelow){
 const e=(refs[id]||[]).find(x=>x.character==="floral_hair_position");
 assert(e?.states.includes("below_spikelet"),id+": historical callus state not present for correction");
 assert(e.source_url?.startsWith("https://"),id+": exact source record not linked");
}
const remapStart=script.indexOf("const callusInsteadOfBristles=[");
const remapEnd=script.indexOf("state.refineEvidenceOptionKeys=new Set(",remapStart);
assert(remapStart>0&&remapEnd>remapStart,"Runtime callus/bristle organ correction missing");
vm.runInContext(script.slice(remapStart,remapEnd),sandbox);
for(const id of wrongBelow){
 const e=refs[id].find(x=>x.character==="floral_hair_position");
 assert(!e.states.includes("below_spikelet"),id+": still falsely shown as independent subtending bristles");
 assert(e.states.includes("spikelet_callus_hairs"),id+": true callus hairs not selectable");
}
state.refineSelected={floral_hair_position:"below_spikelet"};
assert(vm.runInContext('refinementMatches({id:"setaria-parviflora"})',sandbox).length===1,
 "Setaria's verified separate branchlet bristles accidentally removed");
for(const id of wrongBelow)
 assert(vm.runInContext("refinementMatches({id:"+JSON.stringify(id)+"})",sandbox).length===0,
  id+": wrong positive bristle match persisted");
state.refineSelected={floral_hair_position:"spikelet_callus_hairs"};
for(const id of wrongBelow)
 assert(vm.runInContext("refinementMatches({id:"+JSON.stringify(id)+"})",sandbox).length===1,
  id+": correct callus match missing");
assert.equal(bundle.evidence.length,originalCount,"Master row count changed during exact organ remap");
state.refineSelected={};
console.log("PASS: 169-universe policy, 24 groups, 1815 sources, 112 unchanged core, conservative measured/exact exclusions and reversible unknowns");
