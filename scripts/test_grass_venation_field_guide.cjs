"use strict";
// Check visitor vein diagrams without altering botanical evidence or scoring.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const lab=path.join(__dirname,"..","site","visual-key-lab");
const html=fs.readFileSync(path.join(lab,"index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"Key script missing");
new Function(script);
const start=script.indexOf("/* Original explanatory leaf sketch.");
const end=script.indexOf("function renderOptionalCharacters(){");
assert.ok(start>=0 && end>start,"Field-guide helper missing");
const nodes=[];
const document={
 createElementNS(namespace,tag){
  assert.equal(namespace,"http://www.w3.org/2000/svg");
  const element={tag,attrs:{},children:[],
   setAttribute(name,value){this.attrs[name]=String(value)},
   append(child){this.children.push(child)}
  };
  nodes.push(element);return element;
 }
};
const sandbox={document};
vm.createContext(sandbox);
vm.runInContext(script.slice(start,end),sandbox);
const pack=JSON.parse(fs.readFileSync(path.join(lab,"optional-refinement-evidence.json"),"utf8"));
const venation=pack.characters.find(x=>x.id==="blade_venation");
assert.ok(venation && venation.options.length===7,"Seven vein options expected");
const drawings=new Map();
for(const option of venation.options){
 const svg=vm.runInContext("venationSketch("+JSON.stringify(option.id)+")",sandbox);
 assert.equal(svg.tag,"svg");
 assert.equal(svg.attrs.role,"img");
 assert.equal(svg.attrs.viewBox,"0 0 168 92");
 assert.ok(svg.attrs["aria-label"].includes("not a species photograph"));
 assert.ok(svg.children.length>=6,"Missing actual explanatory drawing for "+option.id);
 assert.ok(svg.children.every(x=>x.tag==="path"),"Only inline vector geometry allowed");
 drawings.set(option.id,svg.children.map(x=>JSON.stringify(x.attrs)).join("|"));
 assert.ok(vm.runInContext("venationFieldTips["+JSON.stringify(option.id)+"]?.tip",sandbox),
   "Missing specific beginner field guidance for "+option.id);
}
assert.equal(new Set(drawings.values()).size,venation.options.length,
 "Each vein choice should produce its own diagnostic sketch");
const countRibs=vm.runInContext('venationSketch("raised_ribs").children.length',sandbox);
const countGrooves=vm.runInContext('venationSketch("median_lines").children.length',sandbox);
assert.ok(countRibs>countGrooves,"Many ribs need distinct repeated raised lines");
assert.ok(html.includes('if(c.id==="blade_venation")'),"Guide must stay inside the existing advanced blade question");
assert.ok(html.includes('refreshVeinGuide();content.append(guide)'),"Selected vein should show a live guide");
assert.ok(html.includes('updateChosen();updateUrl();renderResults();refreshVeinGuide()'),
 "Click must update results and guide together");
assert.ok(html.includes('guide.setAttribute("aria-live","polite")'),"Updated field guidance must be accessible");
assert.ok(html.includes('html[data-theme="dark"] .venation-field-guide'),"Dark mode guide needed");
assert.ok(html.includes('@media(max-width:420px){.venation-field-guide'),"Small phone guide needed");
const raised=venation.options.find(x=>x.id==="raised_ribs");
assert.equal(raised.evidence_pending,true,"Unsupported ribs must stay research pending");
assert.ok(!pack.evidence.some(e=>e.character==="blade_venation"&&e.states.includes("raised_ribs")),
 "Do not give research-pending ribs a match without a source");
assert.equal(pack.mode,"NON_EXCLUDING_POSITIVE_RANKING","Guide must not hard-filter grasses");
console.log("PASS: seven distinct beginner vein diagrams; responsive and dark UI; pending ribs and positive-only scoring preserved.");
