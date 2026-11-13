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
if(indexed.size<414||448-indexed.size-unknown>31||unknown!==3)
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
   !/genus, NOT independent species-level/.test(atom("paspalum-dilatatum").references[1].locator))
 throw Error("Batch 6 key distinctions or provenance cautions lost");


// Batch 7: all 10 assigned awn slots now cited; anatomical caveats must remain visible.
const finalAwnBatch=["muhlenbergia-paniculata","bothriochloa-torreyana","bromus-lanceolatus","catapodium-rigidum","dichanthelium-lindheimeri","dichanthelium-pedicellatum","dinebra-panicea-subsp-mucronata","festuca-versuta","tridentopsis-buckleyana","triplasiella-eragrostoides"];
if(finalAwnBatch.some(id=>!entries.has(id+"|awns")))
 throw Error("Final 10 awn-source records missing");
if(!/awnless OR awn-tipped/.test(atom("muhlenbergia-paniculata").interpretation)||
   !/two-toothed lemma apex/.test(atom("bromus-lanceolatus").interpretation)||
   !/very short point/.test(atom("festuca-versuta").interpretation)||
   !/genus-level/.test(atom("dichanthelium-lindheimeri").interpretation)||
   !/mucro/.test(atom("triplasiella-eragrostoides").interpretation))
 throw Error("Final awn batch nuances lost");


// Batch 8: document 15 vegetative growth-form slots; do not erase conflicts.
const latestHabitBatch=["bouteloua-dactyloides","aristida-purpurea","avena-fatua","bothriochloa-barbinodis","bromus-japonicus","bromus-pubescens","disakisperma-dubium","echinochloa-crus-galli","hordeum-pusillum","muhlenbergia-lindheimeri","phalaris-caroliniana","tripsacum-dactyloides","paspalum-dilatatum","paspalum-setaceum","paspalum-urvillei"];
if(latestHabitBatch.some(id=>!entries.has(id+"|habit")))
 throw Error("Missing 15 growth-habit source records");
const growth=id=>cross.crosschecks.find(e=>e.id===id&&e.character==="habit");
if(!/rhizomes ABSENT/.test(growth("bouteloua-dactyloides").interpretation)||
 !/CURRENT|Current/.test(growth("bouteloua-dactyloides").interpretation)||
 !/hard-based rhizomatous perennial/.test(growth("tripsacum-dactyloides").references[1].support)||
 !/short rhizomes/.test(growth("paspalum-setaceum").interpretation)||
 !/life history/.test(growth("hordeum-pusillum").interpretation))
 throw Error("New growth form distinctions or open scoring caveat lost");


// Batch 9: verify 15 additional habit records, exact old names and limits.
const nextHabitBatch=["anatherum-glomeratum","anatherum-virginicum","catapodium-rigidum","dichanthelium-oligosanthes","dichanthelium-pedicellatum","dichanthium-annulatum","elymus-virginicus","eragrostis-lugens","eragrostis-secundiflora","erioneuron-pilosum","limnodea-arkansana","muhlenbergia-reverchonii","panicum-capillare","sporobolus-vaginiflorus","tridens-flavus"];
if(nextHabitBatch.some(id=>!entries.has(id+"|habit")))
 throw Error("Missing Batch 9 growth-form citation");
const habit9=id=>cross.crosschecks.find(e=>e.id===id&&e.character==="habit");
if(!/stoloniferous culms/.test(habit9("dichanthium-annulatum").interpretation)||
 !/NOT directly proven/.test(habit9("dichanthium-annulatum").interpretation)||
 !/solitary/.test(habit9("limnodea-arkansana").interpretation)||
 !/narrower/.test(habit9("eragrostis-secundiflora").interpretation)||
 !/E. intermedia/.test(habit9("eragrostis-lugens").interpretation))
 throw Error("Batch 9 documented source limits lost");


// Batch 10: preserve 15 new original-core vegetative habit citations and disputed anatomy.
const habitBatch10=["heteropogon-contortus","setaria-scheelei","sorghastrum-nutans","bromus-texensis","dinebra-panicea-subsp-mucronata","festuca-octoflora","festuca-versuta","muhlenbergia-x-involuta","sporobolus-clandestinus","tridens-albescens","tridens-texanus","tridentopsis-buckleyana","tridentopsis-mutica","triplasiella-eragrostoides","dichanthelium-lindheimeri"];
if(habitBatch10.some(id=>!entries.has(id+"|habit")))throw Error("15 habit source records missing");
const h10=id=>cross.crosschecks.find(e=>e.id===id&&e.character==="habit");
if(!/UNDERGROUND\/SURFACE-STEM CONFLICT/.test(h10("tridentopsis-mutica").interpretation)||
 !/solitary or in small clumps/.test(h10("sorghastrum-nutans").interpretation)||
 !/NOT exact subspecies-only/.test(h10("dinebra-panicea-subsp-mucronata").references[0].support)||
 !/SPRING phase/.test(h10("dichanthelium-lindheimeri").interpretation)||
 !/solitary or forming small clusters/.test(h10("sporobolus-clandestinus").references[0].support))
 throw Error("Habit source scope or structural conflict caveats lost");


// Batch 11: all assigned original-core habit slots documented; protect source limitations.
const finalHabits=["dichanthelium-commutatum","anatherum-tenuispatheum","bromus-lanceolatus","secale-cereale"];
if(finalHabits.some(id=>!entries.has(id+"|habit")))throw Error("Final four habit citations missing");
const finalHabit=id=>cross.crosschecks.find(e=>e.id===id&&e.character==="habit");
if(!/caudices OR rhizomes/.test(finalHabit("dichanthelium-commutatum").interpretation)||
 !/historical/.test(finalHabit("anatherum-tenuispatheum").interpretation)||
 !/do NOT independently prove/.test(finalHabit("bromus-lanceolatus").interpretation)||
 !/TWO_INDEPENDENT_DIRECT_SPECIES_TUFT_ACCOUNTS_AGREE/.test(finalHabit("secale-cereale").status))
 throw Error("Final habit source scope or morphological limitations lost");


// Batch 12: protect 15 original-core ligule references and independent anatomical caveats.
const firstLiguleBatch=["bothriochloa-ischaemum","hilaria-belangeri","muhlenbergia-paniculata","avena-fatua","bothriochloa-barbinodis","bothriochloa-torreyana","eleusine-indica","elymus-canadensis","eragrostis-trichodes","hordeum-pusillum","muhlenbergia-lindheimeri","paspalum-distichum","poa-annua","poa-arachnifera","sorghastrum-nutans"];
if(firstLiguleBatch.some(id=>!entries.has(id+"|ligule")))
 throw Error("Missing first 15 ligule-source records");
const lig12=id=>cross.crosschecks.find(e=>e.id===id&&e.character==="ligule");
if(!/long stiff 8–15-mm membrane/.test(lig12("muhlenbergia-lindheimeri").interpretation)||
 !/fringe-of-hairs/.test(lig12("eragrostis-trichodes").interpretation)||
 !/margin terminology/i.test(lig12("sorghastrum-nutans").status.replace(/_/g," "))&&
 !/margin.*difference/.test(lig12("sorghastrum-nutans").interpretation)||
 !/subspecies bridge/.test(lig12("bothriochloa-torreyana").interpretation))
 throw Error("Ligule-specific structure or cross-source caution lost");


// Batch 13: 15 additional vegetative ligule source records with edge vs blade-hair distinctions.
const nextLiguleBatch=["sorghum-bicolor","dichanthium-annulatum","elymus-virginicus","eragrostis-cilianensis","festuca-octoflora","hilaria-mutica","hopia-obtusa","leersia-oryzoides","muhlenbergia-reverchonii","muhlenbergia-schreberi","muhlenbergia-utilis","panicum-coloratum","paspalum-dilatatum","paspalum-pubiflorum","paspalum-setaceum"];
if(nextLiguleBatch.some(id=>!entries.has(id+"|ligule")))throw Error("Batch 13 ligules missing");
const lg13=id=>cross.crosschecks.find(e=>e.id===id&&e.character==="ligule");
if(!/long, soft hairs are ON LEAF BLADE/.test(lg13("paspalum-setaceum").interpretation)||
 !/marginal cilia/.test(lg13("muhlenbergia-schreberi").interpretation)||
 !/minute membranous base/.test(lg13("panicum-coloratum").references[0].support)||
 !/published descriptions differ/.test(lg13("sorghum-bicolor").interpretation))
 throw Error("Batch 13 anatomy or source disagreement erased");

// Botanical audit 2026-11-13: source-page accuracy matters beyond named-citation counts.
// Red grama was previously misread as having a ciliate membranous ligule.
// Exact H&L p. 38 and Kew species both state a true HAIR FRINGE.
const trifida=cross.crosschecks.find(e=>e.id==="bouteloua-trifida"&&e.character==="ligule");
if(!trifida || !/HAIR_FRINGE_NO_MEMBRANE_REPORTED/.test(trifida.status)||
   !/fringe of hairs shorter than 0.5 mm/.test(trifida.interpretation)||
   !/does NOT mention a tiny membranous base/.test(trifida.references?.[0]?.support||"") ||
   !/ligule a fringe of hairs/.test(trifida.references?.[1]?.support||""))
 throw Error("Red grama exact primary ligule account was misattributed or changed");

if(optional.some(e=>!e.source||!e.source_url?.startsWith("https://")))throw Error("Optional source citation missing");
const viewer=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!viewer)throw Error("Source viewer script missing");
new Function(viewer);
if(!html.includes("No named source record")||!html.includes("source-crosschecks.json"))throw Error("Missing source gap interface");
console.log("PASS: "+all.length+" grasses; "+withSource+" sourced core slots; "+withoutSource+" source-record gaps; "+unknown+" unknown slots; "+optional.length+" optional citations; "+cross.crosschecks.length+" two-source comparison records.");
