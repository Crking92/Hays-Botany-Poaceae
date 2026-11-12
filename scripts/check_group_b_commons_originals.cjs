#!/usr/bin/env node
'use strict';
/*
 * Group B read-only original-file prepublication gate.
 * Only exact Wikimedia Commons originals previously license-reviewed in
 * Group B PRs #141/#146/#152/#159. No new photo candidates or publication.
 */
const fs=require('node:fs');
const crypto=require('node:crypto');
const entries=[
  ['Dichanthelium acuminatum','Dichanthelium_acuminatum_1120323.jpg','James H. Miller & Ted Bodner','CC BY 3.0 US'],
  ['Dichanthelium acuminatum','Dichanthelium_acuminatum_NRCS-1.jpg','Robert H. Mohlenbrock','US Government PD'],
  ['Dichanthelium acuminatum','Dichanthelium_acuminatum_NRCS-2.jpg','Robert H. Mohlenbrock','US Government PD'],
  ['Nassella tenuissima','Nassella_tenuissima.jpg','Stan Shebs','CC BY-SA 3.0'],
  ['Nassella tenuissima','Nassella_tenuissima_sl6.jpg','Stefan.lefnaer','CC BY-SA 4.0'],
  ['Nassella tenuissima','Nassella_tenuissima_1.jpg','Drew Avery','CC BY 2.0'],
  ['Nassella tenuissima','Nassella_tenuissima_sl44.jpg','Stefan.lefnaer','CC BY-SA 4.0'],
  ['Digitaria californica','Digitaria_californica_-_Flickr_-_aspidoscelis_(2).jpg','Patrick Alexander','CC0 1.0'],
  ['Digitaria californica','Digitaria_californica_-_Flickr_-_aspidoscelis_(3).jpg','Patrick Alexander','CC0 1.0'],
  ['Digitaria californica','Digitaria_californica_-_Flickr_-_aspidoscelis_(1).jpg','Patrick Alexander','CC0 1.0'],
  ['Janochloa antidotalis','Starr_050518-1617_Panicum_antidotale.jpg','Forest & Kim Starr','CC BY 3.0'],
  ['Janochloa antidotalis','Starr-141025-2470-Panicum_antidotale-seedhead_and_leaves-Kawela_Bridge-Molokai_(25129502752).jpg','Forest & Kim Starr','CC BY 3.0 US'],
  ['Janochloa antidotalis','Starr-141025-2486-Panicum_antidotale-seeds-Kawela_Bridge-Molokai_(24880132189).jpg','Forest & Kim Starr','CC BY 3.0 US'],
  ['Stapfochloa canterae','Chloris_canterae_(20666772411).jpg','Dick Culbert','CC BY 2.0'],
  ['Stapfochloa canterae','Chloriscanterai.jpg','Jose Hernandez / USDA-ARS','US Government PD'],
];
const pairs=entries.map(([species,filename,author,license])=>({species,filename,author,license}));
const ua='HaysBotanyPoaceae/1.0 (original-photo source and license prepublication audit; GitHub repository Crking92/Hays-Botany-Poaceae)';
const MAX_BYTES=24*1024*1024;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
async function getJson(url) {
 const r=await fetch(url,{headers:{'User-Agent':ua,'Accept':'application/json'},signal:AbortSignal.timeout(23000)});
 if(!r.ok)throw new Error('MediaWiki HTTP '+r.status);
 return r.json();
}
async function hashUrl(url) {
 const r=await fetch(url,{headers:{'User-Agent':ua,'Accept':'image/*'},signal:AbortSignal.timeout(38000)});
 if(!r.ok)throw new Error('FILE_HTTP_'+r.status);
 const media=r.headers.get('content-type')||'';
 const length=Number(r.headers.get('content-length')||0);
 if(length>MAX_BYTES) throw new Error('ORIGINAL_TOO_BIG_'+length);
 if(!r.body)throw new Error('NO_FILE_BODY');
 const sha1=crypto.createHash('sha1'),sha256=crypto.createHash('sha256');
 let n=0;
 for await(const part of r.body){
   n+=part.length;
   if(n>MAX_BYTES){await r.body.cancel();throw new Error('ORIGINAL_EXCEEDS_24MB');}
   sha1.update(part);sha256.update(part);
 }
 return {n,media,sha1:sha1.digest('hex'),sha256:sha256.digest('hex')};
}
const main=async()=>{
 const manifest=JSON.parse(fs.readFileSync('site/visual-key-lab/hays-candidates.json','utf8')).candidates;
 const approved=manifest.flatMap(s=>(s.approved_gallery||[]).map(p=>({species:s.scientific,filename:p.image_filename||'',src:p.src||'',page:p.source_page||''})));
 let collisions=0,verified=0,failed=0,uniqueHashes=new Set();
 const galleryNames=new Set(approved.map(p=>normalize(p.filename)));
 console.log('AUDIT_MODE=READ_ONLY; does not grant photo ID approval, change image attribution, or publish gallery');
 for(let i=0;i<pairs.length;i++){
  const p=pairs[i];
  const title='File:'+p.filename;
  try{
   const api='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|size|sha1|mime',titles:title,redirects:'1'});
   const json=await getJson(api);
   const page=Object.values(json.query?.pages||{})[0];
   const info=page?.imageinfo?.[0];
   if(!info?.url)throw new Error('COMMONS_ORIGINAL_NOT_RESOLVED');
   const payload=await hashUrl(info.url);
   const normalizeFromCommons=normalize(page.title?.replace(/^File:/,''));
   const short=normalize(p.filename);
   const alreadyGallery=galleryNames.has(short)||approved.some(x=>x.src.includes(p.filename)||x.page.includes(p.filename));
   if(alreadyGallery)collisions++;
   const sourceHash=info.sha1||null;
   const shaMatches=!sourceHash || sourceHash.toLowerCase()===payload.sha1.toLowerCase();
   const duplicateWithinBatch=uniqueHashes.has(payload.sha256);
   uniqueHashes.add(payload.sha256);
   verified++;
   console.log('ORIGINAL '+JSON.stringify({
    species:p.species,filename:p.filename,commons_filename:page.title,photographer:p.author,
    recorded_license:p.license,commons_page:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(page.title.replace(/ /g,'_')),
    original_url:info.url,mime:payload.media,bytes:payload.n,
    sha1:payload.sha1,sha256:payload.sha256,commons_metadata_sha1:sourceHash,
    source_sha1_matches:shaMatches,filename_equals_commons:normalizeFromCommons===short,
    already_in_current_gallery:alreadyGallery,duplicate_original_hash_within_group:duplicateWithinBatch,
    status:shaMatches&&!alreadyGallery&&!duplicateWithinBatch?'ORIGINAL_BYTES_ACCESSIBLE_PENDING_VISUAL_AND_CREDIT_QA':'HOLD_CHECK'
   }));
  }catch(err){
   failed++;console.log('FAILED '+JSON.stringify({species:p.species,filename:p.filename,error:String(err.message||err)}));
  }
  if(i!==pairs.length-1) await sleep(320);
 }
 console.log('AUDIT_SUMMARY '+JSON.stringify({
   reviewed:pairs.length,downloaded_and_hashed:verified,unresolved_source:failed,
   existing_gallery_filename_hits:collisions,distinct_original_sha256:uniqueHashes.size,
   next:'Sole photo publisher must visually validate original image content, exact license/creator and Hays/nonlocal context, then install and verify live Pages pixels and credit. Never treat source hash as botanical ID.'
 }));
 if(failed)process.exitCode=1;
};
main().catch(e=>{console.error('fatal',e);process.exitCode=1});
