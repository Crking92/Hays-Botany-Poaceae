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
if(new Set(pack.evidence.map(x=>x.id)).size!==112)throw Error("Batch17 expected all original 112 to have positive-only advanced evidence");
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
 if(pack.evidence.some(x=>x.id===id&&["florets_per_spikelet","spikelet_position","glume_marks","lemma_texture","true_lemma_awn","floral_hair_position"].includes(x.character)))throw Error("No reproductive evidence without printed Diggs page "+id);
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
 if(rows.length!==expected)throw Error("Source-count mismatch "+id);
 for(const row of rows){
  const expectedPaper=["florets_per_spikelet","lemma_texture"].includes(row.character)?"Diggs, Lipscomb & O\'Kennon (1999)":"Hagenbuch & Lemke (2015)";
  if(!row.source.includes(expectedPaper)||!row.source.includes("printed p.")||!row.source_url?.startsWith("https://"))throw Error("Bad PDF citation "+id+"/"+row.character);
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
for(const candidate of [...groupedTrials,...placeholderProfiles])if(!selective.some(x=>x.id===candidate.id))throw Error("Provisional disagreement must be UNKNOWN, not a hard exclusion: "+candidate.id);
state.selected={head:null,habit:null,ligule:null,awns:null};
state.refineSelected={};
if(run().length!==169)throw Error("Unified 169 inventory was not restored after selection");
if(!html.includes("candidateManifest")||!html.includes("traits:{head:[],habit:[],ligule:[],awns:[]}"))throw Error("Missing no-photo fallback for four research grasses");

console.log("PASS: 112 original species retained for all extra choices; 24 groups, "+
  pack.evidence.length+" cited clues, multistate/unknown-safe ranking and comparisons preserved.");
