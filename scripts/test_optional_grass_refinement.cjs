/* Verify extra optional character selections cannot exclude a grass. */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname,"..","site","visual-key-lab");
const html = fs.readFileSync(path.join(root,"index.html"),"utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw Error("Grass Lab script unavailable");
const begin = script.indexOf("function refinementEvidence(");
const end = script.indexOf("function renderOptionalCharacters(){");
const startResults = script.indexOf("function currentResults(){");
const endResults = script.indexOf("function renderTabs(){");
if (Math.min(begin,end,startResults,endResults)<0 || !(begin<end&&startResults<endResults)) throw Error("Cannot isolate refinement and original filtering");
const functions = script.slice(begin,end) + "\n" + script.slice(startResults,endResults);
const names=["species-a.json","species-b.json","species-c1.json","species-c2.json","species-c3.json",
  "species-d1.json","species-d2.json","species-d3.json","species-d4.json"];
const species=names.flatMap(n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8")));
if(species.length!==112)throw Error("Original scored count drift");
const pack=JSON.parse(fs.readFileSync(path.join(root,"optional-refinement-evidence.json"),"utf8"));
const refs={};
for(const e of pack.evidence)(refs[e.id]??=[]).push(e);
const state={selected:{head:null,habit:null,ligule:null,awns:null},range:"all",query:"",
  species,refineCharacters:pack.characters,refineSelected:{},refineEvidenceMap:refs};
const sandbox={state};vm.createContext(sandbox);vm.runInContext(functions,sandbox);
const run=()=>Array.from(vm.runInContext("currentResults()",sandbox)).map(x=>({id:x.s.id,extras:x.refinementMatches.length,unknown:x.unknown}));
const full=run();if(full.length!==112)throw Error("Baseline excludes species");
const baselineSet=new Set(full.map(x=>x.id));
function verifyUnchanged(label) {
 const got=run();if(got.length!==112)throw Error(label+" deleted a species");
 if(got.some(x=>!baselineSet.has(x.id)))throw Error(label+" mutated candidate IDs");
 return got;
}
state.refineSelected={blade_tip:"boat_tipped"};
let got=verifyUnchanged("boat-tip");
if(got[0].id!=="poa-annua"||got[0].extras===0)throw Error("Boat-tip evidence did not positively rank Poa annua");
state.refineSelected={blade_tip:"hardened_tip"};
got=verifyUnchanged("hardened tip");
if(!got.some(x=>x.id==="erioneuron-pilosum"&&x.extras>0))throw Error("Prior Erioneuron hardened-tip positive match lost");
state.refineSelected={blade_width:"broad"};
got=verifyUnchanged("broad blade");
if(got.filter(x=>x.extras>0).length<4)throw Error("Broad-width evidence did not match sufficiently");
state.refineSelected={blade_shape:"folded",blade_width:"narrow",blade_edge:"serrate"};
verifyUnchanged("multiple contradictory clues");
state.refineSelected={blade_shape:"flat"};
let c=run().find(x=>x.id==="chloris-virgata");
if(!c||c.extras!==1)throw Error("A multiple-state flat blade is lost");
state.refineSelected={blade_shape:"folded"};
c=run().find(x=>x.id==="chloris-virgata");
if(!c||c.extras!==1)throw Error("A multiple-state folded blade is lost");
state.refineSelected={};
state.selected.head="airy";
const baseWithHead=run().map(x=>x.id);
state.refineSelected={blade_width:"broad"};
const withHead=run().map(x=>x.id);
if(withHead.length!==baseWithHead.length||baseWithHead.some(x=>!withHead.includes(x)))
  throw Error("Optional width eliminated a legitimate four-question match");

state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={blade_venation:"median_lines"};
got=verifyUnchanged("Poa median grooves");
if(got[0].id!=="poa-annua"||got[0].extras!==1)throw Error("Poa groove evidence ranking failed");
state.refineSelected={blade_venation:"raised_ribs"};
got=verifyUnchanged("unsourced ribs");
if(got.some(x=>x.extras))throw Error("Research-pending ribs should not rank a taxon");
state.refineSelected={ligule_length:"long"};
got=verifyUnchanged("long ligule");
if(!["muhlenbergia-lindheimeri","muhlenbergia-reverchonii","polypogon-monspeliensis"].includes(got[0].id)||got[0].extras!==1)
  throw Error("Long ligule evidence not available");
state.refineSelected={ligule_edge:"lacerate"};
got=verifyUnchanged("lacerate ligule");
if(!got.some(x=>x.id==="muhlenbergia-lindheimeri"&&x.extras))throw Error("Muhly torn edge was not ranked");
state.refineSelected={sheath_margins:"closed"};
got=verifyUnchanged("unverified closed sheath");
if(got.some(x=>x.extras))throw Error("Unverified fused sheath must not rank");
state.refineSelected={blade_venation:"rough_vein_lines",sheath_surface:"rough_surface"};
got=verifyUnchanged("rough vein and sheath");
if(!got.some(x=>x.id==="leersia-oryzoides"&&x.extras===2))throw Error("Leersia two documented traits not ranked");
state.refineSelected={ligule_length:"tiny",blade_venation:"raised_ribs"};
verifyUnchanged("conflicting biological clues with pending rib evidence");


state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={surface_runners:"wiry_stolon"};
got=verifyUnchanged("wiry runners");
if(!got.some(x=>x.id==="hilaria-belangeri"&&x.extras===1)||
   !got.some(x=>x.id==="hopia-obtusa"&&x.extras===1))
  throw Error("Wiry runner evidence missing");
state.refineSelected={surface_runners:"rooted_nodes"};
got=verifyUnchanged("rooting lower nodes");
if(!got.some(x=>x.id==="paspalum-pubiflorum"&&x.extras===1))
  throw Error("Low culm rooting not recorded separately from stolons");
state.refineSelected={underground_stems:"long_scaly"};
got=verifyUnchanged("long scaly rhizomes");
if(!got.some(x=>x.id==="sorghum-halepense"&&x.extras===1)||
   !got.some(x=>x.id==="sporobolus-compositus"&&x.extras===1))
  throw Error("Published long rhizome matches missing");
state.refineSelected={underground_stems:"short_rhizome"};
got=verifyUnchanged("short rhizomes without guessing texture");
if(!got.some(x=>x.id==="schizachyrium-scoparium"&&x.extras===1))
  throw Error("Optional short little-bluestem rhizome missing");
state.refineSelected={stem_nodes:"gland_ring",stem_special:"node_gland_ring"};
got=verifyUnchanged("gland ring below actual culm joints");
if(!got.some(x=>x.id==="eragrostis-cilianensis"&&x.extras===2))
  throw Error("Stinkgrass gland ring not recorded in both observational contexts");
state.refineSelected={basal_crown:"hard_knotty"};
got=verifyUnchanged("knotty crowns");
if(!got.some(x=>x.id==="paspalum-dilatatum"&&x.extras===1))throw Error("Knotty Paspalum not ranked");
state.refineSelected={culm_posture:"geniculate"};
verifyUnchanged("knee-bent stems");
state.refineSelected={culm_posture:"prostrate"};
got=verifyUnchanged("unconfirmed prostrate posture");
if(got.some(x=>x.extras))throw Error("Research-pending prostrate posture must not boost rankings");
for(const id of ["culm_posture","surface_runners","underground_stems","basal_crown","stem_special","stem_nodes"]){
 if(vm.runInContext("refinementSection("+JSON.stringify(id)+")",sandbox)!=="stem")throw Error("Wrong optional tab for "+id);
}
if(vm.runInContext('refinementSection("blade_width")',sandbox)!=="blade")throw Error("Blade tab changed unexpectedly");

// Batch 5 — close-up reproductive characters remain OPTIONAL positive ranking only.
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const id of ["florets_per_spikelet","spikelet_position","glume_marks","lemma_texture","true_lemma_awn","floral_hair_position"]){
 if(vm.runInContext("refinementSection("+JSON.stringify(id)+")",sandbox)!=="flower")
   throw Error("Wrong flower mini-tab for "+id);
}
state.refineSelected={true_lemma_awn:"none",floral_hair_position:"below_spikelet"};
got=verifyUnchanged("Setaria bristle, not true lemma awn");
if(!got.some(x=>x.id==="setaria-parviflora"&&x.extras===2))
 throw Error("Setaria awnless lemma + subtending bristles must both rank");
state.refineSelected={floral_hair_position:"rachilla"};
got=verifyUnchanged("Phragmites long rachilla hairs");
if(!got.some(x=>x.id==="phragmites-australis"&&x.extras===1)||
   got.some(x=>x.id==="arundo-donax"&&x.extras))
 throw Error("Reed rachilla and lemma hair structures conflated");
state.refineSelected={floral_hair_position:"lemma"};
got=verifyUnchanged("Arundo lemma hairs");
if(!got.some(x=>x.id==="arundo-donax"&&x.extras===1)||
   got.some(x=>x.id==="phragmites-australis"&&x.extras))
 throw Error("Giant reed lemma hairs incorrectly assigned to common reed");
state.refineSelected={true_lemma_awn:"short"};
got=verifyUnchanged("very short Johnsongrass lemma awn");
if(!got.some(x=>x.id==="sorghum-halepense"&&x.extras===1))
 throw Error("Johnsongrass short variable awn missing");
state.refineSelected={true_lemma_awn:"none"};
got=verifyUnchanged("Johnsongrass awnless variation");
if(!got.some(x=>x.id==="sorghum-halepense"&&x.extras===1))
 throw Error("Johnsongrass awnless alternate state missing");
state.refineSelected={lemma_texture:"reddish_spotted"};
got=verifyUnchanged("sand lovegrass red-marked lemma");
if(!got.some(x=>x.id==="eragrostis-trichodes"&&x.extras===1))
 throw Error("Sand lovegrass lemma marks missing");
state.refineSelected={true_lemma_awn:"three",florets_per_spikelet:"one"};
got=verifyUnchanged("Aristida triple awns and single-floret spikelet");
if(!got.some(x=>x.id==="aristida-oligantha"&&x.extras===2)||
   !got.some(x=>x.id==="aristida-purpurea"&&x.extras===2))
 throw Error("Threeawn key paths should preserve both species");
state.refineSelected={true_lemma_awn:"three",florets_per_spikelet:"several",floral_hair_position:"rachilla"};
verifyUnchanged("deliberately contradictory floral clues");

// Final comparison check is only suggested when published states contrast for
// EVERY compared taxon; no absent/unknown trait is treated as diagnostic.
state.refineSelected={};
let suggested=vm.runInContext(
  'compareRefinementPrompt(state.species.filter(s=>["eragrostis-intermedia","eragrostis-lugens"].includes(s.id)))',sandbox);
if(!suggested||suggested.id!=="blade_shape")
  throw Error("Source-supported flat vs inrolled leaf comparison not offered");
state.refineSelected={blade_shape:"flat"};
suggested=vm.runInContext(
  'compareRefinementPrompt(state.species.filter(s=>["eragrostis-intermedia","eragrostis-lugens"].includes(s.id)))',sandbox);
if(suggested?.id==="blade_shape")throw Error("Already selected optional clue prompted again");
state.refineSelected={};
suggested=vm.runInContext('compareRefinementPrompt([state.species[0],state.species[0]])',sandbox);
if(suggested)throw Error("Identical species must never generate a false diagnostic distinction");
suggested=vm.runInContext('compareRefinementPrompt([state.species[0]])',sandbox);
if(suggested)throw Error("One species does not need comparison");
state.refineSelected={true_lemma_awn:"none",floral_hair_position:"below_spikelet"};
verifyUnchanged("comparison helper must not change species scoring");
if(!html.includes('On a phone, swipe the feature table sideways')||
   !html.includes('max-height:calc(100dvh - 16px)')||
   !html.includes('Helpful next check: '))
  throw Error("Phone comparison and suggested check copy missing");


// A real field contrast must be backed by fully documented states in
// every compared species; missing/overlapping entries cannot imply absence.
sandbox.qs=[{id:"head"},{id:"habit"},{id:"ligule"},{id:"awns"}];
state.selected={head:null,habit:null,ligule:null,awns:null};
let coreNext=vm.runInContext(
 'compareCorePrompt(state.species.filter(s=>["chloris-cucullata","chloris-x-subdolichostachya"].includes(s.id)))',sandbox);
if(coreNext!==null)throw Error("Missing hybrid awn incorrectly described as a true difference");
coreNext=vm.runInContext(
 'compareCorePrompt(state.species.filter(s=>["schizachyrium-scoparium","bothriochloa-ischaemum"].includes(s.id)))',sandbox);
if(!coreNext||coreNext.id!=="head")throw Error("Clear flowering head distinction not suggested");
state.selected.head="short_racemes";
coreNext=vm.runInContext(
 'compareCorePrompt(state.species.filter(s=>["schizachyrium-scoparium","bothriochloa-ischaemum"].includes(s.id)))',sandbox);
if(coreNext!==null)throw Error("Already selected head or overlapping other traits suggested");
state.selected={head:null,habit:null,ligule:null,awns:null};
if(vm.runInContext('compareCorePrompt([state.species[0],state.species[0]])',sandbox)!==null)
 throw Error("Identical grass shouldn't generate a core contrast");
if(vm.runInContext('compareCorePrompt([state.species[0]])',sandbox)!==null)
 throw Error("One grass isn't a comparison");
verifyUnchanged("Comparison suggestions must never modify scoring");

if(!html.includes('id="theme-toggle"')||!html.includes('id="compare-dialog"')||
   !html.includes('const group=node("details","optional-group")'))
  throw Error("Visitor theme, compare or accordion controls missing");
// Batch 8: five locally described gramas; source-backed optional choices
// are positive-only ranking and retain the normal four-question matches.
const batch8={
 "bouteloua-curtipendula":["sheath_margins","ligule_length","ligule_edge","culm_posture","blade_hairs","sheath_surface"],
 "bouteloua-hirsuta":["blade_hairs","sheath_margins","ligule_length","ligule_edge","culm_posture","glume_marks"],
 "bouteloua-rigidiseta":["sheath_margins","ligule_length","ligule_edge","culm_posture","glume_marks","true_lemma_awn"],
 "bouteloua-trifida":["sheath_margins","ligule_length","ligule_edge","culm_posture","underground_stems","glume_marks"],
 "bouteloua-dactyloides":["blade_width","blade_shape","sheath_margins","ligule_length","ligule_edge","blade_hairs","sheath_surface"]
};
if(pack.evidence.length<367)throw Error("Batch 8 must preserve 31 new source-backed records");
for(const [id,chars] of Object.entries(batch8)){
 for(const character of chars){
  const e=pack.evidence.find(x=>x.id===id&&x.character===character);
  if(!e||!e.source||!e.source_url?.startsWith("https://")||!e.states?.length)throw Error("Batch 8 missing source character "+id+"/"+character);
 }
}
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={ligule_length:"tiny",sheath_margins:"open"};
got=verifyUnchanged("Batch 8 tiny ligule and open sheath");
for(const id of Object.keys(batch8)){
 const row=got.find(x=>x.id===id);
 if(!row||row.extras!==2)throw Error("Batch 8 two independent positive observations failed: "+id);
}
state.refineSelected={true_lemma_awn:"three"};
got=verifyUnchanged("Batch 8 Texas grama three awns");
if(!got.some(x=>x.id==="bouteloua-rigidiseta"&&x.extras===1))throw Error("Texas grama documented lemma awns missing");
state.refineSelected={};
// Batch 9: five newly source-covered scored grasses; no optional hard exclusions.
const batch9={
  "echinochloa-crus-galli": [
    "blade_shape",
    "blade_width",
    "blade_edge",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "leaf_base",
    "culm_posture"
  ],
  "heteropogon-contortus": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "leaf_base",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "hordeum-pusillum": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "florets_per_spikelet"
  ],
  "phalaris-caroliniana": [
    "blade_shape",
    "blade_width",
    "sheath_margins",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "florets_per_spikelet"
  ],
  "panicum-capillare": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "stem_nodes",
    "florets_per_spikelet"
  ]
};
if(pack.evidence.length<410)throw Error("Batch 9 evidence total unexpectedly low");
for(const [id,characters] of Object.entries(batch9)){
 const taxon=species.find(s=>s.id===id);
 if(!taxon?.character_evidence?.audit_batch9_core_advanced_20261113||taxon.character_evidence.audit_batch9_core_advanced_20261113.core_scoring_changed!==false)throw Error("Batch 9 four-core review missing: "+id);
 for(const character of characters){
  const e=pack.evidence.find(r=>r.id===id&&r.character===character);
  if(!e||!e.source||!e.source_url?.startsWith("https://")||!e.states?.length)throw Error("Batch 9 missing published character "+id+"/"+character);
 }
}
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={sheath_margins:"open"};
got=verifyUnchanged("Batch 9 open sheath must only positively rank");
for(const id of Object.keys(batch9)){
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Batch 9 source-backed open sheath not ranked: "+id);
}
state.refineSelected={florets_per_spikelet:"several"};
got=verifyUnchanged("Batch 9 Carolina canarygrass 3 florets");
if(!got.some(x=>x.id==="phalaris-caroliniana"&&x.extras===1))throw Error("Phalaris 3-floret source missing");
state.refineSelected={ligule_length:"tiny"};
got=verifyUnchanged("Batch 9 very short ligules");
for(const id of ["heteropogon-contortus","hordeum-pusillum","panicum-capillare"]){
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Missing tiny true ligule: "+id);
}
if(got.some(x=>x.id==="echinochloa-crus-galli"&&x.extras>0))throw Error("Barnyardgrass has NO true ligule: do not invent length");
state.refineSelected={};
// Batch 10: five formerly zero-coverage originals; measured Hill Country
// morphology only. Existing core scoring and source conflicts are untouched.
const batch10={
  "dichanthelium-oligosanthes": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "stem_nodes"
  ],
  "dichanthelium-pedicellatum": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "stem_nodes",
    "basal_crown"
  ],
  "digitaria-ciliaris": [
    "blade_shape",
    "blade_width",
    "blade_edge",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "surface_runners"
  ],
  "tridens-flavus": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "underground_stems"
  ],
  "urochloa-texana": [
    "blade_shape",
    "blade_width",
    "blade_edge",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "surface_runners",
    "stem_nodes"
  ]
};
if(pack.evidence.length<459)throw Error("Batch 10 evidence count below documented additions");
for(const [id,chars] of Object.entries(batch10)){
 const taxon=species.find(s=>s.id===id);
 if(!taxon?.character_evidence?.audit_batch10_core_advanced_20261115 || taxon.character_evidence.audit_batch10_core_advanced_20261115.core_scoring_changed!==false)
  throw Error("Batch 10 four-core audit record missing "+id);
 for(const c of chars){
  const e=pack.evidence.find(r=>r.id===id&&r.character===c);
  if(!e||!e.states?.length||!e.source?.includes("Hagenbuch & Lemke (2015)")||!e.source_url?.startsWith("https://"))
   throw Error("Batch 10 advanced provenance missing "+id+"/"+c);
 }
}
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={sheath_margins:"open"};
got=verifyUnchanged("Batch 10 sheath opening must only rank");
for(const id of Object.keys(batch10))
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Batch 10 species not ranked with sourced open sheath: "+id);
state.refineSelected={surface_runners:"rooted_nodes"};
got=verifyUnchanged("Batch 10 decumbent rooted nodes are not true stolons");
for(const id of ["digitaria-ciliaris","urochloa-texana"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Batch 10 documented rooted culm missing: "+id);
state.refineSelected={surface_runners:"stolon"};
got=verifyUnchanged("Batch 10 cannot fabricate true stolons");
for(const id of ["digitaria-ciliaris","urochloa-texana"])
 if(got.some(x=>x.id===id&&x.extras!==0))throw Error("False stolon claim for "+id);
state.refineSelected={ligule_edge:"hair_fringe"};
got=verifyUnchanged("Few-flowered panicgrass hair ligule");
if(!got.some(x=>x.id==="dichanthelium-oligosanthes"&&x.extras===1))throw Error("Few-flowered panicgrass hair ligule missing");
state.refineSelected={ligule_length:"tiny"};
got=verifyUnchanged("Short ciliate membrane on purpletop and signalgrass");
for(const id of ["dichanthelium-pedicellatum","tridens-flavus","urochloa-texana"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Tiny ligule missing "+id);
state.refineSelected={culm_posture:"prostrate"};
got=verifyUnchanged("Research-pending prostrate option must not rank");
if(got.some(x=>x.extras))throw Error("Uncited prostrate option unexpectedly ranks species");
state.refineSelected={};
// Batch 11 — five additional scored species from named Hill Country
// pages, with source-backed advanced positive ranking; core remains unchanged.
const batch11={
  "muhlenbergia-schreberi": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "surface_runners"
  ],
  "muhlenbergia-utilis": [
    "blade_shape",
    "blade_width",
    "sheath_margins",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "underground_stems"
  ],
  "muhlenbergia-x-involuta": [
    "blade_shape",
    "blade_width",
    "sheath_margins",
    "sheath_surface",
    "leaf_base",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "panicum-coloratum": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "underground_stems",
    "basal_crown"
  ],
  "festuca-octoflora": [
    "blade_shape",
    "blade_width",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ]
};
if(pack.evidence.length<499)throw Error("Batch 11: missing 40 new advanced character citations");
for(const [id,characters] of Object.entries(batch11)){
 const speciesRecord=species.find(s=>s.id===id);
 const audit=speciesRecord?.character_evidence?.audit_batch11_core_advanced_20261115;
 if(!audit||audit.core_scoring_changed!==false||audit.core_traits_reviewed.length!==4)
  throw Error("Batch 11 core four review missing "+id);
 for(const character of characters){
  const e=pack.evidence.find(x=>x.id===id&&x.character===character);
  if(!e||!e.source.includes("Hagenbuch & Lemke (2015)")||!e.source_url.startsWith("https://")||!e.states.length)
   throw Error("Batch 11 sourced field character missing "+id+"/"+character);
 }
}
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={sheath_margins:"open"};
got=verifyUnchanged("Batch 11 reported open sheath cannot exclude grasses");
for(const id of Object.keys(batch11))
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Batch11 open sheaths not ranked "+id);
state.refineSelected={ligule_length:"long"};
got=verifyUnchanged("Canyon muhly long ligule must only positively rank");
if(!got.some(x=>x.id==="muhlenbergia-x-involuta"&&x.extras===1))throw Error("Canyon muhly long ligule missing");
if(got.some(x=>x.id==="muhlenbergia-utilis"&&x.extras>0))throw Error("Aparejo cannot receive hybrid long ligule");
state.refineSelected={surface_runners:"stolon"};
got=verifyUnchanged("Nimblewill stolon is not a rhizome");
if(!got.some(x=>x.id==="muhlenbergia-schreberi"&&x.extras===1))throw Error("Nimblewill true stolon unsupported");
if(got.some(x=>x.id==="panicum-coloratum"&&x.extras>0))throw Error("Regional kleingrass must not be automatically called a stolon");
state.refineSelected={underground_stems:"scaly_rhizome"};
got=verifyUnchanged("Aparejo underground scaly rhizome");
if(!got.some(x=>x.id==="muhlenbergia-utilis"&&x.extras===1))throw Error("Aparejo rhizome missing");
state.refineSelected={blade_shape:"inrolled"};
got=verifyUnchanged("Actual involute leaves on two nonhybrid grasses");
for(const id of ["muhlenbergia-utilis","festuca-octoflora"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Inrolled blades missing "+id);
if(got.some(x=>x.id==="muhlenbergia-x-involuta"&&x.extras>0))throw Error("Canyon hybrid has folded, not inrolled, blade");
state.refineSelected={};
// Batch 12: original 112 scored grasses; source-linked advanced anatomy
// remains non-excluding. Preserve conflicting wintergrass rhizome references.
const batch12={
  "muhlenbergia-paniculata": [
    "blade_shape",
    "blade_width",
    "blade_edge",
    "blade_venation",
    "leaf_base",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "nassella-leucotricha": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "stem_nodes"
  ],
  "avena-fatua": [
    "blade_shape",
    "blade_width",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "digitaria-cognata": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "basal_crown",
    "underground_stems"
  ],
  "disakisperma-dubium": [
    "blade_shape",
    "blade_width",
    "leaf_base",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ]
};
if(pack.evidence.length<543)throw Error("Batch 12 evidence total dropped");
for(const [id,characters] of Object.entries(batch12)){
 const row=species.find(s=>s.id===id), audit=row?.character_evidence?.audit_batch12_core_advanced_20261115;
 if(!audit||audit.core_scoring_changed!==false||audit.core_traits_reviewed?.length!==4)throw Error("Batch 12 core literature audit absent "+id);
 for(const character of characters){
  const e=pack.evidence.find(q=>q.id===id&&q.character===character);
  if(!e||!e.source?.includes("Hagenbuch & Lemke (2015)")||!e.source_url?.startsWith("https://")||!e.states?.length)
   throw Error("Batch 12 exact source record absent "+id+"/"+character);
 }
}
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={sheath_margins:"open"};
got=verifyUnchanged("Batch12 sheath openings rank only");
for(const id of Object.keys(batch12))
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Open sheath missing "+id);
state.refineSelected={ligule_length:"tiny"};
got=verifyUnchanged("Batch12 short membranes conditional on presence");
for(const id of ["nassella-leucotricha","digitaria-cognata","disakisperma-dubium"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Tiny ligule not ranked "+id);
state.refineSelected={blade_edge:"whitish"};
got=verifyUnchanged("Tumblegrass pale edges");
if(!got.some(x=>x.id==="muhlenbergia-paniculata"&&x.extras===1))throw Error("Tumblegrass white margin lost");
state.refineSelected={basal_crown:"hard_knotty"};
got=verifyUnchanged("Fall witchgrass hard subrhizomatous base");
if(!got.some(x=>x.id==="digitaria-cognata"&&x.extras===1))throw Error("Fall witchgrass basal hard crown absent");
state.refineSelected={surface_runners:"stolon"};
got=verifyUnchanged("Do not infer stolons from condensed short rhizomes");
for(const id of Object.keys(batch12))
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("False surface stolon "+id);
state.refineSelected={};
// Batch 13 — five formerly zero-coverage scored grasses in the Tridens/Tridentopsis complex.
// Source is H&L 2015 printed pp. 65–66; nomenclatural combinations are explicit.
const batch13={
  "tridens-albescens": [
    "blade_shape",
    "blade_width",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "underground_stems"
  ],
  "tridentopsis-buckleyana": [
    "blade_shape",
    "blade_width",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "stem_nodes"
  ],
  "triplasiella-eragrostoides": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "tridentopsis-mutica": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "stem_nodes"
  ],
  "tridens-texanus": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_edge",
    "culm_posture"
  ]
};
if(pack.evidence.length<583)throw Error("Batch 13 baseline 583 advanced records regressed");
for(const [id,chars] of Object.entries(batch13)){
 const record=species.find(x=>x.id===id), audit=record?.character_evidence?.audit_batch13_core_advanced_20261115;
 if(!audit||audit.core_scoring_changed!==false||audit.core_traits_reviewed?.length!==4)throw Error("Batch 13 core preservation missing "+id);
 for(const ch of chars){
  const e=pack.evidence.find(x=>x.id===id&&x.character===ch);
  if(!e||!e.states?.length||!e.source.includes("Hagenbuch & Lemke (2015)")||!e.source_url.startsWith("https://"))throw Error("Batch 13 provenance missing "+id+"/"+ch);
 }
}
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={sheath_margins:"overlapping"};
got=verifyUnchanged("Batch13 overlapping Texas tridens sheath");
if(!got.some(x=>x.id==="tridens-texanus"&&x.extras===1))throw Error("Texas tridens sheath not ranked");
for(const id of ["tridens-albescens","tridentopsis-buckleyana","triplasiella-eragrostoides","tridentopsis-mutica"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Open sheath incorrectly called overlapping "+id);
state.refineSelected={underground_stems:"short_knotty"};
got=verifyUnchanged("Batch13 published white-tridens rhizome versus unresolved slim tridens");
if(!got.some(x=>x.id==="tridens-albescens"&&x.extras===1))throw Error("White tridens short rhizome missing");
if(got.some(x=>x.id==="tridentopsis-mutica"&&x.extras>0))throw Error("Slim tridens disputed rhizomes must remain unknown");
state.refineSelected={blade_shape:"inrolled"};
got=verifyUnchanged("Batch13 involute blades are distinct from plane");
for(const id of ["tridentopsis-mutica","tridens-texanus"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Published involute option not ranked "+id);
for(const id of ["tridentopsis-buckleyana","triplasiella-eragrostoides","tridens-albescens"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Unpublished involute blade falsely ranked "+id);
state.refineSelected={ligule_edge:"lacerate"};
got=verifyUnchanged("Batch13 ragged lovegrass-tridens ligule");
if(!got.some(x=>x.id==="triplasiella-eragrostoides"&&x.extras===1))throw Error("Lovegrass tridens lacerate ligule lost");
for(const id of ["tridens-albescens","tridentopsis-buckleyana","tridentopsis-mutica","tridens-texanus"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Ciliate ligule mistaken for lacerate "+id);
state.refineSelected={};

// Batch 14 — five original zero-coverage grasses, H&L 2015 direct regional species accounts.
const batch14={
  "catapodium-rigidum": [
    "blade_shape",
    "blade_width",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "dichanthium-annulatum": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "ligule_edge",
    "culm_posture",
    "surface_runners",
    "stem_nodes"
  ],
  "limnodea-arkansana": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "urochloa-fusca": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "surface_runners",
    "stem_nodes"
  ],
  "zizaniopsis-miliacea": [
    "blade_shape",
    "blade_width",
    "blade_edge",
    "sheath_margins",
    "ligule_length",
    "ligule_edge",
    "culm_posture",
    "underground_stems"
  ]
};
if(pack.evidence.length<624)throw Error("Batch14 baseline 624 advanced observations regressed");
for(const [id,chs] of Object.entries(batch14)){
 const row=species.find(s=>s.id===id), audit=row?.character_evidence?.audit_batch14_core_advanced_20261115;
 if(!audit||audit.core_scoring_changed!==false||audit.core_traits_reviewed?.length!==4)throw Error("Batch14 original four categories not reviewed: "+id);
 if(JSON.stringify(audit.advanced_characters_added)!==JSON.stringify(chs))throw Error("Batch14 audit/evidence mismatch: "+id);
 for(const ch of chs){
  const e=pack.evidence.find(x=>x.id===id&&x.character===ch);
  if(!e||!e.states?.length||!e.source?.includes("Hagenbuch & Lemke (2015)")||!e.source_url?.startsWith("https://"))throw Error("Batch14 source/state absent "+id+"/"+ch);
 }
}
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={sheath_margins:"overlapping"};
got=verifyUnchanged("Batch14 overlapping Urochloa fusca sheaths");
if(!got.some(x=>x.id==="urochloa-fusca"&&x.extras===1))throw Error("Urochloa fusca overlapping sheath not ranked");
for(const id of ["catapodium-rigidum","dichanthium-annulatum","limnodea-arkansana","zizaniopsis-miliacea"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Open sheath wrongly made overlapping "+id);
state.refineSelected={ligule_edge:"lacerate"};
got=verifyUnchanged("Batch14 fern grass/Ozarkgrass torn ligules");
for(const id of ["catapodium-rigidum","limnodea-arkansana"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Published lacerate ligule missing "+id);
for(const id of ["dichanthium-annulatum","urochloa-fusca","zizaniopsis-miliacea"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Erose/ciliate ligule misranked as lacerate "+id);
state.refineSelected={surface_runners:"rooted_nodes"};
got=verifyUnchanged("Batch14 lower-node rooting is not a true stolon");
if(!got.some(x=>x.id==="urochloa-fusca"&&x.extras===1))throw Error("Urochloa fusca rooting nodes missing");
if(got.some(x=>x.id==="dichanthium-annulatum"&&x.extras>0))throw Error("Kleberg stoloniferous culms cannot automatically be called rooted nodes");
state.refineSelected={surface_runners:"stolon"};
got=verifyUnchanged("Batch14 Kleberg optional stoloniferous stems");
if(!got.some(x=>x.id==="dichanthium-annulatum"&&x.extras===1))throw Error("Stoloniferous Kleberg feature missing");
if(got.some(x=>x.id==="urochloa-fusca"&&x.extras>0))throw Error("Lower node rooting incorrectly scored as stolon");
state.refineSelected={ligule_length:"long"};
got=verifyUnchanged("Batch14 giant cutgrass exceptionally long true membrane");
if(!got.some(x=>x.id==="zizaniopsis-miliacea"&&x.extras===1))throw Error("Giant cutgrass very long ligule missing");
for(const id of ["catapodium-rigidum","limnodea-arkansana","urochloa-fusca","dichanthium-annulatum"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Long membrane incorrectly attributed to "+id);
state.refineSelected={};

// Batch 15: FNA, Kew GrassBase and UT PRC species-level vegetative observations.
const batch15={
  "bromus-lanceolatus": [
    "blade_width",
    "blade_hairs",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "eragrostis-hirsuta": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "muhlenbergia-dubia": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_surface",
    "ligule_length",
    "ligule_edge",
    "culm_posture"
  ],
  "paspalum-floridanum": [
    "blade_shape",
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "culm_posture",
    "underground_stems"
  ],
  "urochloa-reptans": [
    "blade_width",
    "blade_hairs",
    "sheath_margins",
    "sheath_surface",
    "ligule_length",
    "culm_posture",
    "surface_runners",
    "stem_nodes"
  ]
};
if(pack.evidence.length<660)throw Error("Batch15 cumulative evidence count dropped");
for(const [id,chars] of Object.entries(batch15)){
 const sp=species.find(x=>x.id===id),audit=sp?.character_evidence?.audit_batch15_core_advanced_20261115;
 if(!audit||audit.core_scoring_changed!==false||audit.core_traits_reviewed?.length!==4)throw Error("Batch15 original score review missing "+id);
 if(JSON.stringify(audit.advanced_characters_added)!==JSON.stringify(chars))throw Error("Batch15 character audit mismatch "+id);
 for(const ch of chars){const e=pack.evidence.find(x=>x.id===id&&x.character===ch);
  if(!e||!e.states?.length||!e.source_url?.startsWith("https://"))throw Error("Batch15 source missing "+id+"/"+ch);
 }
}
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={ligule_edge:"hair_fringe"};
got=verifyUnchanged("Batch15 true hair ligule");
if(!got.some(x=>x.id==="eragrostis-hirsuta"&&x.extras===1))throw Error("Bigtop lovegrass hair ligule not matched");
state.refineSelected={ligule_length:"long"};
got=verifyUnchanged("Batch15 pine muhly exceptionally long ligule");
if(!got.some(x=>x.id==="muhlenbergia-dubia"&&x.extras===1))throw Error("Pine muhly long ligule absent");
for(const id of ["bromus-lanceolatus","eragrostis-hirsuta","paspalum-floridanum","urochloa-reptans"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Invented long ligule "+id);
state.refineSelected={blade_shape:"folded"};
got=verifyUnchanged("Batch15 Florida paspalum basal fold");
if(!got.some(x=>x.id==="paspalum-floridanum"&&x.extras===1))throw Error("Florida paspalum folded blade not matched");
state.refineSelected={surface_runners:"rooted_nodes"};
got=verifyUnchanged("Batch15 low stem rooting versus stolon");
if(!got.some(x=>x.id==="urochloa-reptans"&&x.extras===1))throw Error("Sprawling signalgrass rooted nodes absent");
state.refineSelected={surface_runners:"stolon"};
got=verifyUnchanged("Batch15 cannot infer true stolon");
if(got.some(x=>x.id==="urochloa-reptans"&&x.extras>0))throw Error("False Urochloa true stolon");
state.refineSelected={underground_stems:"rhizome_present"};
got=verifyUnchanged("Batch15 Paspalum confirmed rhizome");
if(!got.some(x=>x.id==="paspalum-floridanum"&&x.extras===1))throw Error("Paspalum rhizome missing");
if(got.some(x=>x.id==="muhlenbergia-dubia"&&x.extras>0))throw Error("Rhizome fabricated for pine muhly");
state.refineSelected={culm_posture:"prostrate"};
got=verifyUnchanged("Batch15 prostrate still pending");
if(got.some(x=>batch15[x.id]&&x.extras>0))throw Error("Research-pending prostrate wrongly scored");
state.refineSelected={};

// Batch 16 source-specific morphology, original-key preservation and cautious ranking.
const batch16={"bothriochloa-torreyana":["blade_width","blade_edge","blade_venation","blade_hairs","sheath_margins","ligule_length","ligule_edge","stem_nodes","underground_stems","culm_posture"],"chloris-x-subdolichostachya":["blade_width","ligule_length","ligule_edge","culm_posture","surface_runners"],"munroa-pulchella":["blade_shape","blade_width","blade_tip","ligule_edge","surface_runners"],"dichanthelium-lindheimeri":["blade_width","blade_hairs","sheath_surface","ligule_length","ligule_edge","culm_posture"],"zizania-texana":["blade_width","blade_venation","ligule_length","culm_posture","surface_runners"]};
if(pack.evidence.length<691)throw Error("Batch16 original advanced-evidence total regressed");
for(const [id,characters] of Object.entries(batch16)){
 const row=species.find(x=>x.id===id),a=row?.character_evidence?.audit_batch16_core_advanced_20261115;
 if(!a||a.core_scoring_changed!==false||a.site_filters_changed!==false||a.photos_changed!==false)throw Error("Batch16 original protections lost: "+id);
 if(JSON.stringify(a.advanced_characters_added)!==JSON.stringify(characters))throw Error("Batch16 character audit differs: "+id);
 for(const ch of characters){const e=pack.evidence.find(x=>x.id===id&&x.character===ch);
  if(!e||!e.states?.length||!e.source_url?.startsWith("https://"))throw Error("Batch16 named citation missing "+id+"/"+ch);
 }
}
if(pack.evidence.some(x=>x.id==="munroa-pulchella"&&x.character==="ligule_length"))throw Error("Disputed fluffgrass ligule length must remain unknown");
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={blade_tip:"hardened_tip"};
got=verifyUnchanged("Batch16 fluffgrass hardened leaf tip");
if(!got.some(x=>x.id==="munroa-pulchella"&&x.extras===1))throw Error("Fluffgrass hardened tip missing");
state.refineSelected={blade_venation:"prominent_midvein"};
got=verifyUnchanged("Batch16 protected wildrice prominent vein");
if(!got.some(x=>x.id==="zizania-texana"&&x.extras===1))throw Error("Texas wildrice prominent vein missing");
state.refineSelected={blade_venation:"raised_midvein"};
got=verifyUnchanged("Batch16 silver bluestem underside midrib");
if(!got.some(x=>x.id==="bothriochloa-torreyana"&&x.extras===1))throw Error("Silver bluestem raised midvein missing");
state.refineSelected={surface_runners:"stolon"};
got=verifyUnchanged("Batch16 conditional published stolon form");
for(const id of ["chloris-x-subdolichostachya","munroa-pulchella","zizania-texana"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Positive stolon observation missing "+id);
if(got.some(x=>x.id==="bothriochloa-torreyana"&&x.extras>0))throw Error("Underground rhizome must not be ranked as stolon");
state.refineSelected={underground_stems:"rhizome_present"};
got=verifyUnchanged("Batch16 conditional local silver bluestem rhizome");
if(!got.some(x=>x.id==="bothriochloa-torreyana"&&x.extras===1))throw Error("Silver bluestem positive rhizome observation missing");
if(got.some(x=>x.id==="chloris-x-subdolichostachya"&&x.extras>0))throw Error("Chloris stolon must not imply rhizome");
state.refineSelected={ligule_length:"long"};
got=verifyUnchanged("Batch16 Kew named Zizania 5-15mm ligule");
if(!got.some(x=>x.id==="zizania-texana"&&x.extras===1))throw Error("Texas wildrice long ligule not ranked");
for(const id of ["bothriochloa-torreyana","chloris-x-subdolichostachya","dichanthelium-lindheimeri","munroa-pulchella"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Unsupported long membrane falsely ranked "+id);
state.refineSelected={ligule_edge:"hair_fringe"};
got=verifyUnchanged("Batch16 hair-only ligules versus ciliate membrane");
for(const id of ["munroa-pulchella","dichanthelium-lindheimeri"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("True ligule hair fringe not matched "+id);
if(got.some(x=>x.id==="chloris-x-subdolichostachya"&&x.extras>0))throw Error("Hybrid ciliate membrane mistaken for hair-only ligule");
state.refineSelected={};

// Batch 17 — every one of 112 original grasses has at least one published optional observation.
const batch17={"bouteloua-pectinata":["sheath_surface","culm_posture"],"dichanthelium-commutatum":["blade_width","blade_hairs","sheath_margins","sheath_surface","ligule_length","ligule_edge","culm_posture","underground_stems","stem_nodes"],"anatherum-tenuispatheum":["ligule_length","ligule_edge","sheath_surface"],"dinebra-panicea-subsp-mucronata":["blade_width","ligule_length","blade_shape","sheath_margins","sheath_surface"]};
if(pack.evidence.length<710)throw Error("Batch17 710-row evidence baseline regressed");
if(new Set(pack.evidence.filter(x=>species.some(s=>s.id===x.id)).map(x=>x.id)).size!==112)throw Error("Batch17 requires at least one advanced clue for every original scored grass");
for(const [id,chars] of Object.entries(batch17)){
 const row=species.find(x=>x.id===id),a=row?.character_evidence?.audit_batch17_first_coverage_20261115;
 if(!a||a.core_scoring_changed!==false||a.site_filters_changed!==false||a.photos_changed!==false||a.provisional_admissions_changed!==false)throw Error("Batch17 core and research guards lost "+id);
 if(JSON.stringify(a.advanced_characters_added)!==JSON.stringify(chars))throw Error("Batch17 exact trait list mismatch "+id);
 for(const character of chars){
  const e=pack.evidence.find(x=>x.id===id&&x.character===character);
  if(!e||e.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!e.source_url?.startsWith("https://"))throw Error("Batch17 named source missing "+id+"/"+character);
 }
}
const lastFour=Object.keys(batch17);
for(const id of lastFour){
 // Previously zero reproductive citations; later additions must have directly traced Flora pages.
 for(const x of pack.evidence.filter(r=>r.id===id&&["florets_per_spikelet","spikelet_position","glume_marks","lemma_texture","true_lemma_awn","floral_hair_position"].includes(r.character))){
  if(!x.source?.includes("Diggs, Lipscomb & O'Kennon (1999)")||!x.source?.includes("printed p.")||!Number.isInteger(x.pdf_printed_page)||x.source_url!=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas")
   throw Error("No reproductive evidence without printed Diggs page "+id);
 }
}
if(pack.evidence.some(x=>x.id==="bouteloua-pectinata"&&["ligule_length","ligule_edge"].includes(x.character)))throw Error("Parent hairy grama ligule cannot replace tall grama evidence");
if(pack.evidence.some(x=>x.id==="dinebra-panicea-subsp-mucronata"&&x.character==="ligule_edge"))throw Error("Unresolved mucronata ciliate/erose ligule edge should be held");
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={sheath_surface:"sometimes_hairy"};
got=verifyUnchanged("Batch17 four-species hair variation");
for(const id of ["bouteloua-pectinata","dichanthelium-commutatum","anatherum-tenuispatheum","dinebra-panicea-subsp-mucronata"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Hairy sheath positive option absent "+id);
state.refineSelected={ligule_length:"tiny"};
got=verifyUnchanged("Batch17 very short true ligules");
for(const id of ["dichanthelium-commutatum","anatherum-tenuispatheum","dinebra-panicea-subsp-mucronata"])
 if(!got.some(x=>x.id===id&&x.extras===1))throw Error("Very short ligule positive option absent "+id);
if(got.some(x=>x.id==="bouteloua-pectinata"&&x.extras>0))throw Error("Unproven pectinata parent tiny ligule should stay unknown");
state.refineSelected={ligule_length:"short"};
got=verifyUnchanged("Batch17 exact Anatherum 0.6-1.3mm spans two bins");
if(!got.some(x=>x.id==="anatherum-tenuispatheum"&&x.extras===1))throw Error("Anatherum 1-mm-boundary length not ranked");
for(const id of ["dichanthelium-commutatum","dinebra-panicea-subsp-mucronata"])
 if(got.some(x=>x.id===id&&x.extras>0))throw Error("Less-than-1mm single-bin ligule falsely classified short "+id);
state.refineSelected={sheath_margins:"open"};
got=verifyUnchanged("Batch17 FNA nonoverlapping variable-panicgrass sheaths");
if(!got.some(x=>x.id==="dichanthelium-commutatum"&&x.extras===1))throw Error("Dichanthelium nonoverlapping sheath not ranked");
if(got.some(x=>x.id==="dinebra-panicea-subsp-mucronata"&&x.extras>0))throw Error("Dinebra overlapping sheath falsely open");
state.refineSelected={sheath_margins:"overlapping"};
got=verifyUnchanged("Batch17 mucronata overlapping sheaths");
if(!got.some(x=>x.id==="dinebra-panicea-subsp-mucronata"&&x.extras===1))throw Error("Mucronate sprangletop overlapping sheath not ranked");
if(got.some(x=>x.id==="dichanthelium-commutatum"&&x.extras>0))throw Error("Dichanthelium open sheath falsely overlapping");
state.refineSelected={sheath_surface:"rough_surface"};
got=verifyUnchanged("Batch17 Anatherum documented culm sheath texture variation");
if(!got.some(x=>x.id==="anatherum-tenuispatheum"&&x.extras===1))throw Error("Maritime bluestem rough sheath option lost");
state.refineSelected={underground_stems:"rhizome_present"};
got=verifyUnchanged("Batch17 conditional variable-panicgrass rhizomes");
if(!got.some(x=>x.id==="dichanthelium-commutatum"&&x.extras===1))throw Error("Conditional 2mm Dichanthelium rhizomes not ranked");
state.refineSelected={};

// Unified 169 grass list — original 112 retain scored exclusion logic; 57 uncertain profiles join one group.
// PDF source audit pass 1: H&L vegetative first, Diggs reproductive printed-page gate.
const pdfPass1={"melica-nitens":8,"setaria-viridis":10,"eragrostis-curtipedicellata":8};
if(pack.evidence.length<736)throw Error("PDF audit pass1: fewer than 736 cited observations");
if(new Set(pack.evidence.map(x=>x.id)).size<115)throw Error("PDF audit pass1: 115 of 169 need at least one optional observation");
for(const [id,expected] of Object.entries(pdfPass1)){
 const rows=pack.evidence.filter(x=>x.id===id);
 if(rows.length<expected)throw Error("Historic source rows were lost "+id);
 for(const row of rows.slice(0,expected)){
  const expectedPaper=["florets_per_spikelet","lemma_texture"].includes(row.character)?"Diggs, Lipscomb & O\'Kennon (1999)":"Hagenbuch & Lemke (2015)";
  if(!row.source.includes(expectedPaper)||!/printed pp?\./.test(row.source)||!row.source_url?.startsWith("https://"))throw Error("Bad PDF citation "+id+"/"+row.character);
 }
}
if(pack.evidence.some(x=>x.id==="melica-nitens"&&x.character==="underground_stems"))throw Error("Disputed Melica nitens rhizome incorrectly scored");
if(pack.evidence.some(x=>x.id==="melica-nitens"&&x.character==="sheath_margins"))throw Error("Research-pending closed Melica sheath incorrectly scored");
if(html.includes("Number(!!a.s.trial)-Number(!!b.s.trial)"))throw Error("Old trial-last ranking still separates the 57 newer grasses");
const unifiedManifest=JSON.parse(fs.readFileSync(path.join(root,"hays-candidates.json"),"utf8"));
const unifiedFiles=["provisional-trial-profiles.json","provisional-trial-batch2.json","provisional-trial-batch3.json","provisional-trial-batch4.json","provisional-trial-batch5-a.json","provisional-trial-batch5-b.json","provisional-trial-batch5-c.json"];
const groupedTrials=unifiedFiles.flatMap(name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8")).profiles);
if(groupedTrials.length!==53||unifiedManifest.candidates.length!==57)throw Error("Expected 53 gallery trials plus four photo-held candidates");
if(groupedTrials.some(x=>!x.trial||x.admission_status!=="RESEARCH_TRIAL_NOT_ADMITTED"))throw Error("Research trial admission status drift");
const loadedIds=new Set([...species,...groupedTrials].map(x=>x.id));
const missingPhotos=unifiedManifest.candidates.filter(c=>!loadedIds.has(c.id));
if(missingPhotos.length!==4)throw Error("Expected exactly four no-photo research inventory profiles");
const placeholderProfiles=missingPhotos.map(c=>({id:c.id,scientific:c.scientific,common:c.common||c.scientific,trial:true,admission_status:"RESEARCH_TRIAL_NOT_ADMITTED",range:"UNVERIFIED",traits:{head:[],habit:[],ligule:[],awns:[]},photos:[]}));
state.species=[...species,...groupedTrials,...placeholderProfiles];
if(new Set(state.species.map(x=>x.id)).size!==169)throw Error("One result group must contain 169 distinct grasses");
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={};
const all169=run();
if(all169.length!==169)throw Error("One unfiltered result list must show all 169");
state.selected.head="foxtail";
const selective=run();
if(!selective.length||selective.length>=169)throw Error("Original 112 no longer narrow under scored head selections");
for(const candidate of placeholderProfiles)if(!selective.some(x=>x.id===candidate.id))throw Error("Uncoded photo-held grass must stay possible: "+candidate.id);
if(!selective.some(x=>x.id==="setaria-viridis"))throw Error("Documented newer foxtail trait failed to match");
if(selective.some(x=>x.id==="melica-nitens"))throw Error("Known Melica panicle should not be treated as a foxtail");
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={};
if(run().length!==169)throw Error("Unified 169 inventory was not restored after selection");
if(!html.includes("candidateManifest")||!html.includes("traits:{head:[],habit:[],ligule:[],awns:[]}"))throw Error("Missing no-photo fallback for four research grasses");

// Authoritative H&L PDF pass 2: six original research taxa, one mixed pool of 169.
const pdfPass2={"avena-sativa":[36,7],"lolium-perenne":[53,7],"sphenopholis-obtusata":[63,7],"polypogon-viridis":[60,9],"bromus-tectorum":[40,7],"sporobolus-cryptandrus":[64,6]};
if(pack.evidence.length<779)throw Error("PDF pass 2 requires 779 advanced evidence records");
if(new Set(pack.evidence.map(x=>x.id)).size<121)throw Error("PDF pass 2 requires 121 of the 169 grasses with advanced evidence");
for(const [id,[page,count]] of Object.entries(pdfPass2)){
 const rows=pack.evidence.filter(x=>x.id===id&&x.source.includes("Hagenbuch & Lemke (2015)"));
 if(rows.length!==count)throw Error("PDF pass 2 source coverage count mismatch "+id+": "+rows.length);
 for(const row of rows){
  if(!row.source?.includes("Hagenbuch & Lemke (2015)")||!row.source.includes("printed p. "+page)||row.source_url?.includes("#page="+page)!==true)throw Error("PDF pass 2 missing exact Hill Country account page "+id+"/"+row.character);
  if(row.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED")throw Error("PDF pass 2 cannot certify photographed specimens "+id);
 }
}
for(const id of ["avena-sativa","lolium-perenne","sphenopholis-obtusata","polypogon-viridis","bromus-tectorum","sporobolus-cryptandrus"])
 if(!groupedTrials.some(s=>s.id===id)||species.some(s=>s.id===id))throw Error("PDF pass 2 accidentally admits source candidate into 112 scored");
if(pack.evidence.some(x=>x.id==="bromus-tectorum"&&x.character==="sheath_margins"))throw Error("Do not score research-pending closed Bromus sheath");
if(pack.evidence.some(x=>x.id==="lolium-perenne"&&x.character==="leaf_base"))throw Error("Do not infer exact auricle form from H&L merely reporting presence");
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={sheath_margins:"overlapping"};
let pdfP2Matches=run();
if(pdfP2Matches.length!==169)throw Error("PDF pass 2 optional feature removed candidates");
if(!pdfP2Matches.some(x=>x.id==="sporobolus-cryptandrus"&&x.extras===1))throw Error("Sand dropseed overlapping sheath not positively ranked");
if(pdfP2Matches.some(x=>x.id==="lolium-perenne"&&x.extras>0))throw Error("Ryegrass open sheath misranked as overlapping");
state.refineSelected={ligule_edge:"hair_fringe"};
pdfP2Matches=run();
if(!pdfP2Matches.some(x=>x.id==="sporobolus-cryptandrus"&&x.extras===1))throw Error("Sand dropseed hair-fringe ligule missing");
if(pdfP2Matches.some(x=>x.id==="bromus-tectorum"&&x.extras>0))throw Error("Downy brome erose/lacerate ligule misread as hair fringe");
state.refineSelected={surface_runners:"rooted_nodes"};
pdfP2Matches=run();
if(!pdfP2Matches.some(x=>x.id==="polypogon-viridis"&&x.extras===1))throw Error("Water bentgrass rooting nodes missing");
state.refineSelected={blade_shape:"folded"};
pdfP2Matches=run();
if(!pdfP2Matches.some(x=>x.id==="sporobolus-cryptandrus"&&x.extras===1))throw Error("Sand dropseed plane/conduplicate blade variation not coded");
state.refineSelected={blade_hairs:"blade_hairy"};
pdfP2Matches=run();
if(!pdfP2Matches.some(x=>x.id==="bromus-tectorum"&&x.extras===1))throw Error("Downy brome pubescent blades missing");
state.refineSelected={ligule_length:"medium"};
pdfP2Matches=run();
for(const id of ["avena-sativa","polypogon-viridis"])
 if(!pdfP2Matches.some(x=>x.id===id&&x.extras===1))throw Error("H&L medium ligule bin missing "+id);
state.refineSelected={};
if(run().length!==169)throw Error("PDF pass 2 failed to restore all 169 mixed results");

// PDF pass 3: seven exact H&L 2015 species accounts, no inferred unapproved traits.
const pdfPass3={"aegilops-cylindrica":[33,7],"bromus-catharticus":[39,8],"dichanthelium-acuminatum":[43,9],"digitaria-californica":[44,8],"echinochloa-colona":[46,5],"hordeum-murinum":[52,9],"triticum-aestivum":[67,7]};
if(pack.evidence.length<832)throw Error("PDF pass 3 832 evidence-record baseline regressed");
if(new Set(pack.evidence.map(x=>x.id)).size<128)throw Error("PDF pass 3 fewer than 128/169 source-covered grass species");
for(const [id,[page,count]] of Object.entries(pdfPass3)){
 const observations=pack.evidence.filter(x=>x.id===id&&x.source.includes("Hagenbuch & Lemke (2015)"));
 if(observations.length<count)throw Error("PDF pass 3 original species citations missing "+id+" / "+observations.length);
 if(!groupedTrials.some(s=>s.id===id)||species.some(s=>s.id===id))throw Error("Pass3 improperly promoted candidate "+id);
 for(const record of observations){
  if(record.source?.includes("Hagenbuch & Lemke (2015)")!==true||record.source?.includes("printed p. "+page)!==true||record.source_url?.endsWith("#page="+page)!==true)throw Error("Wrong H&L citation "+id+"/"+record.character);
  if(record.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED")throw Error("Pass3 evidence incorrectly marks an identified photograph "+id);
 }
}
for(const id of ["bromus-catharticus","echinochloa-colona"])
 if(pack.evidence.some(x=>x.id===id&&x.character==="sheath_margins"&&x.states.includes("closed")))throw Error("Closed sheath remains unapproved "+id);
if(pack.evidence.some(x=>x.id==="echinochloa-colona"&&x.character==="ligule_length"))throw Error("Absent Echinochloa ligule incorrectly coded with a numerical length");
if(pack.evidence.some(x=>x.id==="aegilops-cylindrica"&&x.character==="leaf_base"))throw Error("Tiny goatgrass auricles should not be fabricated as pointed/clasping");
if(pack.evidence.some(x=>x.id==="digitaria-californica"&&x.character==="underground_stems"))throw Error("Digitaria subrhizomatous knotty base does not prove a true rhizome");
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={basal_crown:"hard_knotty"};
let pass3Rows=run();
if(pass3Rows.length!==169)throw Error("Pass3 advanced basal-crown choice eliminated grasses");
if(!pass3Rows.some(x=>x.id==="digitaria-californica"&&x.extras===1))throw Error("California cottontop source-backed knotty base not ranked");
state.refineSelected={leaf_base:"compressed_sheath"};
pass3Rows=run();
if(!pass3Rows.some(x=>x.id==="echinochloa-colona"&&x.extras===1))throw Error("Jungle rice compressed sheath not ranked");
state.refineSelected={stem_special:"succulent_stems"};
pass3Rows=run();
if(!pass3Rows.some(x=>x.id==="hordeum-murinum"&&x.extras===1))throw Error("Wall barley succulent culm source not ranked");
state.refineSelected={blade_venation:"prominent_midvein"};
pass3Rows=run();
if(!pass3Rows.some(x=>x.id==="bromus-catharticus"&&x.extras===1))throw Error("Rescuegrass conspicuous lower midvein not ranked");
state.refineSelected={ligule_edge:"hair_fringe"};
pass3Rows=run();
if(!pass3Rows.some(x=>x.id==="dichanthelium-acuminatum"&&x.extras===1))throw Error("Hairy panicgrass multilevel fringe missing");
if(pass3Rows.some(x=>x.id==="bromus-catharticus"&&x.extras>0))throw Error("Rescuegrass erose membrane cannot be called a hair-only ligule");
state.refineSelected={blade_shape:"folded"};
pass3Rows=run();
if(!pass3Rows.some(x=>x.id==="aegilops-cylindrica"&&x.extras===1))throw Error("Dry-folded goatgrass blade observation missing");
state.refineSelected={};
if(run().length!==169)throw Error("PDF pass3 did not restore the full 169-grass pool");

// PDF pass 4: five published taxon treatments, H&L vegetative and Diggs reproductive.
const pdfPass4={"dactyloctenium-aegyptium":{"n":12,"hl":"42","diggs":["florets_per_spikelet","spikelet_position","true_lemma_awn"],"printed":"1259"},"cenchrus-ciliaris":{"n":12,"hl":"58","diggs":[]},"setaria-leucopila":{"n":8,"hl":"61","diggs":["lemma_texture"],"printed":"1319"},"steinchisma-hians":{"n":7,"hl":"65","diggs":[]},"stenotaphrum-secundatum":{"n":12,"hl":"65","diggs":["florets_per_spikelet","spikelet_position","true_lemma_awn"],"printed":"1328"}};
if(pack.evidence.length<883)throw Error("PDF pass 4 source record baseline regressed");
if(new Set(pack.evidence.map(x=>x.id)).size<133)throw Error("PDF pass 4 requires 133/169 species with an optional source");
for(const [id,info] of Object.entries(pdfPass4)){
 const rows=pack.evidence.filter(e=>e.id===id);
 if(rows.length<info.n)throw Error("PDF pass 4 original citations missing "+id+" "+rows.length);
 if(!groupedTrials.some(s=>s.id===id)||species.some(s=>s.id===id))throw Error("PDF pass4 changed research profile into old scored set "+id);
 for(const rec of rows.slice(0,info.n)){
  const isDiggs=info.diggs.includes(rec.character);
  if(rec.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!rec.note?.trim())throw Error("PDF pass4 citation quality drift "+id+"/"+rec.character);
  if(isDiggs){
   if(!rec.source.includes("Diggs, Lipscomb & O\'Kennon")||!rec.source.includes("printed p. "+info.printed)||rec.pdf_printed_page!==Number(info.printed)||rec.source_url!=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas")throw Error("PDF pass4 reproductive citation gate "+id+"/"+rec.character);
  }else if(!rec.source.includes("Hagenbuch & Lemke (2015)")||!rec.source_url.startsWith("https://www.phytoneuron.net/2015Phytoneuron/04PhytoN-HillCountryGrasses.pdf#page="+info.hl))throw Error("PDF pass4 authoritative vegetative page missing "+id+"/"+rec.character);
 }
}
if(pack.evidence.some(x=>x.id==="steinchisma-hians"&&x.character==="ligule_edge"))throw Error("H&L vs Diggs disagreement over Steinchisma ligule rim was incorrectly scored");
if(pack.evidence.some(x=>x.id==="stenotaphrum-secundatum"&&x.character==="culm_posture"&&x.states.includes("prostrate")))throw Error("Research pending prostrate answer should not be activated");
if(pack.evidence.some(x=>x.id==="setaria-leucopila"&&x.character==="ligule_edge"&&x.states.includes("hair_fringe")))throw Error("Setaria ciliate membrane misidentified as hair-only ligule");
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={spikelet_position:"two_rows"};
let pdf4Got=run();
if(pdf4Got.length!==169||!pdf4Got.some(x=>x.id==="dactyloctenium-aegyptium"&&x.extras===1))throw Error("Diggs crowfoot two-row spikelet clue does not rank");
state.refineSelected={spikelet_position:"one_side"};
pdf4Got=run();
for(const id of ["dactyloctenium-aegyptium","stenotaphrum-secundatum"])
 if(!pdf4Got.some(x=>x.id===id&&x.extras===1))throw Error("Diggs one-sided spikelet position missing "+id);
state.refineSelected={lemma_texture:"wrinkled"};
pdf4Got=run();
if(!pdf4Got.some(x=>x.id==="setaria-leucopila"&&x.extras===1))throw Error("Diggs Setaria finely rugose fertile lemma missing");
state.refineSelected={basal_crown:"hard_knotty"};
pdf4Got=run();
if(!pdf4Got.some(x=>x.id==="cenchrus-ciliaris"&&x.extras===1))throw Error("H&L knotty buffelgrass crown unranked");
state.refineSelected={surface_runners:"stolon"};
pdf4Got=run();
for(const id of ["stenotaphrum-secundatum","dactyloctenium-aegyptium"])
 if(!pdf4Got.some(x=>x.id===id&&x.extras===1))throw Error("Published stolon conditional positive observation missing "+id);
state.refineSelected={ligule_length:"tiny"};
pdf4Got=run();
for(const id of Object.keys(pdfPass4))
 if(!pdf4Got.some(x=>x.id===id&&x.extras===1))throw Error("Short ligule range evidence missing "+id);
state.refineSelected={blade_shape:"folded"};
pdf4Got=run();
for(const id of ["dactyloctenium-aegyptium","setaria-leucopila","steinchisma-hians","stenotaphrum-secundatum"])
 if(!pdf4Got.some(x=>x.id===id&&x.extras===1))throw Error("Source documented conduplicate blade unranked "+id);
state.refineSelected={};
if(run().length!==169)throw Error("Pass4 options should not remove any of 169 grasses");


// PDF pass 5: authoritatively sourced five species, preserving the 169-result pool.
const pdfPass5={"janochloa-antidotalis":11,"alopecurus-carolinianus":2,"briza-minor":2,"panicum-dichotomiflorum":3,"paspalum-notatum":2};
if(pack.evidence.length<903)throw Error("PDF pass 5 record count regressed");
if(new Set(pack.evidence.map(x=>x.id)).size<138)throw Error("PDF pass 5 species coverage regressed");
for(const [id,n] of Object.entries(pdfPass5)){
 const rows=pack.evidence.filter(x=>x.id===id);
 if(rows.length<n)throw Error("PDF pass 5 historic cited records missing "+id+": "+rows.length);
 if(!groupedTrials.some(s=>s.id===id)||species.some(s=>s.id===id))throw Error("PDF pass 5 mistakenly admitted provisional species "+id);
 for(const r of rows){
  if(r.coordination_issue===344&&r.source_status==="READY_SUPPLEMENTAL_CONDITIONAL"){
   if(!r.source_url?.startsWith("https://")||!r.original_source_citation||!r.note?.trim())throw Error("Uncited supplemental evidence "+id);
   continue; // Historical Diggs-only baseline checks follow.
  }
  if(r.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!r.note?.trim())throw Error("PDF pass 5 citation quality "+id);
  if(id==="janochloa-antidotalis"){
   if(!r.source.includes("printed p. 56")||!r.source_url.endsWith("#page=56")||!r.taxon_crosswalk_url?.includes("77319974-1"))throw Error("Pass 5 Panicum/Janochloa crosswalk is missing");
  }else if(!r.source.includes("Diggs, Lipscomb & O'Kennon")||r.pdf_document!=="Flora of North Central Texas-monocots-Acor-Zanni.pdf"||r.pdf_printed_page<1200||r.source_url!=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas")throw Error("Pass 5 Flora reproductive/vegetative page missing "+id);
 }
}
if(pack.evidence.some(x=>x.id==="janochloa-antidotalis"&&x.character==="stem_nodes"&&x.states.includes("backward_hairs")))throw Error("Antrorse is not backward-facing");
if(pack.evidence.some(x=>x.id==="panicum-dichotomiflorum"&&x.character==="culm_posture"&&x.states.includes("prostrate")))throw Error("Trails along soil must not activate research-pending prostrate");
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const [choice,expected] of [
 [{ligule_length:"medium"},["alopecurus-carolinianus","briza-minor"]],
 [{underground_stems:"thick_rhizome"},["janochloa-antidotalis"]],
 [{underground_stems:"rhizome_present"},["paspalum-notatum"]],
 [{florets_per_spikelet:"one"},["alopecurus-carolinianus"]],
 [{florets_per_spikelet:"several"},["briza-minor"]],
 [{ligule_edge:"ciliate"},["janochloa-antidotalis","panicum-dichotomiflorum"]],
 [{culm_posture:"erect"},["janochloa-antidotalis","panicum-dichotomiflorum","paspalum-notatum"]]
]){
 state.refineSelected=choice;
 const r=run();
 if(r.length!==169)throw Error("Pass 5 optional clue excluded one of 169 species");
 for(const id of expected)if(!r.some(x=>x.id===id&&x.extras>=1))throw Error("Pass 5 clue did not rank "+id);
}
state.refineSelected={};
if(run().length!==169)throw Error("Pass 5 default result pool changed");


// PDF pass 6: direct H&L 2015 p.49 and species-level Diggs 1999 pages only.
// Cross-taxon absence is not encoded, nor are genus-only statements.
const pdfPass6={"eragrostis-superba":6,"paspalum-langei":1,"echinochloa-walteri":2,"muhlenbergia-capillaris":2,"phyllostachys-aurea":4};
if(pack.evidence.length<918||new Set(pack.evidence.map(r=>r.id)).size<143)throw Error("PDF pass 6 coverage regressed");
for(const [id,n] of Object.entries(pdfPass6)){
 const a=pack.evidence.filter(x=>x.id===id);
 if(a.length<n)throw Error("Pass6 historical records lost "+id);
 if(id==="paspalum-langei"&&!a.some(r=>r.character==="blade_width"&&r.pdf_printed_page===1306))throw Error("Pass6 original Paspalum blade width/source disappeared");
 if(![...groupedTrials,...placeholderProfiles].some(s=>s.id===id)||species.some(s=>s.id===id))throw Error("Pass6 changed admission "+id);
 for(const r of a.slice(0,n)){
  if(r.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!r.note?.trim())throw Error("Pass6 quality "+id);
  if(id==="eragrostis-superba"){
   if(!r.source.includes("printed p. 49")||!r.source_url.endsWith("#page=49"))throw Error("Pass6 Hill Country source error");
  }else if(!r.source.includes("Diggs, Lipscomb & O'Kennon")||!r.pdf_printed_page||r.source_url!=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas")throw Error("Pass6 Diggs source error "+id);
 }
}
if(!pack.evidence.some(x=>x.id==="echinochloa-walteri"&&x.character==="true_lemma_awn"&&x.states.includes("none")))throw Error("Echinochloa awnless variation lost");
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const [choice,expected] of [
 [{blade_shape:"inrolled"},["eragrostis-superba"]],
 [{blade_width:"broad"},["paspalum-langei","phyllostachys-aurea"]],
 [{ligule_edge:"hair_fringe"},["eragrostis-superba"]],
 [{sheath_surface:"sometimes_hairy"},["echinochloa-walteri"]],
 [{true_lemma_awn:"long"},["echinochloa-walteri","muhlenbergia-capillaris"]],
 [{true_lemma_awn:"none"},["echinochloa-walteri"]],
 [{stem_special:"giant_canes"},["phyllostachys-aurea"]]
]){
 state.refineSelected=choice;
 const res=run();
 if(res.length!==169)throw Error("Pass6 excluded source-unknown grasses");
 for(const id of expected)if(!res.some(r=>r.id===id&&r.extras>=1))throw Error("Pass6 positive ranking missing "+id);
}
state.refineSelected={};
if(run().length!==169)throw Error("Pass6 default result pool changed");


// PDF pass 7: ten exact H&L/Diggs treatment crosswalks and non-excluding evidence.
const pdfPass7={"rottboellia-campestris":11,"pappophorum-bicolor":7,"sphenopholis-interrupta":10,"oplismenus-hirtellus":5,"panicum-miliaceum":3,"sclerochloa-dura":2,"lolium-multiflorum":1,"miscanthus-sinensis":3,"cortaderia-selloana":3,"tridentopsis-elongata":1};
if(pack.evidence.length<964||new Set(pack.evidence.map(x=>x.id)).size<153)throw Error("PDF pass 7 source coverage regression");
for(const [id,n] of Object.entries(pdfPass7)){
 const a=pack.evidence.filter(x=>x.id===id);
 if(a.length<n)throw Error("Pass7 historical source-character baseline regressed "+id+": "+a.length); // Later cite-backed additions are tested independently.
 if(![...groupedTrials,...placeholderProfiles].some(x=>x.id===id)||species.some(s=>s.id===id))throw Error("Pass7 must not promote provisional grass "+id);
 for(const x of a){
  if(x.coordination_issue===344&&x.source_status==="READY_SUPPLEMENTAL_CONDITIONAL"){
   if(!x.source_url?.startsWith("https://")||!x.original_source_citation||!x.note?.trim())throw Error("Uncited supplemental evidence "+id);
   continue; // Historical book-only source checks follow.
  }
  if(x.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!x.note?.trim())throw Error("Pass7 insufficient source note "+id);
  if(!(/Hagenbuch & Lemke|Diggs, Lipscomb & O'Kennon/.test(x.source))||!x.source.includes("printed p. "))throw Error("Pass7 missing exact original-book page "+id);
  if(["florets_per_spikelet","spikelet_position","true_lemma_awn","floral_hair_position"].includes(x.character)&&(!x.source.includes("Diggs, Lipscomb & O'Kennon")||!x.pdf_printed_page))throw Error("Pass7 reproductive trait not in Diggs "+id);
 }
}
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const [sel,id] of [
 [{underground_stems:"short_knotty"},"rottboellia-campestris"],
 [{ligule_edge:"hair_fringe"},"pappophorum-bicolor"],
 [{ligule_edge:"lacerate"},"sphenopholis-interrupta"],
 [{spikelet_position:"one_side"},"oplismenus-hirtellus"],
 [{blade_hairs:"blade_hairy"},"panicum-miliaceum"],
 [{florets_per_spikelet:"several"},"sclerochloa-dura"],
 [{leaf_base:"pointed_auricles"},"lolium-multiflorum"],
 [{true_lemma_awn:"bent_twisted"},"miscanthus-sinensis"],
 [{floral_hair_position:"lemma"},"cortaderia-selloana"],
 [{blade_width:"narrow"},"tridentopsis-elongata"]
]){
 state.refineSelected=sel;let r=run();
 if(r.length!==169||!r.some(x=>x.id===id&&x.extras>=1))throw Error("Pass7 candidate retention / positive match "+id);
}
state.refineSelected={};
if(run().length!==169)throw Error("Pass7 changed 169-grass pool");


// Supplement Pass 8: exact species treatments outside regional book coverage; all positive-only.
const supplementalPass8={"bothriochloa-longipaniculata":3,"bothriochloa-bladhii":3,"dichanthium-aristatum":3,"bromus-brevis":5,"rostraria-cristata":4,"megathyrsus-maximus":5,"eragrostis-minor":8,"melinis-repens":8,"nassella-tenuissima":3};
if(pack.evidence.length<1006||new Set(pack.evidence.map(x=>x.id)).size<162)throw Error("Pass8 coverage regressed");
for(const [id,n] of Object.entries(supplementalPass8)){
 const a=pack.evidence.filter(x=>x.id===id);
 if(a.length<n)throw Error("Pass8 original species-level records missing "+id+" "+a.length);
 if(![...groupedTrials,...placeholderProfiles].some(x=>x.id===id)||species.some(s=>s.id===id))throw Error("Pass8 changed admission "+id);
 for(const e of a){
  if(!e.source_url.startsWith("https://")||e.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!e.note?.trim())throw Error("Pass8 citation quality "+id);
  if(["florets_per_spikelet","spikelet_position","glume_marks","lemma_texture","true_lemma_awn","floral_hair_position"].includes(e.character)&&!(e.coordination_issue===344&&e.source_status==="READY_SUPPLEMENTAL_CONDITIONAL"))throw Error("Pass8 historical source or new floral handoff unsupported");
 }
}
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const [choice,id] of [
 [{stem_special:"basal_branching"},"bothriochloa-longipaniculata"],
 [{underground_stems:"short_rhizome"},"bothriochloa-bladhii"],
 [{culm_posture:"decumbent"},"dichanthium-aristatum"],
 [{blade_hairs:"blade_hairy"},"bromus-brevis"],
 [{blade_width:"medium"},"rostraria-cristata"],
 [{sheath_surface:"sometimes_hairy"},"megathyrsus-maximus"],
 [{stem_nodes:"gland_ring"},"eragrostis-minor"],
 [{surface_runners:"rooted_nodes"},"melinis-repens"],
 [{blade_width:"thread"},"nassella-tenuissima"]
]){
 state.refineSelected=choice;const v=run();
 if(v.length!==169||!v.some(x=>x.id===id&&x.extras>=1))throw Error("Pass8 unknown-safe ranking failed "+id);
}
state.refineSelected={};
if(run().length!==169)throw Error("Pass8 mutated unified 169 pool");


// Source Pass 9: exact FNA, Kew/GrassBase, Go Botany and national-flora species entries.
const supplementalPass9={"stapfochloa-ciliata":3,"tridens-congestus":4,"cenchrus-setaceus":5,"elymus-macgregorii":5,"panicum-repens":7,"stapfochloa-canterae":4};
if(pack.evidence.length<1034||new Set(pack.evidence.map(x=>x.id)).size<168)throw Error("Pass9 evidence coverage regressed");
for(const [id,n] of Object.entries(supplementalPass9)){
 const a=pack.evidence.filter(x=>x.id===id);
 if(a.length<n)throw Error("Pass9 baseline records lost "+id+": "+a.length);
 if(![...groupedTrials,...placeholderProfiles].some(x=>x.id===id)||species.some(s=>s.id===id))throw Error("Pass9 accidentally admitted provisional taxon "+id);
 for(const r of a.slice(0,n)){
  if(!r.source_url.startsWith("https://")||!r.note?.trim()||r.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED")throw Error("Pass9 bad provenance "+id);
  if(["florets_per_spikelet","spikelet_position","glume_marks","lemma_texture","true_lemma_awn","floral_hair_position"].includes(r.character)&&!(r.coordination_issue===344&&r.source_status==="READY_SUPPLEMENTAL_CONDITIONAL"))throw Error("Pass9 historic or new floral citation unsupported");
 }
}
if(pack.evidence.some(x=>x.id==="lolium-x-boucheanum"))throw Error("Kew vs Austrian Lolium x boucheanum hybrid taxon mismatch needs taxonomic review, not automatic scoring");
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const [sel,id] of [
 [{ligule_edge:"hair_fringe"},"stapfochloa-ciliata"],
 [{underground_stems:"long_rhizome"},"tridens-congestus"],
 [{ligule_length:"tiny"},"cenchrus-setaceus"],
 [{sheath_margins:"overlapping"},"elymus-macgregorii"],
 [{underground_stems:"long_scaly"},"panicum-repens"],
 [{blade_shape:"folded"},"stapfochloa-canterae"]
]){
 state.refineSelected=sel;const r=run();
 if(r.length!==169||!r.some(x=>x.id===id&&x.extras>=1))throw Error("Pass9 mismatch ranking "+id);
}
state.refineSelected={};
if(run().length!==169)throw Error("Pass9 changed 169-grass identification pool");


// Reproductive Depth Pass 10: Diggs (1999) species accounts and precise sex/variety ranges.
const reproductivePass10={"aegilops-cylindrica":2,"sphenopholis-obtusata":2,"triticum-aestivum":3,"bromus-catharticus":3,"bromus-tectorum":2,"poa-annua":1,"poa-arachnifera":1,"bouteloua-dactyloides":1,"eleusine-indica":2,"polypogon-viridis":1,"paspalum-notatum":1,"hordeum-murinum":1};
if(pack.evidence.length<1054||new Set(pack.evidence.map(r=>r.id)).size!==168)throw Error("Pass10 baseline evidence/unified coverage drift");
for(const [id,n] of Object.entries(reproductivePass10)){
 const newTraits=pack.evidence.filter(r=>r.id===id&&r.pdf_document==="Flora of North Central Texas-monocots-Acor-Zanni.pdf"&&r.note?.includes("")&&r.pdf_printed_page>=1200);
 const expected=pack.evidence.filter(r=>r.id===id&&["florets_per_spikelet","spikelet_position","lemma_texture","true_lemma_awn","glume_marks"].includes(r.character));
 if(expected.length<n)throw Error("Pass10 missing or duplicate reproductive traits "+id);
 if(newTraits.length<n)throw Error("Pass10 Flora printed-page provenance missing "+id);
 for(const r of expected){
  if(r.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!r.source.includes("Diggs, Lipscomb & O'Kennon")||!r.source.includes("printed p.")||r.source_url!=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas")throw Error("Pass10 source policy "+id);
 }
}
const pass10Find=(id,char)=>pack.evidence.find(r=>r.id===id&&r.character===char);
if(JSON.stringify(pass10Find("bouteloua-dactyloides","florets_per_spikelet").states)!==JSON.stringify(["one","two"]))throw Error("Buffalograss sexes incorrectly simplified");
if(!pass10Find("bromus-tectorum","lemma_texture").states.includes("smooth"))throw Error("Cheatgrass glabratus overlooked");
if(pass10Find("triticum-aestivum","spikelet_position").states.includes("paired"))throw Error("Spikelets on opposite sides are not sessile/pedicelled pairs");
if(pack.evidence.some(r=>r.id==="lolium-x-boucheanum"))throw Error("Unresolved Lolium hybrid hold lost");
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const [selected,id] of [
 [{florets_per_spikelet:"several"},"aegilops-cylindrica"],
 [{true_lemma_awn:"none"},"sphenopholis-obtusata"],
 [{spikelet_position:"two_rows"},"triticum-aestivum"],
 [{true_lemma_awn:"short"},"bromus-catharticus"],
 [{lemma_texture:"hairy"},"bromus-tectorum"],
 [{lemma_texture:"hairy"},"poa-annua"],
 [{lemma_texture:"hairy"},"poa-arachnifera"],
 [{florets_per_spikelet:"one"},"bouteloua-dactyloides"],
 [{florets_per_spikelet:"two"},"bouteloua-dactyloides"],
 [{spikelet_position:"two_rows"},"eleusine-indica"],
 [{true_lemma_awn:"none"},"polypogon-viridis"],
 [{glume_marks:"glabrous"},"paspalum-notatum"],
 [{true_lemma_awn:"long"},"hordeum-murinum"]
]){
 state.refineSelected=selected;
 const got=run();
 if(got.length!==169||!got.some(x=>x.id===id&&x.extras>=1))throw Error("Pass10 positive rank or non-excluding regression "+id);
}
state.refineSelected={};
if(run().length!==169)throw Error("Pass10 changed 169-grass pool");


// Reproductive Depth Pass 11: exact Diggs 1999 species account (flora-only, 169-grass pool).
const reproductivePass11={"erioneuron-pilosum":5,"limnodea-arkansana":1,"nassella-leucotricha":3,"secale-cereale":3,"tridens-texanus":3,"tripsacum-dactyloides":2,"urochloa-texana":1,"paspalum-floridanum":1,"bromus-pubescens":2,"chloris-cucullata":1,"chloris-verticillata":1,"chloris-virgata":1,"hilaria-belangeri":1,"hordeum-pusillum":1,"muhlenbergia-lindheimeri":2,"muhlenbergia-reverchonii":2,"muhlenbergia-schreberi":3,"digitaria-cognata":1,"zizaniopsis-miliacea":2,"bothriochloa-ischaemum":1,"eragrostis-hirsuta":1,"paspalum-langei":2,"paspalum-pubiflorum":1,"paspalum-setaceum":1};
if(pack.evidence.length<1096||new Set(pack.evidence.map(x=>x.id)).size!==168)throw Error("Pass11 total or covered grass regression");
for(const [id,n] of Object.entries(reproductivePass11)){
 const floralChars=new Set(["florets_per_spikelet","spikelet_position","glume_marks","lemma_texture","true_lemma_awn","floral_hair_position"]);
 const a=pack.evidence.filter(x=>x.id===id&&floralChars.has(x.character)&&x.pdf_document==="Flora of North Central Texas-monocots-Acor-Zanni.pdf"&&x.source?.includes("printed p."));
 if(a.length<n)throw Error("Pass11 insufficient new reproductive records: "+id+" "+a.length+"<"+n);
 for(const e of a){
  if(!e.source?.includes("Diggs, Lipscomb & O'Kennon (1999)")||!e.source.includes("printed p.")||!Number.isInteger(e.pdf_printed_page)||e.pdf_document!=="Flora of North Central Texas-monocots-Acor-Zanni.pdf")throw Error("Pass11 missing exact printed Flora page "+id+"/"+e.character);
  if(e.source_url!=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas"||e.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!e.note?.trim())throw Error("Pass11 provenance/conditional note "+id);
 }
}
if(JSON.stringify(pack.evidence.find(x=>x.id==="hilaria-belangeri"&&x.character==="florets_per_spikelet").states)!==JSON.stringify(["one","two"]))throw Error("Pass11 curly-mesquite spikelet sexes flattened");
if(pack.evidence.find(x=>x.id==="zizaniopsis-miliacea"&&x.character==="glume_marks"))throw Error("No-glume grass cannot be mis-scored as tiny lower glume");
if(pack.evidence.some(x=>x.id==="lolium-x-boucheanum"))throw Error("Ryegrass hybrid hold unexpectedly removed");
state.species=[...species,...groupedTrials,...placeholderProfiles];
state.selected={head:null,habit:null,ligule:null,awns:null};
for(const [choice,id] of [
 [{florets_per_spikelet:"several"},"erioneuron-pilosum"],
 [{florets_per_spikelet:"one"},"limnodea-arkansana"],
 [{true_lemma_awn:"long"},"nassella-leucotricha"],
 [{glume_marks:"one_vein"},"secale-cereale"],
 [{floral_hair_position:"lemma"},"tridens-texanus"],
 [{true_lemma_awn:"none"},"tripsacum-dactyloides"],
 [{floral_hair_position:"lemma"},"urochloa-texana"],
 [{glume_marks:"glabrous"},"paspalum-floridanum"],
 [{lemma_texture:"hairy"},"bromus-pubescens"],
 [{florets_per_spikelet:"two"},"chloris-cucullata"],
 [{florets_per_spikelet:"two"},"chloris-verticillata"],
 [{florets_per_spikelet:"two"},"chloris-virgata"],
 [{florets_per_spikelet:"one"},"hilaria-belangeri"],
 [{florets_per_spikelet:"two"},"hilaria-belangeri"],
 [{true_lemma_awn:"short"},"hordeum-pusillum"],
 [{true_lemma_awn:"none"},"muhlenbergia-lindheimeri"],
 [{true_lemma_awn:"short"},"muhlenbergia-reverchonii"],
 [{lemma_texture:"hairy"},"muhlenbergia-schreberi"],
 [{glume_marks:"lower_reduced"},"digitaria-cognata"],
 [{florets_per_spikelet:"one"},"zizaniopsis-miliacea"],
 [{true_lemma_awn:"short"},"bothriochloa-ischaemum"],
 [{florets_per_spikelet:"several"},"eragrostis-hirsuta"],
 [{floral_hair_position:"lemma"},"paspalum-langei"],
 [{glume_marks:"glabrous"},"paspalum-pubiflorum"],
 [{glume_marks:"glabrous"},"paspalum-setaceum"]
]){
 state.refineSelected=choice;
 const r=run();
 if(r.length!==169||!r.some(s=>s.id===id&&s.extras>=1))throw Error("Pass11 positive matching or missing species "+id);
}
state.refineSelected={};
if(run().length!==169)throw Error("Pass11 changed one 169-grass pool");


// Issue #336: four-lane research integration after A01, B01, C01 and D01.
const laneIntegration12={"bothriochloa-barbinodis":3,"bothriochloa-ischaemum":2,"muhlenbergia-capillaris":1,"muhlenbergia-lindheimeri":1,"muhlenbergia-schreberi":1,"chloris-cucullata":1,"chloris-virgata":3,"panicum-capillare":2,"setaria-leucopila":3,"setaria-viridis":3,"paspalum-distichum":3,"paspalum-floridanum":2,"paspalum-langei":3,"paspalum-notatum":2,"paspalum-pubiflorum":2,"paspalum-setaceum":2,"paspalum-urvillei":2,"tridens-albescens":5,"tridens-congestus":3,"bromus-japonicus":1};
if(pack.evidence.length<1141||new Set(pack.evidence.map(r=>r.id)).size!==168)throw Error("Issue336 evidence count/source coverage regression");
for(const [id,n] of Object.entries(laneIntegration12)){
 const r=pack.evidence.filter(x=>x.id===id&&x.coordination_issue===336);
 if(r.length!==n)throw Error("Issue336 missing research-row count "+id+" "+r.length);
 for(const x of r){
  if(x.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||x.source_url!=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas"||!x.source.includes("Diggs, Lipscomb & O'Kennon")||!Number.isInteger(x.pdf_printed_page)||x.pdf_document!=="Flora of North Central Texas-monocots-Acor-Zanni.pdf"||!x.note?.trim())throw Error("Issue336 provenance or printed page "+id);
 }
}
for(const id of ["paspalum-notatum","paspalum-pubiflorum","paspalum-setaceum"]){
 const x=pack.evidence.find(r=>r.id===id&&r.character==="glume_marks");
 if(!x?.states.includes("glabrous")||!x.states.includes("lower_reduced")||x.secondary_printed_page!==1305)throw Error("Paspalum glume amendment missing "+id);
}
for(const id of ["paspalum-distichum","paspalum-floridanum","paspalum-langei","paspalum-notatum","paspalum-pubiflorum","paspalum-setaceum","paspalum-urvillei"]){
 const x=pack.evidence.find(r=>r.id===id&&r.character==="spikelet_position");
 if(!x?.states.includes("one_side")||x.states.includes("paired"))throw Error("Paspalum one-sided branch mistaken for heteromorphic spikelet pair "+id);
}
if(pack.evidence.some(r=>r.id==="lolium-x-boucheanum"))throw Error("Unresolved Lolium hybrid not held");
if(pack.evidence.some(r=>r.id==="tridens-congestus"&&r.character==="true_lemma_awn"))throw Error("Tridens mucro incorrectly scored as lemma awn");
state.species=[...species,...groupedTrials,...placeholderProfiles];state.selected={head:null,habit:null,ligule:null,awns:null};
for(const [sel,id] of [
 [{spikelet_position:"paired"},"bothriochloa-barbinodis"],
 [{florets_per_spikelet:"two"},"bothriochloa-ischaemum"],
 [{floral_hair_position:"lemma"},"muhlenbergia-capillaris"],
 [{glume_marks:"lower_reduced"},"muhlenbergia-schreberi"],
 [{true_lemma_awn:"short"},"chloris-cucullata"],
 [{lemma_texture:"hairy"},"chloris-virgata"],
 [{lemma_texture:"shiny_hard"},"panicum-capillare"],
 [{floral_hair_position:"below_spikelet"},"setaria-leucopila"],
 [{true_lemma_awn:"none"},"setaria-viridis"],
 [{glume_marks:"lower_reduced"},"paspalum-distichum"],
 [{spikelet_position:"one_side"},"paspalum-floridanum"],
 [{glume_marks:"lower_reduced"},"paspalum-langei"],
 [{glume_marks:"lower_reduced"},"paspalum-notatum"],
 [{glume_marks:"lower_reduced"},"paspalum-pubiflorum"],
 [{glume_marks:"lower_reduced"},"paspalum-setaceum"],
 [{spikelet_position:"one_side"},"paspalum-urvillei"],
 [{true_lemma_awn:"none"},"tridens-albescens"],
 [{floral_hair_position:"lemma"},"tridens-congestus"],
 [{glume_marks:"glabrous"},"bromus-japonicus"]
]){
 state.refineSelected=sel;const got=run();
 if(got.length!==169||!got.some(r=>r.id===id&&r.extras>=1))throw Error("Issue336 optional ranking excludes unknown species "+id);
}
state.refineSelected={};if(run().length!==169)throw Error("Issue336 altered 169 species pool");

// Issue #336 Lane C02: six independently read Diggs-backed reproductive rows.
const c02Flora={
 "panicum-miliaceum":{florets_per_spikelet:["two"],lemma_texture:["smooth","shiny_hard"],true_lemma_awn:["none"]},
 "bouteloua-pectinata":{glume_marks:["one_vein"]},
 "setaria-italica":{lemma_texture:["smooth"]},
 "setaria-reverchonii":{lemma_texture:["wrinkled"]}
};
if(pack.evidence.length<1147||new Set(pack.evidence.map(r=>r.id)).size!==168)throw Error("Lane C02 evidence counts regressed");
if(new Set(pack.evidence.map(r=>r.id+"|"+r.character)).size!==pack.evidence.length)throw Error("Lane C02 introduced duplicate source row");
for(const [id,fields] of Object.entries(c02Flora))for(const [ch,states] of Object.entries(fields)){
 const x=pack.evidence.find(r=>r.id===id&&r.character===ch);
 if(!x||x.review_lane!=="C"||x.coordination_issue!==336||x.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!x.pdf_printed_page||x.source_url!=="https://shopbritpress.org/products/illustrated-flora-of-north-central-texas"||!states.every(s=>x.states.includes(s)))throw Error("Missing authoritative Lane C02 state "+id+"/"+ch);
}
for(const ch of ["florets_per_spikelet","lemma_texture","true_lemma_awn"]){
 const x=pack.evidence.find(r=>r.id==="panicum-virgatum"&&r.character===ch);
 if(!x||x.pdf_printed_page!==1291)throw Error("Switchgrass Panicum genus page correction missing "+ch);
}
if(!pack.evidence.find(r=>r.id==="panicum-virgatum"&&r.character==="lemma_texture").states.includes("smooth"))throw Error("Switchgrass glabrous upper fertile lemma lost");
for(const [id,ch,s] of [["panicum-miliaceum","florets_per_spikelet","two"],["setaria-italica","lemma_texture","smooth"],["setaria-reverchonii","lemma_texture","wrinkled"]]){
 state.refineSelected={[ch]:s};const result=run();
 if(result.length!==169||!result.some(r=>r.id===id&&r.extras>=1))throw Error("Lane C02 must rank positively but never exclude "+id+"/"+ch);
}
state.refineSelected={};if(run().length!==169)throw Error("Lane C02 altered unified 169 grass pool");


// Phase 4: coordinator-approved A–D batch of 40 exact H&L vegetative traits (Issue #340).
const phase4Expected={"arundo-donax|sheath_margins":["open"],"bothriochloa-barbinodis|sheath_margins":["open"],"bothriochloa-barbinodis|sheath_surface":["sometimes_hairy"],"bothriochloa-barbinodis|culm_posture":["erect","geniculate"],"bothriochloa-ischaemum|sheath_margins":["open"],"bothriochloa-ischaemum|culm_posture":["erect","decumbent"],"bothriochloa-ischaemum|stem_nodes":["hairy_nodes"],"chloris-andropogonoides|sheath_margins":["open"],"chloris-andropogonoides|sheath_surface":["lower_compressed","weak_keel"],"chloris-andropogonoides|culm_posture":["erect","geniculate"],"chloris-andropogonoides|surface_runners":["stolon"],"chloris-cucullata|sheath_margins":["open"],"chloris-cucullata|sheath_surface":["lower_compressed","keeled_lower"],"chloris-cucullata|culm_posture":["erect"],"chloris-cucullata|surface_runners":["stolon"],"chloris-verticillata|sheath_margins":["open"],"chloris-verticillata|sheath_surface":["lower_compressed","keeled_lower","hyaline_margins"],"chloris-virgata|sheath_margins":["open"],"cynodon-dactylon|sheath_margins":["open"],"aristida-oligantha|sheath_margins":["open"],"aristida-oligantha|culm_posture":["erect","geniculate"],"aristida-oligantha|stem_special":["basal_branching"],"aristida-purpurea|sheath_margins":["open"],"aristida-purpurea|sheath_surface":["rough_surface","sometimes_hairy"],"aristida-purpurea|culm_posture":["erect"],"aristida-purpurea|stem_special":["basal_branching"],"elymus-canadensis|sheath_margins":["open"],"elymus-canadensis|sheath_surface":["sometimes_hairy"],"elymus-canadensis|underground_stems":["short_rhizome"],"elymus-virginicus|sheath_margins":["open"],"elymus-virginicus|sheath_surface":["sometimes_hairy"],"eriochloa-sericea|sheath_margins":["open"],"eriochloa-sericea|culm_posture":["erect"],"eriochloa-sericea|stem_nodes":["hairy_nodes"],"erioneuron-pilosum|sheath_margins":["open"],"erioneuron-pilosum|culm_posture":["erect"],"bromus-japonicus|culm_posture":["erect","geniculate"],"bromus-japonicus|stem_nodes":["backward_hairs"],"bromus-pubescens|sheath_margins":["open"],"bromus-texensis|sheath_margins":["open"]};
if(pack.evidence.length<1187||new Set(pack.evidence.map(r=>r.id+"|"+r.character)).size!==pack.evidence.length||new Set(pack.evidence.map(r=>r.id)).size!==168)throw Error("Phase4 record count, duplicates, or 169-inventory guard");
for(const [key,required] of Object.entries(phase4Expected)){
 const [id,ch]=key.split("|"),e=pack.evidence.find(x=>x.id===id&&x.character===ch);
 if(!e||e.coordination_issue!==340||e.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||!e.note?.trim()||!e.source.includes("Hagenbuch & Lemke (2015)")||!e.source.includes("printed p. "+e.pdf_printed_page)||!e.source_url.endsWith("#page="+e.pdf_printed_page)||!required.every(v=>e.states.includes(v)))throw Error("Phase4 citation or botanical state failed "+key);
}
for(const [id,ch] of [["aristida-oligantha","sheath_surface"],["eriochloa-sericea","sheath_surface"],["bromus-japonicus","sheath_margins"],["cynodon-dactylon","sheath_surface"],["melica-nitens","underground_stems"]]){
 if(pack.evidence.some(x=>x.id===id&&x.character===ch))throw Error("Phase4 unresolved source/UI/organ hold was accidentally promoted "+id+"/"+ch);
}
for(const [id,ch,choice] of [["bromus-japonicus","stem_nodes","backward_hairs"],["chloris-cucullata","sheath_surface","keeled_lower"],["elymus-canadensis","underground_stems","short_rhizome"],["eriochloa-sericea","stem_nodes","hairy_nodes"],["aristida-oligantha","stem_special","basal_branching"]]){
 state.refineSelected={[ch]:choice};const res=run();
 if(res.length!==169||!res.some(r=>r.id===id&&r.extras>=1))throw Error("Phase4 positive-only matching failed "+id+"/"+ch);
}
state.refineSelected={};if(run().length!==169)throw Error("Phase4 altered unified 169 grass inventory");


// Issue #336 Lane D04: 10 original Diggs page-reviewed reproductive records; holds stay unresolved.
const d04SourceApproved={"poa-annua|florets_per_spikelet":["several"],"poa-annua|true_lemma_awn":["none"],"poa-annua|floral_hair_position":["lemma"],"poa-arachnifera|florets_per_spikelet":["several"],"poa-arachnifera|true_lemma_awn":["none"],"poa-arachnifera|floral_hair_position":["lemma"],"sporobolus-cryptandrus|florets_per_spikelet":["one"],"sporobolus-cryptandrus|glume_marks":["one_vein"],"sporobolus-cryptandrus|true_lemma_awn":["none"],"sporobolus-vaginiflorus|floral_hair_position":["lemma"]};
if(pack.evidence.length<1197||new Set(pack.evidence.map(x=>x.id+"|"+x.character)).size!==pack.evidence.length||new Set(pack.evidence.map(x=>x.id)).size!==168)throw Error("Issue336 D04 record/inventory regression");
for(const [key,states] of Object.entries(d04SourceApproved)){
 const [id,ch]=key.split("|");
 const e=pack.evidence.find(x=>x.id===id&&x.character===ch);
 if(!e||e.review_lane!=="D"||e.coordination_issue!==336||e.evidence_level!=="PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED"||e.pdf_document!=="Flora of North Central Texas-monocots-Acor-Zanni.pdf"||!Number.isInteger(e.pdf_printed_page)||!e.source.includes("printed p. "+e.pdf_printed_page)||!states.every(v=>e.states.includes(v)))throw Error("D04 source/field invalid "+key);
}
for(const [id,ch] of [["poa-annua","glume_marks"],["poa-arachnifera","glume_marks"],["rostraria-cristata","florets_per_spikelet"],["sporobolus-clandestinus","lemma_texture"],["sporobolus-vaginiflorus","lemma_texture"],["tripsacum-dactyloides","lemma_texture"]]){
 if(pack.evidence.some(e=>e.id===id&&e.character===ch))throw Error("D04 hold auto-promoted "+id+"/"+ch);
}
for(const [id,ch,choice] of [["poa-annua","true_lemma_awn","none"],["poa-arachnifera","floral_hair_position","lemma"],["sporobolus-cryptandrus","florets_per_spikelet","one"],["sporobolus-vaginiflorus","floral_hair_position","lemma"]]){
 state.refineSelected={[ch]:choice};
 const results=run();
 if(results.length!==169||!results.some(r=>r.id===id&&r.extras>=1))throw Error("D04 positive-only scoring "+id+"/"+ch);
}
state.refineSelected={};if(run().length!==169)throw Error("D04 changed the 169-inventory");


// Phase 2 Issue336 Lane D02/D03: 14 conservative, primary-source-flora reproductive records.
const phase2d23={"bromus-pubescens|florets_per_spikelet":["several"],"bromus-pubescens|glume_marks":["one_vein"],"bromus-tectorum|florets_per_spikelet":["several"],"bromus-tectorum|floral_hair_position":["lemma"],"tridens-flavus|florets_per_spikelet":["several"],"tridens-flavus|glume_marks":["one_vein"],"tridens-texanus|glume_marks":["one_vein"],"dichanthium-annulatum|spikelet_position":["paired"],"dichanthium-annulatum|true_lemma_awn":["long"],"digitaria-californica|florets_per_spikelet":["two"],"digitaria-californica|glume_marks":["lower_reduced"],"digitaria-ciliaris|florets_per_spikelet":["two"],"digitaria-ciliaris|glume_marks":["lower_reduced"],"digitaria-cognata|florets_per_spikelet":["two"]};
if(pack.evidence.length<1211||new Set(pack.evidence.map(x=>x.id+"|"+x.character)).size!==pack.evidence.length||new Set(pack.evidence.map(x=>x.id)).size!==168)throw Error("Phase2 D23 uniqueness/inventory regression");
for(const [key,values] of Object.entries(phase2d23)){
 const [id,ch]=key.split("|"),e=pack.evidence.find(x=>x.id===id&&x.character===ch);
 if(!e||e.review_lane!=="D"||e.coordination_issue!==336||e.pdf_document!=="Flora of North Central Texas-monocots-Acor-Zanni.pdf"||!Number.isInteger(e.pdf_printed_page)||!e.source.includes("printed p. "+e.pdf_printed_page)||!e.note?.trim()||!values.every(v=>e.states.includes(v)))throw Error("Phase2 D23 citation/option mapping "+key);
}
for(const [id,ch] of [["tridens-flavus","true_lemma_awn"],["tridens-texanus","true_lemma_awn"],["digitaria-ciliaris","lemma_texture"],["digitaria-californica","lemma_texture"]]){
 if(pack.evidence.some(e=>e.id===id&&e.character===ch))throw Error("D23 genus-absence or lower lemma-specific texture hold incorrectly forced "+id+"/"+ch);
}
for(const [id,ch,choice] of [["bromus-tectorum","floral_hair_position","lemma"],["tridens-flavus","glume_marks","one_vein"],["dichanthium-annulatum","spikelet_position","paired"],["digitaria-californica","florets_per_spikelet","two"],["digitaria-cognata","florets_per_spikelet","two"]]){
 state.refineSelected={[ch]:choice};
 const result=run();
 if(result.length!==169||!result.some(x=>x.id===id&&x.extras>=1))throw Error("D23 positive-only ranking "+id+"/"+ch);
}
state.refineSelected={};if(run().length!==169)throw Error("D23 altered unified 169 inventory");

console.log("PASS: 112 original species retained for all extra choices; 24 groups, "+
  pack.evidence.length+" cited clues, multistate/unknown-safe ranking and comparisons preserved.");
