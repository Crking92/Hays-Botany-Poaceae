/* Hays Grass ID Lab glossary bridge.
   Read shared Hays Botany vocabulary without writing to the read-only legacy repo.
   Grass-specific extensions are local and do not change the identification model. */
(function(){
"use strict";
const HUB="https://crking92.github.io/Hays-County-Botany/";
const SHARED=HUB+"data/learning-layer.json";
const LAB="https://crking92.github.io/Hays-Botany-Poaceae/";
const vocab=new Map(),aliases=new Map(),verifiedPhotos=new Map();
let matcher=null,dialog=null,lastTrigger=null,sharedLoaded=false,loading=false;
const escapeHTML=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const normalized=v=>String(v||"").trim().toLowerCase().replace(/[\s_-]+/g," ");
const allowedCredit=v=>/\bCC\s*(?:0|BY(?:-SA)?)\b|public[\s-]*domain|PD[\s-]*mark/i.test(String(v||""))&&!/\b(?:NC|ND|all rights reserved|GFDL)\b/i.test(String(v||""));
const isHttps=v=>typeof v==="string"&&/^https:\/\//i.test(v);
const canonicalURL=p=>typeof p==="string"&&/^assets\/diagrams\/[a-z0-9_-]+\.svg$/i.test(p)?HUB+p:"";
const localPicture=p=>typeof p==="string"&&/^(?:assets\/diagrams\/[a-z0-9_-]+\.svg|content\/taxa\/[a-z0-9_/-]+\.(?:jpg|jpeg|png|webp))$/i.test(p)?HUB+p:"";
function resolvePicture(v,key){
 const p=v.real_photo||{};
 if(v.photo&&allowedCredit(v.photo.license)&&isHttps(v.photo.src)&&v.photo.src.startsWith(LAB)){
  return {...v.photo,alt:v.photo.label||v.term};
 }
 if(key==="ligule"){
  return {src:LAB+"content/taxa/Poaceae/Dichanthium/dichanthium-sericeum/images/harry-rose-dichanthium-sericeum-true-exposed-ligule5.jpg",
   label:"Silky bluestem — exposed short membranous ligule at sheath mouth",creator:"Harry Rose (Macleay Grass Man)",license:"CC BY 2.0",
   source_page:"https://commons.wikimedia.org/wiki/File:Dichanthium_sericeum_ligule5_(14344423535).jpg",
   note:"Existing Grass ID Lab source photograph; the short pale membrane is exposed."};
 }
 const approval=verifiedPhotos.get(key);
 if(approval&&p.source_page===approval.source_page&&allowedCredit(approval.license)){
  try{
   const filename=decodeURIComponent(approval.source_page.split("/wiki/File:")[1].split("#")[0].split("?")[0]).replace(/_/g," ");
   return {
    src:"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(filename.replace(/ /g,"_"))+"?width=900",
    label:p.label||v.term,alt:p.alt||p.label||v.term,
    creator:approval.creator,license:approval.license,license_url:approval.license_url,
    source_page:approval.source_page,note:approval.visual_scope||p.focus||"",
    diagram:p.media_type==="diagram"||/\.svg$/i.test(filename)
   };
  }catch(_e){}
 }
 if(p.media_type==="diagram"&&/Hays Botany learner diagram/i.test(p.credit||"")){
  const src=localPicture(p.image_url)||canonicalURL(v.visual);
  if(src)return {src,label:p.label||"Hays Botany diagram",creator:"Hays Botany",license:"Original learner diagram",source_page:"",note:"Diagram, not a specimen photograph.",diagram:true};
 }
 if(allowedCredit(p.credit)){
  const local=localPicture(p.image_url);
  if(local)return {src:local,label:p.label||v.term,creator:p.credit,license:"See credited source",source_page:p.source_page||"",note:p.focus||""};
  if(typeof p.source_page==="string"&&/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(p.source_page)){
   try{
    const filename=decodeURIComponent(p.source_page.split("/wiki/File:")[1].split("#")[0].split("?")[0]).replace(/_/g," ");
    const src="https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(filename.replace(/ /g,"_"))+"?width=900";
    return {src,label:p.label||v.term,creator:p.credit,license:"See credited source",source_page:p.source_page,note:p.focus||""};
   }catch(_e){}
  }
 }
 const diagram=canonicalURL(v.visual);
 return diagram?{src:diagram,label:"Original Hays Botany concept diagram",creator:"Hays Botany",license:"Original learner diagram",source_page:"",note:"Diagram, not a photograph.",diagram:true}:null;
}
function rebuildMatcher(){
 aliases.clear();
 for(const [key,v] of vocab){
  for(const raw of [v.term,...(Array.isArray(v.aliases)?v.aliases:[])]){
   const word=normalized(raw);
   if(word.length<3||word.length>65||!/^[a-z][a-z -]*$/.test(word))continue;
   if(!aliases.has(word))aliases.set(word,key);
  }
 }
 const parts=[...aliases.keys()].sort((a,b)=>b.length-a.length).map(v=>v.split(" ").map(s=>s.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")).join("[\\s-]+"));
 matcher=parts.length?new RegExp("\\b(?:"+parts.join("|")+")\\b","gi"):null;
}
function findKeys(txt,cap=30){
 if(!matcher||!txt)return [];
 const used=new Set(),result=[];matcher.lastIndex=0;
 for(const hit of String(txt).matchAll(matcher)){
  const k=aliases.get(normalized(hit[0]));
  if(!k||used.has(k))continue;
  used.add(k);result.push(k);
  if(result.length>=cap)break;
 }
 return result;
}
function chip(key){
 const item=vocab.get(key),b=document.createElement("button");
 b.type="button";b.className="grass-term-chip";b.dataset.grassTerm=key;
 b.textContent=item?.term||key;b.title="Define "+b.textContent;b.setAttribute("aria-label",b.title);
 return b;
}
const termsByFeature={"head":["panicle","spikelet","raceme","rachis-branch"],"habit":["stolon","rhizome","crown","decumbent"],"ligule":["ligule","collar","leaf-sheath","ciliate"],"awns":["awn","lemma","glume","bristle","floret"],"blade_shape":["leaf-blade"],"blade_width":["leaf-blade"],"blade_tip":["leaf-blade"],"blade_edge":["leaf-blade","scabrous","ciliate"],"blade_midnerve":["midrib"],"blade_venation":["venation","midrib","raised-ribs","scabrous"],"blade_hairs":["trichome","pubescent","glabrous"],"leaf_base":["auricle","collar","leaf-sheath"],"ligule_length":["ligule","collar"],"ligule_edge":["ligule","ciliate"],"sheath_margins":["sheath-margin","leaf-sheath"],"sheath_surface":["leaf-sheath","scabrous","gland","trichome"],"culm_posture":["culm","geniculate","decumbent"],"surface_runners":["stolon","node","internode"],"underground_stems":["rhizome","stolon"],"basal_crown":["crown","culm"],"stem_special":["node","gland","stolon","culm"],"stem_nodes":["node","culm-node","trichome","gland"],"florets_per_spikelet":["floret","spikelet","rachilla"],"spikelet_position":["spikelet","pedicel","distichous"],"glume_marks":["glume","spikelet","venation"],"lemma_texture":["lemma","pubescent","scabrous"],"true_lemma_awn":["lemma","awn","floret"],"floral_hair_position":["bristle","rachilla","trichome","lemma"]};
const featureByLabel={"Leaf blade shape":"blade_shape","Leaf width":"blade_width","Leaf tip":"blade_tip","Blade edge":"blade_edge","Leaf midrib":"blade_midnerve","Veins, ribs & grooves":"blade_venation","Leaf blade hairs":"blade_hairs","Leaf base / sheath":"leaf_base","Ligule height":"ligule_length","Ligule edge":"ligule_edge","Leaf sheath opening":"sheath_margins","Leaf sheath shape and feel":"sheath_surface","How the stem grows":"culm_posture","Surface runners and rooting":"surface_runners","Underground stems":"underground_stems","Stem base and crown":"basal_crown","Other stem clues":"stem_special","Node hairs and gland rings":"stem_nodes","Florets in one spikelet":"florets_per_spikelet","How spikelets sit":"spikelet_position","Outer glumes":"glume_marks","Lemma surface":"lemma_texture","Awns on the lemma":"true_lemma_awn","Bristles and floral hairs":"floral_hair_position"};
const mergeKeys=(automatic,required)=>[...new Set([...required,...automatic])].filter(key=>vocab.has(key));
function quickTermLinks(){
 const question=document.getElementById("question");
 if(question&&!question.querySelector(".grass-terms-quick")){
  const title=question.querySelector("h3")?.textContent||"";
  const group=title.includes("flowering head")?"head":title.includes("grass grow")?"habit":title.includes("true ligule")?"ligule":title.includes("projections surround")?"awns":null;
  const terms=mergeKeys(findKeys(question.textContent,36),termsByFeature[group]||[]);
  if(terms.length){
   const wrap=document.createElement("details");wrap.className="grass-terms-quick";
   const summary=document.createElement("summary");summary.textContent="Learn botanical terms in this question ("+terms.length+")";
   const list=document.createElement("div");list.className="grass-terms-links";
   terms.forEach(k=>list.append(chip(k)));
   wrap.append(summary,list);
   const hint=question.querySelector(".help");
   if(hint)hint.after(wrap);else question.prepend(wrap);
  }
 }
 const root=document.getElementById("optional-character-groups");
 if(!root)return;
 for(const group of root.querySelectorAll(".optional-group")){
  if(group.querySelector(".grass-group-terms"))continue;
  const content=group.querySelector(".optional-group-body");if(!content)continue;
  const title=group.querySelector("summary")?.firstChild?.textContent||"";
   const character=featureByLabel[title]||null;
   const words=mergeKeys(findKeys(group.textContent,25),termsByFeature[character]||[]);
  if(!words.length)continue;
  const bar=document.createElement("div");bar.className="grass-group-terms";
  const label=document.createElement("span");label.textContent="Define:";bar.append(label);
  words.forEach(k=>bar.append(chip(k)));
  content.prepend(bar);
 }
}
const proseSelectors=[
 "#question h3","#question p.help","#question .field-precision p",
 "#question .head-group-help","#question .head-illustration-note",
 "#optional-character-wrap .optional-description",
 "#optional-character-groups .optional-group-body > p",
 "#detail-dialog .diagnostic-check h4","#detail-dialog .diagnostic-check p",
 "#detail-dialog .detail-copy p","#compare-dialog .compare-note"
].join(",");
function linkText(node){
 if(!matcher||!node.nodeValue||!node.parentElement)return;
 if(node.parentElement.closest("a,button,code,pre,script,style,svg,[data-grass-term],.grass-terms-quick,.grass-group-terms,.grass-glossary-dialog"))return;
 const raw=node.nodeValue;
 if(!raw||raw.length>2600)return;
 const hits=[...raw.matchAll(matcher)];
 if(!hits.length)return;
 const frag=document.createDocumentFragment();let previous=0,added=0;
 for(const m of hits){
  if(added>=15||m.index<previous)continue;
  const key=aliases.get(normalized(m[0]));if(!key)continue;
  frag.append(document.createTextNode(raw.slice(previous,m.index)));
  const b=document.createElement("button");b.type="button";
  b.className="grass-term-inline";b.dataset.grassTerm=key;
  b.textContent=m[0];b.title="Define "+(vocab.get(key)?.term||m[0]);
  b.setAttribute("aria-label","Define "+m[0]);
  frag.append(b);previous=m.index+m[0].length;added++;
 }
 if(added){frag.append(document.createTextNode(raw.slice(previous)));node.replaceWith(frag);}
}
function enhance(){
 if(!matcher)return;
 quickTermLinks();
 for(const el of document.querySelectorAll(proseSelectors)){
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const arr=[];while(walker.nextNode())arr.push(walker.currentNode);
  arr.forEach(linkText);
 }
}
let scheduled=false;
function scheduleEnhance(){
 if(scheduled)return;scheduled=true;
 queueMicrotask(()=>{scheduled=false;enhance();});
}
function ensureDialog(){
 if(dialog)return dialog;
 dialog=document.createElement("dialog");
 dialog.id="grass-glossary-dialog";dialog.className="grass-glossary-dialog";
 dialog.setAttribute("aria-label","Botanical glossary");
 dialog.innerHTML='<div class="grass-glossary-shell"><header class="grass-glossary-head"><h2>Grass glossary</h2><button type="button" class="grass-glossary-close" aria-label="Close glossary">Close ×</button></header><div class="grass-glossary-content" id="grass-glossary-content"></div></div>';
 document.body.append(dialog);
 dialog.querySelector(".grass-glossary-close").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener("close",()=>{if(lastTrigger?.isConnected)lastTrigger.focus();lastTrigger=null});
 return dialog;
}
function footer(){
 return '<div class="grass-glossary-external"><a href="'+HUB+'?view=glossary" target="_blank" rel="noopener noreferrer">Open the complete Hays Botany glossary</a>'+
 (!sharedLoaded?' · Shared glossary temporarily unavailable; locally added grass definitions still work.':"")+'</div>';
}
// A tiny original botanical orientation sketch is preferable to a photo that
// does not actually show the character being defined.
function additionalSketch(key){
 if(!["anther","flag-leaf","distichous","coriaceous"].includes(key))return null;
 const ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");
 svg.setAttribute("viewBox","0 0 320 190");svg.setAttribute("role","img");
 svg.setAttribute("aria-label","Simplified original botanical drawing of "+key.replace("-"," "));
 const make=(tag,attrs,text)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);if(text)el.textContent=text;svg.append(el);return el};
 const line=(d,width=3,color="#356b45")=>make("path",{d,fill:"none",stroke:color,"stroke-width":String(width),"stroke-linecap":"round","stroke-linejoin":"round"});
 const label=(value,x,y)=>make("text",{x:String(x),y:String(y),fill:"#204a35","font-size":"14","font-family":"Arial, sans-serif","font-weight":"bold"},value);
 if(key==="anther"){
  line("M158 177 L159 89",4);
  line("M158 123 Q124 108 92 94 M158 119 Q197 94 234 97",2.4);
  line("M115 104 Q112 65 103 46 M156 90 Q154 52 159 39 M198 104 Q211 62 219 47",2);
  for(const [x,y] of [[103,46],[159,39],[219,47]]){
   make("ellipse",{cx:String(x),cy:String(y),rx:"9",ry:"17",fill:"#d7a54b",stroke:"#846232","stroke-width":"1.8"});
  }
  label("ANTHERS",12,28);line("M97 26 L105 34",1.7,"#a26c31");
  label("filaments",212,152);line("M214 137 L198 109",1.6);
 }else if(key==="flag-leaf"){
  line("M146 177 L146 65",4);
  for(const [x,y] of [[146,57],[116,40],[174,27],[138,15],[161,7]]){
   line("M146 65 Q"+x+" "+(y+20)+" "+x+" "+y,1.8);
   make("circle",{cx:String(x),cy:String(y),r:"4.4",fill:"#ba9655"});
  }
  line("M146 134 Q101 121 34 116",4,"#6f9b59");
  line("M146 107 Q211 79 274 94",4,"#6f9b59");
  line("M146 156 Q201 141 256 146",3,"#9ab77b");
  label("FLAG LEAF",197,63);line("M209 68 L240 90",1.8);
  label("flowering head",15,61);line("M97 55 L131 42",1.7);
 }else if(key==="coriaceous"){
  make("path",{d:"M45 88 Q151 46 283 78 L282 100 Q146 130 45 100 Z",fill:"#5a9969",stroke:"#326b47","stroke-width":"3"});
  line("M47 92 Q154 110 283 89",2,"#acd2a3");
  label("THICK, FIRM LEAF",46,41);line("M160 45 L158 72",1.7,"#5c7f48");
  label("texture needs touch",95,159);
 }else if(key==="distichous"){
  line("M156 172 L157 22",4);
  line("M157 138 Q92 123 33 139",4,"#5d9959");
  line("M157 106 Q215 89 286 105",4,"#5d9959");
  line("M157 72 Q88 53 35 74",4,"#5d9959");
  line("M157 39 Q220 28 277 43",4,"#5d9959");
  for(const y of [139,105,73,39])make("circle",{cx:"157",cy:String(y),r:"4",fill:"#926d3c"});
  label("RANK 1",14,181);label("RANK 2",225,181);
  line("M72 173 L84 142",1.6);line("M256 173 L248 107",1.6);
 }
 return svg;
}
function showDefinition(key){
 const v=vocab.get(key);if(!v){showIndex();return;}
 const pic=resolvePicture(v,key);
 const sketch=window.HaysGrassGlossarySketches?.forTerm?.(key)||additionalSketch(key);
 const sketchMarkup=sketch?.outerHTML?'<figure class="grass-glossary-figure grass-glossary-sketch">'+sketch.outerHTML+'<figcaption>Original simplified Grass ID Lab teaching diagram — not a verified specimen photograph or scoring record.</figcaption></figure>':'';
 const main=ensureDialog().querySelector("#grass-glossary-content");
 const fields=[["Where to look",v.where],["Why it helps with ID",v.why],["Botanical definition",v.formal]].filter(a=>a[1]);
 main.innerHTML='<div class="grass-glossary-definition"><button type="button" class="grass-glossary-back">← Browse terms</button>'+
  '<h3>'+escapeHTML(v.term)+'</h3>'+
  (v.pronunciation?'<p class="pronunciation">Say it: '+escapeHTML(v.pronunciation)+'</p>':"")+
  '<p class="plain">'+escapeHTML(v.plain)+'</p>'+
  (pic?'<figure class="grass-glossary-figure"><img loading="lazy" decoding="async" alt="'+escapeHTML(pic.alt||pic.label||v.term)+'" src="'+escapeHTML(pic.src)+'">'+
   '<figcaption><strong>'+escapeHTML(pic.label||v.term)+'</strong>'+
   (pic.diagram?' · Botanical illustration':' · Photo reference')+
   '<div>'+escapeHTML([pic.creator,pic.license].filter(Boolean).join(" · "))+'</div>'+
   (pic.note?'<div>'+escapeHTML(pic.note)+'</div>':"")+
   (isHttps(pic.license_url)?'<a href="'+escapeHTML(pic.license_url)+'" target="_blank" rel="noopener noreferrer">License terms</a> · ':'')+
   (isHttps(pic.source_page)?'<a href="'+escapeHTML(pic.source_page)+'" target="_blank" rel="noopener noreferrer">Original photo / source</a>':"")+
   '</figcaption></figure>':
   (sketch?'':'<div class="grass-glossary-missing">A verified, rights-cleared close-up for this exact structure is not available in the connected glossary yet. The definition still works; no unapproved photograph is displayed.</div>'))+
  sketchMarkup+
  (fields.length?'<dl>'+fields.map(([t,val])=>'<div><dt>'+t+'</dt><dd>'+escapeHTML(val)+'</dd></div>').join("")+'</dl>':"")+
  footer()+'</div>';
 main.querySelector(".grass-glossary-back").addEventListener("click",showIndex);
 const img=main.querySelector("img");
 if(img)img.addEventListener("error",()=>{
  const f=img.closest("figure");if(!f)return;
  img.replaceWith(Object.assign(document.createElement("div"),{className:"grass-glossary-missing",textContent:"The credited reference image could not load. You can still use the definition and original source link below."}));
 },{once:true});
 main.scrollTop=0;
}
function showIndex(){
 const main=ensureDialog().querySelector("#grass-glossary-content");
 main.innerHTML='<label for="grass-glossary-search">Search definitions</label>'+
  '<input type="search" id="grass-glossary-search" class="grass-glossary-search" placeholder="Try ligule, stolon, midrib…" autocomplete="off">'+
  '<p class="grass-glossary-hint">'+vocab.size+' terms available, including the grass-specific additions. The glossary is for learning and never changes your ID answers.</p>'+
  '<div class="grass-glossary-results" id="grass-glossary-results"></div>'+footer();
 const input=main.querySelector("input");
 input.addEventListener("input",()=>showResults(input.value));
 showResults("");
 input.focus();
}
function showResults(query){
 const out=dialog?.querySelector("#grass-glossary-results");if(!out)return;
 const q=normalized(query);
 const matches=[...vocab].filter(([k,v])=>!q||normalized([k,v.term,v.plain,...(v.aliases||[])].join(" ")).includes(q));
 if(!q){const priority=["ligule","collar","culm","spikelet","glume","lemma","palea","awn","panicle","stolon","rhizome","floret","rachilla","auricle","midrib","venation","leaf-blade","bristle","node","ciliate","pedicel","stigma"];
  matches.sort((a,b)=>{const ai=priority.indexOf(a[0]),bi=priority.indexOf(b[0]);return ai===-1?(bi===-1?a[1].term.localeCompare(b[1].term):1):(bi===-1?-1:ai-bi)});}
 else matches.sort((a,b)=>a[1].term.localeCompare(b[1].term));
 out.replaceChildren();
 if(!matches.length){const p=document.createElement("p");p.className="grass-glossary-hint";p.textContent="No matching term yet. Try another botanical word.";out.append(p);return;}
 for(const [k,v] of matches.slice(0,q?45:28)){
  const b=document.createElement("button");b.type="button";b.dataset.grassTerm=k;
  const t=document.createElement("strong");t.textContent=v.term;
  const p=document.createElement("span");p.textContent=v.plain;
  b.append(t,p);out.append(b);
 }
}
function open(key,from){
 const d=ensureDialog();if(!d.open){lastTrigger=from||document.activeElement;d.showModal();}
 if(key&&vocab.has(key))showDefinition(key);else showIndex();
}
function setup(){
 if(!document.querySelector("#grass-glossary-launch")){
  const parent=document.querySelector(".sitebar-actions");
  if(parent){const b=document.createElement("button");b.id="grass-glossary-launch";b.type="button";b.className="grass-glossary-launch";b.textContent="Glossary";parent.prepend(b);}
 }
 document.addEventListener("click",e=>{
  const b=e.target.closest?.("[data-grass-term],#grass-glossary-launch");
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  open(b.dataset.grassTerm||null,b);
 },true);
 document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&dialog?.open)dialog.close();
 });
 for(const id of ["question","optional-character-groups","detail-body","compare-body"]){
  const el=document.getElementById(id);
  if(el)new MutationObserver(scheduleEnhance).observe(el,{subtree:true,childList:true,characterData:true});
 }
}
async function load(){
 if(loading)return;loading=true;
 const read=async path=>{const response=await fetch(path);if(!response.ok)throw Error("Glossary unavailable");return response.json()};
 const [local,snapshot,permissions]=await Promise.allSettled([
  read("grass-glossary-terms.json"),read("shared-glossary-snapshot.json"),read("glossary-approved-source-photos.json")
 ]);
 if(local.status==="fulfilled")for(const [key,item] of Object.entries(local.value.terms||{}))if(item.term&&item.plain)vocab.set(key,item);
 if(snapshot.status==="fulfilled"&&snapshot.value?.terms){
  for(const [key,item] of Object.entries(snapshot.value.terms))if(item.term&&item.plain)vocab.set(key,item);
  sharedLoaded=true;
 }
 if(permissions.status==="fulfilled")for(const [key,record] of Object.entries(permissions.value.approved_photos||{})){
  if(record?.source_page&&record?.creator&&allowedCredit(record.license)&&record.source_page===vocab.get(key)?.real_photo?.source_page)verifiedPhotos.set(key,record);
 }
 rebuildMatcher();scheduleEnhance();
 if(dialog?.open&&!dialog.querySelector(".grass-glossary-definition"))showIndex();
 read(SHARED).then(canonical=>{
  if(!canonical?.terms)return;
  for(const [key,item] of Object.entries(canonical.terms))if(item.term&&item.plain)vocab.set(key,item);
  sharedLoaded=true;rebuildMatcher();scheduleEnhance();
  if(dialog?.open&&!dialog.querySelector(".grass-glossary-definition"))showIndex();
 }).catch(()=>{});
}
setup();
load();
window.HaysGrassGlossary={open,findTerms:findKeys,available:()=>vocab.size,sharedLoaded:()=>sharedLoaded,approvedPhotos:()=>verifiedPhotos.size};
})();