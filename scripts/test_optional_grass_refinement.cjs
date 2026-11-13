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
  species,refineSelected:{},refineEvidenceMap:refs};
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
if(got[0].id!=="erioneuron-pilosum"||got[0].extras===0)throw Error("Hardened-tip evidence not ranked");
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

if(!html.includes('id="theme-toggle"')||!html.includes('id="compare-dialog"')||
   !html.includes('const group=node("details","optional-group")'))
  throw Error("Visitor theme, compare or accordion controls missing");
console.log("PASS: 112 original species retained for all extra choices; 13 groups, "+
  pack.evidence.length+" cited clues, multistate/unknown-safe ranking and comparisons preserved.");
