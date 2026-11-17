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
const original={
 florets_per_spikelet:["one","two","several"],
 spikelet_position:["paired","reduced_partner","two_rows","one_side"],
 glume_marks:["one_vein","first_enclosing","lower_reduced","glabrous"],
 lemma_texture:["hairy","smooth","wrinkled","reddish_spotted","shiny_hard"],
 true_lemma_awn:["three","long","short","bent_twisted","none","straight_or_bent"],
 floral_hair_position:["below_spikelet","rachilla","lemma","partner_stalk"]
};
const pending={
 glume_marks:["upper_one_vein","lower_one_vein","central_glume_glabrous","central_glume_scabrous"],
 true_lemma_awn:["fertile_awn_2_to_5mm","lower_sterile_awn_variable","apical_mucro"],
 floral_hair_position:["lower_sterile_lemma_hairs","upper_fertile_lemma_hairs","spikelet_callus_hairs"]
};
const nowSupportedAndIllustrated=new Set([
 "glume_marks:central_glume_glabrous","glume_marks:central_glume_scabrous",
 "true_lemma_awn:apical_mucro",
 "glume_marks:upper_one_vein","glume_marks:lower_one_vein",
 "true_lemma_awn:fertile_awn_2_to_5mm","true_lemma_awn:lower_sterile_awn_variable",
 "floral_hair_position:lower_sterile_lemma_hairs","floral_hair_position:upper_fertile_lemma_hairs",
 "floral_hair_position:spikelet_callus_hairs"
]);
let count=0,added=0,illustratedNew=0;
for(const [character,ids] of Object.entries(original)){
 const group=pack.characters.find(c=>c.id===character);
 assert.deepEqual(group.options.slice(0,ids.length).map(o=>o.id),ids,"Established diagram-linked option order changed: "+character);
 assert.deepEqual(group.options.slice(ids.length).map(o=>o.id),pending[character]||[],"Unexpected new floral observations: "+character);
 for(const option of group.options.slice(ids.length)){
  added++;
  assert.equal(option.evidence_pending,true,"Anatomical suboption cannot rank unsourced species");
  assert.ok(option.detail?.length>65,"Unscored observation needs a clear text-only anatomical instruction");
  assert.ok(!pack.evidence.some(e=>e.character===character&&e.states.includes(option.id)),"An unverified suboption was accidentally scored");
  const scoped=character+":"+option.id;
  const tip=vm.runInContext("flowerFieldTips["+JSON.stringify(character)+"]["+JSON.stringify(option.id)+"]",sandbox);
  if(nowSupportedAndIllustrated.has(scoped)){
    // The source-backed final-four supplement proves these plant organs; the
    // immutable historical master still correctly records original pending flags.
    assert.equal(tip.length,2,"Precise confirmed organ now needs a novice field tip");
    assert(tip[1].length>=65);
    const drawing=vm.runInContext("flowerFieldSketch("+JSON.stringify(character)+","+JSON.stringify(option.id)+")",sandbox);
    assert(drawing.children.length>=3,"Now-supported plant anatomy illustration absent");
    // Precisely identified glume/lemma/callus organ choices require a
    // distinct VISUAL location and accessible instruction, not a generic
    // two-glume/spikelet fallback. Existing stable answer IDs are preserved.
    const textLabels=drawing.children.filter(x=>x.tag==="text").map(x=>x.textContent).join(" | ");
    if(["upper_one_vein","lower_one_vein"].includes(option.id)){
     assert.match(textLabels,/1 LOWER/);
     assert.match(textLabels,/2 UPPER/);
    }
    if(["fertile_awn_2_to_5mm","lower_sterile_awn_variable"].includes(option.id)){
     assert.match(textLabels,/LOWER STERILE/);
     assert.match(textLabels,/UPPER FERTILE/);
    }
    if(["lower_sterile_lemma_hairs","upper_fertile_lemma_hairs"].includes(option.id)){
     assert.match(textLabels,/LOWER STERILE/);
     assert.match(textLabels,/UPPER FERTILE/);
    }
    if(option.id==="upper_fertile_lemma_hairs")
     assert.match(textLabels,/FEMALE ONLY/,"Pampas reproductive sex caveat must be on the drawing");
    if(option.id==="spikelet_callus_hairs")
     assert.match(textLabels,/FLORET CALLUS BASE/,"Callus hairs must point to the actual floret base");
    if(["upper_one_vein","lower_one_vein","fertile_awn_2_to_5mm",
      "lower_sterile_awn_variable","lower_sterile_lemma_hairs",
      "upper_fertile_lemma_hairs","spikelet_callus_hairs"].includes(option.id))
     assert(drawing.children.filter(x=>x.tag==="text").length>=1,"Missing anatomical position labels");
    illustratedNew++;
  }else assert.equal(tip,undefined,
    "Historical source-pending suboptions without a custom drawing should stay text-only");
 }
 const signatures=new Set();
 for(const option of group.options.slice(0,ids.length)){
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
assert.equal(added,10,"Original historical 10 anatomy additions must remain immutable");
assert.equal(illustratedNew,10,"All ten precise organ options, including seven new photo-independent guides, must have a custom illustration");
assert.ok(html.includes('Anatomically specific observation only; no verified species-level match yet.'));
assert.ok(html.includes('const [where,tip]=flowerFieldTips[c.id][selected.id]||[];'));

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
console.log("PASS: original 26 floral diagrams, immutable 10 historic raw pending flags, 10 source-verified precise diagrams (7 new glume/lemma/callus guides), zero fabricated specimen identifications");
