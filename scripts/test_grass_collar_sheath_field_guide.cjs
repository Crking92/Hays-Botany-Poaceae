"use strict";
// The collar and sheath field guide must teach all existing choices without
// changing specimen scoring, research holds, citations or authorizations.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const lab=path.join(__dirname,"..","site","visual-key-lab");
const html=fs.readFileSync(path.join(lab,"index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);new Function(script);
const begin=script.indexOf("/* Beginner diagrams for the existing collar/sheath options");
const end=script.indexOf("function renderOptionalCharacters(){");
assert.ok(begin>=0&&end>begin,"Collar helper missing or displaced");
const namespace="http://www.w3.org/2000/svg";
const document={createElementNS(ns,tag){
 assert.equal(ns,namespace);
 return{tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=String(v)},append(c){this.children.push(c)}};
}};
const sandbox={document};vm.createContext(sandbox);vm.runInContext(script.slice(begin,end),sandbox);
const bundle=JSON.parse(fs.readFileSync(path.join(lab,"optional-refinement-evidence.json"),"utf8"));
assert.equal(bundle.mode,"NON_EXCLUDING_POSITIVE_RANKING");
const expected={leaf_base:3,ligule_length:4,ligule_edge:5,sheath_margins:3,sheath_surface:7};
let total=0;
for(const [id,number]of Object.entries(expected)){
 const character=bundle.characters.find(c=>c.id===id);
 assert.equal(character?.options.length,number,"Existing options changed: "+id);
 const outlines=new Set();
 for(const option of character.options){
  const svg=vm.runInContext("collarFieldSketch("+JSON.stringify(id)+","+JSON.stringify(option.id)+")",sandbox);
  assert.equal(svg.tag,"svg");assert.equal(svg.attrs.role,"img");
  assert.equal(svg.attrs.viewBox,"0 0 168 92");
  assert.match(svg.attrs["aria-label"],/not a specimen photograph or scale drawing/);
  assert.ok(svg.children.length>0,"Empty illustration: "+id+"/"+option.id);
  assert.ok(svg.children.every(x=>x.tag==="path"||x.tag==="circle"),"Only inline vector geometry");
  const signature=svg.children.map(x=>x.tag+JSON.stringify(x.attrs)).join("|");
  assert.ok(!outlines.has(signature),"Duplicate diagrams within "+id);
  outlines.add(signature);
  const tips=vm.runInContext("collarFieldTips["+JSON.stringify(id)+"]["+JSON.stringify(option.id)+"]",sandbox);
  assert.equal(tips.length,2);assert.ok(tips[0].length>7&&tips[1].length>45,"Missing field instruction: "+id+"/"+option.id);
  total++;
 }
}
assert.equal(total,22,"Expected all 22 collar/sheath choices to get guides");
// Preserve semantic distinctions and the current source-evidence boundary.
const closed=bundle.characters.find(x=>x.id==="sheath_margins").options.find(x=>x.id==="closed");
assert.equal(closed.evidence_pending,true);
assert.ok(!bundle.evidence.some(x=>x.character==="sheath_margins"&&x.states.includes("closed")),
 "Do not invent a supported closed sheath");
assert.ok(bundle.evidence.length>=336,"Do not discard existing source research");
assert.ok(html.includes("Object.prototype.hasOwnProperty.call(collarFieldTips,c.id)"),"Collar UI integration absent");
assert.ok(html.includes("guide.append(collarFieldSketch(c.id,selected.id),info)"),"Collar diagrams not displayed");
assert.ok(html.includes("updateChosen();updateUrl();renderResults();refreshVeinGuide()"),"Options must update guide and results");
assert.ok(html.includes('guide.setAttribute("aria-live","polite")'),"Accessibility announcement missing");
assert.ok(html.includes('html[data-theme="dark"] .collar-field-guide'),"Dark-mode visual guidance absent");
assert.ok(html.includes("@media(max-width:355px){.collar-field-guide"),"Narrow mobile view unsupported");
assert.ok(html.includes("function leafDetailSketch(")&&html.includes("function venationSketch("),
 "Prior leaf and vein guides lost");
assert.ok(html.includes("const picks=Object.entries(state.selected)")&&html.includes(".filter(x=>!x.conflict)"),
 "Core matching logic altered");
assert.ok(html.includes("b.refinementMatches.length-a.refinementMatches.length"),
 "Optional details must only positively rank published matches");
console.log("PASS: 22 distinct collar, ligule and sheath sketches; pending fused-sheath state, prior leaf guides, mobile/dark and unknown-safe ranking.");
