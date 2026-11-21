#!/usr/bin/env node
/* Public read-only iNaturalist live smoke; 3 requests, no scraping/downloads. */
"use strict";
const assert=require("node:assert/strict");
const ac=AbortSignal.timeout(18000);
async function get(url){
 const res=await fetch(url,{signal:ac,headers:{"Accept":"application/json,image/png"}});
 if(![200,204].includes(res.status))throw Error("iNaturalist HTTP "+res.status+" for "+url);
 return res;
}
(async()=>{
 const taxonRes=await get("https://api.inaturalist.org/v1/taxa?q=Bouteloua%20curtipendula&per_page=30&is_active=true");
 const taxa=await taxonRes.json();
 const taxon=(taxa.results||[]).find(x=>x.name==="Bouteloua curtipendula"&&x.rank==="species");
 assert(Number.isInteger(taxon?.id),"An exact iNaturalist species ID must be present");
 const countUrl="https://api.inaturalist.org/v1/observations?taxon_id="+taxon.id+
  "&verifiable=true&captive=false&place_id=18&per_page=1";
 const obsRes=await get(countUrl);
 const obs=await obsRes.json();
 assert(Number.isInteger(obs.total_results),"iNaturalist occurrence count should be numeric");
 const tileUrl="https://tiles.inaturalist.org/v1/points/5/7/13.png?taxon_id="+
  taxon.id+"&place_id=18&verifiable=true&captive=false&color=F07039";
 const tile=await get(tileUrl);
 if(tile.status===200)assert.match(tile.headers.get("content-type")||"",/image\/png/);
 console.log("PASS iNaturalist live API: exact taxon",taxon.id,
  "Texas observations",obs.total_results,"512px tile HTTP",tile.status);
})().catch(e=>{console.error("FAIL iNaturalist live smoke:",e.message);process.exitCode=1});
