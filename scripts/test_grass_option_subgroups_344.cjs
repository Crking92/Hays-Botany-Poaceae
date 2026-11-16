"use strict";
/* Anatomical option audit: 24 existing groups, scoped suboptions, multiple
 * observed structures, unknown-safe positive ranking and share-link fidelity. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","site","visual-key-lab");
const bundle=JSON.parse(fs.readFileSync(path.join(root,"optional-refinement-evidence.json"),"utf8"));
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error("Cannot inspect live lab script");
new vm.Script(script,{filename:"visual-key-lab-inline.js"});
if(bundle.characters.length!==24||bundle.mode!=="NON_EXCLUDING_POSITIVE_RANKING")throw Error("24 existing character groups changed");
if(bundle.evidence.length!==1815)throw Error("Option-only change altered source-backed evidence");
const byId=Object.fromEntries(bundle.characters.map(x=>[x.id,x]));
for(const c of bundle.characters){
 const ids=c.options.map(x=>x.id);
 if(new Set(ids).size!==ids.length)throw Error(c.id+" duplicate option");
 if(c.subgroups){
  const grouped=c.subgroups.flatMap(g=>g.options);
  if(grouped.length!==ids.length||new Set(grouped).size!==ids.length||grouped.some(x=>!ids.includes(x)))
   throw Error(c.id+" incomplete / duplicated anatomical scope groups");
 }
}
const exact={
 glume_marks:["lower_one_vein","upper_one_vein","central_glume_glabrous","central_glume_scabrous"],
 floral_hair_position:["lower_sterile_lemma_hairs","upper_fertile_lemma_hairs","spikelet_callus_hairs"],
 true_lemma_awn:["fertile_awn_2_to_5mm","lower_sterile_awn_variable","apical_mucro"]
};
for(const [group,options] of Object.entries(exact)){
 if(!byId[group].multi_select||!byId[group].subgroups)throw Error("Missing scoped multiple selections for "+group);
 for(const id of options){
  const o=byId[group].options.find(x=>x.id===id);
  if(!o?.evidence_pending)throw Error("Unsourced new state cannot become a scored fact: "+group+"/"+id);
  if(bundle.evidence.some(r=>r.character===group&&r.states.includes(id)))throw Error("Unexpected new species assignment: "+group+"/"+id);
 }
}
if(byId.leaf_base.options.find(o=>o.id==="pointed_auricles").label.toLowerCase().includes("upright"))
 throw Error("Pointed auricles still assert an unsupported vertical orientation");
for(const k of ["leaf_base","sheath_margins","blade_venation","lemma_texture","surface_runners"])
 if(!byId[k].multi_select)throw Error("Simultaneous observable details not enabled: "+k);
const section=script.slice(script.indexOf("function refinementEvidence("),script.indexOf("function renderOptionalCharacters(){"));
const results=script.slice(script.indexOf("function currentResults(){"),script.indexOf("function renderTabs(){"));
const urlFn=script.slice(script.indexOf("function updateUrl(){"),script.indexOf("function choose("));
if(!section||!results||!urlFn)throw Error("Optional selector entry points unavailable");
const refs={};
for(const r of bundle.evidence)(refs[r.id]??=[]).push(r);
const files=["species-a.json","species-b.json","species-c1.json","species-c2.json","species-c3.json","species-d1.json","species-d2.json","species-d3.json","species-d4.json"];
const species=files.flatMap(n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8")));
if(species.length!==112)throw Error("Original verified 112 changed");
const state={refineSelected:{},refineEvidenceMap:refs,refineCharacters:bundle.characters,selected:{head:null,habit:null,ligule:null,awns:null},range:"all",query:"",species};
const location={href:"https://example.org/site/visual-key-lab/?guest=1"};
let writtenUrl;
const history={replaceState(_a,_b,x){writtenUrl=x;}};
const sandbox={state,location,history,URL,qs:["head","habit","ligule","awns"].map(id=>({id}))};
vm.createContext(sandbox);vm.runInContext(section+"\n"+results+"\n"+urlFn,sandbox);
const match=id=>Array.from(vm.runInContext("refinementMatches({id:"+JSON.stringify(id)+"})",sandbox));
// Progressive key must narrow the visible list while preserving unknown species
// as explicit review candidates, never promoting research trials or invented states.
const progressive=()=>vm.runInContext("progressiveResultGroups(currentResults())",sandbox);
const initial=progressive();
if(initial.active||initial.confirmed.length!==112||initial.unresolved.length)throw Error("Unselected key should begin with all grasses");
state.refineSelected={blade_width:"narrow"};
const widthGroups=progressive();
if(!widthGroups.active||!widthGroups.confirmed.length||!widthGroups.unresolved.length||
 widthGroups.confirmed.length+widthGroups.unresolved.length!==112)
 throw Error("Leaf width selection must narrow main results but preserve all unknown possibilities");
if(widthGroups.confirmed.some(r=>!refs[r.s.id]?.some(e=>e.character==="blade_width"&&e.states.includes("narrow"))))
 throw Error("Main matches include a grass without matching evidence");
state.refineSelected={blade_width:"narrow",glume_marks:["upper_one_vein"]};
const pendingGroups=progressive();
if(pendingGroups.confirmed.length||pendingGroups.unresolved.length!==112)
 throw Error("Research-pending detail cannot invent matching species or eliminate unknowns");
state.refineSelected={};
if(progressive().active||progressive().confirmed.length!==112)throw Error("Clearing selections must restore entire baseline");
if(!html.includes('id="unresolved-candidates"')&&!script.includes('unknown.id="unresolved-candidates"'))
 throw Error("Unresolved species are not accessible through the progressive disclosure");

const current=()=>Array.from(vm.runInContext("currentResults()",sandbox));
const n0=current().length;if(n0!==112)throw Error("Baseline filtering mutated");
state.refineSelected={glume_marks:["lower_reduced","one_vein"]};
let m=match("cenchrus-setaceus");
if(m.length!==1||m[0].matched.length!==2)throw Error("Two source-supported glume observations must count as exactly ONE character");
if(current().length!==n0)throw Error("Optional double observation excluded grasses");
state.refineSelected={glume_marks:["lower_reduced","upper_one_vein"]};
m=match("cenchrus-setaceus");
if(m.length!==1||m[0].matched.length!==1)throw Error("Pending exact side of glume cannot silently match a generic glume observation");
state.refineSelected={glume_marks:["upper_one_vein"]};
if(match("cenchrus-setaceus").length||current().length!==n0)throw Error("Evidence pending must remain non-scoring and non-excluding");
state.refineSelected={true_lemma_awn:["long","none"]};
m=match("triticum-aestivum");
if(m.length!==1||m[0].matched.length!==2)throw Error("Wheat cultivar-variant awned and awnless observations should not double-score");
state.refineSelected={floral_hair_position:["lemma","rachilla"]};
if(match("arundo-donax").length!==1||match("phragmites-australis").length!==1)
 throw Error("Lemma/rachilla organ distinction lost");
state.refineSelected={blade_width:"narrow"};
if(vm.runInContext('selectedRefinementStates("blade_width").join(",")',sandbox)!=="narrow")
 throw Error("Existing one-choice bookmarks must still score");
state.refineSelected={glume_marks:["lower_reduced","one_vein"],leaf_base:["pointed_auricles"]};
vm.runInContext("updateUrl()",sandbox);
const url=new URL(writtenUrl);
if(url.searchParams.get("more_glume_marks")!=="lower_reduced,one_vein"||
   url.searchParams.get("more_leaf_base")!=="pointed_auricles"||
   url.searchParams.get("guest")!=="1")
 throw Error("Scoped optional observations do not survive share-link encoding");
if((script.match(/const selectedIds=selectedRefinementStates\(c\.id\);const selected=c\.options\.find\(o=>o\.id===selectedIds\[selectedIds\.length-1\]\);/g)||[]).length!==5)throw Error("Teaching guides must follow the most recently picked detail in every optional plant-part area");
if(!script.includes('val.split(",").filter(id=>c.options.some(o=>o.id===id))'))
 throw Error("Share-link multi-option decoding missing");
if(!script.includes('choices.querySelectorAll("button[data-option]")')||
   !script.includes('const makeButton=o=>')||
   !script.includes('if(Array.isArray(c.subgroups))'))
 throw Error("Scoped clickable suboptions absent from visitor HTML");
// All 111 exposed options must have an evidence count, or explicitly be research-pending.
const optionCounts=new Map();
for(const evidence of bundle.evidence)for(const id of evidence.states){
 const key=evidence.character+":"+id;optionCounts.set(key,(optionCounts.get(key)||0)+1);
}
const allOptions=bundle.characters.flatMap(c=>c.options.map(o=>[c.id,o]));
if(allOptions.length!==111||optionCounts.size!==98)throw Error("Menu/evidence coverage changed; re-audit options");
for(const [id,o] of allOptions){
 const backed=optionCounts.has(id+":"+o.id);
 if(backed===Boolean(o.evidence_pending))throw Error("Incorrect evidence-pending state: "+id+"/"+o.id);
}
if(!script.includes('n+" source-documented grass"')||!html.includes('id="optional-documented-only"'))throw Error("No evidence counts / documented-only control visible");
const documentedGrass=species.find(s=>refs[s.id]?.some(e=>e.character==="blade_width"&&e.states.length));
if(!documentedGrass)throw Error("No original grass has a documented leaf width");
const documentedWidth=refs[documentedGrass.id].find(e=>e.character==="blade_width").states[0];
state.refineSelected={blade_width:documentedWidth};
state.refineOnlyDocumented=true;
if(!current().some(x=>x.s.id===documentedGrass.id)||current().length>=n0)throw Error("Evidence-only mode failed to narrow source-backed grasses");
state.refineSelected={glume_marks:["upper_one_vein"]};
if(current().length!==0)throw Error("Pending glume detail must not yield fabricated species matches");
state.refineOnlyDocumented=false;
if(current().length!==n0)throw Error("Unknown-safe baseline was not restored");
const compareStart=script.indexOf("function comparisonFeatureRows(species){");
const compareEnd=script.indexOf("function inspectComparisonFeature(feature){");
if(compareStart<0||compareEnd<=compareStart)throw Error("Comparison source unavailable");
vm.runInContext(script.slice(compareStart,compareEnd),sandbox);
state.refineSelected={glume_marks:["lower_reduced","one_vein"]};
const comp=Array.from(vm.runInContext('comparisonFeatureRows([{id:"cenchrus-setaceus",traits:{}}])',sandbox));
if(Array.from(comp.find(x=>x.id==="glume_marks").selectedValues).join(",")!=="lower_reduced,one_vein")throw Error("Comparison lost one multi-option selection");
if(!script.includes("const matches=chosen.filter(v=>feature.values[i].includes(v))"))throw Error("Comparison still checks a joined option string");

console.log("PASS: 24 character groups, 10 pending anatomically scoped options, 1815 unchanged evidence records, 112 scored grasses protected, independent multi-picks count once and survive URL sharing.");
