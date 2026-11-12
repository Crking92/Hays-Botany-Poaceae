// Read-only snapshot guard. Update expectations only after an explicit evidence-backed admission.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const dir='audits/hays-expansion-20261111',candidates=read('site/visual-key-lab/hays-candidates.json').candidates;
const packets=fs.readdirSync(path.join(root,dir)).filter(f=>/packet.*\.json$/.test(f));
const taxa=packets.flatMap(f=>read(`${dir}/${f}`).taxa);
const scored=['a','b','c1','c2','c3','d1','d2','d3','d4'].flatMap(s=>read(`site/visual-key-lab/species-${s}.json`));
assert.equal(packets.length,7);assert.equal(taxa.length,57);assert.equal(candidates.length,57);assert.equal(scored.length,112);
assert.equal(new Set([...scored,...candidates].map(s=>s.id)).size,169);
const signoffs=['species_id_approved','species_level_ID_approved','specimen_species_id_signed_off','species_id_final_signoff','species_ID_signoff'];
for(const c of candidates){
 assert.equal(c.status,'RESEARCH_CANDIDATE_NOT_RELEASED');
 const matches=taxa.filter(t=>[t.species_draft_id,t.card_id,t.staging_card_id].includes(c.id));
 assert.equal(matches.length,1,`missing/duplicate dossier: ${c.id}`);
 const flags=signoffs.filter(k=>Object.hasOwn(matches[0],k));
 assert.equal(flags.length,1,`missing/ambiguous signoff: ${c.id}`);assert.equal(matches[0][flags[0]],false);
}
assert.equal(candidates.reduce((n,c)=>n+c.details.length,0),322);
console.log(JSON.stringify({pass:true,total:169,scored:112,provisional:57,dossiers:taxa.length,literatureTargets:322,recordedSpecimenSignoffs:0,configuredGalleryReferences:candidates.reduce((n,c)=>n+(c.approved_gallery?.length||0),0),candidatesWithConfiguredGallery:candidates.filter(c=>c.approved_gallery?.length).length,liveRendering:'UNVERIFIED',newSpecimenInspections:0},null,2));
