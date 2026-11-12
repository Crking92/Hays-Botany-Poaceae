#!/usr/bin/env node
'use strict';

// READ-ONLY Group B photo-rights probe. No photo downloads, approvals,
// archive writes, or changes to the canonical gallery/candidate manifest.
const observations = [
  {species:'Pappophorum bicolor', id:136755826},
  {species:'Tridens congestus', id:232038649},
  {species:'Tridens congestus', id:135964547},
  {species:'Stapfochloa ciliata', id:141035831},
  {species:'Stapfochloa ciliata', id:23580302},
  {species:'Tridentopsis elongata', id:377001623},
  {species:'Tridentopsis elongata', id:367070671},
  {species:'Tridentopsis elongata', id:366639842},
  {species:'Eragrostis curtipedicellata', id:82930092},
  {species:'Eragrostis curtipedicellata', id:62485653},
  {species:'Elymus macgregorii', id:314369187},
  {species:'Lolium × boucheanum', id:45834760}
];
const unrestricted = new Set(['cc0','cc-by','cc-by-sa']);
const acceptedOnlyIfGenuinelyNoncommercial = new Set(['cc-by-nc','cc-by-nc-sa']);
const licenseLinks = {
  cc0:'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc-by':'https://creativecommons.org/licenses/by/4.0/',
  'cc-by-sa':'https://creativecommons.org/licenses/by-sa/4.0/',
  'cc-by-nc':'https://creativecommons.org/licenses/by-nc/4.0/',
  'cc-by-nc-sa':'https://creativecommons.org/licenses/by-nc-sa/4.0/'
};
// Note: this lookup contains illustrative current versions, NOT a claim that
// the specific photo's license is version 4.0. Verify version at source.
async function getObservation(id) {
  const url='https://api.inaturalist.org/v1/observations/'+id;
  let lastError;
  for(let attempt=0;attempt<2;attempt++) {
    try {
      const resp=await fetch(url,{
        headers:{Accept:'application/json','User-Agent':'HaysBotanyPhotoSourceAudit/1.0 (noncommercial botanical photo rights research)'},
        signal:AbortSignal.timeout(16000)
      });
      if(!resp.ok) throw new Error('HTTP '+resp.status);
      const json=await resp.json();
      if(!Array.isArray(json.results)||json.results.length!==1) throw new Error('missing single observation');
      return json.results[0];
    } catch(e) {
      lastError=e;
      if(attempt===0) await new Promise(res=>setTimeout(res,1000));
    }
  }
  throw lastError;
}
async function main() {
  const total={observations:0,photos:0,permissivePhotoLicenses:0,noncommercialPhotoLicenses:0,blockedOrMissing:0,failedObservations:0};
  console.log('GROUP_B_PHOTO_PROBE_MODE=READ_ONLY; external observation and photo licenses may differ; do not auto-publish');
  for(const item of observations) {
    try {
      const o=await getObservation(item.id);
      total.observations++;
      const observedTaxon=o.taxon?.name??'UNKNOWN';
      const matches=o.taxon?.name?.toLowerCase()===item.species.toLowerCase();
      const photos=Array.isArray(o.photos)?o.photos:[];
      console.log('OBS '+JSON.stringify({expected:item.species,observedTaxon,taxonNameExactMatch:matches,observation_id:item.id,observation_url:'https://www.inaturalist.org/observations/'+item.id,observer:o.user?.name||o.user?.login||null,quality_grade:o.quality_grade,observed_on:o.observed_on,observation_license:o.license_code,photos_count:photos.length}));
      for(const p of photos) {
        const lc=(p.license_code||'none').toLowerCase();
        const status=unrestricted.has(lc)?'RIGHTS_POSSIBLE_REVIEW_IMAGE_ID':acceptedOnlyIfGenuinelyNoncommercial.has(lc)?'CONDITIONAL_NONCOMMERCIAL_REVIEW':'HOLD_RIGHTS';
        total.photos++;
        if(unrestricted.has(lc))total.permissivePhotoLicenses++;
        else if(acceptedOnlyIfGenuinelyNoncommercial.has(lc))total.noncommercialPhotoLicenses++;
        else total.blockedOrMissing++;
        const record={
          expected:item.species,
          observed_taxon:observedTaxon,
          observation_id:item.id,
          photo_id:p.id,
          photo_page:'https://www.inaturalist.org/photos/'+p.id,
          photo_image_url:p.url||null,
          photo_attribution:p.attribution||null,
          photo_user:p.user?.name||p.user?.login||o.user?.name||o.user?.login||null,
          photo_license_code:lc,
          rights_gate:status,
          note:'License code alone is NOT photo identity, license version, bytes or publisher signoff'
        };
        console.log('PHOTO '+JSON.stringify(record));
      }
    }catch(e){
      total.failedObservations++;
      console.log('OBS_FETCH_FAILED '+JSON.stringify({id:item.id,species:item.species,error:String(e.message||e)}));
    }
  }
  console.log('TOTAL '+JSON.stringify(total));
  for(const s of ['Pappophorum bicolor','Tridens congestus','Stapfochloa ciliata','Tridentopsis elongata','Tridens muticus var. elongatus','Eragrostis curtipedicellata','Elymus macgregorii','Lolium × boucheanum','Lolium boucheanum']) await discoverPermissiveReferencePhotos(s);
  if(total.failedObservations===observations.length)process.exitCode=1;
}

async function discoverPermissiveReferencePhotos(species) {
  const endpoint='https://api.inaturalist.org/v1/observations';
  const params=new URLSearchParams({
    taxon_name:species,photos:'true',quality_grade:'research',
    per_page:'100',photo_license:'cc0,cc-by,cc-by-sa'
  });
  let data;
  try {
    const response=await fetch(endpoint+'?'+params,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(25000)});
    if(!response.ok) throw new Error('HTTP '+response.status);
    data=await response.json();
  } catch(err) {
    console.log('DISCOVERY_FAILED '+JSON.stringify({species,error:String(err.message||err)}));
    return;
  }
  const rows=Array.isArray(data.results)?data.results:[];
  let matchedObservations=0,seenEligible=0,reported=0;
  const seenPeople=new Set();
  for(const o of rows) {
    if(o.taxon?.name?.toLowerCase()!==species.toLowerCase()) continue;
    matchedObservations++;
    for(const p of o.photos||[]) {
      const code=(p.license_code||'none').toLowerCase();
      if(!unrestricted.has(code)) continue;
      seenEligible++;
      const person=p.user?.name||p.user?.login||o.user?.name||o.user?.login||null;
      const key=String(person||'')+'|'+code;
      // Prefer different creators and observation IDs to find varied field views.
      if(reported>=15 || (seenPeople.has(key)&&reported>=8)) continue;
      seenPeople.add(key);
      reported++;
      console.log('OPEN_PHOTO '+JSON.stringify({
        expected:species,observed_taxon:o.taxon?.name,
        observation_id:o.id,observation_url:'https://www.inaturalist.org/observations/'+o.id,
        observation_quality:o.quality_grade,observed_on:o.observed_on,
        photo_id:p.id,photo_page:'https://www.inaturalist.org/photos/'+p.id,
        api_photo_url:p.url||null,photo_creator:person,photo_attribution:p.attribution||null,
        photo_license_code:code,
        status:'RIGHTS_POSSIBLE_ONLY; human actual-pixel ID, original photo license version and archive SHA still required'
      }));
    }
  }
  console.log('DISCOVERY_SUMMARY '+JSON.stringify({
    species,total_available_observations:data.total_results,
    returned_rows:rows.length,exact_species_rows:matchedObservations,
    eligible_cc0_by_sa_photo_count_in_page:seenEligible,source_leads_logged:reported,
    warning:'Searching does not clear any image or change website photo count'
  }));
}

main().catch(e=>{console.error('Fatal photo probe:',e);process.exitCode=1});
