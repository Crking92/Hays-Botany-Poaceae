"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..","site","visual-key-lab");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const shards=["a","b","c1","c2","c3","d1","d2","d3","d4"];
const scored=shards.flatMap(s=>read("species-"+s+".json"));
const candidates=read("hays-candidates.json").candidates;
const optional=read("optional-refinement-evidence.json").evidence;
const cross=read("source-crosschecks.json");
const html=fs.readFileSync(path.join(root,"source-register.html"),"utf8");
if(scored.length!==112||candidates.length!==57)throw Error("112+57 inventory changed");
const all=scored.concat(candidates),known=new Map(all.map(x=>[x.id,x]));
if(known.size!==169)throw Error("Duplicate species ID");
const cats=["head","habit","ligule","awns"];
let withSource=0,withoutSource=0,unknown=0;
for(const s of scored)for(const c of cats){
 const vals=s.traits?.[c]||[];
 if(!Array.isArray(vals))throw Error("Non-array trait: "+s.id+":"+c);
 if(!vals.length)unknown++;
 else if(s.character_evidence?.[c]?.source)withSource++;
 else withoutSource++;
}
if(cross.schema_version!==1||!cross.crosschecks?.length)throw Error("No crosschecks");
for(const e of cross.crosschecks){
 if(!known.has(e.id)||!cats.includes(e.character))throw Error("Invalid source crosscheck species or character");
 if(!e.status||!e.interpretation||e.references?.length<2)throw Error("Incomplete crosscheck");
 const sources=new Set();
 for(const ref of e.references){
  if(!ref.authority||!ref.locator||!ref.support||!ref.uri?.startsWith("https://"))throw Error("Citation lacking source, page/section, URL or claim");
  sources.add(ref.authority);
 }
 if(sources.size<2)throw Error("Sources not independent");
}

// Guard source-register coverage, anatomy and intentionally unknown slots.
// A crosscheck only fills an assigned core slot if the main scored file has a state.
const indexed=new Set(scored.flatMap(s=>cats.filter(c=>(s.traits?.[c]||[]).length&&s.character_evidence?.[c]?.source).map(c=>s.id+"|"+c)));
const entries=new Set();
for(const e of cross.crosschecks){
 const key=e.id+"|"+e.character;
 if(entries.has(key))throw Error("Duplicate source crosscheck "+key);
 entries.add(key);
 if(!scored.some(s=>s.id===e.id&&(s.traits[e.character]||[]).length))
  throw Error("Crosscheck cannot fill unassigned/non-scored slot "+key);
 indexed.add(key);
}
if(indexed.size<325||448-indexed.size-unknown>120||unknown!==3)
 throw Error("Awn citation batch dropped source-coverage guarantees");
const awnBatch=[
 "aristida-purpurea","avena-fatua","bothriochloa-barbinodis","bromus-japonicus","bromus-pubescens",
 "chloris-verticillata","chloris-virgata","elymus-canadensis","elymus-virginicus","hordeum-pusillum",
 "sorghastrum-nutans","sorghastrum-elliottii","anatherum-glomeratum","anatherum-virginicum",
 "setaria-italica","heteropogon-contortus","bromus-texensis","poa-annua"];
const awnlessBatch=[
 "eragrostis-spectabilis","eragrostis-intermedia","eragrostis-trichodes","eragrostis-cilianensis",
 "eragrostis-hirsuta","eragrostis-lugens","eragrostis-secundiflora","sporobolus-compositus",
 "sporobolus-clandestinus","sporobolus-vaginiflorus","panicum-hallii","panicum-virgatum",
 "panicum-capillare","panicum-coloratum","dichanthelium-commutatum",
 "dichanthelium-oligosanthes","poa-arachnifera"];
if(awnlessBatch.some(id=>!entries.has(id+"|awns")))throw Error("Missing awnless source batch citation");
const scopes=awnlessBatch.map(id=>cross.crosschecks.find(e=>e.id===id&&e.character==="awns"));
if(scopes.some(x=>!x||x.references.length<2||!x.interpretation))
 throw Error("Awnless citations missing sources/interpretations");
if(!scopes.some(x=>x.status.includes("NOT_TWO_SPECIES_EXPLICIT"))||
  !scopes.some(x=>x.status.includes("SPECIES_TREATMENT_COMPATIBLE_ONLY"))||
  !scopes.some(x=>x.status.includes("HISTORICAL_PANICUM_CROSSWALK")))
 throw Error("New citations falsely imply two independently explicit species-level accounts");
if(awnBatch.some(id=>!entries.has(id+"|awns")))
 throw Error("Missing a named citation from 18-member first awn batch");
const structuralAwnBatch=[
 "chloris-cucullata","eleusine-indica","phalaris-caroliniana","erioneuron-pilosum",
 "zizaniopsis-miliacea","hilaria-belangeri","bouteloua-dactyloides","tridens-albescens",
 "tridens-flavus","tridens-texanus","arundo-donax","phragmites-australis",
 "digitaria-ciliaris","leersia-oryzoides","paspalum-distichum"];
if(structuralAwnBatch.some(id=>!entries.has(id+"|awns")))
 throw Error("15 source-anatomy citations absent");
const atom=id=>cross.crosschecks.find(e=>e.id===id&&e.character==="awns");
if(!/GLUME awns/i.test(atom("hilaria-belangeri").interpretation)||
 !/pistillate/i.test(atom("zizaniopsis-miliacea").interpretation)||
 !/SHORT awns/i.test(atom("chloris-cucullata").interpretation)||
 !/PUBLISHED_TREATMENTS_DIFFER_SHORT_AWN_VS_MUCRO/.test(atom("arundo-donax").status)||
 !/mucro/i.test(atom("tridens-flavus").interpretation))
 throw Error("Awn source distinctions or conflict labels lost");
const phrase=id=>cross.crosschecks.find(e=>e.id===id&&e.character==="awns");
if(!phrase("bothriochloa-barbinodis").references[0].support.includes("20–30 mm"))
 throw Error("Bothriochloa barbinodis key accidentally switched with short-awn B. laguroides");
if(!/involucral bristles/i.test(phrase("setaria-italica").interpretation)||
   !/sterile lemma/i.test(phrase("chloris-verticillata").interpretation)||
   !/life.history conflict/i.test(phrase("hordeum-pusillum").status.replace(/_/g," ")))
 throw Error("Awn vs bristle vs sterile-lemma or source conflict distinction lost");


// Batch 6: preserve 15 explicitly qualified anatomy/source entries (no scored data edits).
const latestAwnBatch=["paspalum-dilatatum","paspalum-floridanum","paspalum-pubiflorum","paspalum-setaceum","paspalum-urvillei","tripsacum-dactyloides","limnodea-arkansana","disakisperma-dubium","muhlenbergia-utilis","digitaria-cognata","urochloa-texana","eriochloa-sericea","hopia-obtusa","urochloa-fusca","urochloa-reptans"];
if(latestAwnBatch.some(id=>!entries.has(id+"|awns")))
 throw Error("Batch 6 awn records absent");
if(!/0.3–0.5 mm/.test(atom("eriochloa-sericea").interpretation)||
   !/geniculate/.test(atom("limnodea-arkansana").interpretation)||
   !/sometimes (a tiny mucro|mucronate)/.test(atom("disakisperma-dubium").interpretation)||
   !/genus-level/.test(atom("paspalum-dilatatum").references[1].locator))
 throw Error("Batch 6 key distinctions or provenance cautions lost");

if(optional.some(e=>!e.source||!e.source_url?.startsWith("https://")))throw Error("Optional source citation missing");
const viewer=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!viewer)throw Error("Source viewer script missing");
new Function(viewer);
if(!html.includes("No named source record")||!html.includes("source-crosschecks.json"))throw Error("Missing source gap interface");
console.log("PASS: "+all.length+" grasses; "+withSource+" sourced core slots; "+withoutSource+" source-record gaps; "+unknown+" unknown slots; "+optional.length+" optional citations; "+cross.crosschecks.length+" two-source comparison records.");
