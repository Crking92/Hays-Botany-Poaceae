"use strict";
// Test that the six existing leaf-blade questions teach visible anatomy without
// manufacturing evidence, changing choices, or excluding unscored grasses.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const lab=path.join(__dirname,"..","site","visual-key-lab");
const html=fs.readFileSync(path.join(lab,"index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);new Function(script);
const start=script.indexOf("/* Supplementary leaf-blade diagrams;");
const stop=script.indexOf("function renderOptionalCharacters(){");
assert.ok(start>=0&&stop>start,"Leaf field helpers missing");
const namespace="http://www.w3.org/2000/svg";
const document={createElementNS(ns,tag){
 assert.equal(ns,namespace);
 return {tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=String(v)},append(c){this.children.push(c)}};
}};
const sandbox={document};vm.createContext(sandbox);vm.runInContext(script.slice(start,stop),sandbox);
const bundle=JSON.parse(fs.readFileSync(path.join(lab,"optional-refinement-evidence.json"),"utf8"));
assert.equal(bundle.mode,"NON_EXCLUDING_POSITIVE_RANKING");
const groups=["blade_shape","blade_width","blade_tip","blade_edge","blade_midnerve","blade_hairs"];
const expected={blade_shape:3,blade_width:4,blade_tip:3,blade_edge:2,blade_midnerve:1,blade_hairs:2};
let counted=0;
for(const id of groups){
 const group=bundle.characters.find(x=>x.id===id);
 assert.equal(group?.options.length,expected[id],id+" choice count changed");
 const shapes=new Map();
 for(const option of group.options){
  const svg=vm.runInContext("leafDetailSketch("+JSON.stringify(id)+","+JSON.stringify(option.id)+")",sandbox);
  assert.equal(svg.tag,"svg");
  assert.equal(svg.attrs.role,"img");
  assert.equal(svg.attrs.viewBox,"0 0 168 92");
  assert.match(svg.attrs["aria-label"],/not a specimen photo or scale drawing/);
  assert.ok(svg.children.length>0,id+" / "+option.id+" drew nothing");
  assert.ok(svg.children.every(x=>x.tag==="path"),"Inline paths only");
  const signature=svg.children.map(x=>JSON.stringify(x.attrs)).join("|");
  shapes.set(option.id,signature);
  const guidance=vm.runInContext("leafDetailGuides["+JSON.stringify(id)+"]["+JSON.stringify(option.id)+"]",sandbox);
  assert.equal(guidance.length,2);
  assert.ok(guidance[0].length>4&&guidance[1].length>45,"Missing field guidance");
  counted++;
 }
 assert.equal(new Set(shapes.values()).size,expected[id],"Different choices need distinct sketches for "+id);
}
assert.equal(counted,15);
assert.ok(bundle.evidence.length>=336,"Prior morphology evidence lost");
assert.ok(html.includes('Object.prototype.hasOwnProperty.call(leafDetailGuides,c.id)'));
assert.ok(html.includes('refreshVeinGuide();content.append(guide)'));
assert.ok(html.includes('updateChosen();updateUrl();renderResults();refreshVeinGuide()'));
assert.ok(html.includes('html[data-theme="dark"] .venation-field-guide'));
assert.ok(html.includes("@media(max-width:355px){.leaf-detail-guide"));
assert.ok(html.includes('guide.setAttribute("aria-live","polite")'));
assert.ok(html.includes("function venationSketch("),"Earlier vein diagrams must remain");
assert.ok(html.includes('if(c.id==="blade_venation")'),"Earlier vein panel must remain");
assert.ok(html.includes("const picks=Object.entries(state.selected)"),"Original core scoring must remain");
assert.ok(html.includes(".filter(x=>!x.conflict)"),"Core filtering must remain");
assert.ok(html.includes("b.refinementMatches.length-a.refinementMatches.length"),
 "Extras must only change ranking");
console.log("PASS: six beginner leaf groups, 15 distinct sketches, source-aware guidance, dark/mobile design and nonexcluding core matching.");
