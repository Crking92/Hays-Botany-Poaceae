#!/usr/bin/env node
'use strict';
// Read-only Commons original-file metadata / duplicate gate for 15
// previously source/license-reviewed Group B images. A previous run
// downloaded and SHA-1-matched two full originals, then Wikimedia
// rate-limited the remaining 13 (HTTP 429). DO NOT repeatedly download
// originals or misstate Commons metadata checks as byte verification.
const fs=require('node:fs');
const photos=[
['Dichanthelium acuminatum','Dichanthelium_acuminatum_1120323.jpg'],
['Dichanthelium acuminatum','Dichanthelium_acuminatum_NRCS-1.jpg'],
['Dichanthelium acuminatum','Dichanthelium_acuminatum_NRCS-2.jpg'],
['Nassella tenuissima','Nassella_tenuissima.jpg'],
['Nassella tenuissima','Nassella_tenuissima_sl6.jpg'],
['Nassella tenuissima','Nassella_tenuissima_1.jpg'],
['Nassella tenuissima','Nassella_tenuissima_sl44.jpg'],
['Digitaria californica','Digitaria_californica_-_Flickr_-_aspidoscelis_(2).jpg'],
['Digitaria californica','Digitaria_californica_-_Flickr_-_aspidoscelis_(3).jpg'],
['Digitaria californica','Digitaria_californica_-_Flickr_-_aspidoscelis_(1).jpg'],
['Janochloa antidotalis','Starr_050518-1617_Panicum_antidotale.jpg'],
['Janochloa antidotalis','Starr-141025-2470-Panicum_antidotale-seedhead_and_leaves-Kawela_Bridge-Molokai_(25129502752).jpg'],
['Janochloa antidotalis','Starr-141025-2486-Panicum_antidotale-seeds-Kawela_Bridge-Molokai_(24880132189).jpg'],
['Stapfochloa canterae','Chloris_canterae_(20666772411).jpg'],
['Stapfochloa canterae','Chloriscanterai.jpg']
];
const normalize=s=>String(s||'').normalize('NFKC').replace(/^File:/i,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function queryMetadata(){
 const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',prop:'imageinfo',
    iiprop:'url|size|sha1|mime',titles:photos.map(p=>'File:'+p[1]).join('|'),redirects:'1'});
 const url='https://commons.wikimedia.org/w/api.php?'+params;
 for(let attempt=0;attempt<3;attempt++){
   if(attempt)await sleep(attempt*9000);
   try{
    const r=await fetch(url,{headers:{'User-Agent':'HaysBotanySourceMetadataAudit/1.0 (repository Crking92/Hays-Botany-Poaceae)','Accept':'application/json'},signal:AbortSignal.timeout(30000)});
    if(r.status===429){console.log('SOURCE_API_RATE_LIMIT '+JSON.stringify({attempt:attempt+1}));continue;}
    if(!r.ok)throw new Error('MediaWiki API HTTP '+r.status);
    return r.json();
   }catch(e){console.log('SOURCE_API_RETRY '+JSON.stringify({attempt:attempt+1,error:String(e.message||e)}));}
 }
 throw new Error('Source API inaccessible after bounded retries. Not a photo/rights failure.');
}
async function main(){
 console.log('MODE=READ_ONLY; Commons ORIGINAL metadata, NOT independent bytes or botanical photo ID');
 const manifest=JSON.parse(fs.readFileSync('site/visual-key-lab/hays-candidates.json','utf8')).candidates;
 const refs=manifest.flatMap(s=>(s.approved_gallery||[]).map(p=>({filename:p.image_filename||'',src:p.src||'',page:p.source_page||''})));
 const json=await queryMetadata();
 const pages=json.query?.pages||[];
 const byName=new Map(pages.filter(p=>p.title).map(p=>[normalize(p.title),p]));
 const hashToFiles=new Map();
 let resolved=0,failed=0,collisions=0,dupHashes=0;
 for(const [species,filename] of photos){
   const page=byName.get(normalize(filename));
   const info=page?.imageinfo?.[0];
   if(!info?.url || !info.sha1){failed++;console.log('SOURCE_MISSING '+JSON.stringify({species,filename,reason:page?.missing?'Commons file missing':'Imageinfo unavailable'}));continue;}
   resolved++;
   const inGallery=refs.some(p=>normalize(p.filename)===normalize(filename) ||
        p.src.includes(filename)||p.page.includes(filename));
   if(inGallery)collisions++;
   const prior=hashToFiles.get(info.sha1);
   if(prior)dupHashes++;
   hashToFiles.set(info.sha1,filename);
   console.log('SOURCE_METADATA '+JSON.stringify({
     species,filename,commons_page:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(page.title.replace(/ /g,'_')),
     source_original_url:info.url,source_original_bytes:info.size,
     mime:info.mime,source_metadata_sha1:info.sha1,
     source_hash_duplicate_in_batch:prior||null,currently_in_approved_gallery:inGallery,
     interpretation:'Source-authoritative metadata only; independent original byte/hash validation pending on publisher retrieval'
   }));
 }
 console.log('AUDIT_SUMMARY '+JSON.stringify({
   total:photos.length,source_metadata_resolved:resolved,source_metadata_failed:failed,
   exact_filename_source_collisions:collisions,duplicate_metadata_sha1:dupHashes,
   previous_run_independently_hashed_originals:2,
   previous_run_remaining_429_rate_limited:13,
   action:'Publisher visually confirms source photo identity, license/creator, full original SHA and image uniqueness then installs legal refs and verifies live Pages pixels/credits'
 }));
 if(failed)process.exitCode=1;
}
main().catch(e=>{console.error('SOURCE_CHECK_FAILED',String(e.message||e));process.exitCode=1});
