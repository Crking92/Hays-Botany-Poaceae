"use strict";
// Non-deployed Hays Botany Poaceae staging learner. Do not enable Pages or
// treat broadly licensed photo candidates as fully cleared by this interface.
const $=id=>document.getElementById(id);
const hub="https://crking92.github.io/Hays-County-Botany/";
const esc=(s)=>String(s??"");
const state={index:[],active:null,mode:"learner",glossary:null,cache:new Map()};
const make=(tag,props={})=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==="className")n.className=v;else n.setAttribute(k,v)}return n;};
const txt=(tag,value,cls)=>{const n=make(tag);if(cls)n.className=cls;n.textContent=esc(value);return n;};
const text=(node,value)=>node.append(document.createTextNode(esc(value)));
const appendParagraph=(node,value,cls)=>{if(value){node.append(txt("p",value,cls));}};
const metadataWarning="Staging only: photo permissions and arrow landing positions are not fully certified. Original external and restricted references remain available below the gallery as source-only links.";
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
 const entries=state.index.filter(x=>[x.id,x.scientific,x.common,x.genus].join(" ").toLowerCase().includes(search));
 $("count").textContent=entries.length+" of "+state.index.length+" grass species";
 for(const x of entries){
   const b=make("button",{type:"button","aria-current":String(state.active===x.id)});
   b.append(txt("strong",x.common||x.scientific),txt("em",x.scientific));
   b.addEventListener("click",()=>select(x.id));
   root.append(b);
 }
}
function photoCard(panel,index,scientific){
 const fig=make("figure",{className:"photo",id:"photo-"+index});
 const art=make("div",{className:"photo-artwork"});
 const img=make("img",{src:panel.src,alt:panel.label||scientific,loading:"lazy"});
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
function renderField(d,root){
 root.append(txt("h3","Field ID — expand each diagnostic character"));
 if(d.field_rule)root.append(txt("p",d.field_rule,"memory-rule"));
 for(const [index,t] of (d.tiles||[]).entries()){
   const details=make("details",{className:"field-tile"});
   if(index===0)details.open=true;
   const summary=make("summary");
   summary.append(txt("strong",t.heading||"Diagnostic feature"),txt("span",t.short||"","muted"));
   details.append(summary);
   appendParagraph(details,t.details);
   if(t.status)appendParagraph(details,t.status,"source-flag");
   appendTerms(details,t.glossary||[]);
   for(const n of t.preview_panel_indices||[]){
      if(d.panels[n])details.append(photoJump(n,"View matching documented photo"));
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
async function select(id){
 const record=state.index.find(x=>x.id===id);if(!record)return;
 state.active=id;list($("search").value);
 try{
   if(!state.cache.has(id)){
     const response=await fetch("data/species/"+encodeURIComponent(id)+".json");
     if(!response.ok)throw new Error("species summary unavailable");
     state.cache.set(id,await response.json());
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
 root.append(txt("p","POACEAE · "+d.genus,"eyebrow"),txt("h2",d.common||d.scientific),txt("p",d.scientific,"subtitle"));
 root.append(txt("p",metadataWarning,"notice-stage"));
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
  const [indexResponse,glossaryResponse]=await Promise.all([
    fetch("data/poaceae-index.json"),fetch("data/grass-terms.json")
  ]);
  if(!indexResponse.ok||!glossaryResponse.ok)throw new Error("Unable to load learner index or botanical glossary");
  state.index=await indexResponse.json();
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
