/* Hays Grass ID Lab — public iNaturalist observation map.
 * Occurrence dots are community observations, NOT a native-range polygon,
 * an identification endorsement, or a BONAP county-native decision.
 * Requests happen only on opening a species, never while scanning the key.
 */
(function(){
 "use strict";
 const INAT_API="https://api.inaturalist.org/v1";
 const TILE_BASE="https://tiles.inaturalist.org/v1/points/{z}/{x}/{y}.png";
 const LEAFLET_JS="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
 const LEAFLET_CSS="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
 const LEAFLET_JS_HASH="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
 const LEAFLET_CSS_HASH="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
 const REGIONS={
  local:{name:"Hays area",bounds:[[29.18,-99.4],[30.68,-97.16]],query:"&swlat=29.18&swlng=-99.4&nelat=30.68&nelng=-97.16"},
  texas:{name:"Texas",bounds:[[25.70,-106.68],[36.57,-93.48]],query:"&place_id=18"}
 };
 let leafletPromise=null, active=null;
 const taxonCache=new Map();
 function child(tag,cls,text){
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined)el.textContent=text;
  return el;
 }
 function leaflet(){
  if(window.L?.map)return Promise.resolve(window.L);
  if(leafletPromise)return leafletPromise;
  leafletPromise=new Promise((resolve,reject)=>{
   const css=document.createElement("link");
   css.rel="stylesheet";css.href=LEAFLET_CSS;
   css.integrity=LEAFLET_CSS_HASH;css.crossOrigin="anonymous";
   css.onload=()=>resolve();
   css.onerror=()=>reject(new Error("Map stylesheet could not load"));
   document.head.append(css);
  }).then(()=>new Promise((resolve,reject)=>{
   const script=document.createElement("script");
   script.src=LEAFLET_JS;script.async=true;
   script.integrity=LEAFLET_JS_HASH;script.crossOrigin="anonymous";
   script.onload=()=>window.L?.map?resolve(window.L):reject(new Error("Leaflet unavailable"));
   script.onerror=()=>reject(new Error("Map library could not load"));
   document.head.append(script);
  })).catch(error=>{leafletPromise=null;throw error});
  return leafletPromise;
 }
 function norm(name){
  return String(name||"").toLowerCase().replace(/×/g,"x").replace(/\s+/g," ").trim();
 }
 async function exactTaxon(name){
  if(taxonCache.has(name))return taxonCache.get(name);
  const request=(async()=>{
   // Never substitute a genus or an unrelated search result. For hybrids and
   // taxonomic splits that iNat handles differently, keep the map unresolved.
   const r=await fetch(INAT_API+"/taxa?q="+encodeURIComponent(name)+"&per_page=30&is_active=true",
    {mode:"cors"});
   if(!r.ok)throw new Error("iNaturalist taxon lookup unavailable");
   const j=await r.json();
   const matches=Array.isArray(j.results)?j.results:[];
   const hit=matches.find(t=>norm(t.name)===norm(name)&&
    ["species","hybrid","subspecies","variety","form"].includes(t.rank));
   return hit&&Number.isInteger(hit.id)?hit:null;
  })();
  taxonCache.set(name,request);
  try{return await request}catch(err){taxonCache.delete(name);throw err}
 }
 function observationUrl(name,id,scope){
  const u=new URL("https://www.inaturalist.org/observations");
  if(Number.isInteger(id))u.searchParams.set("taxon_id",String(id));
  else u.searchParams.set("taxon_name",name);
  u.searchParams.set("subview","map");
  u.searchParams.set("verifiable","true");
  u.searchParams.set("captive","false");
  if(scope==="texas")u.searchParams.set("place_id","18");
  else{
   const b=REGIONS.local.bounds;
   u.searchParams.set("place_id","18");
   u.searchParams.set("swlat",String(b[0][0]));
   u.searchParams.set("swlng",String(b[0][1]));
   u.searchParams.set("nelat",String(b[1][0]));
   u.searchParams.set("nelng",String(b[1][1]));
  }
  return u.href;
 }
 function close(){
  if(!active)return;
  active.closed=true;
  if(active.countAbort)active.countAbort.abort();
  if(active.map){active.map.remove();active.map=null}
  active=null;
 }
 async function updateCount(view){
  if(view.closed||!Number.isInteger(view.taxonId))return;
  view.countAbort?.abort();
  const ctrl=new AbortController();view.countAbort=ctrl;
  const scope=view.scope;
  view.count.textContent="Looking up "+REGIONS[scope].name+" observation count…";
  const query=INAT_API+"/observations?taxon_id="+view.taxonId+
   "&verifiable=true&captive=false&per_page=1"+REGIONS[scope].query;
  try{
   const res=await fetch(query,{mode:"cors",signal:ctrl.signal});
   if(!res.ok)throw new Error("iNaturalist count unavailable");
   const json=await res.json();
   if(view.closed||ctrl.signal.aborted||view.scope!==scope)return;
   const n=Number(json.total_results);
   view.count.textContent=Number.isFinite(n)?
    n.toLocaleString()+" verifiable observation"+(n===1?"":"s")+" in "+REGIONS[scope].name+
     (scope==="local"?" viewing window":""):
    "Observation count unavailable";
  }catch(e){
   if(!view.closed&&!ctrl.signal.aborted)view.count.textContent=
    "Observation count unavailable; use the iNaturalist link.";
  }
 }
 function setScope(view,scope){
  if(view.closed||!REGIONS[scope])return;
  view.scope=scope;
  for(const [key,button] of Object.entries(view.buttons))
   button.setAttribute("aria-pressed",String(key===scope));
  view.link.href=observationUrl(view.species.scientific,view.taxonId,scope);
  if(view.map)view.map.fitBounds(REGIONS[scope].bounds,{padding:[10,10],animate:false});
  updateCount(view);
 }
 async function mount(species,host){
  close();
  const view={species,closed:false,scope:"local",taxonId:null,map:null,countAbort:null};
  active=view;
  host.replaceChildren();
  const intro=child("p","inat-note",
   "Community observations, not proven native range. Locations may be obscured, identifications may be wrong, and no dots does not mean absent. BONAP is used separately for county nativity.");
  const controls=child("div","inat-controls");
  const local=child("button","inat-choice","Hays area");
  const texas=child("button","inat-choice","All Texas");
  local.type="button";texas.type="button";
  const count=child("div","inat-status","Finding the exact iNaturalist taxon…");
  count.setAttribute("role","status");count.setAttribute("aria-live","polite");
  const mapEl=child("div","inat-map");
  mapEl.setAttribute("role","img");
  mapEl.setAttribute("aria-label","Interactive map of reported iNaturalist grass observations");
  const link=child("a","inat-external","Explore observations on iNaturalist");
  link.href=observationUrl(species.scientific,null,"local");
  link.target="_blank";link.rel="noopener noreferrer";
  const attribution=child("p","inat-caption",
   "Hays area is an approximate central-Texas viewing rectangle, not an exact county filter. Showing public verifiable wild-observation reports (Research Grade and Needs ID), not a surveyed distribution.");
  controls.append(local,texas);
  host.append(intro,controls,count,mapEl,link,attribution);
  Object.assign(view,{count,mapEl,link,buttons:{local,texas}});
  local.addEventListener("click",()=>setScope(view,"local"));
  texas.addEventListener("click",()=>setScope(view,"texas"));
  try{
   const taxon=await exactTaxon(species.scientific);
   if(view.closed)return;
   if(!taxon){
    count.textContent="No exact matching active iNaturalist taxon found for "+
     species.scientific+". Open iNaturalist to inspect its current name or synonym.";
    mapEl.hidden=true;
    return;
   }
   view.taxonId=taxon.id;
   const L=await leaflet();
   if(view.closed)return;
   const map=L.map(mapEl,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true,
    maxZoom:16,minZoom:4});
   view.map=map;
   L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
   }).addTo(map);
   L.tileLayer(TILE_BASE+"?taxon_id="+encodeURIComponent(taxon.id)+
    "&place_id=18&verifiable=true&captive=false&color=F07039",{
     tileSize:512,zoomOffset:-1,maxZoom:16,opacity:0.85,
     attribution:'Occurrences: <a href="https://www.inaturalist.org/">iNaturalist</a>'
   }).addTo(map);
   setScope(view,"local");
   // A dialog has just opened; let Leaflet measure its actual dimensions.
   requestAnimationFrame(()=>{if(!view.closed&&view.map)view.map.invalidateSize()});
  }catch(e){
   if(view.closed)return;
   count.textContent="Map could not load. Open these observations on iNaturalist instead.";
   mapEl.hidden=true;
   link.href=observationUrl(species.scientific,view.taxonId,"local");
  }
 }
 window.HaysINatObservationMap={mount,close};
})();
