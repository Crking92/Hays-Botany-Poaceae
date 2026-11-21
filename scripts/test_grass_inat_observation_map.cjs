#!/usr/bin/env node
/* Offline deterministic QA for Hays Grass ID Lab iNaturalist occurrence maps.
 * Does not call live iNaturalist services or make any rights/nativity claims.
 */
"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const js=fs.readFileSync("site/visual-key-lab/inat-observation-map.js","utf8");
const html=fs.readFileSync("site/visual-key-lab/index.html","utf8");
const css=fs.readFileSync("site/visual-key-lab/inat-observation-map.css","utf8");
new vm.Script(js,{filename:"inat-observation-map.js"});
assert.match(html,/inat-observation-map\.js/);
assert.match(html,/inat-observation-map\.css/);
assert.match(html,/window\.HaysINatObservationMap\.mount\(s,inatPanel\)/);
assert.match(html,/addEventListener\("close",\(\)=>window\.HaysINatObservationMap\?\.close\(\)\)/);
assert.match(css,/inat-map/);
const calls=[],tiles=[],maps=[];
class MockElement{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attrs={};this.handlers={};this.textContent="";this.hidden=false}
 append(...x){this.children.push(...x)}
 replaceChildren(...x){this.children=x}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(event,fn){this.handlers[event]=fn}
}
let context;
const document={
 createElement(tag){return new MockElement(tag)},
 head:{append(el){
  Promise.resolve().then(()=>{
   if(el.tagName==="LINK")el.onload();
   else if(el.tagName==="SCRIPT"){context.window.L=leaflet;el.onload()}
  });
 }}
};
const leaflet={
 map(el,opts){
  const map={el,opts,fitBounds(bounds){this.bounds=bounds},invalidateSize(){this.invalidated=true},remove(){this.removed=true}};
  maps.push(map);return map;
 },
 tileLayer(url,options){tiles.push({url,options});return {addTo(map){this.map=map;return this}}},
};
async function fakeFetch(url){
 calls.push(url);
 if(url.includes("/taxa?")){
  const q=new URL(url).searchParams.get("q");
  const t=q==="Bouteloua curtipendula"?
   [{id:123456,name:q,rank:"species"}]:[{id:1,name:"Bouteloua",rank:"genus"}];
  return {ok:true,json:async()=>({results:t})};
 }
 if(url.includes("/observations?"))
  return {ok:true,json:async()=>({total_results:42})};
 throw Error("Unexpected request "+url);
}
context={window:{},document,fetch:fakeFetch,URL,requestAnimationFrame:fn=>fn(),
 AbortController,console};
vm.runInNewContext(js,context,{filename:"inat-observation-map.js"});
const api=context.window.HaysINatObservationMap;
assert.equal(typeof api.mount,"function");
assert.equal(calls.length,0,"Do not fetch anything before a species is opened");
(async()=>{
 const host=new MockElement("section");
 await api.mount({id:"bouteloua-curtipendula",scientific:"Bouteloua curtipendula"},host);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(maps.length,1);
 assert.equal(maps[0].bounds[0][0],29.18);
 assert.equal(tiles.length,2);
 assert.match(tiles[1].url,/taxon_id=123456/);
 assert.match(tiles[1].url,/place_id=18/);
 assert.equal(tiles[1].options.tileSize,512);
 assert.equal(tiles[1].options.zoomOffset,-1);
 assert(calls.some(url=>url.includes("swlat=29.18")));
 const texas=host.children.find(x=>x.className==="inat-controls").children[1];
 texas.handlers.click();
 await new Promise(resolve=>setImmediate(resolve));
 assert(calls.some(url=>url.includes("/observations?")&&url.includes("place_id=18")&&!url.includes("swlat=")));
 assert.equal(maps[0].bounds[0][0],25.7);
 const ext=host.children.find(x=>x.className==="inat-external");
 assert.match(ext.href,/taxon_id=123456/);
 assert.match(ext.href,/place_id=18/);
 api.close();
 assert.equal(maps[0].removed,true,"Closing a detail view must clean up map tiles");
 const other=new MockElement("section");
 await api.mount({id:"lolium-x-boucheanum",scientific:"Lolium × boucheanum"},other);
 assert.equal(maps.length,1,"Never auto-substitute a genus or ambiguous hybrid");
 const msg=other.children.find(x=>x.className==="inat-status");
 assert.match(msg.textContent,/No exact matching active/i);
 assert.equal(other.children.find(x=>x.className==="inat-map").hidden,true);
 api.close();
 console.log("PASS inat map QA: lazy API, exact taxa, Hays and Texas views, 512px observation tiles, cleanup, hybrid hold");
})().catch(e=>{console.error(e);process.exitCode=1});
