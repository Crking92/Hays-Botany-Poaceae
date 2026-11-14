"use strict";
// Comparison visuals may surface documented differences but must not infer
// absences, create scoring evidence, or exclude unknown grasses.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","site","visual-key-lab");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const inline=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline,"Missing Grass ID Lab source");
new Function(inline);
const from=inline.indexOf("function comparisonFeatureRows(species){");
const until=inline.indexOf("function compareCandidates(){");
assert.ok(from>=0&&until>from,"Missing guided comparison functions");
const q={id:"head",short:"Flowerhead",options:[["airy","Open panicle"],["spike","Straight spike"]]};
const c={id:"blade_shape",label:"Leaf shape",options:[{id:"flat",label:"Flat"},{id:"inrolled",label:"Inrolled"}]};
const a={id:"a",common:"Grass A",traits:{head:["airy"]}};
const b={id:"b",common:"Grass B",traits:{head:["spike"]}};
const u={id:"u",common:"Grass Unknown",traits:{}};
const state={selected:{head:null},refineCharacters:[c],refineSelected:{},refineEvidenceMap:{
 a:[{character:"blade_shape",states:["flat"],source:"Source 1",source_url:"https://example.com/1"}],
 b:[{character:"blade_shape",states:["inrolled"],source:"Source 2",source_url:"https://example.com/2"}]
}};
const sb={state,qs:[q],refinementEvidence:(s,id)=>(state.refineEvidenceMap[s.id]||[]).find(e=>e.character===id)||null};
vm.createContext(sb);vm.runInContext(inline.slice(from,until),sb);
const rows=ss=>Array.from(vm.runInContext("comparisonFeatureRows(species)",Object.assign(sb,{species:ss})));
const start=JSON.stringify(state);
let pair=rows([a,b]);
assert.equal(pair.length,2);
assert.equal(pair[0].label,"Flowerhead");
assert.equal(pair[0].distinguishes,true);
assert.equal(pair[0].separatesEveryPair,true);
assert.equal(pair[0].labels[0][0],"Open panicle");
assert.equal(pair[1].distinguishes,true);
assert.equal(pair[1].labels[1][0],"Inrolled");
assert.equal(pair[1].refs[0].source,"Source 1");
// An unknown third taxon is NOT diagnosed by two other conflicting values.
const unknown=rows([a,b,u]);
assert.equal(unknown[0].documented,false);
assert.equal(unknown[0].distinguishes,false);
assert.equal(unknown[1].documented,false);
assert.equal(unknown[1].distinguishes,false);
assert.equal(unknown[1].labels[2].length,0);
// Overlapping documented states cannot manufacture a contrast.
const overlap={id:"overlap",traits:{head:["airy","spike"]}};
const o=rows([a,overlap])[0];
assert.equal(o.distinguishes,false);
assert.equal(o.separatesEveryPair,false);
// For three known grasses a distinction between two need not separate all three.
const d={id:"d",traits:{head:["spike"]}};
const triple=rows([a,b,d])[0];
assert.equal(triple.distinguishes,true);
assert.equal(triple.separatesEveryPair,false);
// Selected choices are preserved and not treated as proof of ID.
state.refineSelected.blade_shape="flat";
pair=rows([a,b]);
assert.equal(pair[1].selected,"flat");
assert.equal(JSON.stringify(state),JSON.stringify({...JSON.parse(start),refineSelected:{blade_shape:"flat"}}));
const pack=JSON.parse(fs.readFileSync(path.join(root,"optional-refinement-evidence.json"),"utf8"));
assert.equal(pack.mode,"NON_EXCLUDING_POSITIVE_RANKING");
assert.ok(pack.evidence.length>=336,"Protect the original evidence floor across later source batches");
assert.ok(html.includes("group.dataset.character=c.id"));
assert.ok(html.includes('const highlights=contrasts.filter(f=>!f.selected)'));
assert.ok(html.includes('row.documented=row.values.every(vs=>vs.length>0)'));
assert.ok(html.includes('row.distinguishes=row.documented&&differences>0'));
assert.ok(html.includes('feature.separatesEveryPair?'));
assert.ok(html.includes('Unknown — not documented'));
assert.ok(html.includes('See full character comparison ('));
assert.ok(html.includes('On a phone, swipe the feature table sideways'));
assert.ok(html.includes('const group=Array.from($("optional-character-groups").querySelectorAll("details"))'));
assert.ok(html.includes('state.question=index;render()'));
assert.ok(html.includes('state.refineSection=refinementSection(feature.id)'));
assert.ok(html.includes('Top two started for you'));
assert.ok(html.includes('html[data-theme="dark"] .compare-pick'));
assert.ok(html.includes('max-height:calc(100dvh - 16px)'));
assert.ok(html.includes('Helpful next check: '));
assert.ok(html.includes('p?.source_page?.startsWith("https://")'));
assert.ok(html.includes("s.field_rule"));
assert.ok(html.includes("b.refinementMatches.length-a.refinementMatches.length"));
console.log("PASS: documented comparisons never use unknowns as contrasts; mobile, source links, light/dark themes and scoring remain intact.");
