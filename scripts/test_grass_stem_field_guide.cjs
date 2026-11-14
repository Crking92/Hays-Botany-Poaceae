"use strict";
// Check all existing optional stem and root details remain observational,
// source-aware, and unknown-safe; diagrams are not specimen identifications.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const lab=path.join(__dirname,"..","site","visual-key-lab");
const html=fs.readFileSync(path.join(lab,"index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);new Function(script);
const from=script.indexOf("/* Original teaching sketches of stem/posture/root structures.");
const until=script.indexOf("function renderOptionalCharacters(){");
assert.ok(from>=0&&until>from,"Stem guide not found");
const namespace="http://www.w3.org/2000/svg";
const document={createElementNS(ns,tag){
 assert.equal(ns,namespace);
 return{tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=String(v)},append(c){this.children.push(c)}};
}};
const sandbox={document};vm.createContext(sandbox);vm.runInContext(script.slice(from,until),sandbox);
const pack=JSON.parse(fs.readFileSync(path.join(lab,"optional-refinement-evidence.json"),"utf8"));
assert.equal(pack.mode,"NON_EXCLUDING_POSITIVE_RANKING");
const expected={culm_posture:4,surface_runners:4,underground_stems:9,basal_crown:3,stem_special:7,stem_nodes:4};
let count=0;
for(const [char,n] of Object.entries(expected)){
 const group=pack.characters.find(x=>x.id===char);
 assert.equal(group?.options.length,n,"Original options drifted for "+char);
 const signatures=new Set();
 for(const o of group.options){
  const drawing=vm.runInContext("stemFieldSketch("+JSON.stringify(char)+","+JSON.stringify(o.id)+")",sandbox);
  assert.equal(drawing.tag,"svg");assert.equal(drawing.attrs.role,"img");
  assert.equal(drawing.attrs.viewBox,"0 0 168 92");
  assert.match(drawing.attrs["aria-label"],/not a specimen photograph or scale drawing/);
  assert.ok(drawing.children.length>=3,"Empty stem sketch: "+char+"/"+o.id);
  assert.ok(drawing.children.every(x=>x.tag==="path"||x.tag==="circle"),"Only original vector geometry");
  const sig=drawing.children.map(x=>x.tag+JSON.stringify(x.attrs)).join("|");
  assert.ok(!signatures.has(sig),"Indistinguishable sketches in "+char+": "+o.id);
  signatures.add(sig);
  const advice=vm.runInContext("stemFieldTips["+JSON.stringify(char)+"]["+JSON.stringify(o.id)+"]",sandbox);
  assert.equal(advice.length,2);assert.ok(advice[0].length>=12&&advice[1].length>=65,
   "Missing novice-friendly explanation "+char+"/"+o.id);
  count++;
 }
}
assert.equal(count,31);
assert.ok(pack.evidence.length>=336,"Preserve original source evidence; later evidence batches may add records");
for(const [c,o] of [["culm_posture","prostrate"],["stem_nodes","hairy_stolon_nodes"]]){
 assert.equal(pack.evidence.filter(e=>e.character===c&&e.states.includes(o)).length,0,
 "Uncited field observations must not add species ranking: "+c+" "+o);
}
assert.equal(pack.characters.find(x=>x.id==="culm_posture").options.find(x=>x.id==="prostrate").evidence_pending,true);
assert.ok(html.includes("Object.prototype.hasOwnProperty.call(stemFieldTips,c.id)"));
assert.ok(html.includes("guide.append(stemFieldSketch(c.id,selected.id),info)"));
assert.ok(html.includes("guide.setAttribute(\"aria-live\",\"polite\")"));
assert.ok(html.includes("updateChosen();updateUrl();renderResults();refreshVeinGuide()"));
assert.ok(html.includes("html[data-theme=\"dark\"] .stem-field-guide"));
assert.ok(html.includes("@media(max-width:355px){.stem-field-guide"));
for(const name of ["venationSketch","leafDetailSketch","collarFieldSketch"])
 assert.ok(html.includes("function "+name+"("),"Earlier guides lost: "+name);
assert.ok(html.includes("const picks=Object.entries(state.selected)")&&html.includes(".filter(x=>!x.conflict)"),
 "Core scoring logic changed");
assert.ok(html.includes("b.refinementMatches.length-a.refinementMatches.length"),
 "Unknown-safe positive ranking must remain");
console.log("PASS: 31 distinct stem, crown, runner, rhizome and node diagrams in 6 hidden sections, no evidence or scoring changes.");
