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
if(optional.some(e=>!e.source||!e.source_url?.startsWith("https://")))throw Error("Optional source citation missing");
const viewer=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!viewer)throw Error("Source viewer script missing");
new Function(viewer);
if(!html.includes("No named source record")||!html.includes("source-crosschecks.json"))throw Error("Missing source gap interface");
console.log("PASS: "+all.length+" grasses; "+withSource+" sourced core slots; "+withoutSource+" source-record gaps; "+unknown+" unknown slots; "+optional.length+" optional citations; "+cross.crosschecks.length+" two-source comparison records.");
