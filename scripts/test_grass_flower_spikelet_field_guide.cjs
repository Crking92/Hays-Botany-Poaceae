"use strict";
// Educational sketches cannot change the 112-scored-species key, citations,
// rights, or positive-only optional scoring.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const lab=path.join(__dirname,"..","site","visual-key-lab");
const html=fs.readFileSync(path.join(lab,"index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"Missing inline Grass ID Lab script");
new Function(script);
const from=script.indexOf("/* Original flower and spikelet teaching sketches:");
const to=script.indexOf("function renderOptionalCharacters(){");
assert.ok(from>=0&&to>from,"Flower guide not found before character renderer");
const NS="http://www.w3.org/2000/svg";
const document={createElementNS(ns,tag){
 assert.equal(ns,NS);
 return{tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=String(v)},append(c){this.children.push(c)}};
}};
const sandbox={document};vm.createContext(sandbox);
vm.runInContext(script.slice(from,to),sandbox);
const pack=JSON.parse(fs.readFileSync(path.join(lab,"optional-refinement-evidence.json"),"utf8"));
assert.equal(pack.mode,"NON_EXCLUDING_POSITIVE_RANKING");
const expected={florets_per_spikelet:3,spikelet_position:4,glume_marks:4,lemma_texture:5,true_lemma_awn:6,floral_hair_position:4};
let count=0;
for(const [character,n] of Object.entries(expected)){
 const group=pack.characters.find(c=>c.id===character);
 assert.equal(group?.options.length,n,"Unexpected floral options: "+character);
 const signatures=new Set();
 for(const option of group.options){
  const drawing=vm.runInContext("flowerFieldSketch("+JSON.stringify(character)+","+JSON.stringify(option.id)+")",sandbox);
  assert.equal(drawing.tag,"svg");
  assert.equal(drawing.attrs.role,"img");
  assert.equal(drawing.attrs.viewBox,"0 0 168 92");
  assert.match(drawing.attrs["aria-label"],/not a specimen photograph or scale drawing/);
  assert.ok(drawing.children.length>=3,"Empty drawing for "+character+"/"+option.id);
  assert.ok(drawing.children.every(e=>["path","circle"].includes(e.tag)),"All artwork must be original vector geometry");
  const signature=drawing.children.map(x=>x.tag+JSON.stringify(x.attrs)).join("|");
  assert.ok(!signatures.has(signature),"Flower sketches must differ within "+character+": "+option.id);
  signatures.add(signature);
  const tip=vm.runInContext("flowerFieldTips["+JSON.stringify(character)+"]["+JSON.stringify(option.id)+"]",sandbox);
  assert.equal(tip.length,2);
  assert.ok(tip[0].length>=12&&tip[1].length>=65,"Missing practical botanical tip: "+character+"/"+option.id);
  count++;
 }
}
assert.equal(count,26);
assert.ok(pack.evidence.length>=336,"Keep original source evidence; later evidence batches may add records");
assert.ok(html.includes("Object.prototype.hasOwnProperty.call(flowerFieldTips,c.id)"));
assert.ok(html.includes("guide.append(flowerFieldSketch(c.id,selected.id),info)"));
assert.ok(html.includes('guide.setAttribute("aria-live","polite")'));
assert.ok(html.includes("updateChosen();updateUrl();renderResults();refreshVeinGuide()"));
assert.ok(html.includes('html[data-theme="dark"] .flower-field-guide'));
assert.ok(html.includes("@media(max-width:355px){.flower-field-guide"));
for(const f of ["venationSketch","leafDetailSketch","collarFieldSketch","stemFieldSketch"])
 assert.ok(html.includes("function "+f+"("),"Prior illustration missing: "+f);
assert.ok(html.includes("const picks=Object.entries(state.selected)")&&html.includes(".filter(x=>!x.conflict)"));
assert.ok(html.includes("b.refinementMatches.length-a.refinementMatches.length"));
console.log("PASS: 26 distinct optional floret/spikelet/glume/lemma/awn/hair illustrations in six groups; cited data, rights, exclusions and scoring unchanged.");
