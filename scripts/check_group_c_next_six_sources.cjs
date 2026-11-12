#!/usr/bin/env node
'use strict';
// Temporary, READ-ONLY publication preflight for Group C's NEXT six one-photo species.
// Commons-provided SHA1 is source metadata, NOT an independent download/hash.
// Chat2 owns any changes to approved_gallery; this script NEVER publishes.
const fs=require('node:fs'),path=require('node:path');
const targets=[
 {taxon:'Melinis repens',name:'Melinis_repens_head4_(7185571587).jpg',creator:'Harry Rose',license:'CC BY 2.0',sha:null,role:'fluffy flowering panicle'},
 {taxon:'Avena sativa',name:'Avena_sativa_L.jpg',creator:'Henrik Sendelbach',license:'CC BY-SA 3.0',sha:'32afe148dbc82a331e58ffba2f30ccf919c6924c',role:'attached green panicle with leaves'},
 {taxon:'Aegilops cylindrica',name:'Aegilops_cylindrica_(3874100137).jpg',creator:'Matt Lavin',license:'CC BY-SA 2.0',sha:'443f6e1fd98b7cbc19ac510812a54511b1880a70',role:'mature disarticulating seedheads'},
 {taxon:'Phyllostachys aurea',name:'Phyllostachys-écaille-tortue.JPG',creator:'Abrahami',license:'CC BY-SA 3.0',sha:'fa6829e49b4936ef47c8b46b5f320780fc31f33a',role:'compressed lower culm nodes; cultivated plant'},
 {taxon:'Panicum dichotomiflorum',name:'Panicum_dichotomiflorum_plant_(12).jpeg',creator:'stephen',license:'CC BY 4.0',sha:'d85aeafec92d7e802e776e407ba63d03d9603f4f',role:'living sprawling wet-bank vegetative plant'},
 {taxon:'Alopecurus carolinianus',name:'Alopecurus_carolinianus_seeds.jpg',creator:'Steve Hurst / USDA-NRCS',license:'US federal public domain',sha:'53db1cb9ed6efa1fbb0580a3197757e361b26859',role:'separated reproductive structures with 1-mm scale'}
];
const normalize=s=>String(s||'').normalize('NFKC').replace(/^File:/i,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const strip=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const unwrap=s=>{try{return decodeURIComponent(String(s||''))}catch{return String(s||'')}};
const fileURL=s=>{const m=unwrap(s).match(/(?:File:|Special:FilePath\/)([^?&#]+)/i);return m?normalize(m[1]):null};
const refs=[];
const provisional=JSON.parse(fs.readFileSync('site/visual-key-lab/hays-candidates.json','utf8'));
for(const s of provisional.candidates||[])for(const p of s.approved_gallery||[])refs.push({category:'provisional',taxon:s.id,file:p.image_filename||'',page:p.source_page||'',src:p.src||'',sha:p.commons_original_sha1||''});
for(const k of ['a','b','c1','c2','c3','d1','d2','d3','d4']){
 const f=path.join('site','visual-key-lab','species-'+k+'.json');
 const d=JSON.parse(fs.readFileSync(f,'utf8'));
 const arr=Array.isArray(d)?d:d.species||[];
 for(const s of arr)for(const p of s.photos||[])refs.push({category:'scored',taxon:s.id,file:p.image_filename||'',page:p.source_page||'',src:p.src||'',sha:p.commons_original_sha1||''});
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function request(){
 const url=new URL('https://commons.wikimedia.org/w/api.php');
 const prm=new URLSearchParams({action:'query',format:'json',formatversion:'2',prop:'imageinfo',iiprop:'url|size|sha1|mime|extmetadata',titles:targets.map(x=>'File:'+x.name).join('|'),redirects:'1'});
 url.search=prm.toString();
 for(let i=0;i<3;i++){
  if(i)await sleep(i*8000);
  try{
   const response=await fetch(url,{headers:{'User-Agent':'HaysBotanyGroupCSixPhotoPreflight/1.0 (Crking92/Hays-Botany-Poaceae)','Accept':'application/json'},signal:AbortSignal.timeout(30000)});
   if(response.status===429){console.log('COMMONS_API_RATE_LIMIT_ATTEMPT',i+1);continue}
   if(!response.ok)throw Error('Commons API HTTP '+response.status);
   return await response.json();
  }catch(e){console.log('COMMONS_RETRY',i+1,String(e.message||e))}
 }
 throw Error('Commons API request failed after bounded retries; never auto-approve unresolved source rights.');
}
async function main(){
 const api=await request(),pages=new Map((api.query?.pages||[]).filter(x=>x.title).map(x=>[normalize(x.title),x]));
 const hashIndex=new Map(),records=[];let errors=0;
 for(const x of targets){
  const page=pages.get(normalize(x.name)),info=page?.imageinfo?.[0],meta=info?.extmetadata||{};
  const license=strip(meta.LicenseShortName?.value||meta.License?.value||'');
  const artist=strip(meta.Artist?.value||'');
  const exactLicense=x.license==='US federal public domain'
   ? /public domain|pd[-\s]|usgov/i.test(license)
   : (x.license==='CC BY-SA 3.0'&&x.name==='Avena_sativa_L.jpg')
     ? /cc by-sa|attribution.share.alike/i.test(license.toLowerCase()) // file has multi-version BY-SA
     : license.toLowerCase()===x.license.toLowerCase()||(x.license==='CC BY-SA 3.0'&&license.toLowerCase()==='cc by-sa 3.0');
  const idOK=Boolean(info?.url&&info?.sha1&&info?.size>0&&info?.mime?.startsWith('image/'));
  const shaOK=!x.sha||info.sha1===x.sha;
  const collisions=refs.filter(ref=>normalize(ref.file)===normalize(x.name)||fileURL(ref.page)===normalize(x.name)||fileURL(ref.src)===normalize(x.name)||(info?.sha1&&ref.sha===info.sha1));
  const within=info?.sha1?hashIndex.get(info.sha1)||null:null;
  if(info?.sha1)hashIndex.set(info.sha1,x.name);
  const record={taxon:x.taxon,filename:x.name,role_from_prior_visual_review:x.role,
   expected_creator:x.creator,commons_artist:artist.slice(0,300),expected_license:x.license,commons_license:license,commons_license_url:meta.LicenseUrl?.value||'',
   source_page:page?.title?('https://commons.wikimedia.org/wiki/'+encodeURIComponent(page.title.replace(/ /g,'_'))):null,
   source_original_url:info?.url||null,source_bytes:info?.size||null,mime:info?.mime||null,
   commons_source_sha1:info?.sha1||null,prior_reported_source_sha1:x.sha,sha1_agrees_with_prior:shaOK,
   source_metadata_verified:idOK,source_license_metadata_consistent:exactLicense,
   duplicate_source_hash_among_six:within,
   matching_scored_or_provisional_source_refs:collisions,
   original_binary_downloaded_and_independently_hashed:false,
   identity_status:'source-labeled nonlocal photo, NOT locally specimen-certified',
   action:'Chat2 visually verify original, license/artist and archive binary identity then publish; Chat1 verify real Pages image+credits'};
  if(!idOK||!shaOK||!exactLicense||within||collisions.length)errors++;
  records.push(record);console.log('SOURCE_RECORD',JSON.stringify(record));
 }
 const summary={source_records:targets.length,metadata_resolved:records.filter(x=>x.source_metadata_verified).length,
 licenses_consistent:records.filter(x=>x.source_license_metadata_consistent).length,previous_source_SHA_consistent:records.filter(x=>x.sha1_agrees_with_prior).length,
 duplicates_within_six:records.filter(x=>x.duplicate_source_hash_among_six).length,
 duplicate_source_references_in_existing_galleries:records.reduce((n,x)=>n+x.matching_scored_or_provisional_source_refs.length,0),
 existing_gallery_source_references_scanned:refs.length,independent_original_downloads:0,
 license_or_source_failures:errors,
 note:'Source metadata only: not a user-facing installation or proof of local species identity'};
 fs.mkdirSync('qa-report',{recursive:true});
 fs.writeFileSync('qa-report/group-c-next-six-source-metadata.json',JSON.stringify({summary,files:records},null,2)+'\n');
 console.log('SOURCE_SUMMARY',JSON.stringify(summary));
 if(errors)process.exitCode=1;
}
main().catch(e=>{console.error('SOURCE_PREFLIGHT_ERROR',String(e.message||e));process.exitCode=1});
