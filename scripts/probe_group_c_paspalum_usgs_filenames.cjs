#!/usr/bin/env node
'use strict';
// One-shot READ-ONLY official USGS Plants of Louisiana source proof.
// Exact photo filenames and per-file author/affiliation come from embedded
// var files = [...] JSON in its Paspalum langei species page HTML.
// Retrieve full media only into temporary memory to compute original SHA1.
// NO photo assets or shared galleries are modified or committed.
const fs=require('node:fs'),crypto=require('node:crypto');
const speciesUrl='https://warcapps.usgs.gov/PlantID/Species/Details/3514';
const base='https://warcapps.usgs.gov';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchResource(u,accept){
 let last;
 for(let attempt=1;attempt<=2;attempt++){
  if(attempt>1)await pause(3000);
  try{
   const resp=await fetch(u,{headers:{'User-Agent':'HaysBotany-USGS-SpeciesPhotoEvidence/1.0 (Crking92/Hays-Botany-Poaceae)','Accept':accept},signal:AbortSignal.timeout(35000)});
   if(!resp.ok)throw Error('HTTP '+resp.status);
   return resp;
  }catch(e){last=e}
 }
 throw Error('Official source request failed after bounded attempts: '+String(last?.message||last));
}
async function main(){
 const response=await fetchResource(speciesUrl,'text/html'),html=await response.text();
 const match=html.match(/\bvar\s+files\s*=\s*(\[[\s\S]*?\]);/i);
 if(!match)throw Error('Official species HTML no longer exposes var files JSON. HOLD other image files; never guess.');
 const files=JSON.parse(match[1]);
 if(!Array.isArray(files)||files.length<2)throw Error('Official source file array missing/empty; hold additional references.');
 const records=[];let mediaVerified=0;
 for(const f of files){
  const file=String(f.ImagePath||f.Filename||'');
  const filename=String(f.Filename||f.ImagePath||'');
  const person=String(f.Photographer||'');
  const affiliation=String(f.Affiliation||'');
  const correctNames=file===filename;
  const officialCredit=person==='Larry Allain' && affiliation==='U.S. Geological Survey';
  const url=new URL('/PlantID/Image/GivenFile',base);
  url.searchParams.set('file',file);
  url.searchParams.set('id','3514');
  const datum={file,filename,photographer:person,affiliation,official_same_filename_and_imagepath:correctNames,
   official_USGS_authored_credit:officialCredit,official_media_url:url.href,status:null,mime:null,source_original_bytes:null,
   independently_computed_sha1:null,usable_original_media:false,role_from_name:/_infl\b/i.test(file)?'inflorescence candidate':/_leaf\b/i.test(file)?'leaf / sheath candidate':'unclassified'};
  try{
   const img=await fetchResource(url.href,'image/jpeg,image/*;q=0.9');
   const mime=img.headers.get('content-type')||'';
   const bytes=Buffer.from(await img.arrayBuffer());
   datum.status=img.status;datum.mime=mime;datum.source_original_bytes=bytes.byteLength;
   datum.independently_computed_sha1=crypto.createHash('sha1').update(bytes).digest('hex');
   datum.usable_original_media=mime.toLowerCase().includes('image/')&&bytes.byteLength>1000;
   if(datum.usable_original_media)mediaVerified++;
  }catch(e){datum.source_access_hold=String(e.message||e)}
  records.push(datum);
  console.log('USGS_IMAGE',JSON.stringify(datum));
 }
 const expected=['Paspalum Langei_infl 1.JPG','Paspalum Langei_infl 2.JPG','Paspalum Langei_infl 3.JPG','Paspalum Langei_leaf 2.JPG','Paspalum Langei_leaf 5.JPG'];
 const present=expected.every(n=>records.some(x=>x.file===n));
 const distinctSHA=new Set(records.filter(x=>x.independently_computed_sha1).map(x=>x.independently_computed_sha1)).size;
 const summary={source:speciesUrl,source_http:200,exact_source_file_records:records.length,
  expected_all_five_exact_names_in_official_html:present,
  names:records.map(x=>x.file),individual_USGS_artist_credit_records:records.filter(x=>x.official_USGS_authored_credit).length,
  original_image_http_verified:mediaVerified,source_original_shas_unique:distinctSHA===mediaVerified,
  independently_hashed_original_images:mediaVerified,
  previously_published_photo:'Paspalum Langei_infl 3.JPG',
  image_pixels_botanically_inspected_by_human:false,
  rights_caveat:'USGS-authored federal work is generally public domain, but each image must be individually checked for explicit third-party restrictions. This JSON has individual Larry Allain/USGS labels from source. No species ID approval.',
  action:'Chat2 visually inspect exact five images and source credit/PD evidence, dedupe against entire historical library by computed SHA, install distinct new roles, Chat1 verify live pixels and credits.'};
 fs.mkdirSync('qa-report',{recursive:true});
 fs.writeFileSync('qa-report/paspalum-langei-usgs-source.json',JSON.stringify({summary,images:records},null,2)+'\n');
 console.log('USGS_PROVENANCE_SUMMARY',JSON.stringify(summary));
 if(!present||mediaVerified!==records.length||!summary.source_original_shas_unique||!records.every(x=>x.official_USGS_authored_credit))process.exitCode=1;
}
main().catch(e=>{console.error('USGS_SOURCE_ACCESS_HOLD',String(e.message||e));process.exitCode=1});
