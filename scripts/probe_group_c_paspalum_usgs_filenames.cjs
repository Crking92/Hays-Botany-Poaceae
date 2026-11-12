#!/usr/bin/env node
'use strict';
// Read-only ONE-SHOT attempt to recover EXACT USGS-hosted Paspalum langei
// image filenames from official Plants of Louisiana HTML. No installation.
// Do not guess file names or grant reuse rights from species-level photo captions.
const fs=require('node:fs');
const target='https://warcapps.usgs.gov/PlantID/Species/Details/3514';
const decode=s=>{try{return decodeURIComponent(String(s).replace(/&amp;/g,'&'))}catch{return String(s).replace(/&amp;/g,'&')}};
const uniques=a=>[...new Set(a.filter(Boolean))];
async function main(){
 const response=await fetch(target,{headers:{'User-Agent':'HaysBotanyPoaceaeSourceProbe/1.0 (Crking92/Hays-Botany-Poaceae)','Accept':'text/html'},signal:AbortSignal.timeout(35000)});
 if(!response.ok)throw Error('Official USGS site returned HTTP '+response.status);
 const html=await response.text(),linkedAssets=[];
 for(const m of html.matchAll(/(?:src|href|data-src|data-original|data-full|data-image|ng-src)\s*=\s*(['"])(.*?)\1/gi)){
  const value=decode(m[2]);if(/image|photo|paspalum|carousel|gallery|3514/i.test(value))linkedAssets.push(value);
 }
 const fileParams=uniques([...html.matchAll(/(?:file\s*=\s*|file%3[dD])([^&"'\s<>]+)/gi)].map(m=>decode(m[1].replaceAll('+',' '))));
 const imageURLs=uniques([...html.matchAll(/(?:\/PlantID\/)?Image\/(?:GivenFile|[A-Za-z]+)[^"'\s<>]*/gi)].map(m=>decode(m[0])));
 const filenames=uniques([
  ...fileParams,
  ...linkedAssets.map(v=>{const m=v.match(/[?&]file=([^&]+)/i);return m?decode(m[1].replaceAll('+',' ')):null}),
  ...imageURLs.map(v=>{const m=v.match(/[?&]file=([^&]+)/i);return m?decode(m[1].replaceAll('+',' ')):null})
 ]).filter(v=>/langei/i.test(v));
 const creditMatches=[...html.matchAll(/photo\s+credit\s*:?[^<]{0,240}/gi)].map(x=>x[0].slice(0,230));
 const contextHits=[...html.matchAll(/.{0,200}(?:Paspalum\s*[+_]?\s*Langei|GivenFile|photo credit|Image\/)[^\n]{0,300}/gi)].map(x=>x[0].slice(0,500));
 const result={source:target,html_response_status:response.status,html_length:html.length,
  found_official_site_photo_credit_count:creditMatches.length,credit_snippets:creditMatches.slice(0,12),
  extracted_exact_langei_filenames:filenames,linked_image_asset_urls:linkedAssets.slice(0,45),
  image_endpoint_urls:imageURLs.slice(0,40),file_parameters:fileParams.slice(0,50),
  relevant_html_context:contextHits.slice(0,24),
  expected_existing_one_ref:'Paspalum Langei_infl 3.JPG',
  rights_verification:'Only photos visibly credited to Larry Allain/USGS can be considered USGS-authored; third-party and ambiguous images remain held. Exact image identity/rights/pixels needed before gallery publication.',
  authorizations:'READ_ONLY: this does not install images or certify grass identification, county status or independent copyrights'};
 fs.mkdirSync('qa-report',{recursive:true});
 fs.writeFileSync('qa-report/paspalum-langei-usgs-source.json',JSON.stringify(result,null,2)+'\n');
 console.log('USGS_SOURCE_SUMMARY',JSON.stringify({response:response.status,html_chars:html.length,linked_images:linkedAssets.length,exact_langei_filenames:filenames,credits:creditMatches.length,contexts:contextHits.length}));
 console.log('USGS_SOURCE_ASSETS',JSON.stringify(linkedAssets.slice(0,26)));
 console.log('USGS_SOURCE_IMAGE_CONTEXT',JSON.stringify(contextHits.slice(0,9)));
}
main().catch(e=>{console.error('USGS_SOURCE_ACCESS_HOLD',String(e.message||e));process.exitCode=1});
