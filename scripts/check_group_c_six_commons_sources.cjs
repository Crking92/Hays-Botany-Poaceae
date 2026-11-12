#!/usr/bin/env node
'use strict';
// Chat 4 read-only metadata + gallery-source collision gate.
// NO photo assets downloaded, installed or modified. This checks Commons-provided
// original SHA-1 metadata, NOT SHA-1 independently recomputed from file bytes.
// Only Chat 2 publishes. See GitHub Issue #70 for source/license/ID holds.
const fs=require('node:fs'),path=require('node:path');
const images=[
 {species:'Briza minor',name:'Briza_minor_plant1_(6829036782)_(2).jpg',creator:'Harry Rose',license:'CC BY 2.0',sha:'4fa481addf1c1ae1eca6a820d103723dea24cebd',role:'whole flowering plant'},
 {species:'Briza minor',name:'Briza_minor_ligule1_(6975160643)_(2).jpg',creator:'Harry Rose',license:'CC BY 2.0',sha:'661b2dd0989e905b3952d463fc18d0d40ff4e50e',role:'opened membranous ligule'},
 {species:'Briza minor',name:'Briza_minor_spikelet1_(6975159719)_(2).jpg',creator:'Harry Rose',license:'CC BY 2.0',sha:'ca3b28ff9b19cdf0f4a16dd828df895b6f82dd50',role:'layered triangular spikelets'},
 {species:'Setaria leucopila',name:'Setaria_leucopila_-_Flickr_-_aspidoscelis_(1).jpg',creator:'Patrick Alexander',license:'CC0 1.0',sha:null,role:'dry flowering bunches'},
 {species:'Setaria leucopila',name:'Setaria_leucopila_-_Flickr_-_aspidoscelis_(5).jpg',creator:'Patrick Alexander',license:'CC0 1.0',sha:null,role:'green leafy clump'},
 {species:'Eragrostis superba',name:'Starr_040723-9007_Eragrostis_superba.jpg',creator:'Forest & Kim Starr',license:'CC BY 3.0',sha:'52b22dab4b4848936e3ac4d4cae56f97e1cb5266',role:'uprooted crown, roots and foliage'}
];
const fmt=s=>String(s||'').normalize('NFKC').replace(/^File:/i,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const loose=s=>String(s||'').toLowerCase().replace(/&amp;/g,'&').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const stripU=s=>{try{return decodeURIComponent(String(s||''))}catch{return String(s||'')}};
const commonsBase=s=>{const t=stripU(s);const i=t.match(/(?:File:|Special:FilePath\/)([^?&#]+)/i);return i?fmt(i[1]):null;};
const refs=[];
const manifest=JSON.parse(fs.readFileSync('site/visual-key-lab/hays-candidates.json','utf8'));
for(const c of manifest.candidates||[])for(const p of c.approved_gallery||[])refs.push({source:'provisional',species:c.id,filename:p.image_filename,page:p.source_page||'',src:p.src||''});
for(const f of ['species-a.json','species-b.json','species-c1.json','species-c2.json','species-c3.json','species-d1.json','species-d2.json','species-d3.json','species-d4.json']){
 const p=path.join('site/visual-key-lab',f);if(!fs.existsSync(p))continue;
 const v=JSON.parse(fs.readFileSync(p,'utf8'));
 const arr=Array.isArray(v)?v:Array.isArray(v.species)?v.species:[];
 for(const c of arr)for(const im of c.photos||[])refs.push({source:'scored',species:c.id,filename:im.image_filename||'',page:im.source_page||'',src:im.src||''});
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function api(){
 const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',prop:'imageinfo',iiprop:'url|size|sha1|mime|extmetadata',titles:images.map(x=>'File:'+x.name).join('|'),redirects:'1'});
 const url='https://commons.wikimedia.org/w/api.php?'+params;
 for(let attempt=1;attempt<=3;attempt++){
  if(attempt>1)await sleep(7500*attempt);
  try {
   const resp=await fetch(url,{headers:{'User-Agent':'HaysBotanyGroupCPhotoAudit/1.0 (Crking92/Hays-Botany-Poaceae)','Accept':'application/json'},signal:AbortSignal.timeout(30000)});
   if(resp.status===429){console.log('COMMONS_RATE_LIMIT',attempt);continue}
   if(!resp.ok)throw Error('Commons HTTP '+resp.status);
   return await resp.json();
  }catch(e){console.log('COMMONS_FETCH_RETRY',attempt,String(e.message||e));}
 }
 throw Error('Commons API unavailable after three bounded attempts; RETAIN HOLDS (not an identity/license failure).');
}
async function main(){
 const res=await api();
 const pages=new Map((res.query?.pages||[]).filter(x=>x.title).map(p=>[fmt(p.title),p]));
 const hashes=new Map(),entries=[];
 let errors=0;
 for(const x of images){
  const p=pages.get(fmt(x.name)),info=p?.imageinfo?.[0]||null;
  const evidence=info?.extmetadata||{};
  const displayLicense=loose(evidence.LicenseShortName?.value||evidence.License?.value);
  const author=loose(evidence.Artist?.value);
  const other=refs.filter(y=>fmt(y.filename)===fmt(x.name)||[y.src,y.page].some(u=>commonsBase(u)===fmt(x.name)));
  const sourceSha=info?.sha1||null,hashDuplicate=sourceSha?hashes.get(sourceSha)||null:null;
  if(sourceSha)hashes.set(sourceSha,x.name);
  const okFile=Boolean(info?.url&&sourceSha&&info.size&&info.mime?.startsWith('image/'));
  const okHash=!x.sha||x.sha===sourceSha;
  const licenseNormalized=displayLicense.toLowerCase().replace(/\s+/g,' ');
  const wanted=x.license.toLowerCase();
  const okLicense=Boolean(licenseNormalized&&(licenseNormalized.includes(wanted)||(wanted==='cc0 1.0'&&licenseNormalized.includes('cc0'))));
  const record={species:x.species,name:x.name,expected_creator:x.creator,expected_license:x.license,source_artist_html_stripped:author.slice(0,320),
   source_license_short_name:displayLicense,source_license_url:evidence.LicenseUrl?.value||null,
   source_original_url:info?.url||null,source_original_size:info?.size||null,source_metadata_sha1:sourceSha,expected_original_sha1:x.sha,
   source_sha_matches_previous_record:okHash,license_metadata_consistent:okLicense,actual_binary_sha_recomputed:false,
   source_metadata_usable:okFile,source_hash_duplicate_within_six:hashDuplicate,
   current_provisional_or_scored_gallery_source_collisions:other,role_prior_inspection:x.role,
   publisher_gate:'Chat2 independently inspect image identity/license + binary hash vs archives, install with credited original source; Chat1 verify actual Pages pixels and credits'};
  if(!okFile||!okHash||!okLicense||hashDuplicate)errors++;
  console.log('GROUP_C_SOURCE',JSON.stringify(record));
  entries.push(record);
 }
 const summary={audited:images.length,source_file_metadata_resolved:entries.filter(x=>x.source_metadata_usable).length,
  source_license_metadata_consistent:entries.filter(x=>x.license_metadata_consistent).length,
  source_sha_matches_previous_records:entries.filter(x=>x.source_sha_matches_previous_record).length,
  within_batch_source_hash_duplicates:entries.filter(x=>x.source_hash_duplicate_within_six).length,
  already_configured_photo_source_matches:entries.reduce((a,x)=>a+x.current_provisional_or_scored_gallery_source_collisions.length,0),
  existing_configured_photo_refs_scanned:refs.length,original_binary_bytes_hashed:0,
  note:'Six source records checked via one Commons API request. This does NOT grant species-ID confirmation, verify original binary downloads or establish 6 live gallery additions.',
  errors};
 const report={summary,files:entries};
 fs.mkdirSync('qa-report',{recursive:true});
 fs.writeFileSync('qa-report/group-c-six-source-metadata.json',JSON.stringify(report,null,2)+'\n');
 console.log('GROUP_C_SUMMARY',JSON.stringify(summary));
 if(errors)process.exitCode=1;
}
main().catch(e=>{console.error('GROUP_C_GATE_ERROR',e.message||String(e));process.exitCode=1});
