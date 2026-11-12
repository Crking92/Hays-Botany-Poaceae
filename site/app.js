"use strict";
// Rights-filtered existing-source public Poaceae teaching learner.
// Original specimen/photo sources and unresolved permissions remain separately preserved.
const $=id=>document.getElementById(id);
const hub="https://crking92.github.io/Hays-County-Botany/";
const esc=(s)=>String(s??"");
const state={index:[],active:null,mode:"field",glossary:null,cache:new Map(),research:new Map()};
const make=(tag,props={})=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==="className")n.className=v;else n.setAttribute(k,v)}return n;};
const txt=(tag,value,cls)=>{const n=make(tag);if(cls)n.className=cls;n.textContent=esc(value);return n;};
const text=(node,value)=>node.append(document.createTextNode(esc(value)));
const appendParagraph=(node,value,cls)=>{if(value){node.append(txt("p",value,cls));}};
const metadataWarning="Source-credited photos (including separately licensed educational-use images); subtle anatomy arrows may still need field verification. Original external and restricted references remain available below the gallery as source-only links.";
function glossaryKeys(){return Object.keys(state.glossary?.terms||{}).sort();}
function showTerm(key){
 const dialog=$("term-dialog"),data=state.glossary?.terms?.[key];
 if(!data)return;
 const body=$("term-body");body.replaceChildren();
 body.append(txt("h2",data.term||key));
 if(data.pronunciation)body.append(txt("p",data.pronunciation,"muted"));
 appendParagraph(body,data.plain);
 if(data.formal)appendParagraph(body,"Field botany: "+data.formal,"muted");
 if(data.where)appendParagraph(body,"Where to look: "+data.where);
 if(data.why)appendParagraph(body,"Why it matters: "+data.why);
 if(dialog.showModal)dialog.showModal();else dialog.setAttribute("open","");
}
function glossaryButton(word){
 const key=String(word||"").toLowerCase().trim().replace(/ /g,"-");
 const btn=make("button",{type:"button",className:"glossary-chip"});
 btn.textContent=word;
 if(state.glossary?.terms?.[key]){
   btn.title="Open the botanical meaning of "+word;
   btn.addEventListener("click",()=>showTerm(key));
 }else{
   btn.disabled=true;btn.title="Term remains referenced in the unified hub glossary";
 }
 return btn;
}
function list(q=""){
 const root=$("species-list");root.replaceChildren();
 const search=q.trim().toLowerCase();
 const entries=state.index.filter(x=>[x.id,x.scientific,x.common,x.genus,...(x.aliases||[])].join(" ").toLowerCase().includes(search));
 $("count").textContent=entries.length+" of "+state.index.length+" grass species";
 for(const x of entries){
   const b=make("button",{type:"button","aria-current":String(state.active===x.id)});
   b.append(txt("strong",x.common||x.scientific),txt("em",x.scientific));
   if(state.research.has(x.id))b.append(txt("small","Research profile · photo and ID review pending","comparison-count"));
   if(x.local_panel_count>0 && x.target_species_source_panels===0 && x.comparison_source_panels>0)
      b.append(txt("small","Comparison photos only — target species photo pending","comparison-count"));
   b.addEventListener("click",()=>select(x.id));
   root.append(b);
 }
}
function photoCard(panel,index,scientific){
 const fig=make("figure",{className:"photo"});
 if(Number.isInteger(index))fig.id="photo-"+index;
 const art=make("div",{className:"photo-artwork"});
 const img=make("img",{src:panel.src,alt:panel.label||scientific,loading:"lazy"});
 img.addEventListener("error",()=>{
   art.replaceChildren(txt("p","This source photo could not load.","photo-hold"));
 });
 art.append(img);
 const markers=panel.markers||[];
 if(markers.length){
   const NS="http://www.w3.org/2000/svg";
   const svg=document.createElementNS(NS,"svg");
   svg.setAttribute("viewBox","0 0 100 100");svg.setAttribute("preserveAspectRatio","none");
   svg.setAttribute("aria-hidden","true");
   for(const [markerIndex,m] of markers.entries()){
     if(!["target_x","target_y","label_x","label_y"].every(k=>Number.isFinite(m[k])))continue;
     const line=document.createElementNS(NS,"line");
     for(const [k,v] of Object.entries({x1:m.label_x,y1:m.label_y,x2:m.target_x,y2:m.target_y,stroke:"#f34a27","stroke-width":"0.65"}))line.setAttribute(k,v);
     svg.append(line);
     const dot=document.createElementNS(NS,"circle");
     for(const [k,v] of Object.entries({cx:m.target_x,cy:m.target_y,r:"1.2",fill:"#f34a27",stroke:"white","stroke-width":"0.3"}))dot.setAttribute(k,v);
     svg.append(dot);
   }
   art.append(svg);
   for(const [markerIndex,m] of markers.entries()){
      if(!Number.isFinite(m.target_x)||!Number.isFinite(m.target_y))continue;
      const badge=make("span",{className:"marker-number",title:m.label||"",
         style:"left:"+m.target_x+"%;top:"+m.target_y+"%;"});
      badge.textContent=String(markerIndex+1);
      art.append(badge);
   }
 }
 if(panel.photo_role==="COMPARISON_SPECIES_SOURCE"){
    fig.classList.add("comparison-photo");
    const source=(panel.source_species_id||"another species").replace(/-/g," ");
    fig.append(txt("p","LOOK-ALIKE / COMPARISON ONLY — original photo filed under "+source+
                   ", not the target species "+scientific+".","comparison-photo-note"));
 }
 fig.append(art);
 const caption=make("figcaption");
 caption.append(txt("strong",panel.label));
 appendParagraph(caption,panel.caption);
 caption.append(txt("span",[panel.creator,panel.license].filter(Boolean).join(" · "),"credit"));
 if(panel.license_url?.startsWith("https://")){
   const licenseLink=make("a",{href:panel.license_url,target:"_blank",rel:"noopener noreferrer"});
   licenseLink.textContent="License terms";
   caption.append(licenseLink,document.createTextNode(" · "));
 }
 if(panel.photo_license_note)caption.append(txt("span",panel.photo_license_note,"credit"));
 if(panel.modifications)caption.append(txt("span","Original source record notes: "+panel.modifications,"credit"));
 if(markers.length)caption.append(txt("span","Displayed numbering and arrow overlays added by Hays Botany; original source JPEG unchanged.","credit"));
 if(panel.source_page?.startsWith("https://")){
   const a=make("a",{href:panel.source_page,target:"_blank",rel:"noopener noreferrer"});
   a.textContent="Original photo and photographer credit";
   caption.append(a);
 }
 if(markers.length){
   const ul=make("ol",{className:"marker-list"});
   for(const m of markers)ul.append(txt("li",m.label));
   caption.append(ul);
 }
 fig.append(caption);
 return fig;
}
function photoJump(index,label="View matched photograph"){
 const btn=make("button",{type:"button",className:"photo-jump"});
 btn.textContent=label;
 btn.addEventListener("click",()=>{
   const figure=$("photo-"+index);
   if(figure){figure.scrollIntoView({behavior:"smooth",block:"nearest"});}
 });
 return btn;
}
function relatedSection(data,root){
 const relation=data.related||[];
 if(!relation.length&&!data.comparison_text)return;
 root.append(txt("h3","Look-alikes and comparison"));
 if(data.comparison_text)root.append(txt("p",data.comparison_text));
 if(relation.length){
  const div=make("div",{className:"related-grid"});
  for(const r of relation){
   const p=make("div",{className:"related-tax"});
   if(r.species_id && r.species_id!==data.id){
      const button=make("button",{type:"button",className:"text-link"});
      button.textContent=r.scientific;
      button.addEventListener("click",()=>select(r.species_id));
      p.append(button);
   }else{
      p.append(txt("strong",r.scientific));
      p.append(txt("span","See unified hub or an external taxonomic reference; this species is not a verified internal comparison link.","muted"));
   }
   div.append(p);
  }
  root.append(div);
 }
}
function photoGallery(data,root){
 root.append(txt("h3","Source photographs ("+data.panels.length+")"));
 const target=data.panels.filter(p=>p.photo_role==="TARGET_SPECIES_SOURCE").length;
 const comparisons=data.panels.filter(p=>p.photo_role==="COMPARISON_SPECIES_SOURCE").length;
 if(data.panels.length && !target && comparisons)
   root.append(txt("p","COMPARISON PHOTOS ONLY: There is no source-folder-matched photograph of "+
       data.scientific+" in this release. The pictures below show other identified grasses for comparison, NOT "+data.scientific+".","comparison-gallery-warning"));
 else if(target && comparisons)
   root.append(txt("p","Photos filed under this species appear first. Other-species look-alike examples are marked separately.","muted"));
 const gallery=make("div",{className:"gallery"});
 if(!data.panels.length)gallery.append(txt("p","No local licensed-candidate photographs available in this staging copy."));
 data.panels.forEach((p,i)=>gallery.append(photoCard(p,i,data.scientific)));
 root.append(gallery);
 const references=data.unavailable_references||[];
 if(references.length){
   const details=make("details",{className:"source-only-references"});
   const summary=make("summary");
   summary.textContent=references.length+" original photo references not embedded (permissions or external sources)";
   details.append(summary);
   details.append(txt("p","These original panel references are preserved as research pointers. The images themselves are not copied into the published gallery.","muted"));
   const ul=make("ul");
   for(const ref of references){
     const li=make("li");
     li.append(txt("strong",ref.label||"Reference photograph"));
     li.append(txt("span"," — "+ref.reason,"muted"));
     if(ref.reference_page?.startsWith("https://")){
       const link=make("a",{href:ref.reference_page,target:"_blank",rel:"noopener noreferrer"});
       link.textContent="View at original source";
       li.append(document.createTextNode(" · "),link);
     }
     ul.append(li);
   }
   details.append(ul);root.append(details);
 }
}
function appendTerms(root,terms){
 const unique=[...new Set(terms||[])];
 if(!unique.length)return;
 const wrap=make("div",{className:"glossary-chips"});
 wrap.append(txt("span","Vocabulary: ","chip-label"));
 for(const s of unique)wrap.append(glossaryButton(s));
 root.append(wrap);
}
function renderLearner(d,root){
 const intro=txt("div","","learning-intro");
 appendParagraph(intro,d.intro||d.field_rule);
 if(d.memory_rule)intro.append(txt("p","Remember: "+d.memory_rule,"memory-rule"));
 root.append(intro);
 root.append(txt("h3","Follow the field ID steps"));
 const list=make("ol",{className:"learner-steps"});
 for(const [i,s] of d.steps.entries()){
  const li=make("li",{className:"learner-step"});
  const info=make("div",{className:"step-copy"});
  info.append(txt("h4",s.title||"Observe this plant"));
  appendParagraph(info,s.look_for);
  appendParagraph(info,s.why_it_matters,"muted");
  if(s.source==="EXISTING_CARD_FIELD_GUIDANCE")info.append(txt("p","Sequence assembled from the existing species-card notes.","source-flag"));
  const idx=s.panel_index;
  if(Number.isInteger(idx)&&d.panels[idx]){
     const p=d.panels[idx];
     const thumb=make("img",{src:p.src,alt:p.label||d.scientific,loading:"lazy",className:"step-thumb"});
     const btn=make("button",{type:"button",className:"step-image"});
     btn.append(thumb,txt("span","See source image and annotated structures","muted"));
     btn.addEventListener("click",()=>$("photo-"+idx)?.scrollIntoView({behavior:"smooth",block:"nearest"}));
     li.append(info,btn);
  }else{
     if(s.original_panel_index!==null && s.photo_unavailable)info.append(txt("p","Original step photograph withheld or unavailable in this stage; botanical text preserved.","photo-hold"));
     li.append(info);
  }
  list.append(li);
 }
 root.append(list);
 relatedSection(d,root);
 photoGallery(d,root);
}
// Show an honest, credited same-species reference in otherwise empty Field ID cards.
// Context is NOT a diagnostic photograph and never satisfies the missing-part need.
function chooseFieldContextPhoto(data,tile,used){
 const head=[tile.heading,tile.short].filter(Boolean).join(" ").toLowerCase();
 const terms=[
  {test:/ligule|collar|sheath|node|blade|leaf|foliage/,want:/ligule|collar|sheath|node|leaf|blade|foliage/},
  {test:/spikelet|glume|lemma|floret|awn|bristle/,want:/spikelet|glume|lemma|floret|awn|bristle|seedhead|seed head/},
  {test:/panicle|raceme|spike|flower|plume|inflorescence|seedhead/,want:/panicle|raceme|spike|flower|plume|inflorescence|seedhead/},
  {test:/base|root|clump|tuft|habit|whole|growth|crown|stem|culm/,want:/base|root|clump|tuft|habit|whole|growth|crown|stem|culm/},
  {test:/look-alike|compare|versus|similar|vs\\./,want:/habit|whole|panicle|flower|clump|tuft|inflorescence/}
 ].filter(x=>x.test.test(head));
 const eligible=(data.panels||[]).map((panel,index)=>({panel,index})).filter(({panel})=>
  panel?.src && panel.photo_role==="TARGET_SPECIES_SOURCE" &&
  panel.source_species_id===data.id && panel.creator && panel.license && panel.source_page);
 if(!eligible.length)return null;
 const scored=eligible.map(item=>{
  const label=String(item.panel.label||"").toLowerCase();
  const priority=terms.reduce((sum,x)=>sum+(x.want.test(label)?4:0),0);
  const original=(tile.original_panel_indices||[]).includes(item.panel.original_panel_index)?3:0;
  const overview=/whole|plant|habit|clump|tuft|flower|panicle|seedhead/.test(label)?2:0;
  const repeats=used.get(item.index)||0;
  return {...item,score:priority+original+overview-repeats*5};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 const chosen=scored[0];used.set(chosen.index,(used.get(chosen.index)||0)+1);
 return chosen.panel;
}
function renderField(d,root){
 root.append(txt("h3","Field ID — expand each diagnostic character"));
 if(d.field_rule)root.append(txt("p",d.field_rule,"memory-rule"));
 const usedContextPhotos=new Map();
 for(const [index,t] of (d.tiles||[]).entries()){
   const details=make("details",{className:"field-tile"});
   if(index===0)details.open=true;
   const summary=make("summary");
   summary.append(txt("strong",t.heading||"Diagnostic feature"),txt("span",t.short||"","muted"));
   details.append(summary);
   const matches=[...new Set(t.preview_panel_indices||[])]
     .map(n=>d.panels[n])
     .filter(p=>p?.src && p.photo_role==="TARGET_SPECIES_SOURCE" && p.source_species_id===d.id);
   if(matches.length){
     const photos=make("div",{className:"gallery"});
     matches.forEach(p=>photos.append(photoCard(p,null,d.scientific)));
     details.append(photos);
   }else{
     const context=chooseFieldContextPhoto(d,t,usedContextPhotos);
     if(context){
       const photos=make("div",{className:"gallery"});
       photos.append(photoCard(context,null,d.scientific));
       details.append(photos);
       details.append(txt("p","Plant reference only — this is a credited photograph of the same species, NOT proof of the particular diagnostic feature. A clear close-up of that feature is still needed.","muted"));
     }else{
       details.append(txt("p","A photo of this exact feature is still needed. See the source gallery for other views.","photo-hold"));
     }
   }
   appendParagraph(details,t.details);
   if(t.status)appendParagraph(details,t.status,"source-flag");
   appendTerms(details,t.glossary||[]);
   for(const n of t.preview_panel_indices||[]){
      if(d.panels[n]?.photo_role==="COMPARISON_SPECIES_SOURCE")details.append(photoJump(n,"View look-alike photo"));
   }
   if(t.missing_original_panel_indices?.length){
     details.append(txt("p",t.missing_original_panel_indices.length+" original teaching photo reference(s) held for rights or source review.","photo-hold"));
   }
   root.append(details);
 }
 relatedSection(d,root);
 root.append(txt("h3","Field photographs — inspect before deciding"));
 photoGallery(d,root);
}
function renderTerms(d,root){
 const profile=state.glossary?.family_profile;
 root.append(txt("h3","Grass anatomy basics"));
 if(profile)root.append(txt("p",profile.plain_signature));
 appendTerms(root,profile?.key_terms||[]);
 root.append(txt("h3","Species terminology"));
 appendTerms(root,d.family_glossary_terms||[]);
 root.append(txt("p","Tap any available term for a plain-language definition, where to look, and why it matters.","muted"));
 root.append(txt("h3","Photographs with visible anatomy markers"));
 photoGallery(d,root);
}
function renderModeHeader(root){
 const modes=[["learner","Learner"],["terms","Learn terms"],["field","Field ID"]];
 const bar=make("div",{className:"view-switch",role:"group","aria-label":"Teaching level"});
 for(const [value,label] of modes){
  const btn=make("button",{type:"button","aria-pressed":String(state.mode===value)});
  btn.textContent=label;btn.addEventListener("click",()=>{state.mode=value;renderSelected()});
  bar.append(btn);
 }
 root.append(bar);
}

/* The 169-grass Learner displays source-based expansion records without asserting
   local identification, verified anatomy or third-party photo reuse rights. */
function renderResearchCandidate(d,root){
 const intro=txt("section","","learning-intro");
 intro.append(txt("p","Provisional taxon identification — published descriptions and any credited reference photos are not proof of a verified Hays specimen.","photo-hold"));
 const approved=Array.isArray(d.approved_gallery)?d.approved_gallery:[];
 if(approved.length)intro.append(txt("p",approved.length+" source-credited general photograph"+(approved.length===1?"":"s")+" cleared for this reference card. These are nonlocal visual examples, not certified Hays voucher specimens. Each image retains its creator, license and original-source link.","source-flag"));
 else intro.append(txt("p","No general photograph has yet cleared exact-image rights and source checks for this species. Original observation links below are research sources, not licenses to republish images."));
 if(d.local_report_count)intro.append(txt("p","Research packet links "+d.local_report_count+" local observation reports; individual identities and native status remain to be verified.","muted"));
 if(d.aliases?.length)intro.append(txt("p","Other recorded names: "+d.aliases.join("; "),"muted"));
 if(d.risky_context)intro.append(txt("p","Check planted, cultivated or escaped occurrence context before accepting the local record.","photo-hold"));
 if(typeof d.unresolved==="string"&&d.unresolved)intro.append(txt("p","Pending evidence: "+d.unresolved,"muted"));
 root.append(intro);
 if(approved.length){
  root.append(txt("p","General photo gallery first: browse these rights-checked reference views. They are NOT proof of fine diagnostic structures; anatomy and specimen identification remain separate.","muted"));
  photoGallery({scientific:d.scientific,panels:approved,unavailable_references:[]},root);
 }
 const chars=Array.isArray(d.details)?d.details:[];
 if(state.mode==="terms"){
  root.append(txt("h3","Botanical vocabulary for this species"));
  const combined=chars.map(x=>x.part+" "+x.description).join(" ").toLowerCase();
  const terms=["ligule","collar","sheath","culm","rhizome","stolon","spikelet","glume","lemma","palea","awn","panicle","raceme","rachis","node","floret"].filter(x=>combined.includes(x)&&state.glossary?.terms?.[x]);
  appendTerms(root,terms.length?terms:state.glossary?.family_profile?.key_terms||[]);
  root.append(txt("p","Vocabulary definitions do not confirm a species identity or a photographed character.","muted"));
 }else if(state.mode==="field"){
  root.append(txt("h3","Field ID — source-described characters to inspect"));
  for(const [i,c] of chars.entries()){
   const section=make("details",{className:"field-tile"});if(i===0)section.open=true;
   const summary=make("summary");summary.append(txt("strong",String(c.part||"structure").replaceAll("_"," ")));section.append(summary);
   appendParagraph(section,c.description);
   appendParagraph(section,"Photo still needed: "+(c.needed_view||"Same-specimen structure"),"photo-hold");
   appendParagraph(section,"Literature: "+(c.source||"See regional research packet"),"source-flag");
   root.append(section);
  }
 }else{
  root.append(txt("h3","Learner — structures described in the references"));
  const steps=make("ol",{className:"learner-steps"});
  for(const c of chars){
   const li=make("li",{className:"learner-step"}),copy=make("div",{className:"step-copy"});
   copy.append(txt("h4",String(c.part||"structure").replaceAll("_"," ")));
   appendParagraph(copy,c.description);
   appendParagraph(copy,"Next photograph: "+(c.needed_view||"Same-specimen evidence"),"muted");
   appendParagraph(copy,"Reference: "+(c.source||"Regional research packet"),"source-flag");
   li.append(copy);steps.append(li);
  }
  root.append(steps);
 }
 root.append(txt("h3","Research observations and original evidence"));
 root.append(txt("p","These external observation links are leads, not photo-use permission or final verification of the reported identification.","photo-hold"));
 const links=make("div",{className:"route-footer"});
 for(const [i,url] of (d.observation_urls||[]).slice(0,5).entries()){
  if(typeof url!=="string"||!url.startsWith("https://"))continue;
  const a=make("a",{href:url,target:"_blank",rel:"noopener noreferrer"});a.textContent="Original observation "+(i+1);links.append(a);
 }
 if(d.source_location?.startsWith("../../audits/")){
  const a=make("a",{href:"https://github.com/Crking92/Hays-Botany-Poaceae/blob/main/"+d.source_location.slice(6),target:"_blank",rel:"noopener noreferrer"});
  a.textContent="Diagnostic source packet";links.append(a);
 }
 const a=make("a",{href:"visual-key-lab/hays-candidates.html"});a.textContent="All expansion research records";links.append(a);
 root.append(links);
}

async function select(id){
 const record=state.index.find(x=>x.id===id);if(!record)return;
 state.active=id;list($("search").value);
 try{
   if(!state.cache.has(id)){
     if(state.research.has(id))state.cache.set(id,state.research.get(id));
     else {
      const response=await fetch("data/species/"+encodeURIComponent(id)+".json");
      if(!response.ok)throw new Error("species summary unavailable");
      state.cache.set(id,await response.json());
     }
   }
   renderSelected();
   history.replaceState(null,"","?species="+encodeURIComponent(id));
 }catch(error){
   $("species-detail").replaceChildren(txt("p","Species could not load: "+error.message,"photo-hold"));
 }
}
function renderSelected(){
 const d=state.cache.get(state.active);if(!d)return;
 const root=$("species-detail");root.replaceChildren();
 root.append(txt("p","POACEAE · "+(d.genus||d.scientific.split(" ")[0]),"eyebrow"),txt("h2",d.common||d.scientific),txt("p",d.scientific,"subtitle"));
 if(state.research.has(d.id)){
   root.append(txt("p","Provisional taxon identity in the 169-grass Learner. Any cleared example photographs show their own individual reuse permissions below. Local occurrence and scored-key identification are not yet approved.","notice-stage"));
   renderModeHeader(root);
   renderResearchCandidate(d,root);
   return;
 }
 root.append(txt("p",metadataWarning,"notice-stage"));
 if(d.source_sync_status==="AUTO_IMPORTED_SOURCE_RECORD_REVIEW_WELCOME")
   root.append(txt("p","Automatically imported grass source record — confirm identification, county nativity and anatomy before field use.","photo-hold"));
 if(d.native_target_zone_calculated===false)root.append(txt("p","Native target-zone qualification is unresolved or excluded in the canonical record. Do not infer Hays County nativity from a picture.","photo-hold"));
 renderModeHeader(root);
 if(state.mode==="terms")renderTerms(d,root);
 else if(state.mode==="field")renderField(d,root);
 else renderLearner(d,root);
 if(d.safety_note)root.append(txt("p",d.safety_note,"warning"));
 const footer=make("div",{className:"route-footer"});
 const quiz=make("a",{href:hub+"quiz.html",target:"_blank",rel:"noopener noreferrer"});
 quiz.textContent="Open universal Hays Botany Quiz (original site)";
 const glossary=make("a",{href:hub+"index.html?view=glossary",target:"_blank",rel:"noopener noreferrer"});
 glossary.textContent="Open complete original glossary";
 footer.append(quiz,glossary);
 root.append(footer);
}
async function boot(){
 try{
  const [indexResponse,researchResponse,glossaryResponse]=await Promise.all([
    fetch("data/poaceae-index.json"),fetch("visual-key-lab/hays-candidates.json"),fetch("data/grass-terms.json")
  ]);
  if(!indexResponse.ok||!researchResponse.ok||!glossaryResponse.ok)throw new Error("Unable to load the full grass inventory or glossary");
  const base=await indexResponse.json(),manifest=await researchResponse.json();
  if(!Array.isArray(base)||base.length!==112||!Array.isArray(manifest.candidates)||manifest.candidates.length!==57)throw new Error("The 169-species Learner inventory is incomplete");
  state.research=new Map(manifest.candidates.map(x=>[x.id,x]));
  const additions=manifest.candidates.map(x=>({id:x.id,scientific:x.scientific,common:x.common,genus:x.scientific.split(" ")[0],aliases:x.aliases||[]}));
  state.index=[...base,...additions];
  if(new Set(state.index.map(x=>x.id)).size!==169||new Set(state.index.map(x=>x.scientific.toLowerCase())).size!==169)throw new Error("Duplicate species in the unified Learner");
  state.glossary=await glossaryResponse.json();
  state.index.sort((a,b)=>(a.common||a.scientific).localeCompare(b.common||b.scientific));
  $("search").addEventListener("input",e=>list(e.target.value));
  $("glossary-open").addEventListener("click",()=>{
    const target=$("glossary-list");target.replaceChildren();
    for(const key of glossaryKeys())target.append(glossaryButton(key));
    const dialog=$("all-glossary-dialog");if(dialog.showModal)dialog.showModal();else dialog.setAttribute("open","");
  });
  for(const [id,dialogId] of [["term-close","term-dialog"],["all-glossary-close","all-glossary-dialog"]]){
     $(id).addEventListener("click",()=>$(dialogId).close());
  }
  list();
  const wanted=new URLSearchParams(location.search).get("species");
  if(wanted&&state.index.some(x=>x.id===wanted))await select(wanted);
 }catch(error){$("count").textContent="Could not load staging learner: "+error.message}
}
boot();
