'use strict';
/* Public-website gallery acceptance guard; legal source detail stays in original audit. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'../site/visual-key-lab');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'hays-candidates.json'),'utf8'));
const expected = {
 'bothriochloa-bladhii': 3,
 'dichanthium-aristatum': 2,
 'bromus-brevis': 2,
 'cortaderia-selloana': 2,
 'rostraria-cristata': 1,
 'megathyrsus-maximus': 3
};
assert.equal(manifest.candidates.length,57);
const refs=[],origins=new Set();
for(const c of manifest.candidates)for(const p of c.approved_gallery||[]){
 assert.equal(p.source_species_id,c.id,'Photo filed against wrong species');
 assert(p.src.startsWith('https://commons.wikimedia.org/wiki/Special:FilePath/'));
 assert(p.source_page.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(p.original_source_page&&p.creator&&p.license&&p.license_url);
 const src=decodeURIComponent(p.source_page).replace(/_/g,' ').toLowerCase();
 assert(!origins.has(src),'Duplicate source photo: '+src);origins.add(src);
 refs.push(p);
}
for(const [id,n] of Object.entries(expected)){
 const c=manifest.candidates.find(x=>x.id===id);assert(c);
 assert(c.status==='RESEARCH_CANDIDATE_NOT_RELEASED');
 assert((c.approved_gallery||[]).length>=n,'Missing approved general photos: '+id);
 assert(c.approved_gallery_review?.status==='GENERAL_IMAGES_CLEARED_EXACT_FILE_LICENSE_AND_SOURCE');
 for(const p of c.approved_gallery.slice(0,n)){
  assert.equal(p.photo_role,'TARGET_SPECIES_SOURCE');
  assert.equal(p.source_location_class,'NONLOCAL_REFERENCE');
  assert(p.label.includes('nonlocal')||p.caption.includes('Nonlocal'),'Source context missing');
  assert(/^CC BY(?:-SA)? [234]\.0(?: US)?$/i.test(p.license),'Noncompliant image rights '+p.license);
  assert(p.exact_rights_evidence.includes('audits/hays-expansion-20261111/'));
 }
}
const originals=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(n=>
 JSON.parse(fs.readFileSync(path.join(root,'species-'+n+'.json'),'utf8')));
assert.equal(originals.length,112);
assert.equal(originals.reduce((n,s)=>n+s.photos.length,0),514);
assert(refs.length>=67);
assert(manifest.candidates.filter(c=>c.approved_gallery?.length).length>=38);
console.log(JSON.stringify({pass:true,production_scored:112,original_scored_photo_refs:514,
 provisional_species:57,minimum_first_six_installed:6,minimum_photo_refs:67,
 current_photo_refs:refs.length,current_photographed_provisional_species:
 manifest.candidates.filter(c=>c.approved_gallery?.length).length,
 public_rendering_certified:false,identity_and_rights_final: 'source-level only'}));
